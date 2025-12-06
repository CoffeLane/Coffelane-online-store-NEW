import { Box, Typography, Grid } from "@mui/material";
import { h3, h6 } from "../../styles/typographyStyles.jsx";


function Block3() {

    return (
        <Box sx={{ backgroundColor: '#EAD9C9', p: ' 48px' }}>
            <Typography sx={{ fontFamily: "Vujahday Script", fontSize: "40px", color: "#FE9400", mb: 3, textAlign: "center", }}>
                Our Core Values
            </Typography>
            <Grid sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: '50%', justifyContent: 'center', }}>
                    <Typography sx={{ ...h3, mb: 3, textAlign: "center", }}>
                        Community
                    </Typography>
                    <Typography sx={{ ...h6, pl: 4, pr: 6 }}>
                        We believe coffee is more than a drink, it’s a bond. Every cup is an invitation to connect,
                        share stories, and feel at home, no matter where you are.
                    </Typography>
                </Grid>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: '50%', justifyContent: 'center', }}>
                    <Typography sx={{ ...h3, mb: 3, textAlign: "center", }}>
                        Excellence
                    </Typography>
                    <Typography sx={{ ...h6, pl: 4, pr: 6 }}>
                        Quality is never an accident. From carefully sourcing the finest beans to perfecting each roast,
                        we’re committed to delivering a rich, consistent experience that speaks for itself.
                    </Typography>
                </Grid>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: '50%', justifyContent: 'center', }}>
                    <Typography sx={{ ...h3, mb: 3, textAlign: "center", }}>
                        Customer-Centric
                    </Typography>
                    <Typography sx={{ ...h6, pl: 4, pr: 6 }}>
                        You’re at the heart of what we do. Every step, from the beans we choose to the way we serve is guided
                        by your needs, ensuring every sip feels crafted just for you.
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Block3;