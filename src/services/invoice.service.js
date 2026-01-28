import * as invoiceRepo from "../repositories/invoice.repo.js";

export async function createInvoice(data) {
  return invoiceRepo.createInvoiceWithItems(data);
}

export async function updateStatus(invoiceId, status) {
  return invoiceRepo.updateInvoiceStatus(invoiceId, status);
}

export async function getSalesReport({ storeId, date }) {
  return invoiceRepo.fetchSalesAggregation(storeId, date);
}
