import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCartItems, addToCart } from "../../store/slice/cartSlice.jsx";
import { btnStyles, btnBorderStyles } from "../../styles/btnStyles.jsx";


export default function AddToCartButtons({ product, quantity, selectedSupplyId }) {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const navigate = useNavigate();
    const cartEntries = useSelector(selectCartItems);

    if (!product || !selectedSupplyId) return null;

    const isInCart = cartEntries.some(([key]) => key === `${product.id}-${selectedSupplyId}`);

    const addProductToCart = () => {
        if (!product) return;

        const supplies = product.supplies || [];

        const selectedSupply =
            supplies.find((s) => s.id === selectedSupplyId) || supplies[0];

        if (!selectedSupply) return;

        const key = `${product.id}-${selectedSupply.id}`;

        dispatch(
            addToCart({
                product: {
                    ...product,
                    price: Number(selectedSupply.price) || 0,
                    selectedSupplyId: selectedSupply.id,
                },
                quantity,
            })
        );
    };

    const handleAddToCart = () => {
        addProductToCart();
        setIsCartOpen(true);
    };

    const handleCheckout = () => {
        addProductToCart();
        navigate("/checkout");
    };

    return (
        <>
            <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 1.5, md: 2 }, 
                mt: { xs: 3, md: 7 },
                width: "100%"
            }}>
                <Button 
                    onClick={handleAddToCart} 
                    sx={{ 
                        ...(isInCart ? btnBorderStyles : btnStyles), 
                        textTransform: "none", 
                        width: "100%",
                        py: { xs: 1.5, md: 1.75 },
                        fontSize: { xs: '14px', md: '16px' }
                    }}
                >
                    {isInCart ? "In cart" : "Add to cart"}
                </Button>
                <Button 
                    sx={{ 
                        ...btnBorderStyles, 
                        width: "100%",
                        py: { xs: 1.5, md: 1.75 },
                        fontSize: { xs: '14px', md: '16px' }
                    }} 
                    onClick={handleCheckout}
                >
                    Checkout now
                </Button>
            </Box>

            {}
        </>
    );
}
