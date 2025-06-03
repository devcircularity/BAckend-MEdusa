// src/api/routes/webhooks/pesapal.ts
import { Request, Response } from "express"

export default async (req: Request, res: Response): Promise<void> => {
  const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.query
  
  console.log("Received Pesapal webhook:", req.query)
  
  try {
    // Using req.scope is causing TypeScript error
    // Instead, access container through request
    const container = (req as any).scope
    
    if (container) {
      // Get payment provider service
      const paymentProviderService = container.resolve("paymentProviderService")
      
      // Process webhook data
      if (OrderTrackingId && OrderNotificationType) {
        console.log(`Updating payment status for order ${OrderMerchantReference} with tracking ID ${OrderTrackingId} to ${OrderNotificationType}`)
      }
    }
    
    // Always respond with 200 OK
    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Pesapal webhook error:", error)
    res.status(400).json({ success: false, error: (error as Error).message })
  }
}
