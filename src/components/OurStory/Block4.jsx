import { Box, Typography, Grid } from "@mui/material";
import { h6 } from "../../styles/typographyStyles.jsx";
import barista3 from "../../assets/images/ourStory/barista3.png";
import barista4 from "../../assets/images/ourStory/barista4.png";

function Block4() {
    return (
        <Box sx={{ backgroundColor: '#fff', p: ' 48px' }}>
            <Grid container spacing={4} sx={{ display: 'flex', flexWrap: 'nowrap', }}>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: '50%', justifyContent: 'center', }}>
                    <Typography sx={{ fontFamily: "Vujahday Script", fontSize: "40px", color: "#FE9400", mb: 3, textAlign: "center", }}>
                        Exceptional Coffee Experience
                    </Typography>
                    <Typography sx={{ ...h6, pl: 4, pr: 6 }}>
                        At Coffee Lane, we’re more than coffee makers—we’re storytellers in every sip.
                        From hand-selecting the finest beans to perfecting the roast, our passion and precision shine
                        through. Every cup is crafted to deliver not just flavor, but a memorable experience filled with
                        warmth, dedication, and care.
                    </Typography>
                </Grid>
                <Box component="img" src={barista3} alt="Barista Image 3" sx={{ width: 640, height: 400, mx: "auto" }} />
            </Grid>

            <Grid container spacing={4} sx={{ display: 'flex', flexWrap: 'nowrap', pt: ' 48px' }}>
                <Box component="img" src={barista4} alt="Barista Image 4" sx={{ width: 640, height: 400, mx: "auto" }} />
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: "Vujahday Script", fontSize: "40px", color: "#FE9400", mb: 3, textAlign: "center" }}>
                        Brewing Hope with Every Cup
                    </Typography>
                    <Typography sx={{ ...h6, pl: 7, pr: 4 }}>
                        With every sip of Coffee Lane, you’re savoring more than a bold, rich blend you’re fueling a
                        child’s fight, nurturing their dreams, and giving hope for a brighter tomorrow. Our coffee doesn’t
                        just bring a smile to your face it puts a wag in your step and joy in your day.
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Block4;