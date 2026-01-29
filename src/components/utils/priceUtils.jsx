// price including currency conversion utils
// Базовая валюта бэкенда — USD.
// Здесь делаем предсказуемую конвертацию на фронте:
// - берём basePrice в долларах (supply.price / product.price)
// - умножаем на коэффициент валюты.
const CURRENCY_RATES = {
  USD: 1,        // базовая валюта
  UAH: 42.77,    // 1 USD = 42.77 UAH
  EUR: 0.84,     // 1 USD = 0.84 EUR
};

const toCurrency = (baseUsd, currency = 'USD') => {
  const rate = CURRENCY_RATES[currency] ?? 1;
  return Number(baseUsd || 0) * rate;
};

export const getPrice = (supply, currency = 'USD') => {
  if (!supply) return 0;
  const baseUsd = Number(supply.price) || 0;
  return toCurrency(baseUsd, currency);
};

// price including currency excluding supplies
export const getProductPrice = (product, currency = 'USD') => {
  if (!product) return 0;

  if (product.supplies && product.supplies.length > 0) {
    return getPrice(product.supplies[0], currency);
  }

  const baseUsd = Number(product.price) || 0;
  return toCurrency(baseUsd, currency);
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

