import { Dialog, Box, Typography, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { h3, h6 } from "../../styles/typographyStyles.jsx";
import send from "../../assets/images/sign-up/send.png";
import CloseIcon from "@mui/icons-material/Close";

export default function IntermediateModal({ open, handleClose, email }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={handleClose}
      PaperProps={{ sx: { position: "fixed", top: 0, right: 0, width: { xs: "100%", sm: 450 }, borderRadius: { xs: 0, sm: "40px 0 0 0" }, backgroundColor: "#fff", m: 0, height: "100vh", maxHeight: "100vh", } }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4, p: 5, alignItems: "center", position: "relative" }}>
        {isMobile && (
          <IconButton onClick={handleClose} sx={{ position: "absolute", top: 8, right: 8, color: "#3E3027", zIndex: 1}}>
            <CloseIcon />
          </IconButton>
        )}
        <Typography sx={{ ...h3, textAlign: "center", mt: 5 }}>Reset your password!</Typography>
        <Box component="img" src={send} alt="send" sx={{ margin: "32px 0",  }} />
        <Typography sx={{ ...h6, textAlign: "center" }}>
          An email has been sent to <strong>{email}</strong>.
        </Typography>
        <Typography sx={{ ...h6, textAlign: "center" }}>
          Please open your email and click the link to create a new password.
        </Typography>
      </Box>
    </Dialog>
  );
}

