import { Box, Paper, List, ListItem, ListItemText, ListItemIcon, ListItemButton, AppBar, Toolbar, IconButton, Tooltip, Avatar } from '@mui/material';
import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
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

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: authUser, email } = useSelector((state) => state.auth);
  const isAdmin = useSelector((state) => state.auth.isAdmin);

  // Получаем инициалы для дефолтной аватарки
  const userInitials = useMemo(() => {
    const firstName = authUser?.first_name || '';
    const lastName = authUser?.last_name || '';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'A';
  }, [authUser?.first_name, authUser?.last_name]);

  // Получаем аватарку из authUser (обновляется автоматически после изменения в MyAccountAdmin)
  const avatar = authUser?.avatar || authUser?.profile?.avatar || null;

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleExitAdmin = () => {
    dispatch(setAdminMode(false));
    navigate('/');
  };

  // Формируем объект user из данных Redux store (с сервера)
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', background: "linear-gradient(to bottom, #FFFFFF, #EAD9C9)" }}>
      {/* Header с иконкой шестеренки */}
      <AppBar position="static" sx={{ backgroundColor: '#EAD9C9', boxShadow: 'none', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ color: '#16675C', fontSize: 28 }} />
            <Box sx={{ ...h6, color: '#16675C', fontWeight: 600 }}>Admin Panel</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Return to store">
              <IconButton
                onClick={handleExitAdmin}
                sx={{ color: '#3E3027', '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' } }}
                aria-label="Return to store"
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Paper elevation={3} sx={{ width: 250, m: 3, p: 2, display: 'flex', flexDirection: 'column', borderRadius: '24px', }}>
          <Box component="img" src={logo} alt="Coffee Lane logo" sx={{ width: '144px', height: '35px', mt: 3, mb: 4, px: 1 }} />

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={NavLink} to={item.path} end={item.text === 'Dashboard'} sx={{ '&.active': { backgroundColor: '#EAD9C9' }, '&:hover': { backgroundColor: '#f5e8ddff' } }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ ...h5 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ borderTop: '1px solid #999' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ '&.active': { backgroundColor: '#eddbcaff' }, '&:hover': { backgroundColor: '#f5e8ddff' } }}>
                <ListItemIcon>
                  <Box component="img" src={logoutIcon} sx={{ width: 24, height: 24 }} />
                </ListItemIcon>
                <ListItemText primary="Log out" sx={{ ...h6, color: '#A63A3A', }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        <Box component={RouterLink} to="/admin/account" sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto', px: 1, pb: 2, textDecoration: 'none', color: 'inherit', cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover', borderRadius:'16px', pt:'16px' } }}>
          {avatar ? (
            <Box 
              component="img" 
              src={avatar} 
              alt="Avatar" 
              sx={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: '#A4795B',
                color: 'white',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {userInitials}
            </Avatar>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ ...h6, mb: 1 }}>{user.firstName} {user.lastName}</Box>
            <Box sx={{ ...h7 }}>{user.position}</Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flexGrow: 1, pr: 3, pt: 3, overflowX: 'auto' }}>
        <Outlet />
      </Box>
      </Box>
    </Box>
  );
}
