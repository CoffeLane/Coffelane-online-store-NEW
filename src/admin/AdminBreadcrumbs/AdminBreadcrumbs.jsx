import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { h3 } from '../../styles/typographyStyles.jsx';

export default function AdminBreadcrumbs() {
  const { pathname } = useLocation();

  const labels = {
    admin: 'Admin',
    products: 'Products',
    add: 'Add Product',
    edit: 'Edit Product',
    editOrder: 'Edit Order',
    orders: 'Orders',
    account: 'My Account',
  };

  let segments = pathname.split('/').filter(Boolean);
  
  if (segments[0] !== 'admin') {
    segments = ['admin', ...segments];
  }

  if (segments.length >= 4 && segments[2] === 'orders' && segments[3] === 'edit') {
    segments = ['admin', 'orders', 'edit'];
  }

  if (segments.length >= 4 && segments[2] === 'edit' && segments[1] === 'products') {
    segments = segments.slice(0, 3);
  }

  if (segments.length === 1 && segments[0] === 'admin') {
    return (
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Typography sx={{ ...h3, fontSize: { xs: '14px', md: h3.fontSize } }}>Admin</Typography>
      </Breadcrumbs>
    );
  }

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      {segments.map((seg, idx) => {
        const to = `/${segments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === segments.length - 1;
        const label = labels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);

        return isLast ? (
          <Typography key={to} sx={{ ...h3, fontSize: { xs: '14px', md: h3.fontSize } }}>
            {label}
          </Typography>
        ) : (
          <Link key={to} component={RouterLink} underline="hover" color="inherit" to={to} sx={{ fontSize: { xs: '14px', md: 'inherit' } }}>
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}