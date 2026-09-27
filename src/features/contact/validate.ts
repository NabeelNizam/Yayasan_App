export function validateFeedback(input: { rating: number; message: string }): { ok: boolean } {
  const ratingOk = Number.isInteger(input.rating) && input.rating >= 1 && input.rating <= 5
  const msgOk = input.message.trim().length > 0
  return { ok: ratingOk && msgOk }
}
