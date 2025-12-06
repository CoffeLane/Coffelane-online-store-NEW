import { IconButton, Menu, MenuItem, Divider, ListItemIcon, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import editIcon from '../../assets/admin/edit.svg';
import deleteIcon from '../../assets/admin/delete.svg';
import viewIcon from '../../assets/admin/view.svg';
import hideIcon from '../../assets/admin/hide.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiWithAuth } from '../../store/api/axios.js';

export default function ActionsMenu({ id, type = 'product', productType = 'coffee', onRefresh }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleEdit = () => {
        handleClose();
        if (type === 'product') {
            navigate(`/admin/products/edit/${id}`);
        } else if (type === 'order') {
            navigate(`/admin/orders`);
        }
    };

    const handleView = () => {
        handleClose();
        if (type === 'product') {
            const path = productType === 'accessory' 
                ? `/accessories/product/${id}` 
                : `/coffee/product/${id}`;
            navigate(path);
        } else if (type === 'order') {
            navigate(`/admin/orders`);
        }
    };

    const handleDeleteClick = () => {
        handleClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access");
            if (!token) {
                alert("You must be logged in to delete items!");
                setLoading(false);
                setDeleteDialogOpen(false);
                return;
            }

            const apiAuth = apiWithAuth(token);
            
            if (type === 'product') {
                await apiAuth.delete(`/products/${id}/deletion`);
            } else if (type === 'order') {
                await apiAuth.delete(`/orders/${id}/deletion`);
            }

            // console.log(`✅ ${type} deleted successfully`);
            setDeleteDialogOpen(false);
            
            if (onRefresh) {
                onRefresh();
            } else {
                window.location.reload();
            }
        } catch (error) {
            // console.error(`❌ Error deleting ${type}:`, error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 
                               error.response?.data?.message || 
                               `Error when deleting ${type}. Please try again.`;
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleHide = async () => {
        handleClose();
        
        if (type !== 'product') {
            alert("Hide action is only available for products");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("access");
            if (!token) {
                alert("You must be logged in to hide products!");
                setLoading(false);
                return;
            }

            const apiAuth = apiWithAuth(token);
            await apiAuth.patch(`/products/product/${id}`, { status: 'Hidden' });

            // console.log("✅ Product hidden successfully");
            
            if (onRefresh) {
                onRefresh();
            } else {
                window.location.reload();
            }
        } catch (error) {
            // console.error("❌ Error hiding product:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 
                               error.response?.data?.message || 
                               "Error when hiding product. Please try again.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <IconButton size="small" onClick={handleClick} disabled={loading}>
                <MoreVertIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { border: '1px solid #000', borderRadius: 2, overflow: 'hidden', } }}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <Box component="img" src={editIcon} sx={{ width: 20, height: 20 }} />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                        <Box component="img" src={deleteIcon} sx={{ width: 20, height: 20 }} />
                    </ListItemIcon>
                    Delete
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleView}>
                    <ListItemIcon>
                        <Box component="img" src={viewIcon} sx={{ width: 20, height: 20 }} />
                    </ListItemIcon>
                    View
                </MenuItem>
                {type === 'product' && (
                    <Divider />
                )}
                {type === 'product' && (
                    <MenuItem onClick={handleHide}>
                        <ListItemIcon>
                            <Box component="img" src={hideIcon} sx={{ width: 20, height: 20 }} />
                        </ListItemIcon>
                        Hide
                    </MenuItem>
                )}
            </Menu>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => !loading && setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this {type}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
