import React from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import purpose1 from "../../assets/images/home/purpose1.png";
import purpose2 from "../../assets/images/home/purpose2.png";
import { btnStyles } from '../../styles/btnStyles.jsx';
import { h3, h6, h4 } from "../../styles/typographyStyles.jsx";
import { useNavigate } from 'react-router-dom';

export default function OurPurpose() {
    const navigate = useNavigate();

    return (
        <Box sx={{ backgroundColor: '#EAD9C9' }}>
            <Grid container spacing={0} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 0 }}>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: { xs: '100%', md: '50%' }, justifyContent: 'center', alignItems: 'center', py: { xs: 4, md: 0 }, px: { xs: 2, md: 0 }, order: { xs: 1, md: 0 } }}>
                    <Typography sx={{ ...h3, marginBottom: '16px', fontSize: { xs: '24px', md: '32px' } }}>
                        Our Purpose
                    </Typography>
                    <Typography sx={{ ...h6, margin: { xs: '0 16px', md: '0 110px' }, textAlign: 'center', fontSize: { xs: '12px', md: '14px' } }}>
                        We believe that coffee creates moments of connection. We're inspired
                        by the love we all share for coffee, and we're driven to make
                        something meaningful—together.
                    </Typography>
                    <Typography sx={{ ...h4, margin: '16px 0', color: '#3E3027', fontSize: { xs: '16px', md: '18px' } }}>
                        Store at Coffee Lane today!
                    </Typography>
                    <Button variant="outlined" sx={{ ...btnStyles, width: { xs: '150px', md: '179px' }, fontSize: { xs: '12px', md: '14px' } }} onClick={() => navigate('/coffee')}>
                        SHOP HERE
                    </Button>
                </Grid>
                <Grid sx={{ width: { xs: '100%', md: '50%' }, position: 'relative', order: { xs: 2, md: 0 }, margin: 0, padding: 0 }}>
                    <Box component="img" src={purpose1} alt="Purpose Image 1" sx={{ width: '100%', height: { xs: '300px', md: 'auto' }, objectFit: 'cover', display: 'block' }} />
                </Grid>
            </Grid>
            <Grid container spacing={0} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 0 }}>
                <Grid sx={{ width: { xs: '100%', md: '50%' }, position: 'relative', order: { xs: 1, md: 0 }, margin: 0, padding: 0 }}>
                    <Box component="img" src={purpose2} alt="Purpose Image 2" sx={{ width: '100%', height: { xs: '300px', md: 'auto' }, objectFit: 'cover', display: 'block' }} />
                </Grid>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: { xs: '100%', md: '50%' }, justifyContent: 'center', alignItems: 'center', py: { xs: 4, md: 0 }, px: { xs: 2, md: 0 }, order: { xs: 0, md: 1 } }}>
                    <Typography sx={{ ...h3, marginBottom: '16px', fontSize: { xs: '24px', md: '32px' } }}>
                        Delicious Coffee
                    </Typography>
                    <Typography sx={{ ...h6, margin: { xs: '0 16px', md: '0 110px' }, textAlign: 'center', fontSize: { xs: '12px', md: '14px' } }}>
                        At Coffee Lane, we believe great taste should never make you wait.
                        That's why we deliver freshly coffee straight to your door — fast and hassle-free.
                        Over 20,000 satisfied customers have already made us part of their daily ritual.
                        Whether you love bold espresso or smooth blends, we've got something to satisfy every coffee lover.
                        Enjoy rich flavor, cozy moments, and exceptional service — all in one cup.
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate('/coffee')} sx={{ "&:hover": { backgroundColor: "#B88A6E" }, textTransform: 'none', fontFamily: "Montserrat, sans-serif", fontSize: { xs: '12px', md: '16px' }, backgroundColor: '#A4795B', borderRadius: '20px', border: 'none', color: '#fff', width: { xs: '220px', md: '262px' }, height: { xs: '44px', md: '52px' }, marginTop: '16px' }}>
                        Order your coffee now
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
}
