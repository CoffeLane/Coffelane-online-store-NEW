import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCartItems, addToCart } from "../../store/slice/cartSlice.jsx";
import { btnStyles, btnBorderStyles } from "../../styles/btnStyles.jsx";


export default function AddToCartButtons({ product, quantity }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartEntries = useSelector(selectCartItems);
    const [isCartOpen, setIsCartOpen] = useState(false);

    if (!product) return null;

    const key = `${product.id}`;
    const isInCart = cartEntries.some(([cartKey]) => cartKey === key);

    const addProductToCart = () => {
        dispatch(
            addToCart({
                product: {
                    ...product,
                    price: Number(product.price || 0),
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