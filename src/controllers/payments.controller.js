import * as paymentService from "../services/payment.service.js";

export async function addPayment(req, res) {
  await paymentService.addPayment(req.body);
  res.status(201).json({ ok: true });
}
