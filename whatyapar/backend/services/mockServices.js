// Simulate AI parsing of unstructured text
const mockAIService = (orderDescription) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Basic mock logic: split by commas or newlines and assume those are items
      const items = orderDescription
        .split(/,|\n/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      const summary = items.length > 0 
        ? items.join(', ')
        : "Generic Order Summary";
      
      resolve(`AI Parsed: ${summary}`);
    }, 1000);
  });
};

// Simulate Payment link generation
const mockPaymentService = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockId = Math.random().toString(36).substring(2, 10);
      resolve(`https://rzp.io/mocklink${mockId}`);
    }, 1000);
  });
};

module.exports = {
  mockAIService,
  mockPaymentService
};
