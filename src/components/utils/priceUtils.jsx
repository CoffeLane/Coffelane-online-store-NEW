const CURRENCY_RATES = {
  USD: 1,        
  UAH: 43.4785,
  EUR: 0.84,   
};

const getCurrencySymbol = (currency = 'USD') => {
  const symbols = {
    USD: '$',
    UAH: '₴',
    EUR: '€',
  };
  return symbols[currency] || '$';
};

const toCurrency = (baseUsd, currency = 'USD') => {
  const rate = CURRENCY_RATES[currency] ?? 1;
  return Number(baseUsd || 0) * rate;
};

export const getPrice = (supply, currency = 'USD') => {
  if (!supply) return 0;
  const price = Number(supply.price) || 0;

  return currency === 'USD' ? price : toCurrency(price, currency);
};

export const getProductPrice = (product, currency = 'USD') => {
  if (!product) return 0;

  if (product.supplies && product.supplies.length > 0) {
    return getPrice(product.supplies[0], currency);
  }

  const price = Number(product.price) || 0;
  return currency === 'USD' ? price : toCurrency(price, currency);
};

export const formatPrice = (price, currency = 'USD', decimals = 2) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Number(price || 0).toFixed(decimals)}`;
};

export const formatOrderPrice = (amount, currency) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
};