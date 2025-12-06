import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

/**
 * props:
 *  open (bool) - открыть модалку
 *  onClose (fn) - закрыть
 *  items (array) - [{ id, name, price, qty, img }]
 *  onChangeQty(id, newQty)
 *  onRemove(id)
 *  onCheckout()
 *
 * Если используешь Redux — передавай items и обработчики из контейнера.
 */

export default function BasketModal({
  open,
  onClose,
  items = [],
  onChangeQty = () => {},
  onRemove = () => {},
  onCheckout = () => {},
}) {
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="basket-dialog-title"
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">Корзина</Typography>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {items.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="subtitle1">Ваша корзина пуста</Typography>
            <Typography variant="body2" color="text.secondary">Добавьте товары, чтобы увидеть их здесь.</Typography>
          </Box>
        ) : (
          <List>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={item.img}
                      alt={item.name}
                      sx={{ width: 64, height: 64, mr: 2 }}
                    />
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="body2">Цена: {item.price.toFixed(2)} ₴</Typography>

                        {/* Количественые кнопки */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => onChangeQty(item.id, Math.max(1, item.qty - 1))}
                            aria-label="decrement"
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>

                          <TextField
                            value={item.qty}
                            onChange={(e) => {
                              const v = parseInt(e.target.value || "0", 10);
                              if (!Number.isNaN(v) && v > 0) onChangeQty(item.id, v);
                            }}
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", style: { textAlign: "center", width: 36 } }}
                            size="small"
                          />

                          <IconButton
                            size="small"
                            onClick={() => onChangeQty(item.id, item.qty + 1)}
                            aria-label="increment"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <IconButton
                          color="error"
                          onClick={() => onRemove(item.id)}
                          aria-label="remove"
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  />

                  <Box sx={{ ml: 2, textAlign: "right" }}>
                    <Typography variant="subtitle2">{(item.price * item.qty).toFixed(2)} ₴</Typography>
                    <Typography variant="caption" color="text.secondary">({item.qty} × {item.price.toFixed(2)})</Typography>
                  </Box>
                </ListItem>

                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ flexDirection: "column", gap: 1, alignItems: "stretch", p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1 }}>
          <Typography variant="subtitle1">Итого</Typography>
          <Typography variant="h6">{total.toFixed(2)} ₴</Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" fullWidth onClick={onClose}>
            Продолжить покупки
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onCheckout();
              // если нужно — можно закрывать модалку после checkout:
              // onClose();
            }}
            disabled={items.length === 0}
          >
            Оформить заказ
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
