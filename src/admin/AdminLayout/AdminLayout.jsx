import { Box, Paper, List, ListItem, ListItemText, ListItemIcon, ListItemButton, AppBar, Toolbar, IconButton, Tooltip, Avatar, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {  useMemo, useState, useEffect } from 'react';
import { logoutUser, setAdminMode } from '../../store/slice/authSlice';
import logo from '../../assets/images/header/logo.svg';
import dashboard from '../../assets/admin/dashboard.svg'
import products from '../../assets/admin/products.svg';
import orders from '../../assets/admin/orders.svg';
import logoutIcon from '../../assets/admin/logout-icon.svg';
import { h5, h6, h7 } from '../../styles/typographyStyles.jsx';
import { Link as RouterLink } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ScrollToTopButton from '../../components/ScrollToTopButton/ScrollToTopButton';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { user: authUser, email } = useSelector((state) => state.auth);
  const isAdmin = useSelector((state) => state.auth.isAdmin);

  const userInitials = useMemo(() => {
    const firstName = authUser?.first_name || '';
    const lastName = authUser?.last_name || '';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'A';
  }, [authUser?.first_name, authUser?.last_name]);

  const avatar = useMemo(() => {
    const authAvatar = authUser?.avatar || authUser?.profile?.avatar;
    if (authAvatar) {
      return authAvatar;
    }
    const savedAvatar = localStorage.getItem('userAvatar');
    return savedAvatar || null;
  }, [authUser?.avatar, authUser?.profile?.avatar]);

  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleExitAdmin = () => {
    dispatch(setAdminMode(false));
    navigate('/');
  };

  const user = {
    firstName: authUser?.first_name || 'Admin',
    lastName: authUser?.last_name || 'User',
    position: 'Administrator',
    avatar: avatar,
    email: email || authUser?.email || '',
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Box component="img" src={dashboard} sx={{ width: 24, height: 24 }} />,
      path: '/admin/',
    },
    {
      text: 'Products',
      icon: <Box component="img" src={products} sx={{ width: 24, height: 24 }} />,
      path: '/admin/products',
    },
    {
      text: 'Orders',
      icon: <Box component="img" src={orders} sx={{ width: 24, height: 24 }} />,
      path: '/admin/orders',
    },
  ];

  const SidebarContent = () => (
    <Paper elevation={3} sx={{ 
      width: { xs: '100%', md: 250 }, 
      height: '100%',
      m: { xs: 0, md: 3 }, 
      p: { xs: 2, md: 2 }, 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: { xs: 0, md: '24px' },
      boxSizing: 'border-box',
    }}>
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pt: 1 }}>
          <Box component="img" src={logo} alt="Coffee Lane logo" sx={{ width: '120px', height: 'auto' }} />
          <IconButton 
            onClick={() => setMobileMenuOpen(false)} 
            sx={{ color: '#3E3027', p: 0.5, minWidth: 'auto' }}
            aria-label="Close menu"
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Box>
      )}
      {!isMobile && (
        <Box component="img" src={logo} alt="Coffee Lane logo" sx={{ width: '144px', height: '35px', mt: 3, mb: 4, px: 1 }} />
      )}

      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/admin/' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={NavLink} 
                to={item.path} 
                end={item.text === 'Dashboard'} 
                onClick={() => isMobile && setMobileMenuOpen(false)}
                sx={{ 
                  backgroundColor: isActive ? '#EAD9C9' : 'transparent',
                  '&.active': { backgroundColor: '#EAD9C9' }, 
                  '&:hover': { backgroundColor: '#f5e8ddff' },
                  py: { xs: 1.5, md: 1 }
                }}
              >
                <ListItemIcon sx={{ minWidth: { xs: 40, md: 56 } }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ borderTop: '1px solid #999', mt: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => {
                handleLogout();
                if (isMobile) setMobileMenuOpen(false);
              }} 
              sx={{ '&.active': { backgroundColor: '#eddbcaff' }, '&:hover': { backgroundColor: '#f5e8ddff' }, py: { xs: 1.5, md: 1 } }}
            >
              <ListItemIcon sx={{ minWidth: { xs: 40, md: 56 } }}>
                <Box component="img" src={logoutIcon} sx={{ width: 24, height: 24 }} />
              </ListItemIcon>
              <ListItemText primary="Log out" sx={{ ...h6, color: '#A63A3A', fontSize: { xs: '14px', md: '16px' } }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Box 
        component={RouterLink} 
        to="/admin/account" 
        onClick={() => isMobile && setMobileMenuOpen(false)}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1.5, md: 2 }, 
          mt: 'auto', 
          px: 1, 
          pb: 2, 
          textDecoration: 'none', 
          color: 'inherit', 
          cursor: 'pointer', 
          '&:hover': { backgroundColor: 'action.hover', borderRadius:'16px', pt:'16px' } 
        }}
      >
        {avatar && !avatarError ? (
          <Box 
            component="img" 
            src={avatar} 
            alt="Avatar" 
            onError={() => setAvatarError(true)}
            sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <Avatar
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              bgcolor: '#A4795B',
              color: 'white',
              fontSize: { xs: '16px', md: '18px' },
              fontWeight: 600,
            }}
          >
            {userInitials}
          </Avatar>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ ...h6, mb: 1, fontSize: { xs: '14px', md: '16px' } }}>{user.firstName} {user.lastName}</Box>
          <Box sx={{ ...h7, fontSize: { xs: '12px', md: '14px' } }}>{user.position}</Box>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', background: "linear-gradient(to bottom, #FFFFFF, #EAD9C9)" }}>
      <AppBar position="static" sx={{ backgroundColor: '#EAD9C9', boxShadow: 'none', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: '#3E3027', mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <SettingsIcon sx={{ color: '#16675C', fontSize: { xs: 24, md: 28 } }} />
            <Box sx={{ ...h6, color: '#16675C', fontWeight: 600, fontSize: { xs: '16px', md: '18px' } }}>Admin Panel</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            <Tooltip title="Return to store">
              <IconButton
                onClick={handleExitAdmin}
                sx={{ color: '#3E3027', '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' } }}
                aria-label="Return to store"
              >
                <HomeIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {isMobile ? (
          <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: 280,
                maxWidth: '85vw',
                backgroundColor: '#EAD9C9',
                boxSizing: 'border-box',
              }
            }}
          >
            <SidebarContent />
          </Drawer>
        ) : (
          <SidebarContent />
        )}

        <Box 
          data-admin-content
          sx={{ 
            flexGrow: 1, 
            pr: { xs: 2, md: 3 }, 
            pt: { xs: 2, md: 3 }, 
            pl: { xs: 2, md: 0 },
            overflowX: 'auto',
            overflowY: 'auto',
            width: { xs: '100%', md: 'auto' },
            maxWidth: { xs: '100%', md: 'none' },
            boxSizing: 'border-box'
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <ScrollToTopButton />
    </Box>
  );
}
