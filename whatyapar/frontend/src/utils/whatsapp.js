export const generateWhatsAppLink = (mobileNumber, aiSummary, paymentLink) => {
  const safeNumber = mobileNumber || '';
  const cleanNumber = safeNumber.replace(/\D/g, '');
  const message = `Here is your order summary:\n${aiSummary}\n\nPlease proceed with the payment here:\n${paymentLink}\n\nThank you for ordering with us!`;
  const encodedMessage = encodeURIComponent(message);
  const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
  return `https://wa.me/${finalNumber}?text=${encodedMessage}`;
};

export const sendWhatsAppMessage = (mobileNumber, aiSummary, paymentLink) => {
  const url = generateWhatsAppLink(mobileNumber, aiSummary, paymentLink);
  // Programmatic anchor click to bypass strict popup blockers
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
