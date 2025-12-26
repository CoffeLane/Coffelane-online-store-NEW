import { Box, Button, Typography } from "@mui/material";
import { h3, h5 } from "../../styles/typographyStyles.jsx";
import welcome from "../../assets/images/sign-up/welcome.png";
import { btnStyles } from "../../styles/btnStyles.jsx";

export default function RegistrationSuccessful({ onLoginClick }) {
    return (
        <Box sx={{ 
            textAlign: 'center', 
            padding: { xs: '24px', md: '40px' },
            px: { xs: 2, md: 4 }
        }}>
            <Typography sx={{ 
                ...h3, 
                fontSize: { xs: '24px', md: '32px' },
                mb: { xs: 1, md: 0 }
            }}>
                Welcome to Coffee Lane!
            </Typography>
            <Typography sx={{ 
                ...h5, 
                marginTop: { xs: '12px', md: '16px' },
                fontSize: { xs: '14px', md: '18px' }
            }}>
                Your account has been created.
            </Typography>
            <Box 
                component="img" 
                src={welcome} 
                alt="welcome" 
                sx={{ 
                    margin: { xs: '20px 0', md: '32px 0' }, 
                    width: '100%',
                    maxWidth: { xs: '280px', md: '100%' },
                    height: 'auto',
                    mx: 'auto',
                    display: 'block'
                }} 
            />
            <Button 
                variant="contained" 
                onClick={onLoginClick} 
                sx={{ 
                    mt: { xs: 1.5, md: 2 }, 
                    ...btnStyles, 
                    width: '100%', 
                    textTransform: 'none',
                    py: { xs: 1.5, md: 1.75 },
                    fontSize: { xs: '14px', md: '16px' }
                }}
            >
                Log in
            </Button>
        </Box>
    );
}

