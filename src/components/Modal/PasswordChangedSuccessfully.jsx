import { Dialog, Box, Button, Typography } from "@mui/material";
import { h3, h5 } from "../../styles/typographyStyles.jsx";
import passwordChanged from "../../assets/images/sign-up/password-changed.png";
import { btnStyles } from "../../styles/btnStyles.jsx";

export default function PasswordChangedSuccessfully({ open, handleClose, onLoginClick }) {
    return (
        <Dialog open={open} onClose={handleClose}>
            <Box sx={{ textAlign: 'center', padding: '40px' }}>
                <Typography sx={{ ...h3 }}>Password changed successfully !</Typography>
                <Typography sx={{ ...h5, marginTop: '16px' }}>
                    You can now log in with your new password..
                </Typography>
                <Box component="img" src={passwordChanged} alt="passwordChanged" sx={{ margin: '32px 0', width: '100%', }} />
                <Button variant="contained" onClick={onLoginClick} sx={{ mt: 2, ...btnStyles, width: '100%', textTransform: 'none', }}>
                    Log in
                </Button>
            </Box>
        </Dialog>
    );
}