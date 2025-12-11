import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Grid, Box, Typography, Button, Divider, Checkbox, FormControlLabel, TextField } from "@mui/material";
import ContactDetailsForm from "../components/Checkout/ContactDetailsForm.jsx";
import PaymentForm from "../components/Checkout/PaymentForm.jsx";
import CartSummary from "../components/Checkout/CartSummary.jsx";
import { selectCartItems, selectCartTotal, addToCart, decrementQuantity, removeFromCart, clearCart } from "../store/slice/cartSlice.jsx";
import { createOrder } from "../store/slice/ordersSlice.jsx";
import { validateContact } from "../components/utils/validation/validateContact.jsx";
import icon1 from "../assets/icons/1icon.svg";
import icon2 from "../assets/icons/2icon.svg";
import icon3 from "../assets/icons/3icon.svg";
import icondelete from "../assets/icons/delete-icon.svg";
import LoginModal from "../components/Modal/LoginModal.jsx";
import { titlePage, h6, h5 } from "../styles/typographyStyles";
import { inputStyles, checkboxStyles, helperTextRed, } from "../styles/inputStyles.jsx";
import { btnStyles, btnCart } from "../styles/btnStyles.jsx";
import { formatPhone, formatCardNumber, formatExpiry } from "../components/utils/formatters.jsx";
import { CircularProgress } from "@mui/material";
import api from "../store/api/axios.js";

export default function CheckoutPage() {
    const items = useSelector(selectCartItems);
    const total = useSelector(selectCartTotal);
    const { creating: isCreatingOrder, currentOrder } = useSelector((state) => state.orders);
    const user = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1);
    const [openLogin, setOpenLogin] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [region, setRegion] = useState("");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");
    const [country, setCountry] = useState("");

    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [agreed, setAgreed] = useState(false);

    const [discount, setDiscount] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountCode, setDiscountCode] = useState(null); // Сохраняем информацию о примененном коде
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState("");
    const [errors, setErrors] = useState({});
    const pendingOrderDataRef = useRef(null); // Сохраняем данные заказа для повторной попытки после логина

    useEffect(() => {
        if (user && token && pendingOrderDataRef.current && openLogin) {
            console.log("✅ User logged in, retrying order creation...");
            const orderData = pendingOrderDataRef.current;
            pendingOrderDataRef.current = null;
            setOpenLogin(false);

            setTimeout(async () => {
                try {
                    const result = await dispatch(createOrder(orderData));
                    if (result.meta.requestStatus === "fulfilled") {
                        const order = result.payload;
                        console.log("✅ Order created successfully after login:", order);
                        dispatch(clearCart());
                        navigate("/order_successful", {
                            state: {
                                orderNumber: order.id || order.order_number || order.number || order.order_id,
                                email: orderData.email || user.email,
                                firstName: orderData.first_name,
                                lastName: orderData.last_name,
                                total: orderData.total,
                                orderId: order.id,
                            },
                        });
                    }
                } catch (error) {
                    console.error("❌ Error retrying order after login:", error);
                }
            }, 500);
        }
    }, [user, token, openLogin, dispatch, navigate]);

    const handleContinue = () => {
        const contactErrors = validateContact({ firstName, lastName, email, phone, street, region, state, zip, country });
        setErrors(contactErrors);
        if (Object.keys(contactErrors).length === 0) setStep(2);
    };

    const handleCompletePayment = async () => {

        const accessToken = token || localStorage.getItem("access");
        if (!accessToken || !user) {
            console.warn("⚠️ User not authenticated, opening login modal");
            setOpenLogin(true);
            setErrors({ submit: "Please log in to complete your order." });
            return;
        }

        const contactErrors = validateContact({ firstName, lastName, email, phone, street, region, state, zip, country });
        const newErrors = { ...contactErrors };

        if (!cardName.trim()) newErrors.cardName = "Card holder name required";
        else if (!/^[A-Za-z]+([ '-][A-Za-z]+)*$/.test(cardName)) newErrors.cardName = "Invalid card name. Please enter first and last name.";

        if (!cardNumber.trim()) newErrors.cardNumber = "Card number required";
        else if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, ""))) newErrors.cardNumber = "Must be 16 digits";

        if (!expiry.trim()) newErrors.expiry = "Expire date required";
        else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) newErrors.expiry = "Format MM/YY";

        if (!cvv.trim()) newErrors.cvv = "CVV required";
        else if (!/^\d{3}$/.test(cvv)) newErrors.cvv = "Must be 3 digits";

        if (!agreed) newErrors.agreed = "You must agree to the Privacy Policy and Terms of Use.";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const orderItems = items.map(([key, item]) => {
            const product = item.product;

            const position = { quantity: item.quantity };

            if (product.id) {
                // Если это продукт
                position.product_id = Number(product.id);

                if (product.selectedSupplyId) {
                    position.supply_id = Number(product.selectedSupplyId);
                }
            } else if (product.isAccessory) {
                // Если это аксессуар
                position.accessory_id = Number(product.id);
            }

            return position;
        });

        const orderData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phone.replace(/\s+/g, ""),
            street_name: street,
            region: region,
            state: state,
            zip_code: zip,
            country: country || "Ukraine", // По умолчанию Ukraine, если не указано
            items: orderItems,
            total: (total - discountAmount).toFixed(2),
            discount: discountAmount > 0 ? discountAmount.toFixed(2) : "0.00",
        };

        console.log("🛒 Starting order creation process...");
        console.log("📦 Order data:", JSON.stringify(orderData, null, 2));
        console.log("🛍️ Cart items count:", items.length);
        console.log("💰 Total amount:", total);
        console.log("🎫 Discount amount:", discountAmount);

        try {

            pendingOrderDataRef.current = orderData;
            const result = await dispatch(createOrder(orderData));

            if (result.meta.requestStatus === "fulfilled") {
                const order = result.payload;
                console.log("✅ Order successfully created!");
                console.log("📋 Order ID:", order.id);
                console.log("📋 Order number:", order.order_number || order.id || order.number);
                console.log("📋 Order status:", order.status);
                console.log("📋 Full order response:", JSON.stringify(order, null, 2));

                dispatch(clearCart());
                console.log("🛒 Cart cleared after successful order");

                pendingOrderDataRef.current = null;

                const orderNumber = order.id || order.order_number || order.number || order.order_id;
                console.log("📝 Navigating to order success page with order number:", orderNumber);

                navigate("/order_successful", {
                    state: {
                        orderNumber: orderNumber,
                        email: email,
                        firstName: firstName,
                        lastName: lastName,
                        total: (total - discountAmount).toFixed(2),
                        orderId: order.id,
                    },
                });
            } else {
                console.error("❌ Order creation failed!");
                console.error("❌ Error details:", result.payload);
                console.error("❌ Error message:", result.payload?.detail || result.payload?.message || "Unknown error");

                if (result.payload?.requiresLogin) {
                    setOpenLogin(true);
                    setErrors({ submit: "Your session has expired. Please log in and try again." });
                } else {

                    const errorMsg = result.payload?.error || result.payload?.detail || result.payload?.message || "Failed to create order. Please try again.";
                    console.error("❌ Order creation error details:", result.payload);
                    setErrors({ submit: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) });
                }
            }
        } catch (error) {
            console.error("❌ Unexpected error creating order:", error);
            setErrors({ submit: "An unexpected error occurred. Please try again." });
        }
    };

    const handleQuantityChange = (key, change, cartItem) => {
        const { product, quantity } = cartItem;
        const supplyId = product.selectedSupplyId;
        if (change === 1) dispatch(addToCart({ product, quantity: 1, selectedSupplyId: supplyId }));
        else if (change === -1 && quantity > 1) dispatch(decrementQuantity(key));
    };

    const handleRemove = (key) => dispatch(removeFromCart(key));

    const handleApplyDiscount = async () => {
        if (!discount.trim()) {
            setDiscountError("Please enter a discount code");
            return;
        }

        setDiscountLoading(true);
        setDiscountError("");
        setDiscountAmount(0);
        setDiscountCode(null);

        try {
            const response = await api.get(`/discount-codes/${discount.trim()}/`);
            const discountData = response.data;

            console.log("✅ Discount code fetched:", discountData);

            let calculatedDiscount = 0;

            if (discountData.discount_percent) {

                calculatedDiscount = total * (discountData.discount_percent / 100);
            } else if (discountData.discount_amount) {

                calculatedDiscount = Math.min(discountData.discount_amount, total);
            }

            setDiscountAmount(calculatedDiscount);
            setDiscountCode(discountData);
            setDiscountError("");
        } catch (err) {
            console.error("❌ Discount code error:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.detail ||
                err.response?.data?.message ||
                "Invalid or expired discount code";
            setDiscountError(errorMsg);
            setDiscountAmount(0);
            setDiscountCode(null);
        } finally {
            setDiscountLoading(false);
        }
    };

    return (
        <Grid sx={{ px: 4, py: 4 }}>
            <Typography sx={{ ...titlePage, textAlign: "center", mb: 3 }}>Checkout page</Typography>
            <Box sx={{ display: "flex", flexWrap: "nowrap", gap: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "50%" }}>
                    <ContactDetailsForm
                        step={step}
                        firstName={firstName} setFirstName={setFirstName}
                        lastName={lastName} setLastName={setLastName}
                        email={email} setEmail={setEmail}
                        phone={phone} setPhone={setPhone}
                        street={street} setStreet={setStreet}
                        region={region} setRegion={setRegion}
                        state={state} setState={setState}
                        zip={zip} setZip={setZip}
                        country={country} setCountry={setCountry}
                        errors={errors}
                        handleContinue={handleContinue}
                        formatPhone={formatPhone}
                        openLogin={openLogin} setOpenLogin={setOpenLogin}
                        icon1={icon1} icon2={icon2}
                        LoginModal={LoginModal}
                        btnStyles={btnStyles} btnCart={btnCart}
                    />

                    <PaymentForm
                        step={step}
                        cardName={cardName} setCardName={setCardName}
                        cardNumber={cardNumber} setCardNumber={setCardNumber}
                        expiry={expiry} setExpiry={setExpiry}
                        cvv={cvv} setCvv={setCvv}
                        agreed={agreed} setAgreed={setAgreed}
                        errors={errors}
                        formatCardNumber={formatCardNumber}
                        formatExpiry={formatExpiry}
                        handleCompletePayment={handleCompletePayment}
                        icon3={icon3}
                        btnCart={btnCart}
                    />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "50%" }}>
                    <CartSummary items={items} handleRemove={handleRemove} handleQuantityChange={handleQuantityChange} icondelete={icondelete} />

                    <Box sx={{ flex: 1, backgroundColor: "#fff", p: 3, borderRadius: 2 }}>
                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="Discount code"
                                value={discount}
                                onChange={(e) => {
                                    setDiscount(e.target.value);
                                    setDiscountError("");
                                }}
                                error={!!discountError}
                                sx={{ ...inputStyles }}
                            />
                            <Button
                                onClick={handleApplyDiscount}
                                disabled={discountLoading}
                                sx={{ ...btnStyles, textTransform: "none", width: 127, height: 52, }}
                            >
                                {discountLoading ? <CircularProgress size={20} color="inherit" /> : "Apply"}
                            </Button>
                        </Box>
                        {discountError && (
                            <Typography sx={{ ...helperTextRed, mb: 1, fontSize: "14px" }}>
                                {discountError}
                            </Typography>
                        )}
                        {discountCode && (
                            <Typography sx={{ color: "#16675C", mb: 1, fontSize: "14px", fontWeight: 600 }}>
                                Discount code "{discountCode.code}" applied!
                            </Typography>
                        )}
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5 }}>Subtotal:</Typography><Typography sx={{ ...h5 }}>{total.toFixed(2)}$</Typography></Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5 }}>Discount:</Typography><Typography sx={{ ...h5 }}>-{discountAmount.toFixed(2)}$</Typography></Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5 }}>Total:</Typography><Typography sx={{ ...h5 }}>{(total - discountAmount).toFixed(2)}$</Typography></Box>

                        <Divider sx={{ my: 3, borderColor: "#3E3027" }} />
                        <FormControlLabel control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />} label="I agree to the Privacy Policy and Terms of Use." sx={{ ...h6, ...checkboxStyles }} />
                        {errors.agreed && (<Typography sx={{ ...helperTextRed, mt: 0.5 }}>{errors.agreed}</Typography>)}
                        {errors.submit && (<Typography sx={{ ...helperTextRed, mt: 0.5 }}>{errors.submit}</Typography>)}
                        <Button
                            fullWidth
                            sx={{ ...btnCart, mt: 3 }}
                            onClick={handleCompletePayment}
                            disabled={isCreatingOrder || items.length === 0}
                        >
                            {isCreatingOrder ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                                    Processing...
                                </Box>
                            ) : (
                                "Complete payment"
                            )}
                        </Button>
                    </Box>
                </Box>
            </Box>

            { }
            <LoginModal
                open={openLogin}
                handleClose={() => {
                    setOpenLogin(false);

                    if (errors.submit && errors.submit.includes("session has expired")) {
                        setErrors({ ...errors, submit: undefined });
                    }
                }}
                returnPath={location.pathname}
            />
        </Grid>
    );
}