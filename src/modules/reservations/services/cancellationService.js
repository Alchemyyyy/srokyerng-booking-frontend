import { cancellationApi } from '../api/cancellation.api'


// Statuses that allow cancellation
export const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'upcoming']

/**
 * Derive cancellation policy based on days until check-in.
 * Pass the `t` function from useI18n() for translated strings.
 */
export function deriveCancellationPolicy(checkInDate, totalAmount = 0, t = (k) => k) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkIn = new Date(checkInDate)
  checkIn.setHours(0, 0, 0, 0)
  const daysUntil = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24))

  const deadlineDate = new Date(checkIn.getTime() - 7 * 86400000)
  const deadline = deadlineDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  if (daysUntil >= 7) {
    return {
      tone: 'free',
      description: t('cancellationPolicy.free.description'),
      deadline,
      refundAmount: totalAmount,
      refundBreakdown: [
        { label: t('cancellationPolicy.breakdown.sevenPlus'),  value: t('cancellationPolicy.breakdown.fullRefund'), type: 'full' },
        { label: t('cancellationPolicy.breakdown.oneToSix'),   value: t('cancellationPolicy.breakdown.halfRefund'), type: 'partial' },
        { label: t('cancellationPolicy.breakdown.sameDay'),    value: t('cancellationPolicy.breakdown.noRefund'),   type: 'none' },
      ],
    }
  }

  if (daysUntil >= 1) {
    return {
      tone: 'partial',
      description: t('cancellationPolicy.partial.description'),
      deadline: null,
      refundAmount: totalAmount * 0.5,
      refundBreakdown: [
        { label: t('cancellationPolicy.breakdown.oneToSix'),   value: t('cancellationPolicy.breakdown.halfRefund'), type: 'partial' },
        { label: t('cancellationPolicy.breakdown.sameDay'),    value: t('cancellationPolicy.breakdown.noRefund'),   type: 'none' },
      ],
    }
  }

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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkIn = new Date(checkInDate)
  checkIn.setHours(0, 0, 0, 0)
  return checkIn > today
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