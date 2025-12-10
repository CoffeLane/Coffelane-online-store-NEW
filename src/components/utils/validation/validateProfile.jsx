import { patterns } from "./validatorsPatterns.jsx";

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
        if (!email?.trim()) {
            errors.email = "Email is required";
        } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            errors.email = "Invalid email format (example: user@example.com).";
        }

        // phone validation
        if (!phone) {
            errors.phone = "Phone number is required";
        } else if (!patterns.phone.test(phone)) {
            errors.phone =
                "Invalid phone format. Example: +380 50 123 4567 (must include country code)";
        }
    }

    // === Address info ===
    if (type === "all" || type === "address") {
        const requiredFields = [
            ["country", "Country"],
            ["city", "City"],
            ["state", "State"],
            ["streetName", "Street name"],
            ["houseNumber", "House number"],
            ["aptNumber", "Apt number"],
            ["zip", "Zip code"],
        ];

        requiredFields.forEach(([field, label]) => {
            const value = formData[field]?.trim();
            if (!value) {
                errors[field] = `${label} is required`;
            } else if (field === "zip" && !patterns.zip.test(value)) {
                errors[field] = "Invalid zip/postal code format";
            }
        });
    }

    return errors;
};
