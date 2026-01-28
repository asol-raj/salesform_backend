import { mysqlPool } from "../config/db.js";

export async function createInvoiceWithItems(data) {
  const conn = await mysqlPool.getConnection();

  try {
    await conn.beginTransaction();

    /* 1️⃣ Insert invoice */
    const [invoiceResult] = await conn.query(
      `
      INSERT INTO invoices (
        invoice_number,
        customer_id,
        store_id,
        status,
        created_by,
        subtotal,
        tax,
        delivery_charge,
        total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.invoiceNumber,
        data.customerId,
        data.storeId,
        data.status,          // QUOTE / COMPLETED
        data.createdBy,       // employee_id
        data.subtotal,
        data.tax,
        data.deliveryCharge,
        data.total
      ]
    );

    const invoiceId = invoiceResult.insertId;

    /* 2️⃣ Insert invoice items (BATCH) */
    const itemValues = data.items.map(item => [
      invoiceId,
      JSON.stringify(item.productSnapshot),
      item.quantity,
      item.salePrice,
      item.extendedPrice,
      item.orderType
    ]);

    await conn.query(
      `
      INSERT INTO invoice_items (
        invoice_id,
        product_snapshot,
        quantity,
        sale_price,
        extended_price,
        order_type
      )
      VALUES ?
      `,
      [itemValues]
    );

    /* 3️⃣ Insert salespersons (many-to-many) */
    if (data.salespersons?.length) {
      const salespersonValues = data.salespersons.map(empId => [
        invoiceId,
        empId
      ]);

      await conn.query(
        `
        INSERT INTO invoice_salespersons (invoice_id, employee_id)
        VALUES ?
        `,
        [salespersonValues]
      );
    }

    /* 4️⃣ Insert payments (optional for QUOTE) */
    if (data.payments?.length) {
      const paymentValues = data.payments.map(p => [
        invoiceId,
        p.method,
        p.amount,
        p.approvedBy || null
      ]);

      await conn.query(
        `
        INSERT INTO payments (
          invoice_id,
          payment_method,
          amount,
          approved_by
        )
        VALUES ?
        `,
        [paymentValues]
      );
    }

    await conn.commit();
    return invoiceId;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
