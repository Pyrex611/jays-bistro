/** Format a naira amount, e.g. 3500 -> "₦3,500". */
export const formatPrice = (amount) => `₦${Number(amount).toLocaleString("en-NG")}`;
