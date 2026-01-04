import { patterns } from "./validatorsPatterns.jsx";

const normalizePhone = (phone) => phone.replace(/[()\s-]/g, "");

// strict E.164
const e164Regex = /^\+[1-9]\d{7,14}$/;

const isValidPhone = (phone) => e164Regex.test(normalizePhone(phone));


export const validateContact = ({ firstName, lastName, email, phone, street, region, state, zip, country }) => {
  const errors = {};

  if (!firstName.trim()) {
    errors.firstName = "First name is required";
  } else if (!patterns.firstName.test(firstName)) {
    errors.firstName = "Invalid first name. First name must start with a capital letter, only letters and optional hyphen (2–25 characters).";
  }

  if (!lastName.trim()) {
    errors.lastName = "Last name is required";
  } else if (!patterns.lastName.test(lastName)) {
    errors.lastName = "Invalid last name. Last name must start with a capital letter, only letters and optional hyphen (2–25 characters).";
  }

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    errors.email = "Invalid email format (example: user@example.com).";
  }

  if (!phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!isValidPhone(phone)) {
    errors.phone =
      "Please enter a valid phone number in international format, for example +380931234567";
  }


  if (!street.trim()) {
    errors.street = "Street address is required";
  } else if (!/^(?=.*[A-Za-z])[A-Za-z0-9\s.,'-]{3,100}$/.test(street)) {
    errors.street =
      "Invalid street address. Use letters, numbers, spaces, commas, dots, apostrophes or hyphens (3–100 characters) and include at least one letter.";
  }

  if (!region?.trim()) {
    errors.region = "City is required";
  } else if (!/^(?=.*[A-Za-z])[A-Za-z\s'-]{2,50}$/.test(region)) {
    errors.region =
      "Invalid city name. Use only letters, spaces, apostrophes or hyphens (2–50 characters) and include at least one letter.";
  }

  if (!state.trim()) {
    errors.state = "State/Province is required";
  } else if (!/^[A-Za-z\s'-]{2,50}$/.test(state)) {
    errors.state =
      "Invalid state/province. Use only letters, spaces, apostrophes or hyphens (2–50 characters).";
  }

  if (!zip.trim()) {
    errors.zip = "Zip code is required";
  } else if (!patterns.zip.test(zip.trim())) {
    errors.zip = "Invalid zip code format.";
  }

  if (!country || !country.trim()) {
    errors.country = "Country is required";
  } else if (!/^(?=.*\p{L})[\p{L}\s'-]{2,100}$/u.test(country)) {
    errors.country =
      "Invalid country. Use only letters, spaces, apostrophes or hyphens and include at least one letter.";
  }

  return errors;
};

