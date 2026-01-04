import { Dialog, Box, TextField, Button, Typography, CircularProgress, Alert, InputAdornment, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { btnStyles } from "../../styles/btnStyles.jsx";
import { h3, h5 } from "../../styles/typographyStyles.jsx";
import passwordReset from "../../assets/images/sign-up/password-reset.png";
import { inputStyles } from "../../styles/inputStyles.jsx";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../store/api/axios.js";
import { useNavigate } from "react-router-dom";
import { validatePassword } from "../utils/validation/validatePasswords.jsx";

export default function ResetPasswordModal({ open, handleClose, setSuccessModalOpen, token }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const validate = () => {
        const newErrors = {};
        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else {
            const pwErrors = validatePassword(password);
            if (pwErrors.length > 0) {
                newErrors.password = pwErrors[0];
            }
        }

        if (!repeatPassword.trim()) {
            newErrors.repeatPassword = "Repeat password is required";
        } else if (password !== repeatPassword) {
            newErrors.repeatPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setServerError("");
    try {
        const cleanToken = token?.replace(/^"+|"+$/g, "");
        const response = await api.post(`/auth/recovery_password/${cleanToken}`, { 
            password: password 
        });

        console.log("Password changed successfully:", response.data);
        handleClose(); 
        setErrors({});
        navigate("/", { replace: true });
        setSuccessModalOpen(true); 
    } catch (error) {
        console.error("Full error object:", error);
        const serverData = error.response?.data;
        let message = "Server error. Try again later.";

        if (serverData) {
            message = serverData.password ? `Password: ${serverData.password}` : 
                      serverData.detail ? serverData.detail : 
                      JSON.stringify(serverData);
        }

        setServerError(message);
    } finally {
        setLoading(false);
    }
};

    return (
        <Dialog open={open} onClose={handleClose}
            PaperProps={{ sx: { position: "fixed", top: 0, right: 0, width: { xs: "100%", sm: 450 }, borderRadius: { xs: 0, sm: "40px 0 0 0" }, backgroundColor: "#fff", m: 0, height: "100vh", maxHeight: "100vh" } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4, p: 3, position: "relative" }}>
                {isMobile && (
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "#3E3027",
                            zIndex: 1
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
                <Box component="img" src={passwordReset} alt="passwordReset" sx={{ margin: '32px 0', width: '100%' }} />
                <Typography sx={{ ...h3, textAlign: 'center' }}>Reset password</Typography>
                <Typography sx={{ ...h5, textAlign: 'center' }}>Enter your new password below.</Typography>

                {serverError && <Alert severity="error">{serverError}</Alert>}

                <TextField
                    label="New password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    sx={{ ...inputStyles }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    error={!!errors.password}
                    helperText={errors.password}
                />

                <TextField
                    label="Repeat new password"
                    type={showRepeatPassword ? "text" : "password"}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    fullWidth
                    sx={{ ...inputStyles }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowRepeatPassword(!showRepeatPassword)} edge="end">
                                    {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    error={!!errors.repeatPassword}
                    helperText={errors.repeatPassword}
                />

                <Button sx={{ ...btnStyles, width: "100%", textTransform: "none" }} onClick={handleSubmit} disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                </Button>
            </Box>
        </Dialog>
    );
}
