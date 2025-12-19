import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RegistrationSuccessful from "../Modal/RegistrationSuccessful.jsx";
import { Dialog, Box, Tabs, Tab, TextField, Button, Typography, Divider, CircularProgress, Alert, FormControlLabel, Checkbox, IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { h3, h7 } from "../../styles/typographyStyles.jsx";
import { btnStyles } from "../../styles/btnStyles.jsx";
import { inputStyles, checkboxStyles } from "../../styles/inputStyles.jsx";
import { patterns } from "../utils/validation/validatorsPatterns.jsx";
import { validatePassword } from "../utils/validation/validatePasswords.jsx";
import { loginUser, registerUser, loginWithGoogle } from "../../store/slice/authSlice.jsx";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import ForgotPasswordModal from "../Modal/ForgotPassword.jsx";
import ResetPasswordModal from "../Modal/ResetPasswordModal.jsx";
import IntermediateModal from "../Modal/IntermediateModal.jsx";

export default function LoginModal({ open, handleClose, openResetByLink = false, tokenFromLink = null, returnPath = null }) {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [tab, setTab] = useState(0);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);
    const [resetToken, setResetToken] = useState("");
    const [intermediateOpen, setIntermediateOpen] = useState(false);
    const [intermediateEmail, setIntermediateEmail] = useState("");
    const [forgotEmail, setForgotEmail] = useState("");

    useEffect(() => {
        // console.log("openResetByLink", openResetByLink, "tokenFromLink", tokenFromLink);
        if (openResetByLink && tokenFromLink) {
            setResetToken(tokenFromLink);
            setResetOpen(true);
        }
    }, [openResetByLink, tokenFromLink]);

    const openIntermediate = (email) => {
        setIntermediateEmail(email);
        setIntermediateOpen(true);
    };

    const handleTabChange = (e, newValue) => {
        setTab(newValue);
        setErrors({});
    };

    const validateLoginForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email format (example: user@example.com).";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRegisterForm = () => {
        const newErrors = {};

        if (!firstName.trim()) {
            newErrors.firstName = "First name is required";
        } else if (!patterns.firstName.test(firstName)) {
            newErrors.firstName =
                "Invalid first name. First name must start with a capital letter, only letters and optional hyphen (2–25 characters).";
        }

        if (!lastName.trim()) {
            newErrors.lastName = "Last name is required";
        } else if (!patterns.lastName.test(lastName)) {
            newErrors.lastName =
                "Invalid last name. Last name must start with a capital letter, only letters and optional hyphen (2–25 characters).";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email format (example: user@example.com).";
        }

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

        if (!agreePrivacy) {
            newErrors.agreePrivacy = "You must agree to the privacy policy";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const token = credentialResponse?.credential;
            if (!token) return;

            const decoded = jwtDecode(token);
            const email = decoded?.email;
            if (!email) return;

            const result = await dispatch(loginWithGoogle({ email, token }));

            if (result.meta.requestStatus === "fulfilled") {
                const serverToken = result.payload.access;
                if (serverToken) {
                    localStorage.setItem("access", serverToken);
                } else {
                    console.error("❌ Server did not return access token!");
                }

                if (handleClose) handleClose();

                // Проверяем, является ли пользователь админом
                const isAdmin = result.payload?.isAdmin || result.payload?.user?.role === 'admin';
                if (isAdmin) {
                    // Редиректим админа в админку
                    navigate('/admin');
                } else if (returnPath) {
                    // Если есть путь возврата, переходим туда
                    navigate(returnPath);
                }
            } else {
                console.error("Google login failed:", result.payload);
            }
        } catch (e) {
            console.error("Google login error", e);
        }
    };

    const handleLogin = async () => {
        if (!validateLoginForm()) return;
        // console.log("▶ LOGIN CLICK");
        // console.log("Email:", email);
        // console.log("Password:", password);

        const result = await dispatch(loginUser({ email, password }));

        // console.log("LOGIN RESULT:", result);

        if (result.meta.requestStatus === "fulfilled") {
            // console.log("✔ Login successful. Closing modal...");
            if (handleClose) handleClose();

            // Проверяем, является ли пользователь админом
            const isAdmin = result.payload?.isAdmin || result.payload?.user?.role === 'admin';
            if (isAdmin) {
                // Редиректим админа в админку
                navigate('/admin');
            } else if (returnPath) {
                // Если есть путь возврата, переходим туда
                navigate(returnPath);
            }
        } else {
            // console.log("✖ Login failed:", result.payload);
        }
    };

    const handleRegister = async () => {
        if (!validateRegisterForm()) return;
        // console.log("▶ REGISTER CLICK");
        // console.log("Email:", email);
        // console.log("Password:", password);
        // console.log("Repeat:", repeatPassword);

        if (password !== repeatPassword) {
            // console.log("❌ Passwords do not match!");
            alert("Passwords do not match!");
            return;
        }

        // Создаем объект profile только с заполненными полями
        const profileData = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            agree_privacy: agreePrivacy,
            subscribe_newsletter: subscribeNewsletter,
        };

        // Убираем пустые строки из profile
        Object.keys(profileData).forEach(key => {
            if (profileData[key] === "" || profileData[key] === null || profileData[key] === undefined) {
                delete profileData[key];
            }
        });

        const registrationData = {
            email: email.trim(),
            password,
            profile: profileData,
        };

        // console.log("DATA SENT TO REGISTER:", registrationData);

        const result = await dispatch(registerUser(registrationData));

        // console.log("REGISTER RESULT:", result);

        if (result.meta.requestStatus === "fulfilled") {
            // console.log("✔ Registration successful. Closing modal...");
            setSuccessModalOpen(true);
        } else {
            console.log("✖ Registration failed:", result.payload);
            // Показываем ошибку пользователю
            const errorPayload = result.payload || {};
            const newErrors = {};
            
            // Функция для форматирования сообщения об ошибке
            const formatErrorMessage = (message) => {
                if (!message) return "";
                let formatted = String(message);
                // Улучшаем читаемость сообщений об ошибках
                if (formatted.includes("already exists")) {
                    formatted = "This email is already registered. Please use a different email or try to log in.";
                } else if (formatted.includes("Enter your email")) {
                    formatted = formatted.replace(/user model with this Enter your email/g, "This email");
                }
                return formatted;
            };
            
            // Обрабатываем ошибки для каждого поля
            if (errorPayload.email) {
                const emailError = Array.isArray(errorPayload.email) 
                    ? errorPayload.email.join(" ") 
                    : String(errorPayload.email);
                newErrors.email = formatErrorMessage(emailError);
            }
            
            if (errorPayload.password) {
                newErrors.password = Array.isArray(errorPayload.password) 
                    ? errorPayload.password.join(" ") 
                    : String(errorPayload.password);
            }
            
            if (errorPayload.profile) {
                const profileErrors = errorPayload.profile;
                if (profileErrors.first_name) {
                    newErrors.firstName = Array.isArray(profileErrors.first_name) 
                        ? profileErrors.first_name.join(" ") 
                        : String(profileErrors.first_name);
                }
                if (profileErrors.last_name) {
                    newErrors.lastName = Array.isArray(profileErrors.last_name) 
                        ? profileErrors.last_name.join(" ") 
                        : String(profileErrors.last_name);
                }
            }
            
            // Если есть общее сообщение об ошибке
            if (errorPayload.message || errorPayload.error) {
                if (Object.keys(newErrors).length === 0) {
                    newErrors.submit = errorPayload.message || errorPayload.error || "Registration failed. Please try again.";
                }
            }
            
            // Если нет конкретных ошибок полей, показываем общее сообщение
            if (Object.keys(newErrors).length === 0) {
                newErrors.submit = "Registration failed. Please check your information and try again.";
            }
            
            setErrors(newErrors);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}
            PaperProps={{ sx: { position: "fixed", top: 0, right: 0, width: { xs: "100%", sm: 450 }, borderRadius: { xs: 0, sm: "40px 0 0 0" }, backgroundColor: "#fff", m: 0, height: "100vh", maxHeight: "100vh" } }}>
            <Box sx={{ display: "flex", flexDirection: "column", p: 3, gap: 3 }}>

                {successModalOpen ? (
                    <RegistrationSuccessful onLoginClick={() => { setSuccessModalOpen(false); setTab(0); }} />) : (
                    <>
                        <Tabs value={tab} onChange={handleTabChange} centered textColor="inherit" TabIndicatorProps={{ style: { backgroundColor: "#3E3027" } }}>
                            <Tab label="Log in" sx={{ ...h3, textTransform: "none", color: tab === 0 ? "#3E3027" : "#999999", }} />
                            <Tab label="Sign up" sx={{ ...h3, textTransform: "none", color: tab === 1 ? "#3E3027" : "#999999" }} />
                        </Tabs>

                        <Box display="flex" flexDirection="column" gap={2}>
                            {tab === 1 && (
                                <>
                                    <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth sx={{ ...inputStyles }} error={!!errors.firstName} helperText={errors.firstName} />
                                    <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth sx={{ ...inputStyles }} error={!!errors.lastName} helperText={errors.lastName} />
                                </>
                            )}
                            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth sx={{ ...inputStyles }} error={!!errors.email} helperText={errors.email} />
                            <TextField label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} fullWidth sx={{ ...inputStyles }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                error={!!errors.password} helperText={errors.password} />
                            {tab === 1 && (
                                <TextField label="Repeat Password" type={showRepeatPassword ? "text" : "password"} value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} fullWidth sx={{ ...inputStyles }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowRepeatPassword(!showRepeatPassword)} edge="end">
                                                    {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    error={!!errors.repeatPassword} helperText={errors.repeatPassword} />
                            )}
                            {tab === 0 && (
                                <Typography sx={{ ...h7, cursor: "pointer", color: "#A4795B", textAlign: "right" }} onClick={() => setForgotOpen(true)}>
                                    <span style={{ borderBottom: "1px solid #A4795B", paddingBottom: 2, display: "inline-block", lineHeight: 1.2 }}>
                                        Forgot password?
                                    </span>
                                </Typography>
                            )}
                            {tab === 1 && (
                                <>
                                    <FormControlLabel sx={{ ...checkboxStyles }} control={
                                        <Checkbox checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
                                    } label="I agree to the privacy policy" />
                                    {errors.agreePrivacy && <Typography sx={{ color: "#d32f2f", fontSize: "0.75rem", mt: 0.5 }}>{errors.agreePrivacy}</Typography>}
                                    <FormControlLabel sx={{ ...checkboxStyles }} control={
                                        <Checkbox checked={subscribeNewsletter} onChange={(e) => setSubscribeNewsletter(e.target.checked)} />
                                    } label="Subscribe to newsletter" />
                                </>
                            )}
                        </Box>

                        <Button onClick={tab === 0 ? handleLogin : handleRegister} disabled={loading} sx={{ ...btnStyles, textTransform: "none", width: "100%" }}>
                            {loading ? <CircularProgress size={24} /> : tab === 0 ? "Log in" : "Sign up"}
                        </Button>

                        <Box display="flex" alignItems="center" gap={1}>
                            <Divider sx={{ flex: 1 }} />
                            <Typography variant="body2">OR</Typography>
                            <Divider sx={{ flex: 1 }} />
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            { }

                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => { console.error("Google login failed") }}
                                useOneTap={false}
                                locale="en"
                                text="continue_with"
                            />
                        </Box>
                    </>
                )}
            </Box>

            <ForgotPasswordModal
                open={forgotOpen}
                openIntermediate={openIntermediate}
                handleClose={() => setForgotOpen(false)}
                setResetOpen={setResetOpen}
                setToken={setResetToken}
                backToLogin={() => {
                    setForgotOpen(false);
                    setTab(0);
                }}

            />
            <IntermediateModal
                open={intermediateOpen}
                handleClose={() => setIntermediateOpen(false)}
                email={intermediateEmail}

            />

            <ResetPasswordModal
                open={resetOpen}
                handleClose={() => setResetOpen(false)}
                token={resetToken}
                setSuccessModalOpen={setSuccessModalOpen}
            />
        </Dialog>
    );
}

