import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, matchPath } from 'react-router-dom';
import {h3,} from '../../styles/typographyStyles.jsx';




export default function AdminBreadcrumbs() {
  const { pathname } = useLocation();

  const labels = {
    products: 'Products',
    add: 'Add Product',
    edit: 'Edit Product',
    orders: 'Orders',
    account: 'My Account',
  };

  let segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'admin') segments = segments.slice(1);

  if (segments.length >= 3 && segments[1] === 'edit') {
    segments = segments.slice(0, 2);
  }

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      {segments.map((seg, idx) => {
        const to = `/${segments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === segments.length - 1;
        const label = labels[seg] || seg;

        return isLast ? (
          <Typography key={to} sx={{ ...h3 }}>
            {label}
          </Typography>
        ) : (
          <Link
            key={to}
            component={RouterLink}
            underline="hover"
            color="inherit"
            to={to}
          >
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}