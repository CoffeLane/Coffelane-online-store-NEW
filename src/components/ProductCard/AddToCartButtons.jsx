import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCartItems, addToCart } from "../../store/slice/cartSlice.jsx";
import { btnStyles, btnBorderStyles } from "../../styles/btnStyles.jsx";
// import CartModal from "../CartModal/index.jsx";



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
            <Box sx={{ display: "flex", gap: 2, mt: 7 }}>
                <Button onClick={handleAddToCart} sx={{ ...(isInCart ? btnBorderStyles : btnStyles), textTransform: "none", width: "100%" }} >
                    {isInCart ? "In cart" : "Add to cart"}
                </Button>
                <Button sx={{ ...btnBorderStyles, width: "100%" }} onClick={handleCheckout}>
                    Checkout now
                </Button>
            </Box>

            {/* <CartModal open={isCartOpen} onClose={() => setIsCartOpen(false)} /> */}
        </>
    );
}
