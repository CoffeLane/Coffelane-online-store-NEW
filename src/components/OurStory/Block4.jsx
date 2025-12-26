import { Box, Typography, Grid } from "@mui/material";
import { h6 } from "../../styles/typographyStyles.jsx";
import barista3 from "../../assets/images/ourStory/barista3.png";
import barista4 from "../../assets/images/ourStory/barista4.png";

function Block4() {
    return (
        <Box sx={{ backgroundColor: '#fff', p: { xs: 2, sm: 3, md: '48px' } }}>
            <Grid container spacing={4} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: { xs: '100%', md: '50%' }, justifyContent: 'center', order: { xs: 2, md: 1 }, px: { xs: 2, md: 0 } }}>
                    <Typography sx={{ fontFamily: "Vujahday Script", fontSize: { xs: "28px", sm: "32px", md: "40px" }, color: "#FE9400", mb: { xs: 2, md: 3 }, textAlign: "center", }}>
                        Exceptional Coffee Experience
                    </Typography>
                    <Typography sx={{ ...h6, pl: { xs: 0, md: 4 }, pr: { xs: 0, md: 6 }, fontSize: { xs: '12px', md: '14px' }, textAlign: { xs: 'justify', md: 'left' } }}>
                        At Coffee Lane, we're more than coffee makers—we're storytellers in every sip.
                        From hand-selecting the finest beans to perfecting the roast, our passion and precision shine
                        through. Every cup is crafted to deliver not just flavor, but a memorable experience filled with
                        warmth, dedication, and care.
                    </Typography>
                </Grid>
                <Box component="img" src={barista3} alt="Barista Image 3" sx={{ width: { xs: '100%', md: 640 }, height: { xs: 'auto', md: 400 }, maxHeight: { xs: 300, md: 400 }, objectFit: 'cover', mx: "auto", order: { xs: 1, md: 2 }, mb: { xs: 2, md: 0 } }} />
            </Grid>

            <Grid container spacing={4} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: { xs: 'wrap', md: 'nowrap' }, pt: { xs: 2, md: '48px' } }}>
                <Box component="img" src={barista4} alt="Barista Image 4" sx={{ width: { xs: '100%', md: 640 }, height: { xs: 'auto', md: 400 }, maxHeight: { xs: 300, md: 400 }, objectFit: 'cover', mx: "auto", order: { xs: 1, md: 1 }, mb: { xs: 2, md: 0 } }} />
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: { xs: '100%', md: '50%' }, justifyContent: 'center', alignItems: 'center', order: { xs: 2, md: 2 }, px: { xs: 2, md: 0 } }}>
                    <Typography sx={{ fontFamily: "Vujahday Script", fontSize: { xs: "28px", sm: "32px", md: "40px" }, color: "#FE9400", mb: { xs: 2, md: 3 }, textAlign: "center" }}>
                        Brewing Hope with Every Cup
                    </Typography>
                    <Typography sx={{ ...h6, pl: { xs: 0, md: 7 }, pr: { xs: 0, md: 4 }, fontSize: { xs: '12px', md: '14px' }, textAlign: { xs: 'justify', md: 'left' } }}>
                        With every sip of Coffee Lane, you're savoring more than a bold, rich blend you're fueling a
                        child's fight, nurturing their dreams, and giving hope for a brighter tomorrow. Our coffee doesn't
                        just bring a smile to your face it puts a wag in your step and joy in your day.
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Block4;