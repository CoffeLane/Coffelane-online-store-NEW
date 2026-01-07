import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, Card, CardContent, Typography, useMediaQuery, useTheme } from '@mui/material';
import ActionsMenu from './ActionsMenu.jsx';
import PaginationControl from '../../components/PaginationControl/PaginationControl.jsx';
import { h5 } from "../../styles/typographyStyles.jsx";

export default function ProductsTableOrders({ products, onRowClick, page, totalPages, onPageChange, variant, selectedOrderId }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (isMobile) {
        return (
            <Box sx={{ width: '100%' }}>
                <Paper sx={{ 
                    borderRadius: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    mb: 2
                }}>
                    <Box sx={{ 
                        backgroundColor: '#EAD9C9',
                        px: 2,
                        py: 1.5,
                        borderBottom: '2px solid #D4C4B5'
                    }}>
                        <Typography sx={{ 
                            fontWeight: 600, 
                            fontSize: '14px', 
                            color: '#3E3027' 
                        }}>
                            Orders
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1.5,
                        p: 2,
                        backgroundColor: '#fafafa'
                    }}>
                        {products.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography sx={{ color: '#999', fontSize: '14px' }}>No orders found</Typography>
                            </Box>
                        ) : (
                            products.map((p) => {
                                const isSelected = p.id === selectedOrderId;
                                return (
                                    <Card
                                        key={p.id}
                                        sx={{
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                            border: isSelected ? '2px solid #A4795B' : '1px solid #e0e0e0',
                                            backgroundColor: isSelected ? '#f5e8dd' : '#ffffff',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                borderColor: isSelected ? '#A4795B' : '#d0d0d0',
                                            },
                                            '&:not(:last-child)': {
                                                borderBottom: '1px solid #f0f0f0',
                                            }
                                        }}
                                    >
                                    <CardContent sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 0.5 }}>
                                                    Order #{p.ID}
                                                </Typography>
                                                <Typography sx={{ fontSize: '13px', color: '#666', mb: 1 }}>
                                                    {p.customer}
                                                </Typography>
                                            </Box>
                                            <ActionsMenu id={p.id} type="order" onViewOrder={(orderId) => {
                                                const order = products.find(o => o.id === orderId);
                                                if (order && onRowClick) {
                                                    onRowClick(order);
                                                }
                                            }} />
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                            <Box>
                                                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.5 }}>Date</Typography>
                                                <Typography sx={{ fontSize: '13px' }}>
                                                    {p.date}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.5 }}>Items</Typography>
                                                <Typography sx={{ fontSize: '13px' }}>
                                                    {p.items}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.5 }}>Total</Typography>
                                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#16675C' }}>
                                                    ${p.total}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.5 }}>Status</Typography>
                                                <Chip
                                                    label={p.status}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor:
                                                            p.status === 'Delivered' ? '#46d95b' :
                                                                p.status === 'Processing' ? '#f5c407' :
                                                                    p.status === 'Cancelled' ? '#FD8888' : '#E0E0E0',
                                                        color: '#3E3027',
                                                        fontWeight: 600,
                                                        fontSize: '10px',
                                                        height: 24,
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })
                        )}
                    </Box>
                </Paper>
                <PaginationControl page={page} totalPages={totalPages} onPageChange={onPageChange} variant={variant} />
            </Box>
        );
    }

    return (
        <TableContainer 
            component={Paper} 
            sx={{ 
                width: '100%', 
                borderRadius: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
            }}
        >
            <Table sx={{ width: '100%' }}>
                <TableHead sx={{ 
                    backgroundColor: '#EAD9C9',
                    '& .MuiTableCell-head': {
                        fontWeight: 600,
                        fontSize: { xs: '12px', md: '14px' },
                        color: '#3E3027',
                        borderBottom: '2px solid #D4C4B5',
                        py: { xs: 1.5, md: 2 },
                    }
                }}>
                    <TableRow>
                        <TableCell sx={{...h5, fontSize: { xs: '12px', md: '14px' } }}>ID</TableCell>
                        <TableCell sx={{...h5, fontSize: { xs: '12px', md: '14px' } }}>Customer</TableCell>
                        <TableCell sx={{...h5, fontSize: { xs: '12px', md: '14px' } }}>Date</TableCell>
                        <TableCell sx={{...h5, fontSize: { xs: '12px', md: '14px' } }}>Items</TableCell>
                        <TableCell sx={{ ...h5, fontSize: { xs: '12px', md: '14px' } }}>Total</TableCell>
                        <TableCell sx={{...h5, fontSize: { xs: '12px', md: '14px' } }}>Status</TableCell>
                        <TableCell sx={{...h5, fontSize: { xs: '12px', md: '14px' } }}>Action</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#999', fontSize: { xs: '14px', md: '16px' } }}>
                                No orders found
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((p) => {
                            const isSelected = p.id === selectedOrderId;
                            return (
                                <TableRow 
                                    key={p.id} 
                                    sx={{ 
                                        backgroundColor: isSelected ? '#f5e8dd' : '#ffffff',
                                        '&:hover': { 
                                            backgroundColor: isSelected ? '#f5e8dd' : '#f8f2ed',
                                            transform: 'scale(1.001)',
                                            transition: 'all 0.2s ease',
                                        },
                                        transition: 'all 0.2s ease',
                                        borderBottom: '1px solid #f0f0f0',
                                        '&:last-child': {
                                            borderBottom: 'none',
                                        }
                                    }}
                                >
                                    <TableCell sx={{ fontSize: { xs: '12px', md: '14px' }, fontWeight: 600, color: '#16675C' }}>#{p.ID}</TableCell>
                                    <TableCell sx={{ fontSize: { xs: '12px', md: '14px' }, fontWeight: 500 }}>{p.customer}</TableCell>
                                    <TableCell sx={{ fontSize: { xs: '12px', md: '14px' }, color: '#666' }}>{p.date}</TableCell>
                                    <TableCell sx={{ fontSize: { xs: '12px', md: '14px' } }}>{p.items}</TableCell>
                                    <TableCell sx={{ fontSize: { xs: '12px', md: '14px' }, fontWeight: 600, color: '#16675C' }}>${p.total}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={p.status}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    p.status === 'Delivered' ? '#46d95b' :
                                                        p.status === 'Processing' ? '#f5c407' :
                                                            p.status === 'Cancelled' ? '#FD8888' : '#E0E0E0',
                                                color: '#3E3027',
                                                fontWeight: 600,
                                                fontSize: { xs: '10px', md: '12px' },
                                                height: { xs: 24, md: 28 },
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell><ActionsMenu id={p.id} type="order" onViewOrder={(orderId) => {
                                        const order = products.find(o => o.id === orderId);
                                        if (order && onRowClick) {
                                            onRowClick(order);
                                        }
                                    }} /></TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
            <PaginationControl page={page} totalPages={totalPages} onPageChange={onPageChange} variant={variant} />
        </TableContainer>
    );
}
