import { Box, Paper, List, ListItem, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slice/authSlice';
import logo from '../../assets/images/header/logo.svg';
import dashboard from '../../assets/admin/dashboard.svg'
import products from '../../assets/admin/products.svg';
import orders from '../../assets/admin/orders.svg';
import logoutIcon from '../../assets/admin/logout-icon.svg';
import { h5, h6, h7 } from '../../styles/typographyStyles.jsx';
import userAvatar from '../../assets/admin/user-avatar.jpg';
import { Link as RouterLink } from 'react-router-dom';

export default function AdminLayout() {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.auth);

  // if (!user || user.role !== 'admin') {
  //   return <Navigate to="/" replace />;
  // }

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const user = {
    firstName: 'Jane',
    lastName: 'Jordan',
    position: 'Administrator',
    avatar: userAvatar
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
    <Box sx={{ display: 'flex', height: '100vh', background: "linear-gradient(to bottom, #FFFFFF, #EAD9C9)" }}>

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
          <Box component="img" src={user.avatar} alt="Avatar" sx={{ width: 48, height: 48, borderRadius: '50%' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ ...h6, mb: 1 }}>{user.firstName} {user.lastName}</Box>
            <Box sx={{ ...h7 }}>{user.position}</Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flexGrow: 1, pr: 3, overflowX: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
