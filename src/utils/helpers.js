export const formatPrice = (p) => "₦" + p.toLocaleString();

export const generateWhatsAppLink = (cart, phoneNumber) => {
    if (cart.length === 0) return `https://wa.me/${phoneNumber}`;
    let message = "Hello Jay's Bistro, I would like to place an order:\n\n";
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `▪ ${item.quantity}x ${item.name} - ${formatPrice(itemTotal)}\n`;
    });
    message += `\n*Total Order Value: ${formatPrice(total)}*`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};