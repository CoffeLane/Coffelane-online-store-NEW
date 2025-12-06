import { Dialog, Box, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";
import { btnStyles } from "../../styles/btnStyles.jsx";
import { h3, h5, h6 } from "../../styles/typographyStyles.jsx";
import passwordReset from "../../assets/images/sign-up/password-reset.png";
import { inputStyles } from "../../styles/inputStyles.jsx";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../store/api/axios.js";


export default function ForgotPasswordModal({ open, handleClose, backToLogin, setToken, openIntermediate }) {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");


    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email format (example: user@example.com).";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        setServerError("");
        try {
            const res = await api.post("/auth/recovery_request", { email });
            const tokenFromServer = res.data.token; 
            handleClose();
            setToken(tokenFromServer); 
            openIntermediate(email);  
        } catch (error) {
            setServerError(error.response?.data?.message || "Server error. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}
            PaperProps={{ sx: { position: "fixed", top: 0, right: 0, width: { xs: "100%", sm: 450 }, borderRadius: { xs: 0, sm: "40px 0 0 0" }, backgroundColor: "#fff", m: 0, height: "100vh", maxHeight: "100vh" } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4, p: 3 }}>
                <Box component="img" src={passwordReset} alt="passwordReset" sx={{ margin: '32px 0', width: '100%' }} />
                <Typography sx={{ ...h3, textAlign: 'center' }}>Forgot your password?</Typography>
                <Typography sx={{ ...h5, textAlign: 'center' }}>Enter your email to receive a password reset link.</Typography>
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    sx={{ ...inputStyles }}
                    error={!!errors.email}
                    helperText={errors.email}
                />

                <Button
                    sx={{ ...btnStyles, width: "100%", textTransform: "none" }}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Email"}
                </Button>

                <Button onClick={backToLogin} sx={{ ...h6, textTransform: "none", display: "flex", gap: 1, alignItems: "center" }}>
                    <ArrowBackIcon />
                    Back to Login
                </Button>
            </Box>
        </Dialog>
    );
}

