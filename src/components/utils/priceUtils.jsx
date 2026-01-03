// price including currency conversion utils

export const getPrice = (supply, currency = 'USD') => {
  if (!supply) return 0;

  if (currency !== 'USD' && supply.converted_price !== null && supply.converted_price !== undefined) {
    return Number(supply.converted_price) || 0;
  }
  
  return Number(supply.price) || 0;
};

// price including currency excluding supplies
export const getProductPrice = (product, currency = 'USD') => {
  if (!product) return 0;
  
  if (product.supplies && product.supplies.length > 0) {
    return getPrice(product.supplies[0], currency);
  }
  
  if (currency !== 'USD' && product.converted_price !== null && product.converted_price !== undefined) {
    return Number(product.converted_price) || 0;
  }
  
  return Number(product.price) || 0;
};


export const getCurrencySymbol = (currency = 'USD') => {
  const symbols = {
    USD: '$',
    UAH: '₴',
    EUR: '€',
  };
  return symbols[currency] || '$';
};


export const formatPrice = (price, currency = 'USD', decimals = 2) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Number(price || 0).toFixed(decimals)}`;
};

