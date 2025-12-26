import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
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
import { logoutUser, fetchProfile } from "../store/slice/authSlice.jsx";
import PersonalInfoForm from "../components/account/PersonalInfoForm";
import AccountSettingsForm from "../components/account/AccountSettingsForm";
import OrdersHistory from "../components/account/OrdersHistory";
import {TabPanel} from "../components/TabPanel/TabPanel";
import { h3, h5 } from "../styles/typographyStyles";

const tabPaths = ["personal-info", "account-settings", "orders-history", "logout"];

// Список админских email (должен совпадать с authSlice и App.jsx)
const ADMIN_EMAILS = [
  'admin@coffeelane.com',
  'admin@example.com',
];

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  
  // console.log("▶ AccountPage. auth:", auth);

  let userEmail = null;

  if (auth.user?.email) {
    userEmail = auth.user.email;
  } else if (auth.profile?.email) {
    userEmail = auth.profile.email;
  } else if (auth.email) {
    userEmail = auth.email;
  }

  // Проверяем, является ли пользователь админом
  const isAdminUser = auth.isAdmin || 
    (userEmail && ADMIN_EMAILS.some(adminEmail => 
      userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()
    )) ||
    (auth.user?.role === 'admin' || auth.user?.role === 'Administrator');

  // Если пользователь админ, перенаправляем на админскую страницу аккаунта
  useEffect(() => {
    if (isAdminUser) {
      navigate('/admin/account');
    }
  }, [isAdminUser, navigate]);

  // Если пользователь админ, не рендерим обычную страницу аккаунта
  if (isAdminUser) {
    return null; // или можно показать загрузку
  }

  const userData = auth.user
    ? { ...auth.user, email: userEmail || "" }
    : null;

// console.log("▶ AccountPage. userData:", userData);
// console.log("▶ AccountPage. userEmail:", userEmail);
// console.log("▶ AccountPage. auth.user:", auth.user);
// console.log("▶ AccountPage. auth.profile:", auth.profile);
// console.log("▶ AccountPage. auth.email:", auth.email);

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

  useEffect(() => {
    const token = localStorage.getItem("access");
    // Всегда обновляем профиль при монтировании компонента, чтобы получить актуальные данные
    // Это важно, чтобы разделить данные обычного пользователя и админа
    if (token && !auth.tokenInvalid && !auth.loading) {
      // console.log("▶ AccountPage - Fetching profile to ensure we have current user data...");
      dispatch(fetchProfile());
    }
  }, [dispatch]); // Вызываем только при монтировании компонента

  const handleLogout = async () => {
    // console.log("▶ LOGOUT CLICK");
    const result = await dispatch(logoutUser());
     navigate("/");
    // console.log("LOGOUT RESULT:", result);
  };

  return (
    <Grid
      size={12}
      sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, md: 4 }, display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography sx={{ ...h3, textAlign: "center", mb: { xs: 2, md: 3 }, width: "100%", fontSize: { xs: '24px', md: '32px' } }}>
        My Account
      </Typography>
      <Paper elevation={1} sx={{ borderRadius: 3, p: { xs: 1, md: 2 }, width: "100%", maxWidth: "1400px" }}>
        <Grid container spacing={{ xs: 2, md: 6 }}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: { xs: 0, md: 2 }, display: "flex", flexDirection: "column" }}>
            <Tabs
              orientation={{ xs: "horizontal", md: "vertical" }}
              value={tab}
              onChange={handleChange}
              variant={{ xs: "scrollable", md: "standard" }}
              scrollButtons={{ xs: "auto", md: false }}
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
                borderRight: { xs: "none", md: "1px solid #E0E0E0" },
                width: { xs: "100%", md: "100%" },
                "& .MuiTabs-flexContainer": {
                  flexDirection: { xs: "row", md: "column" },
                },
                "& .MuiTab-root": {
                  ...h5,
                  textTransform: "none",
                  alignItems: { xs: "center", md: "flex-start" },
                  justifyContent: { xs: "center", md: "flex-start" },
                  py: { xs: 1, md: 2 },
                  fontSize: { xs: '12px', md: '16px' },
                  minHeight: { xs: 48, md: 72 },
                  width: { xs: "auto", md: "100%" },
                  maxWidth: { xs: "none", md: "100%" },
                },
                "& .Mui-selected": { color: "#A4795B !important" },
                borderBottom: { xs: "1px solid #E0E0E0", md: "none" },
                mb: { xs: 2, md: 0 },
              }}
            >
              <Tab icon={<PersonOutlineIcon sx={{ fontSize: { xs: 18, md: 24 } }} />} iconPosition="start" label="Profile" />
              <Tab icon={<SettingsOutlinedIcon sx={{ fontSize: { xs: 18, md: 24 } }} />} iconPosition="start" label="Settings" />
              <Tab
                icon={<ShoppingBagOutlinedIcon sx={{ fontSize: { xs: 18, md: 24 } }} />}
                iconPosition="start"
                label="Orders"
                sx={{ borderBottom: { xs: "none", md: "1px solid #E0E0E0" }, mb: { xs: 0, md: 1 } }}
              />
              <Tab
                icon={<LogoutOutlinedIcon sx={{ fontSize: { xs: 18, md: 24 } }} />}
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
