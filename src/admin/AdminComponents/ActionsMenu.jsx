import { IconButton, Menu, MenuItem, Divider, ListItemIcon, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import editIcon from '../../assets/admin/edit.svg';
import deleteIcon from '../../assets/admin/delete.svg';
import viewIcon from '../../assets/admin/view.svg';
import hideIcon from '../../assets/admin/hide.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiWithAuth } from '../../store/api/axios.js';

export default function ActionsMenu({ id, type = 'product', productType = 'coffee', onRefresh, onViewOrder, onProductUpdated }) {
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
            const productTypeParam = productType === 'accessory' ? 'accessory' : 'product';
            navigate(`/admin/products/edit/${id}?type=${productTypeParam}`);
        } else if (type === 'order') {
            navigate(`/admin/orders/edit/${id}`);
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
            if (onViewOrder) {
                onViewOrder(id);
            } else {
                navigate(`/admin/orders`);
            }
        }
    };

    const handleDeleteClick = () => {
        handleClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        try {
            if (type === 'product') {
                await apiWithAuth.delete(`/products/${id}/deletion`);
            } else if (type === 'order') {
                await apiWithAuth.delete(`/orders/delete/${id}/`);
            }

            setDeleteDialogOpen(false);
            
            if (onRefresh) {
                onRefresh();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error.response?.data || error.message);
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
            // Устанавливаем visible: false и status: 'Hidden' для скрытия продукта
            // Пробуем сначала JSON, так как мы не отправляем файлы
            let response;
            try {
                response = await apiWithAuth.patch(`/products/product/${id}`, {
                    visible: false,
                    status: 'Hidden'
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (jsonError) {
                // Если JSON не работает, пробуем FormData
                console.warn("JSON request failed, trying FormData:", jsonError);
                const formData = new FormData();
                formData.append("visible", "false");
                formData.append("status", "Hidden");
                
                response = await apiWithAuth.patch(`/products/product/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            console.log("✅ Product hidden successfully");
            console.log("📊 Response data:", response.data);
            
            // Уведомляем родительский компонент об обновлении продукта
            // Это позволяет обновить локальное состояние без перезагрузки
            if (onProductUpdated) {
                onProductUpdated(id, { status: 'Hidden', visible: false });
            }
            
            // API не возвращает status и visible в ответе PATCH, но изменения должны быть применены
            // Даем время бэкенду обработать изменения
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Обновляем список продуктов
            if (onRefresh) {
                if (typeof onRefresh === 'function') {
                    try {
                        onRefresh();
                        console.log("✅ Product list refreshed");
                    } catch (e) {
                        console.warn("onRefresh failed, reloading page:", e);
                        window.location.reload();
                    }
                } else {
                    window.location.reload();
                }
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error("Error hiding product:", error.response?.data || error.message);
            console.error("Error details:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
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

            <Dialog open={deleteDialogOpen} onClose={() => !loading && setDeleteDialogOpen(false)}
                PaperProps={{sx: { borderRadius: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', minWidth: '400px', maxWidth: '500px'}}}>
                <DialogTitle sx={{  backgroundColor: '#EAD9C9', color: '#3E3027', fontWeight: 600, fontSize: '18px', borderBottom: '2px solid #D4C4B5', py: 2, px: 3}}>
                    Confirm Delete
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <DialogContentText sx={{  color: '#666', fontSize: '15px', lineHeight: 1.6}}>
                        Are you sure you want to delete this {type}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{  p: 2.5, px: 3, borderTop: '1px solid #f0f0f0', gap: 1.5}}>
                    <Button  onClick={() => setDeleteDialogOpen(false)}  disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#666',
                            border: '1px solid #e0e0e0',
                            backgroundColor: '#fff',
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                                borderColor: '#d0d0d0'
                            },
                            '&:disabled': {
                                color: '#999',
                                borderColor: '#e0e0e0'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button  onClick={handleDeleteConfirm}  disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#fff',
                            backgroundColor: '#FD8888',
                            '&:hover': {
                                backgroundColor: '#fc6d6d'
                            },
                            '&:disabled': {
                                backgroundColor: '#fccccc',
                                color: '#fff'
                            }
                        }}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
