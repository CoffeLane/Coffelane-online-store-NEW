import { Box, Typography, Divider, Avatar, Chip, Stack } from '@mui/material';
import { h6, h3, h4, h5, h7 } from "../../styles/typographyStyles.jsx";

export default function OrderDetails({ order }) {
    if (!order) return null;

    return (
        <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#fff' }}>
            <Typography mb={2} sx={{ ...h3 }}>Order #{order.ID}</Typography>
            <Stack direction="row" spacing={1} mb={2} alignItems="center" justifyContent="space-between">
                <Chip label={order.status}
                    sx={{
                        ...h6,
                        bgcolor:
                            order.status === 'Delivered' ? '#7AF48C' :
                                order.status === 'Pending' ? '#FFE47A' :
                                    order.status === 'Cancelled' ? '#FD8888' : '#E0E0E0',
                        color: '#3E3027',
                    }}
                />
                <Typography sx={{ ...h6 }}>{order.date}</Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1} alignItems="center" mb={2} bgcolor={'#F9F9F9'} p={2} borderRadius={2}>
                <Avatar src={order.customerPhoto} alt={order.customer} sx={{ width: 80, height: 80 }} />
                <Typography sx={{ ...h4, textAlign: 'center' }}>{order.customer}</Typography>
                <Typography sx={{ ...h7, color: '#999' }}>ID: {order.customerId}</Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Typography sx={{ ...h4 }} mb={3}>Order items</Typography>

            {order?.itemsList?.map((item, idx) => (
                <Stack key={idx} direction="row" spacing={2} alignItems="center" mb={4}>
                    <Box component="img" src={item.image} alt={item.name} sx={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                        <Typography sx={{ ...h5, mb: 2 }}>{item.name}</Typography>
                        <Box flex={1} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ ...h6, }}>{item.quantity} item </Typography>
                            <Typography sx={{ ...h6, }}>${item.price}</Typography>
                        </Box>
                    </Box>
                </Stack>
            ))}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ ...h4, mb: 1 }}> Total:</Typography>
                <Typography sx={{ ...h4 }}> ${order.total}</Typography>
            </Box>
        </Box>
    );
}
