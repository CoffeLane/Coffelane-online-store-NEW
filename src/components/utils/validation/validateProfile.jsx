export const validateProfile = ({ type = "all", ...formData }) => {
    const errors = {};

    if (type === "all" || type === "personal") {
        const fullName = formData.fullName || "";
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        if (!firstName) errors.fullName = "First name is required";
        else if (!/^[A-Za-z]+([ '-][A-Za-z]+)*$/.test(firstName))
            errors.fullName = "Invalid first name. Use only Latin letters.";
        else if (!lastName) errors.fullName = "Please enter both first and last name";
        else if (!/^[A-Za-z\s'-]{2,50}$/.test(lastName))
            errors.fullName = "Invalid last name. Use only Latin letters.";

        const email = formData.email || "";
        if (!email.trim()) errors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errors.email = "Invalid email format";

        const phone = formData.phone || "";
        const digits = phone.replace(/\D/g, "");
        if (!phone.trim()) errors.phone = "Phone number is required";
        else if (digits.length < 10 || digits.length > 12)
            errors.phone = "Invalid phone number. It should contain 10–12 digits";
    }

    if (type === "all" || type === "address") {
        [
            ["country", "Country"],
            ["city", "City"],
            ["state", "State"],
            ["streetName", "Street name"],
            ["houseNumber", "House number"],
            ["aptNumber", "Apt number"],
        ].forEach(([field, label]) => {
            if (!formData[field] || !formData[field].trim())
                errors[field] = `${label} is required`;
        });
    }

    return errors;
};



