import * as invoiceService from "../services/invoice.service.js";

export async function createInvoice(req, res) {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(201).json(invoice);
}

export async function convertQuote(req, res) {
  await invoiceService.updateStatus(
    req.params.invoiceId,
    "COMPLETED"
  );
  res.json({ ok: true });
}

export async function getSalesReport(req, res) {
  const data = await invoiceService.getSalesReport(req.query);
  res.json(data);
}
