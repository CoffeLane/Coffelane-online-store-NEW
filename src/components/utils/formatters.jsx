export const formatDigits = (value, maxLength) => String(value || "").replace(/\D/g, "").slice(0, maxLength);

export const formatPhone = (value) => {
  if (value === null || value === undefined) return "";

  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';

  const limited = digits.slice(0, 15);
  const parts = [];

  if (limited.length > 0) parts.push(limited.slice(0, 3)); 
  if (limited.length > 3) parts.push(limited.slice(3, 5));
  if (limited.length > 5) parts.push(limited.slice(5, 8));
  if (limited.length > 8) parts.push(limited.slice(8, 10));
  if (limited.length > 10) parts.push(limited.slice(10, 12));

  return `+${parts.join(' ')}`;
};


export const formatCardNumber = (value) =>
    formatDigits(value, 16).replace(/(.{4})/g, "$1 ").trim();

export const formatExpiry = (value) => {
    const digits = formatDigits(value, 4);
    return digits.length <= 2 ? digits : digits.slice(0, 2) + "/" + digits.slice(2);
};

export const formatCVV = (value) => formatDigits(value, 3);

export const formatZip = (value) => formatDigits(value, 10);
