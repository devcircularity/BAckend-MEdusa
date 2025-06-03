import { Router } from "express"

export default (router: Router) => {
  router.post("/pesapal/webhook", async (req, res) => {
    console.log("🪝 Pesapal Webhook Received:", req.body)
    res.sendStatus(200)
  })
}
