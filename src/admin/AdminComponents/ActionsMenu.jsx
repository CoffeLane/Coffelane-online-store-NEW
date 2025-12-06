import { IconButton, Menu, MenuItem, Divider, ListItemIcon, Box } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import editIcon from '../../assets/admin/edit.svg';
import deleteIcon from '../../assets/admin/delete.svg';
import viewIcon from '../../assets/admin/view.svg';
import hideIcon from '../../assets/admin/hide.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';



export default function ActionsMenu({ id }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);


     const handleEdit = () => {
    handleClose();                     
    navigate(`/admin/products/edit/${id}`); 
  };

    return (
        <>
            <IconButton size="small" onClick={handleClick}>
                <MoreVertIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { border: '1px solid #000', borderRadius: 2, overflow: 'hidden', } }}>
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <Box component="img" src={editIcon} sx={{ width: 20, height: 20 }} />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Box component="img" src={deleteIcon} sx={{ width: 20, height: 20 }} />
                    </ListItemIcon>
                    Delete
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Box component="img" src={viewIcon} sx={{ width: 20, height: 20 }} />
                    </ListItemIcon>
                    View
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Box component="img" src={hideIcon} sx={{ width: 20, height: 20 }} />
                    </ListItemIcon>
                    Hide
                </MenuItem>
            </Menu>
        </>
    );
}
