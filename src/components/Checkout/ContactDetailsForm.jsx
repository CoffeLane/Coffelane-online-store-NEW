import { Box, TextField, Typography, Button, Divider } from "@mui/material";
import { h4, h6 } from '../../styles/typographyStyles';
import { inputStyles, helperTextRed } from '../../styles/inputStyles';
import { formatPhone,  formatZip } from "../../components/utils/formatters.jsx";

export default function ContactDetailsForm({
    step,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    phone, setPhone,
    street, setStreet,
    region, setRegion,
    state, setState,
    zip, setZip,
    country, setCountry,
    apartment, setApartment,
    errors,
    handleContinue,
    openLogin,
    setOpenLogin,
    icon1, icon2,
    LoginModal,
    btnStyles, btnCart
}) {
    const handleFieldChange = (setter, field, formatter) => (e) => {
        const value = e.target.value;
        const formatted = formatter ? formatter(value) : value;
        setter(formatted);

        if (errors[field]) {
            errors[field] = undefined;
        }
    };

    return (
        <Box sx={{ flex: 1, backgroundColor: "#fff", p: { xs: 2, md: 3 }, borderRadius: 2, border: step === 1 ? "2px solid yellow" : "2px solid transparent" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Box component="img" src={icon1} alt="one" sx={{ width: { xs: 24, md: 32 }, height: { xs: 24, md: 32 } }} />
                <Typography sx={{ ...h4, fontSize: { xs: '18px', md: '20px' } }}>Contact details</Typography>
            </Box>

            <TextField id="firstName" fullWidth margin="normal" label="First name" value={firstName} onChange={handleFieldChange(setFirstName, "firstName")} error={!!errors.firstName} helperText={errors.firstName} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} required />
            <TextField id="lastName" fullWidth margin="normal" label="Last name" value={lastName} onChange={handleFieldChange(setLastName, "lastName")} error={!!errors.lastName} helperText={errors.lastName} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} required />
            <TextField id="email" fullWidth margin="normal" label="Email" type="email" value={email} onChange={handleFieldChange(setEmail, "email")} error={!!errors.email} helperText={errors.email} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} required />
            <TextField id="phone" fullWidth margin="normal" label="Phone number" value={phone} onChange={handleFieldChange(setPhone, "phone", formatPhone)} error={!!errors.phone} helperText={errors.phone} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} required />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: { xs: 2, md: 3 } }}>
                <Box component="img" src={icon2} alt="two" sx={{ width: { xs: 24, md: 32 }, height: { xs: 24, md: 32 } }} />
                <Typography sx={{ ...h4, fontSize: { xs: '18px', md: '20px' } }}>Delivery</Typography>
            </Box>

            <TextField id="country" fullWidth margin="normal" label="Country" value={country} onChange={handleFieldChange(setCountry, "country")} error={!!errors.country} helperText={errors.country} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} required />
            <TextField id="street" fullWidth margin="normal" label="Street address" value={street} onChange={handleFieldChange(setStreet, "street")} error={!!errors.street} helperText={errors.street} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} required />
            <TextField id="apartment" fullWidth margin="normal" label="Apartment number" value={apartment} onChange={handleFieldChange(setApartment, "apartment")} error={!!errors.apartment} helperText={errors.apartment} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} inputProps={{ maxLength: 30 }} required />
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1} mt={1}>
                <TextField id="region" fullWidth label="City" value={region} onChange={handleFieldChange(setRegion, "region")} error={!!errors.region} helperText={errors.region} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} required />
                <TextField id="state" fullWidth label="State / Province" value={state} onChange={handleFieldChange(setState, "state")} error={!!errors.state} helperText={errors.state} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} required />
                <TextField id="zip" fullWidth label="Postal / Zip Code" value={zip}  onChange={handleFieldChange(setZip, "zip", formatZip)} error={!!errors.zip} helperText={errors.zip} sx={{ ...inputStyles }} slotProps={{ formHelperText: { sx: helperTextRed } }} required />
            </Box>

            <Button fullWidth sx={{ ...btnStyles, mt: { xs: 2, md: 3 }, textTransform: "none", fontSize: { xs: '12px', md: '14px' }, py: { xs: 1, md: 1.5 } }} onClick={handleContinue}>Continue</Button>
            <Divider sx={{...h6, my: { xs: 2, md: 3 }, color: "#3E3027", fontSize: { xs: '12px', md: '14px' }, "&::before, &::after": { borderColor: "#3E3027" }, }}>OR</Divider>
            <Button fullWidth sx={{ ...btnCart, textTransform: "none", fontSize: { xs: '12px', md: '14px' }, py: { xs: 1, md: 1.5 } }} onClick={() => setOpenLogin(true)}>
                Log in
            </Button>
            <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
        </Box>
    );
}
