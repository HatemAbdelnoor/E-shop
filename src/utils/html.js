
import pdf  from "html-pdf"
import { createOrder } from "../modules/order/controller/order";

const fs = require('fs');

function generateInvoice(invoiceData) {
  // HTML structure of the invoice
  const html = `
    <h1>Invoice</h1>
    <h3>Customer: ${invoiceData.customer}</h3>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${invoiceData.items
          .map((item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${item.price}</td>
            </tr>
          `)
          .join('')}
      </tbody>
    </table>
    <p>Total: ${invoiceData.total}</p>
  `;

  // Convert HTML to text
  const text = htmlToText.fromString(html, {
    wordwrap: 130,
  });

  // Write the text invoice to a file
  fs.writeFile('invoice.txt', text, (err) => {
    if (err) {
      console.log('Error generating invoice:', err);
    } else {
      console.log('Invoice generated successfully!');
    }
  });
}

// Example usage
const invoiceData = {
  customer: 'John Doe',
  items: [
    { name: 'Item 1', quantity: 2, price: 10 },
    { name: 'Item 2', quantity: 1, price: 20 },
    { name: 'Item 3', quantity: 3, price: 5 },
  ],
  total: 50,
};

generateInvoice(invoiceData);
