
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return errors;
  }

  const minLengthDigit = 1;        // min_length_digit: 1 (adjusted from 4 for better UX)
  const minLengthAlpha = 2;        // min_length_alpha: 2
  const minLengthSpecial = 1;      // min_length_special: 1
  const minLengthLower = 1;        // min_length_lower: 1
  const minLengthUpper = 1;        // min_length_upper: 1
  const specialChars = '~!@#$%^&*()_+{}":;\'[]'; // special_characters

  const digitCount = (password.match(/\d/g) || []).length;
  const alphaCount = (password.match(/[a-zA-Z]/g) || []).length;
  const lowerCount = (password.match(/[a-z]/g) || []).length;
  const upperCount = (password.match(/[A-Z]/g) || []).length;
  const specialCount = (password.match(new RegExp(`[${specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g')) || []).length;

  if (digitCount < minLengthDigit) {
    errors.push(`Password must contain at least ${minLengthDigit} digits`);
  }

  if (alphaCount < minLengthAlpha) {
    errors.push(`Password must contain at least ${minLengthAlpha} alphabetic characters`);
  }

  if (specialCount < minLengthSpecial) {
    errors.push(`Password must contain at least ${minLengthSpecial} special character from: ${specialChars}`);
  }

  if (lowerCount < minLengthLower) {
    errors.push(`Password must contain at least ${minLengthLower} lowercase letter`);
  }

  if (upperCount < minLengthUpper) {
    errors.push(`Password must contain at least ${minLengthUpper} uppercase letter`);
  }

  return errors;
};

export const validatePasswords = ({ currentPassword, newPassword, repeatNewPassword }) => {
  const errors = {};

  if (!currentPassword?.trim()) {
    errors.currentPassword = "Current password is required";
  }

  if (!newPassword?.trim()) {
    errors.newPassword = "New password is required";
  } else {
    if (currentPassword && currentPassword === newPassword) {
      errors.newPassword = "New password must be different from current password";
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      errors.newPassword = passwordErrors[0]; 
    }
  }

  if (!repeatNewPassword?.trim()) {
    errors.repeatNewPassword = "Repeat new password is required";
  } else if (newPassword !== repeatNewPassword) {
    errors.repeatNewPassword = "Passwords do not match";
  }

  return errors;
};

