export type ProviderTransactionInput = {
  campaignSlug: string
  amount: number
  donorName: string
  anonymous: boolean
}

export type CreateResult = { token: string; orderId: string }

export interface PaymentProvider {
  id: string
  createTransaction(input: ProviderTransactionInput): Promise<CreateResult>
}

export class ManualPaymentProvider implements PaymentProvider {
  id = 'manual'

  async createTransaction(input: ProviderTransactionInput): Promise<CreateResult> {
    return { token: '', orderId: `MANUAL-${input.campaignSlug}-${Date.now()}` }
  }
}
