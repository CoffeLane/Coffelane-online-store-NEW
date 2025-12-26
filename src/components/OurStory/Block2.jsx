import { Box, Typography, Grid } from "@mui/material";
import { h6 } from "../../styles/typographyStyles.jsx";
import barista from "../../assets/images/ourStory/barista.png";
import barista2 from "../../assets/images/ourStory/barista2.png";

function Block2() {
    return (
        <Box sx={{ backgroundColor: '#fff', p: { xs: 2, sm: 3, md: '48px' } }}>
            <Grid container spacing={4} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: { xs: '100%', md: '50%' }, justifyContent: 'center', order: { xs: 2, md: 1 }, px: { xs: 2, md: 0 } }}>
                    <Typography sx={{ fontFamily: "Vujahday Script", fontSize: { xs: "28px", sm: "32px", md: "40px" }, color: "#FE9400", mb: { xs: 2, md: 3 }, textAlign: "center", }}>
                        Our Story
                    </Typography>
                    <Typography sx={{ ...h6, pl: { xs: 0, md: 4 }, pr: { xs: 0, md: 6 }, fontSize: { xs: '12px', md: '14px' }, textAlign: { xs: 'justify', md: 'left' } }}>
                        In 2012, Coffee Lane was born on a quiet street corner where friends
                        gathered to share more than just coffee—they shared dreams. Founded
                        by two lifelong companions who believed that every cup tells a
                        story, Coffee Lane began as a small local café with a big vision: to
                        create a space where connection, warmth, and passion for craft
                        coffee could flourish.
                        From the start, Coffee Lane was about more than brewing beans—it was
                        about building moments. Early mornings turned into conversations,
                        and the aroma of freshly ground coffee became the heartbeat of the
                        community. Years later, Coffee Lane has grown, but its soul remains
                        the same.
                        At Coffee Lane, it's never just about coffee—it's about finding your
                        place on the lane where life slows down, hearts connect, and
                        something extraordinary is always brewing.
                    </Typography>
                </Grid>
                <Box component="img" src={barista} alt="Barista Image 1" sx={{ width: { xs: '100%', md: 640 }, height: { xs: 'auto', md: 400 }, maxHeight: { xs: 300, md: 400 }, objectFit: 'cover', mx: "auto", order: { xs: 1, md: 2 }, mb: { xs: 2, md: 0 } }} />
            </Grid>

            <Grid container spacing={4} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: { xs: 'wrap', md: 'nowrap' }, pt: { xs: 2, md: '48px' } }}>
                <Box component="img" src={barista2} alt="Barista Image 2" sx={{ width: { xs: '100%', md: 640 }, height: { xs: 'auto', md: 400 }, maxHeight: { xs: 300, md: 400 }, objectFit: 'cover', mx: "auto", order: { xs: 1, md: 1 }, mb: { xs: 2, md: 0 } }} />

                <Grid sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', width: { xs: '100%', md: '50%' }, justifyContent: 'center', alignItems: 'center', order: { xs: 2, md: 2 }, px: { xs: 2, md: 0 } }}>
                    <Typography sx={{ fontFamily: "Vujahday Script", fontSize: { xs: "28px", sm: "32px", md: "40px" }, color: "#FE9400", mb: { xs: 2, md: 3 }, textAlign: "center" }}>
                        Our Future
                    </Typography>
                    <Typography sx={{ ...h6, pl: { xs: 0, md: 7 }, pr: { xs: 0, md: 4 }, fontSize: { xs: '12px', md: '14px' }, textAlign: { xs: 'justify', md: 'left' } }}>
                        At Coffee Lane, we continue to hold tightly to the values on which
                        we were founded: a commitment to offering every customer specialty,
                        high-quality coffee at a fair price, and a dedication to giving back
                        to the community that has supported us from the very beginning.
                        For us, coffee is more than a drink—it's a way to make a difference.
                        That's why we proudly support local organizations and charities
                        close to our heart, from community programs to initiatives that
                        bring hope and healing. With every cup served, we strive to create
                        something meaningful: a blend of passion, integrity, and care that
                        extends far beyond our doors.
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Block2;
