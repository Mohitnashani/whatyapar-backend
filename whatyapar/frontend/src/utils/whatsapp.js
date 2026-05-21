export const generateWhatsAppLink = (mobileNumber, aiSummary, paymentLink) => {
  const cleanNumber = mobileNumber.replace(/\D/g, '');
  const message = `Here is your order summary:\n${aiSummary}\n\nPlease proceed with the payment here:\n${paymentLink}\n\nThank you for ordering with us!`;
  const encodedMessage = encodeURIComponent(message);
  const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
  return `https://wa.me/${finalNumber}?text=${encodedMessage}`;
};

export const sendWhatsAppMessage = (mobileNumber, aiSummary, paymentLink) => {
  const url = generateWhatsAppLink(mobileNumber, aiSummary, paymentLink);
  // Use window.location.href instead of window.open to bypass popup blockers after async await
  window.location.href = url;
};
