/**
 * Утилиты для работы с ценами и валютами
 */

/**
 * Получает цену с учетом валюты
 * @param {Object} supply - Объект supply с полями price и converted_price
 * @param {string} currency - Текущая валюта (USD, UAH, EUR)
 * @returns {number} - Цена в выбранной валюте
 */
export const getPrice = (supply, currency = 'USD') => {
  if (!supply) return 0;
  
  // Если валюта не USD и есть converted_price, используем его
  if (currency !== 'USD' && supply.converted_price !== null && supply.converted_price !== undefined) {
    return Number(supply.converted_price) || 0;
  }
  
  // Иначе используем базовую цену (price)
  return Number(supply.price) || 0;
};

/**
 * Получает цену продукта (для продуктов без supplies)
 * @param {Object} product - Объект продукта
 * @param {string} currency - Текущая валюта
 * @returns {number} - Цена в выбранной валюте
 */
export const getProductPrice = (product, currency = 'USD') => {
  if (!product) return 0;
  
  // Если у продукта есть supplies, используем первый
  if (product.supplies && product.supplies.length > 0) {
    return getPrice(product.supplies[0], currency);
  }
  
  // Если есть converted_price на уровне продукта
  if (currency !== 'USD' && product.converted_price !== null && product.converted_price !== undefined) {
    return Number(product.converted_price) || 0;
  }
  
  // Иначе используем базовую цену
  return Number(product.price) || 0;
};

/**
 * Получает символ валюты
 * @param {string} currency - Код валюты
 * @returns {string} - Символ валюты
 */
export const getCurrencySymbol = (currency = 'USD') => {
  const symbols = {
    USD: '$',
    UAH: '₴',
    EUR: '€',
  };
  return symbols[currency] || '$';
};

/**
 * Форматирует цену с символом валюты
 * @param {number} price - Цена
 * @param {string} currency - Валюта
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} - Отформатированная цена
 */
export const formatPrice = (price, currency = 'USD', decimals = 2) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Number(price || 0).toFixed(decimals)}`;
};

