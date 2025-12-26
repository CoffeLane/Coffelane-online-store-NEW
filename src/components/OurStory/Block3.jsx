import { Box, Typography, Grid } from "@mui/material";
import { h3, h6 } from "../../styles/typographyStyles.jsx";

function Block3() {

    return (
        <Box sx={{ backgroundColor: '#EAD9C9', p: { xs: 2, sm: 3, md: '48px' } }}>
            <Typography sx={{ fontFamily: "Vujahday Script", fontSize: { xs: "28px", sm: "32px", md: "40px" }, color: "#FE9400", mb: { xs: 2, md: 3 }, textAlign: "center", }}>
                Our Core Values
            </Typography>
            <Grid sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: { xs: 3, md: 0 } }}>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: { xs: '100%', md: '33.33%' }, justifyContent: 'center', px: { xs: 2, md: 0 } }}>
                    <Typography sx={{ ...h3, mb: { xs: 2, md: 3 }, textAlign: "center", fontSize: { xs: '20px', md: '24px' } }}>
                        Community
                    </Typography>
                    <Typography sx={{ ...h6, pl: { xs: 0, md: 4 }, pr: { xs: 0, md: 6 }, fontSize: { xs: '12px', md: '14px' }, textAlign: { xs: 'justify', md: 'left' } }}>
                        We believe coffee is more than a drink, it's a bond. Every cup is an invitation to connect,
                        share stories, and feel at home, no matter where you are.
                    </Typography>
                </Grid>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: { xs: '100%', md: '33.33%' }, justifyContent: 'center', px: { xs: 2, md: 0 } }}>
                    <Typography sx={{ ...h3, mb: { xs: 2, md: 3 }, textAlign: "center", fontSize: { xs: '20px', md: '24px' } }}>
                        Excellence
                    </Typography>
                    <Typography sx={{ ...h6, pl: { xs: 0, md: 4 }, pr: { xs: 0, md: 6 }, fontSize: { xs: '12px', md: '14px' }, textAlign: { xs: 'justify', md: 'left' } }}>
                        Quality is never an accident. From carefully sourcing the finest beans to perfecting each roast,
                        we're committed to delivering a rich, consistent experience that speaks for itself.
                    </Typography>
                </Grid>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: { xs: '100%', md: '33.33%' }, justifyContent: 'center', px: { xs: 2, md: 0 } }}>
                    <Typography sx={{ ...h3, mb: { xs: 2, md: 3 }, textAlign: "center", fontSize: { xs: '20px', md: '24px' } }}>
                        Customer-Centric
                    </Typography>
                    <Typography sx={{ ...h6, pl: { xs: 0, md: 4 }, pr: { xs: 0, md: 6 }, fontSize: { xs: '12px', md: '14px' }, textAlign: { xs: 'justify', md: 'left' } }}>
                        You're at the heart of what we do. Every step, from the beans we choose to the way we serve is guided
                        by your needs, ensuring every sip feels crafted just for you.
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Block3;