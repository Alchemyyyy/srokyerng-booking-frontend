import { cancellationApi } from '../api/cancellation.api'

// Statuses that allow cancellation
export const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'upcoming']

/**
 * Derive cancellation policy based on days until check-in.
 * Replace with real API call if backend supports it.
 */
export function deriveCancellationPolicy(checkInDate, totalAmount = 0) {
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
      description: 'Cancel at least 7 days before check-in for a full refund.',
      deadline,
      refundAmount: totalAmount,
      refundBreakdown: [
        { label: '7+ days before check-in', value: '100% refund', type: 'full' },
        { label: '1–6 days before check-in', value: '50% refund', type: 'partial' },
        { label: 'Same day or after',         value: 'No refund',  type: 'none' },
      ],
    }
  }

  if (daysUntil >= 1) {
    return {
      tone: 'partial',
      description: 'Cancelling within 7 days of check-in gives a 50% refund.',
      deadline: null,
      refundAmount: totalAmount * 0.5,
      refundBreakdown: [
        { label: '1–6 days before check-in', value: '50% refund', type: 'partial' },
        { label: 'Same day',                  value: 'No refund',  type: 'none' },
      ],
    }
  }

  return {
    tone: 'strict',
    description: 'Check-in is today or has already passed. No refund available.',
    deadline: null,
    refundAmount: 0,
    refundBreakdown: [
      { label: 'Same day or after check-in', value: 'No refund', type: 'none' },
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
 */
export function blockedReason(status, checkInDate) {
  const s = String(status).toLowerCase()
  if (s === 'cancelled') return 'This reservation has already been cancelled.'
  if (s === 'completed') return 'Completed stays cannot be cancelled.'
  if (checkInDate) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const checkIn = new Date(checkInDate); checkIn.setHours(0, 0, 0, 0)
    if (checkIn <= today) return 'Cancellation is not available after check-in has started.'
  }
  return 'This reservation is not eligible for cancellation.'
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