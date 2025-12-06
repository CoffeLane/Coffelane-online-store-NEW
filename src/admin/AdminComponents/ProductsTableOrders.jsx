import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import ActionsMenu from './ActionsMenu.jsx';
import PaginationControl from '../../components/PaginationControl/PaginationControl.jsx';
import { h5 } from "../../styles/typographyStyles.jsx";

export default function ProductsTableOrders({ products, onRowClick, page, totalPages, onPageChange, variant, selectedOrderId }) {
    return (
        <TableContainer component={Paper} sx={{ width: '100%', borderRadius: '24px' }}>
            <Table sx={{ width: '100%' }}>
                <TableHead sx={{ backgroundColor: '#EAD9C9' }}>
                    <TableRow>
                        <TableCell sx={{...h5 }}>ID</TableCell>
                        <TableCell sx={{...h5 }}>Customer</TableCell>
                        <TableCell sx={{...h5 }}>Date</TableCell>
                        <TableCell sx={{...h5 }}>Items</TableCell>
                        <TableCell sx={{ ...h5 }}>Total</TableCell>
                        <TableCell sx={{...h5 }}>Status</TableCell>
                        <TableCell sx={{...h5 }}>Action</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {products.map((p) => {
                        const isSelected = p.id === selectedOrderId;
                        return (
                            <TableRow key={p.id} sx={{ cursor: 'pointer', backgroundColor: isSelected ? '#f5e8dd' : 'inherit', '&:hover': { backgroundColor: isSelected ? '#f5e8dd' : '#f8f2ed' }}} onClick={() => onRowClick(p)}>
                                <TableCell>#{p.ID}</TableCell>
                                <TableCell>{p.customer} </TableCell>
                                <TableCell>{p.date}</TableCell>
                                <TableCell>{p.items} </TableCell>
                                <TableCell>{p.total}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={p.status}
                                        sx={{
                                            backgroundColor:
                                                p.status === 'Delivered' ? '#7AF48C' :
                                                    p.status === 'Pending' ? '#FFE47A' :
                                                        p.status === 'Cancelled' ? '#FD8888' : '#E0E0E0',
                                            color: '#3E3027',
                                        }}
                                    />
                                </TableCell>
                                <TableCell><ActionsMenu id={p.id} type="order" /></TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <PaginationControl page={page} totalPages={totalPages} onPageChange={onPageChange} variant={variant} />
        </TableContainer>
    );
}
