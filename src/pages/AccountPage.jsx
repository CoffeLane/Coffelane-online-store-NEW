import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useSelector } from "react-redux";
import { logoutUser } from "../store/slice/authSlice.jsx";
import PersonalInfoForm from "../components/account/PersonalInfoForm";
import AccountSettingsForm from "../components/account/AccountSettingsForm";
import OrdersHistory from "../components/account/OrdersHistory";
import {TabPanel} from "../components/TabPanel/TabPanel";
import { h3, h5 } from "../styles/typographyStyles";

const tabPaths = ["personal-info", "account-settings", "orders-history", "logout"];

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
const auth = useSelector((state) => state.auth);
console.log("▶ AccountPage. auth:", auth);

const userData = auth.user
  ? { ...auth.user, email: auth.email } // <- берём email из auth.email
  : null;

console.log("▶ AccountPage. userData:", userData);

  

  const getTabIndexFromPath = () => {
    const path = location.pathname.split("/").pop();
    const index = tabPaths.indexOf(path);
    return index !== -1 ? index : 0;
  };

  const [tab, setTab] = useState(getTabIndexFromPath());

  const handleChange = (e, newValue) => {
    if (tabPaths[newValue] === "logout") {
      handleLogout();
      return;
    }
    setTab(newValue);
    navigate(`/account/${tabPaths[newValue]}`);
  };

  useEffect(() => {
    setTab(getTabIndexFromPath());
  }, [location.pathname]);

  const handleLogout = async () => {
    console.log("▶ LOGOUT CLICK");
    const result = await dispatch(logoutUser());
     navigate("/");
    console.log("LOGOUT RESULT:", result);
  };

  return (
    <Grid
      size={12}
      sx={{ px: 4, py: 4, display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography sx={{ ...h3, textAlign: "center", mb: 3, width: "100%" }}>
        My Account
      </Typography>
      <Paper elevation={1} sx={{ borderRadius: 3, p: 2, width: "100%", maxWidth: "1400px" }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 2 }}>
            <Tabs
              orientation="vertical"
              value={tab}
              onChange={handleChange}
              variant="scrollable"
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
                "& .MuiTab-root": {
                  ...h5,
                  textTransform: "none",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  py: 2,
                },
                "& .Mui-selected": { color: "#A4795B !important" },
              }}
            >
              <Tab icon={<PersonOutlineIcon />} iconPosition="start" label="Profile" />
              <Tab icon={<SettingsOutlinedIcon />} iconPosition="start" label="Settings" />
              <Tab
                icon={<ShoppingBagOutlinedIcon />}
                iconPosition="start"
                label="Orders"
                sx={{ borderBottom: "1px solid #E0E0E0", mb: 1 }}
              />
              <Tab
                icon={<LogoutOutlinedIcon />}
                iconPosition="start"
                label="Log out"
                sx={{
                  color: "#A63A3A !important",
                  "& .MuiSvgIcon-root": { color: "#A63A3A !important" },
                  "&.Mui-selected": { color: "#A63A3A !important" },
                }}
              />
            </Tabs>
          </Grid>

          <Grid sx={{ flexGrow: 1 }} size={{ xs: 12, md: 8 }}>
            <TabPanel value={tab} index={0}>
              <PersonalInfoForm user={userData} />;
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <AccountSettingsForm />
            </TabPanel>
            <TabPanel value={tab} index={2}>
              <OrdersHistory />
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
