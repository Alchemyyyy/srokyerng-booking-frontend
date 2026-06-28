import { cancellationApi } from '../api/cancellation.api'


// Statuses that allow cancellation
export const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'upcoming']

/**
 * Derive cancellation policy based on days until check-in.
 * Pass the `t` function from useI18n() for translated strings.
 */
// Matches backend CANCELLATION_DEADLINE_HOURS = 24
const DEADLINE_HOURS = 24

export function deriveCancellationPolicy(checkInDate, totalAmount = 0, t = (k) => k) {
  const now = new Date()

  // Deadline = check-in date midnight minus 24 hours
  const checkIn = new Date(checkInDate)
  checkIn.setHours(0, 0, 0, 0)
  const deadlineMs = checkIn.getTime() - DEADLINE_HOURS * 60 * 60 * 1000
  const deadlineDate = new Date(deadlineMs)

  const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60)
  const beforeDeadline = now.getTime() < deadlineMs

  const deadline = deadlineDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  // More than 24h before check-in → full refund
  if (beforeDeadline) {
    return {
      tone: 'free',
      description: t('cancellationPolicy.free.description'),
      deadline,
      refundAmount: totalAmount,
      refundBreakdown: [
        { label: t('cancellationPolicy.breakdown.sevenPlus'), value: t('cancellationPolicy.breakdown.fullRefund'), type: 'full' },
        { label: t('cancellationPolicy.breakdown.oneToSix'),  value: t('cancellationPolicy.breakdown.noRefund'),   type: 'none' },
      ],
    }
  }

  // Within 24h but not yet checked in → 50% refund
  if (hoursUntilCheckIn > 0) {
    return {
      tone: 'partial',
      description: t('cancellationPolicy.partial.description'),
      deadline: null,
      refundAmount: totalAmount * 0.5,
      refundBreakdown: [
        { label: t('cancellationPolicy.breakdown.oneToSix'), value: t('cancellationPolicy.breakdown.halfRefund'), type: 'partial' },
      ],
    }
  }

  // Check-in date passed → no refund
  return {
    tone: 'strict',
    description: t('cancellationPolicy.strict.description'),
    deadline: null,
    refundAmount: 0,
    refundBreakdown: [
      { label: t('cancellationPolicy.breakdown.sameDayAfter'), value: t('cancellationPolicy.breakdown.noRefund'), type: 'none' },
    ],
  }
}

/**
 * Whether a reservation is eligible for cancellation.
 */
export function isCancellable(status, checkInDate) {
  if (!CANCELLABLE_STATUSES.includes(String(status).toLowerCase())) return false
  if (!checkInDate) return true

  const now = new Date()
  const checkIn = new Date(checkInDate)
  checkIn.setHours(0, 0, 0, 0)

  // Deadline = 24h before check-in midnight
  const deadlineMs = checkIn.getTime() - DEADLINE_HOURS * 60 * 60 * 1000

  // Must be before the deadline AND check-in hasn't passed
  return now.getTime() < deadlineMs
}

/**
 * Human-readable reason why cancellation is blocked.
 * Pass the `t` function from useI18n() for translated strings.
 */
export function blockedReason(status, checkInDate, t = (k) => k) {
  const s = String(status).toLowerCase()
  if (s === 'cancelled') return t('cancellationPolicy.blocked.alreadyCancelled')
  if (s === 'completed') return t('cancellationPolicy.blocked.completed')
  if (checkInDate) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const checkIn = new Date(checkInDate); checkIn.setHours(0, 0, 0, 0)
    if (checkIn <= today) return t('cancellationPolicy.blocked.checkInPassed')
  }
  return t('cancellationPolicy.blocked.notEligible')
}

/**
 * Cancel a reservation.
 */
export async function cancelReservation(id, reason) {
  const res = await cancellationApi.cancelReservation(id, reason)
  return res?.data?.data ?? res?.data ?? res
}

/**
 * Refund a payment (owner action).
 */
export async function refundPayment(paymentId, notes = '') {
  const res = await cancellationApi.refundPayment(paymentId, notes)
  return res?.data?.data ?? res?.data ?? res
}