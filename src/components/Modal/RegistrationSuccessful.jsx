import { Box, Button, Typography } from "@mui/material";
import { h3, h5 } from "../../styles/typographyStyles.jsx";
import welcome from "../../assets/images/sign-up/welcome.png";
import { btnStyles } from "../../styles/btnStyles.jsx";

export default function RegistrationSuccessful({ onLoginClick }) {
    return (
        <Box sx={{ textAlign: 'center', padding: '40px' }}>
            <Typography sx={{ ...h3 }}>Welcome to Coffee Lane!</Typography>
            <Typography sx={{ ...h5, marginTop: '16px' }}>
                Your account has been created.
            </Typography>
            <Box component="img" src={welcome} alt="welcome" sx={{ margin: '32px 0', width: '100%', }} />
            <Button variant="contained" onClick={onLoginClick} sx={{ mt: 2, ...btnStyles, width: '100%', textTransform: 'none', }}>
                Log in
            </Button>
        </Box>
    );
}

