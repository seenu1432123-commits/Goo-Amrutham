export const GOO_AMRUTHAM_WHATSAPP =
  "8919597205"; // Replace with your WhatsApp number


export function openWhatsApp(message) {
  const url =
    `https://wa.me/${GOO_AMRUTHAM_WHATSAPP}` +
    `?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}


export function createProductWhatsAppMessage(product) {
  return `
🥛 *Goo Amrutham Milk*

Hi Goo Amrutham 👋

I would like to order:

*Product:* ${product.name}
*Quantity:* ${product.qty || 1}
*Price:* ₹${product.price || 0}

Please confirm my order.

Thank you!
  `.trim();
}


export function createCartWhatsAppMessage(cartItems) {
  let message = `
🥛 *Goo Amrutham Milk*

Hi Goo Amrutham 👋

I would like to place an order:

`;

  let total = 0;

  cartItems.forEach((item, index) => {
    const qty = Number(item.qty || 1);
    const price = Number(item.price || 0);
    const lineTotal = qty * price;

    total += lineTotal;

    message += `
${index + 1}. *${item.name}*
   Quantity: ${qty}
   Price: ₹${price}
   Total: ₹${lineTotal.toFixed(2)}
`;
  });

  message += `
━━━━━━━━━━━━━━
*Total: ₹${total.toFixed(2)}*

Please confirm my order.

Thank you! 🥛
`;

  return message.trim();
}