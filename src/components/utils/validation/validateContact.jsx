import { patterns } from "./validatorsPatterns.jsx";


export const validateContact = ({ firstName, lastName, email, phone, street, region, state, zip }) => {
  const errors = {};

  // First name
    if (!firstName.trim()) {
    errors.firstName = "First name is required";
  } else if (!patterns.firstName.test(firstName)) {
    errors.firstName = "Invalid first name. First name must start with a capital letter, only letters and optional hyphen (2–25 characters).";
  }

  // Last name
if (!lastName.trim()) {
    errors.lastName = "Last name is required";
  } else if (!patterns.lastName.test(lastName)) {
    errors.lastName = "Invalid last name. Last name must start with a capital letter, only letters and optional hyphen (2–25 characters).";
  }

  // Email
  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email format (example: user@example.com).";
  }

  // Phone
  // const digits = phone.replace(/\D/g, "");
  // if (!phone.trim()) {
  //   errors.phone = "Phone number is required";
  // } else if (digits.length < 10 || digits.length > 15) {
  //   errors.phone =
  //     "Invalid phone number. It should contain 10–15 digits, spaces, hyphens or '+' are allowed.";
  // }

  if (!phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!patterns.phone.test(phone)) {
    errors.phone = "Invalid phone number format.";
  }

  // Street
  if (!street.trim()) {
    errors.street = "Street address is required";
  } else if (!/^[A-Za-z0-9\s.,'-]{3,100}$/.test(street)) {
    errors.street =
      "Invalid street address. Use letters, numbers, spaces, commas, dots, apostrophes or hyphens (3–100 characters).";
  }

  // City  (region)
  if (!region.trim()) {
    errors.region = "City is required";
  } else if (!/^[A-Za-z\s'-]{2,50}$/.test(region)) {
    errors.region =
      "Invalid city name. Use only letters, spaces, apostrophes or hyphens (2–50 characters).";
  }

  // State / Province (state)
  if (!state.trim()) {
    errors.state = "State/Province is required";
  } else if (!/^[A-Za-z\s'-]{2,50}$/.test(state)) {
    errors.state =
      "Invalid state/province. Use only letters, spaces, apostrophes or hyphens (2–50 characters).";
  }

  // Zip
  if (!zip.trim()) {
  errors.zip = "Zip code is required";
} else if (!patterns.zip.test(zip.trim())) {
  errors.zip = "Invalid zip code format.";
}

  return errors;
};

