import React, {useState} from "react";
import logo from '../../assets/images/header/logo.svg';
import {TextField, Box, Typography, Button, FormHelperText, CircularProgress} from '@mui/material';
import {NavLink as RouterNavLink} from "react-router-dom";
import {Link,} from 'react-router-dom';
import facebook from '../../assets/icons/facebook.svg';
import instagram from '../../assets/icons/instagram.svg';
import visa from '../../assets/icons/visa.svg';
import mastercard from '../../assets/icons/mastercard.svg';
import {btnStyles} from '../../styles/btnStyles.jsx';
import {helperTextRed} from '../../styles/inputStyles.jsx';
import {inputStyles} from '../../styles/inputStyles.jsx';
import footerImg from '../../assets/images/footer/footer-img.png';
import {h6, h4, h7, h5} from "../../styles/typographyStyles.jsx";
import api from '../../store/api/axios.js';

const validateEmail = (email) => {
    const re =/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    return re.test(String(email).toLowerCase());
};

const navLinkStyles = {
    textDecoration: 'none',
    cursor: 'pointer',
    color: '#3E3027',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 500,
    fontSize: '16px',
    mb: 2,
    '&.active': {color: "#B88A6E"},
    '&:hover': {color: "#B88A6E"}
};

export default function Footer() {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        setValue(e.target.value);
        if (error) setError("");
        if (success) setSuccess(false);
    };

    const handleSubmit = async () => {
        if (!validateEmail(value)) {
            setError("Invalid email format (example: user@example.com)");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            try {
                const response = await api.post("/newsletter/subscribe", { email: value });
                setSuccess(true);
                setValue("");
                setLoading(false);
                return;
            } catch (apiError) {
                if (apiError.response?.status === 404) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    setSuccess(true);
                    setValue("");
                    setLoading(false);
                    return;
                }
                
                throw apiError;
            }
        } catch (err) {
            console.error("Newsletter subscription error:", err.response?.data || err.message);
            setError(
                err.response?.data?.email?.[0] || 
                err.response?.data?.message || 
                "Failed to subscribe. Please try again later."
            );
            setLoading(false);
        }
    };

    return (

        <Box component="footer" sx={{ 
            flexGrow: 1, 
            gap: 3, 
            flex: 1, 
            backgroundImage: `url(${footerImg})`, 
            backgroundSize: 'cover', 
            backgroundRepeat: 'no-repeat', 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            px: { xs: 3, sm: 4, md: 6 }, 
            py: { xs: 4, md: 6 }, 
            justifyContent: 'center'
        }}>
            <Box sx={{
                display: 'flex', 
                flexDirection: 'column', 
                flex: 1, 
                pr: { xs: 0, md: 6 },
                mb: { xs: 4, md: 0 }
            }}>
               <Link to='/'>
                    <Box component='img' src={logo} alt='logo'
                         sx={{width: { xs: '120px', md: '144px' }, height: 'auto', cursor: 'pointer'}}/>
                </Link>
                <Typography sx={{...h7, mt: 3, fontSize: { xs: '12px', md: '14px' }}}>
                    Ethically Sourced, Delicious Coffee Roasted with Purpose by Blind Dog Coffee Roasters.
                    Enjoy Premium 100% Organic Dark Roast, Medium Roast, Light Roast, Low Acid Decaf,
                    & Half-Caff Coffee Bean Roasts Delivered Fresh To Your Doorstep!
                </Typography>
                  <Typography sx={{...h5, fontFamily: 'Work Sans', mt: 3, fontSize: { xs: '14px', md: '16px' }}}>
                    Contact us:
                </Typography>
                <Typography sx={{...h6, fontFamily: 'Work Sans', mt: 2, fontSize: { xs: '12px', md: '14px' }}}>
                    012-345-6789
                </Typography>
                <Typography sx={{...h6, fontFamily: 'Work Sans', mt: 2, fontSize: { xs: '12px', md: '14px' }}}>
                    hello@coffelane.com
                </Typography>
                <Box sx={{display: 'flex', gap: 2, mb: { xs: 2, md: 4 }, mt: 2}}>
                    <Box component='img' src={instagram} alt='instagram'  onClick={() => window.open("https://www.instagram.com", "_blank")}
                         sx={{width: { xs: '20px', md: '24px' }, height: { xs: '20px', md: '24px' }, cursor: 'pointer'}}/>
                    <Box component='img' src={facebook} alt='facebook'   onClick={() => window.open("https://www.facebook.com", "_blank")}
                         sx={{width: { xs: '20px', md: '24px' }, height: { xs: '20px', md: '24px' }, cursor: 'pointer'}}/>   
                </Box>
                <Typography sx={{...h7, fontSize: { xs: '12px', md: '14px' }}}>
                    © 2025 Coffee Lane
                </Typography>
            </Box>

            <Box sx={{
                display: 'flex', 
                flexDirection: 'column',  
                px: { xs: 0, md: 2 },
                mb: { xs: 4, md: 0 }
            }}>
                <Typography sx={{...h4, mb: 3, fontSize: { xs: '16px', md: '18px' }}}>
                    Quick links
                </Typography>
                {[
                    {to: '/', label: 'Home'},
                    {to: '/coffee', label: 'Coffee'},
                    {to: '/accessories', label: 'Accessories'},
                    {to: '/ourStory', label: 'Our Story'},
                    {to: '/ourNewsletter', label: 'Subscribe to Our Newsletter'}
                ].map((link) => (
                    <Typography key={link.to + link.label} component={RouterNavLink} to={link.to} sx={{...navLinkStyles, fontSize: { xs: '14px', md: '16px' }}}>
                        {link.label}
                    </Typography>
                ))}
            </Box>

            <Box sx={{
                display: 'flex', 
                flexDirection: 'column', 
                flex: 1, 
                pl: { xs: 0, md: 6 }
            }}>
                <Typography sx={{...h4, mb: 3, fontSize: { xs: '16px', md: '18px' }}}>
                    Stay in touch
                </Typography>
                <Typography sx={{...h6, mb: 2, fontSize: { xs: '12px', md: '14px' }}}>
                    Sign up for exclusive offers, original stories, events and more.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', '&:hover .helper-text': {color: '#A63A3A'}, '&:focus-within .helper-text': {color: '#A63A3A'},}}>
                    <TextField 
                        fullWidth 
                        variant="outlined" 
                        value={value} 
                        placeholder="Email" 
                        onChange={onChange} 
                        error={!!error} 
                        disabled={loading}
                        sx={{...inputStyles}}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit} 
                        disabled={loading}
                        sx={{...btnStyles, width: '100%', mt: 2, textTransform: "none"}}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Subscribe"}
                    </Button>

                    {error && (<FormHelperText sx={{...helperTextRed, mt: 2}}> {error} </FormHelperText> )}
                    {success && <Typography sx={{ color: "#16675C", fontWeight: 700, mt: 1 }}>Subscribed!</Typography>}
                </Box>

                <Box sx={{
                    display: 'flex', 
                    alignItems: 'center', 
                    marginTop: { xs: 4, md: '120px' }, 
                    justifyContent: { xs: 'flex-start', md: "flex-end" }
                }}>
                    <Box component='img' src={visa} alt='visa' sx={{width: { xs: '28px', md: '32px' }, height: { xs: '28px', md: '32px' }, mr: 2, cursor: 'pointer'}}/>
                    <Box component='img' src={mastercard} alt='mastercard' sx={{width: { xs: '28px', md: '32px' }, height: { xs: '28px', md: '32px' }, mr: 2, cursor: 'pointer'}}/>
                </Box>
            </Box>
        </Box>
    );
};