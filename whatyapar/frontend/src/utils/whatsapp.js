export const sendWhatsAppMessage = (mobileNumber, aiSummary, paymentLink) => {
  // Ensure the mobile number is clean (only digits)
  const cleanNumber = mobileNumber.replace(/\D/g, '');
  
  // Construct the message
  const message = `Here is your order summary:\n${aiSummary}\n\nPlease proceed with the payment here:\n${paymentLink}\n\nThank you for ordering with us!`;
  
  // URL Encode the message
  const encodedMessage = encodeURIComponent(message);
  
  // Construct the wa.me URL
  // Assuming Indian numbers by default for this MVP as per prompt (91)
  // But if the user types a full number with country code, we might just use it.
  // We'll just prepend 91 if it's exactly 10 digits, otherwise assume they added country code.
  const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
  
  const url = `https://wa.me/${finalNumber}?text=${encodedMessage}`;
  
  // Open in new tab
  window.open(url, '_blank');
};
