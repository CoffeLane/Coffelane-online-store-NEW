import { patterns } from "./validatorsPatterns.jsx";

// нормализация: убираем пробелы, скобки, дефисы
export const normalizePhone = (phone) => phone.replace(/[()\s-]/g, "");

// проверка strict E.164
const e164Regex = /^\+[1-9]\d{7,14}$/;

const isValidPhone = (phone) => e164Regex.test(normalizePhone(phone));



export const validateProfile = ({ type = "all", ...formData }) => {
    const errors = {};

    // === Personal info ===
    if (type === "all" || type === "personal") {
        const fullName = formData.fullName?.trim() || "";
        const email = formData.email?.trim() || "";
        const phone = formData.phone?.trim() || "";

        // fullName validation
        if (!fullName) {
            errors.fullName = "Full name is required";
        } else if (!patterns.fullNamePattern.test(fullName)) {
            errors.fullName =
                "Invalid full name. Enter first and last name, starting with a capital letter. Only letters, spaces, hyphens and apostrophes are allowed.";
        }

        // email validation
         const forbiddenDomains = ["test.test", "example.com"]; // список запрещённых доменов
        const domain = email.split("@")[1]?.toLowerCase();

        if (!email) {
            errors.email = "Email is required";
        } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            errors.email = "Invalid email format (example: user@example.com).";
        } else if (forbiddenDomains.includes(domain)) {
            errors.email = "This email domain is not allowed.";
        }
        
        // phone validation
        if (!phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (!isValidPhone(phone)) {
            errors.phone =
                "Please enter a valid phone number in international format, for example +380931234567";
        }

    }

    // === Address info ===
    if (type === "all" || type === "address") {
        const requiredFields = [
            ["country", "Country"],
            ["city", "City"],
            ["state", "State"],
            ["streetName", "Street name"],
            ["houseNumber", "Zip / Postal Code"],
        ];

        requiredFields.forEach(([field, label]) => {
            const value = formData[field]?.trim();
            if (!value) {
                errors[field] = `${label} is required`;
            }
        });

        // Validate houseNumber (zip_code) format
        if (formData.houseNumber?.trim()) {
            const zipValue = formData.houseNumber.trim();
            if (!patterns.zip.test(zipValue)) {
                errors.houseNumber = "Zip code format must be as follows: 12345, 12345-6789, K1A 0B1, SW1A 1AA, 75008, 01001";
            }
        }

        // aptNumber is optional, no validation needed
    }

    return errors;
};
