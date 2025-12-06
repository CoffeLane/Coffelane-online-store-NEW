import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Grid, Box, Typography, Button, Divider, Checkbox, FormControlLabel, TextField } from "@mui/material";
import ContactDetailsForm from "../components/Checkout/ContactDetailsForm.jsx";
import PaymentForm from "../components/Checkout/PaymentForm.jsx";
import CartSummary from "../components/Checkout/CartSummary.jsx";
import { selectCartItems, selectCartTotal, addToCart, decrementQuantity, removeFromCart } from "../store/slice/cartSlice.jsx";
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
import { clearCart } from '../store/slice/cartSlice.jsx';



export default function CheckoutPage() {
    const items = useSelector(selectCartItems);
    const total = useSelector(selectCartTotal);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [agreed, setAgreed] = useState(false);

    const [discount, setDiscount] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [errors, setErrors] = useState({});

    const discounts = { SALE10: 0.1, SUMMER15: 0.15 };

    const handleContinue = () => {
        const contactErrors = validateContact({ firstName, lastName, email, phone, street, region, state, zip });
        setErrors(contactErrors);
        if (Object.keys(contactErrors).length === 0) setStep(2);
    };

    const handleCompletePayment = () => {
        const contactErrors = validateContact({ firstName, lastName, email, phone, street, region, stateProvince, zip });
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

        dispatch(clearCart());
        
        const orderId = Math.floor(Math.random() * 100000);
        navigate("/order_successful", {
            state: { orderNumber: orderId, email, firstName, lastName, total: (total - discountAmount).toFixed(2) },
        });
    };

    const handleQuantityChange = (key, change, cartItem) => {
        const { product, quantity } = cartItem;
        const supplyId = product.selectedSupplyId;
        if (change === 1) dispatch(addToCart({ product, quantity: 1, selectedSupplyId: supplyId }));
        else if (change === -1 && quantity > 1) dispatch(decrementQuantity(key));
    };

    const handleRemove = (key) => dispatch(removeFromCart(key));

    const handleApplyDiscount = () => {
        const percent = discounts[discount.toUpperCase()] || 0;
        setDiscountAmount(total * percent);
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
                             <TextField fullWidth placeholder="Discount code" value={discount} onChange={(e) => setDiscount(e.target.value)} sx={{ ...inputStyles }}/>
                            <Button onClick={handleApplyDiscount} sx={{ ...btnStyles, textTransform: "none", width: 127, height: 52, }}>
                                Apply
                            </Button>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5 }}>Subtotal:</Typography><Typography sx={{ ...h5 }}>{total.toFixed(2)}$</Typography></Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5 }}>Discount:</Typography><Typography sx={{ ...h5 }}>-{discountAmount.toFixed(2)}$</Typography></Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5 }}>Total:</Typography><Typography sx={{ ...h5 }}>{(total - discountAmount).toFixed(2)}$</Typography></Box>

                        <Divider sx={{ my: 3, borderColor: "#3E3027" }} />
                        <FormControlLabel control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />} label="I agree to the Privacy Policy and Terms of Use." sx={{ ...h6, ...checkboxStyles }} />
                             {errors.agreed && (<Typography sx={{ ...helperTextRed, mt: 0.5 }}>{errors.agreed}</Typography>)}
                        <Button fullWidth sx={{ ...btnCart, mt: 3 }} onClick={handleCompletePayment}>Complete payment</Button>
                    </Box>
                </Box>
            </Box>
        </Grid>
    );
}