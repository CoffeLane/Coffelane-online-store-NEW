import React, {useState} from "react";
import logo from '../../assets/images/header/logo.svg';
import {TextField, Box, Typography, Button, FormHelperText} from '@mui/material';
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
    

    const onChange = (e) => {
        setValue(e.target.value);
        if (error) setError("");
        if (success) setSuccess(false);
    };


    const handleSubmit = () => {
        if (!validateEmail(value)) {
            setError("Invalid email format (example: user@example.com)");
            return;
        }
        setSuccess(true);
        setValue("");
        setError("");
    };


    return (

        <Box component="footer" sx={{ flexGrow: 1, gap: 3, flex: 1, backgroundImage: `url(${footerImg})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', display: 'flex', px: 6, py: 6, justifyContent: 'center'}}>
            <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, pr: 6}}>
               <Link to='/'>
                    <Box component='img' src={logo} alt='logo'
                         sx={{width: '144px', height: '35px', cursor: 'pointer'}}/>
                </Link>
                <Typography sx={{...h7, mt: 3}}>
                    Ethically Sourced, Delicious Coffee Roasted with Purpose by Blind Dog Coffee Roasters.
                    Enjoy Premium 100% Organic Dark Roast, Medium Roast, Light Roast, Low Acid Decaf,
                    & Half-Caff Coffee Bean Roasts Delivered Fresh To Your Doorstep!
                </Typography>
                  <Typography sx={{...h5, fontFamily: 'Work Sans', mt: 3}}>
                    Contact us:
                </Typography>
                <Typography sx={{...h6, fontFamily: 'Work Sans', mt: 2}}>
                    012-345-6789
                </Typography>
                <Typography sx={{...h6, fontFamily: 'Work Sans', mt: 2}}>
                    hello@coffelane.com
                </Typography>
                <Box sx={{display: 'flex', gap: 2, mb: 4}}>
                    <Box component='img' src={instagram} alt='instagram'  onClick={() => window.open("https://www.instagram.com", "_blank")}
                         sx={{mt: 2, width: '24px', height: '24px', cursor: 'pointer'}}/>
                    <Box component='img' src={facebook} alt='facebook'   onClick={() => window.open("https://www.facebook.com", "_blank")}
                         sx={{mt: 2, width: '24px', height: '24px', cursor: 'pointer'}}/>   
                </Box>
                <Typography sx={{...h7}}>
                    © 2025 Coffee Lane
                </Typography>
            </Box>

            <Box sx={{display: 'flex', flexDirection: 'column',  px: 2}}>
                <Typography sx={{...h4, mb: 3}}>
                    Quick links
                </Typography>
                {[
                    {to: '/', label: 'Home'},
                    {to: '/coffee', label: 'Coffee'},
                    {to: '/accessories', label: 'Accessories'},
                    {to: '/ourStory', label: 'Our Story'},
                    {to: '/ourNewsletter', label: 'Subscribe to Our Newsletter'}
                ].map((link) => (
                    <Typography key={link.to + link.label} component={RouterNavLink} to={link.to} sx={navLinkStyles}>
                        {link.label}
                    </Typography>
                ))}
            </Box>

           

            <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, pl: 6}}>
                <Typography sx={{...h4, mb: 3}}>
                    Stay in touch
                </Typography>
                <Typography sx={{...h6, mb: 2}}>
                    Sign up for exclusive offers, original stories, events and more.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', '&:hover .helper-text': {color: '#A63A3A'}, '&:focus-within .helper-text': {color: '#A63A3A'},}}>
                    <TextField fullWidth variant="outlined" value={value} placeholder="Email" onChange={onChange} error={!!error} sx={{...inputStyles}}/>
                    <Button variant="contained" onClick={handleSubmit} sx={{...btnStyles, width: '100%', mt: 2, textTransform: "none"}}>
                        Subscribe
                    </Button>

                    {error && (<FormHelperText sx={{...helperTextRed, mt: 2}}> {error} </FormHelperText> )}
                    {success && <Typography sx={{ color: "#16675C", fontWeight: 700, mt: 1 }}>Subscribed!</Typography>}
                </Box>

                <Box sx={{display: 'flex', alignItems: 'center', marginTop: '120px', justifyContent: "flex-end"}}>
                    <Box component='img' src={visa} alt='visa' sx={{width: '32px', height: '32px', mr: 2, cursor: 'pointer'}}/>
                    <Box component='img' src={mastercard} alt='mastercard' sx={{width: '32px', height: '32px', mr: 2, cursor: 'pointer'}}/>
                </Box>
            </Box>
        </Box>
    );
};