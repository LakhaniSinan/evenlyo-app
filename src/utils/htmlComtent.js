import moment from 'moment';

export const generateOrderHTML = order => {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Invoice - ${order.trackingId}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background-color: #007bff;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .info-section {
            flex: 1;
            min-width: 200px;
            margin-bottom: 20px;
          }
          .info-section h3 {
            color: #333;
            margin-bottom: 10px;
            font-size: 16px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 5px;
          }
          .info-item {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
          .value {
            color: #333;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-ordered { background-color: #e3f2fd; color: #1976d2; }
          .status-way { background-color: #fff3e0; color: #f57c00; }
          .status-delivered { background-color: #e8f5e8; color: #388e3c; }
          .products-section {
            margin-top: 30px;
          }
          .products-section h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .product-item {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
            background-color: #fafafa;
          }
          .product-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .product-details {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
          }
          .product-detail {
            margin-right: 20px;
            margin-bottom: 5px;
          }
          .total-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin-top: 30px;
            border: 2px solid #007bff;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
          .footer {
            background-color: #343a40;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 30px;
          }
          .footer p {
            margin: 0;
            opacity: 0.8;
          }
          @media print {
            body { background-color: white; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Invoice</h1>
            <p>Order ID: ${order.trackingId}</p>
          </div>
          
          <div class="content">
            <div class="order-info">
              <div class="info-section">
                <h3>Order Details</h3>
                <div class="info-item">
                  <span class="label">Order ID:</span>
                  <span class="value">${order.trackingId}</span>
                </div>
                <div class="info-item">
                  <span class="label">Date:</span>
                  <span class="value">${moment(order.createdAt).format(
                    'MMMM DD, YYYY',
                  )}</span>
                </div>
                <div class="info-item">
                  <span class="label">Status:</span>
                  <span class="status-badge status-${order.status
                    .toLowerCase()
                    .replace(' ', '-')}" style="margin: 0;">${
    order.status
  }</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>Customer Information</h3>
                <div class="info-item">
                  <span class="label">Name:</span>
                  <span class="value">${
                    order.vendorId?.fullName || 'N/A'
                  }</span>
                </div>
                <div class="info-item">
                  <span class="label">Email:</span>
                  <span class="value">${order.vendorId?.email || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Phone:</span>
                  <span class="value">${order.vendorId?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div class="products-section">
              <h3>Order Items</h3>
              ${
                order.items
                  ?.map(
                    item => `
                <div class="product-item">
                  <div class="product-name">${item.name || 'Product'}</div>
                  <div class="product-details">
                    <span class="product-detail">Quantity: ${
                      item.quantity || 1
                    }</span>
                    <span class="product-detail">Price: $${
                      item.price || '0.00'
                    }</span>
                    <span class="product-detail">Total: $${(
                      (item.quantity || 1) * (item.price || 0)
                    ).toFixed(2)}</span>
                  </div>
                </div>
              `,
                  )
                  .join('') || '<p>No items found</p>'
              }
            </div>
            
            <div class="total-section">
              <div class="total-row">
                <span>Total Amount:</span>
                <span>$${order.totalAmount || '0.00'}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${moment().format('MMMM DD, YYYY')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
};

export const getInvoiceHtml = order => {
  const itemsRows = order.items
    .map(
      item => `
    <tr>
      <td>${item.title?.en}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">$${item.price.toFixed(2)}</td>
      <td style="text-align:right;">$${(
        item.price * item.quantity +
        (item.extraDeliveryCharges || 0)
      ).toFixed(2)}</td>
    </tr>
  `,
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        padding: 30px;
        color: #222;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .logo {
        font-size: 28px;
        font-weight: bold;
        color: #E31B95;
      }
      .invoice-title {
        font-size: 28px;
        font-weight: bold;
        color: #E31B95;
      }
      .section-title {
        background: #E31B95;
        color: #fff;
        padding: 8px 12px;
        margin-top: 30px;
        font-weight: bold;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      td, th {
        padding: 10px;
        font-size: 14px;
      }
      .info-table td {
        padding: 6px 4px;
      }
      .items th {
        background: #E31B95;
        color: #fff;
        text-align: left;
      }
      .items tr:nth-child(even) {
        background: #f5f5f5;
      }
      .totals {
        margin-top: 20px;
        width: 100%;
      }
      .totals td {
        padding: 6px;
        font-size: 14px;
      }
      .totals .label {
        text-align: right;
        font-weight: bold;
      }
      .totals .value {
        text-align: right;
        width: 120px;
        font-weight: bold;
      }
    </style>
  </head>

  <body>
    <div class="header">
      <div class="logo">Evenlyo</div>
      <div class="invoice-title">INVOICE</div>
    </div>

    <div class="section-title">Invoice Details</div>
    <table class="info-table">
      <tr><td><b>Invoice #:</b></td><td>${order.trackingId}</td></tr>
      <tr><td><b>Date:</b></td><td>${
        new Date(order.createdAt).toISOString().split('T')[0]
      }</td></tr>
      <tr><td><b>Due Date:</b></td><td>TBD</td></tr>
      <tr><td><b>Status:</b></td><td>${order.status}</td></tr>
    </table>

    <table class="items">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Rate</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <table class="totals">
      <tr>
        <td class="label">Subtotal:</td>
        <td class="value">$${(
          order.totalAmount -
          order.deliveryAmount -
          order.platformFee
        ).toFixed(2)}</td>
      </tr>
      <tr>
        <td class="label">Delivery Fee:</td>
        <td class="value">$${order.deliveryAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="label">Platform Fee:</td>
        <td class="value">$${order.platformFee.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="label">Total:</td>
        <td class="value">$${order.totalAmount.toFixed(2)}</td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const generateSaleReportHTML = (data, currentLanguage = 'en') => {
  const flatData = data?.allSale
    ?.map(order =>
      order.items.map(item => ({
        orderId: order._id,
        trackingId: order.trackingId,
        customerId: order.customerId,
        totalAmount: order.totalAmount,
        orderDate: order.createdAt,
        itemName:
          currentLanguage === 'en' ? item.itemName.en : item.itemName.nl,
        itemProfit: item.profit,
      })),
    )
    .flat();

  const htmlContent = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        color: #000;
        font-size: 13px;
      }
      h1 {
        text-align: center;
        font-size: 20px;
        margin-bottom: 10px;
      }
      .report-date {
        margin-bottom: 30px;
      }
      .report-date span {
        font-weight: bold;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: center;
        font-size: 12px;
      }
      th {
        font-weight: bold;
        background-color: #FDF1F4;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
    </style>
  </head>
  <body>
    <h1>Sales Report</h1>

    <div class="report-date">
      <span>Report Date:</span> ${moment().format('MM/DD/YYYY')}
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item Name</th>
            <th>Customer ID</th>
            <th>Total Amount</th>
            <th>Order Date</th>
            <th>Profit</th>
          </tr>
        </thead>
        <tbody>
          ${flatData
            ?.map(
              (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.itemName || '-'}</td>
              <td>${item.customerId || '-'}</td>
              <td>$${item.totalAmount || 0}</td>
              <td>${moment(item.orderDate).format('YYYY-MM-DD')}</td>
              <td>$${item.itemProfit || 0}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </body>
</html>
`;

  return htmlContent;
};
