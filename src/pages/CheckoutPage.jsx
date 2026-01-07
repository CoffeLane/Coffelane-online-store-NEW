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
import api, { apiWithAuth } from "../store/api/axios.js";
import { formatPrice } from "../components/utils/priceUtils.jsx";
import { fetchProfile } from "../store/slice/authSlice.jsx";
import { fetchUserOrders } from "../store/slice/ordersSlice.jsx";

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const { creating: isCreatingOrder, currentOrder } = useSelector((state) => state.orders);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  const currency = useSelector((state) => state.settings.currency);

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
  const [apartment, setApartment] = useState("");


  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [discount, setDiscount] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountCode, setDiscountCode] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [errors, setErrors] = useState({});
  const pendingOrderDataRef = useRef(null);

  useEffect(() => {
    if (discountCode) {
      let newDiscount = 0;
      if (discountCode.discount_percent) {
        newDiscount = total * (discountCode.discount_percent / 100);
      } else if (discountCode.discount_amount) {
        newDiscount = Math.min(discountCode.discount_amount, total);
      }
      setDiscountAmount(newDiscount);
    } else {
      setDiscountAmount(0);
    }
  }, [total, discountCode]);


  useEffect(() => {
    if (user && !isAdmin) {
      setFirstName(prev => !prev && user.first_name ? user.first_name : prev);
      setLastName(prev => !prev && user.last_name ? user.last_name : prev);
      setEmail(prev => !prev && user.email ? user.email : prev);
      setPhone(prev => !prev && user.phone_number ? formatPhone(user.phone_number) : prev);
      setCountry(prev => !prev && user.country ? user.country : prev);
      setRegion(prev => !prev && user.region ? user.region : prev);
      setState(prev => !prev && user.state ? user.state : prev);
      setStreet(prev => !prev && user.street_name ? user.street_name : prev);
      setZip(prev => !prev && user.zip_code ? user.zip_code : prev);
      setApartment(prev => !prev && user.apartment_number ? user.apartment_number : prev);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && token && pendingOrderDataRef.current && openLogin) {
      console.log("✅ User logged in, retrying order creation...");
      const orderData = pendingOrderDataRef.current;
      // pendingOrderDataRef.current = null;
      setOpenLogin(false);

      setTimeout(async () => {
        try {
          console.log("🔄 Retrying order with data:", pendingOrderDataRef.current);
          const result = await dispatch(createOrder(orderData));
          if (result.meta.requestStatus === "fulfilled") {
            const order = result.payload;
            console.log("✅ Order created successfully after login:", order);

            const orderId = order.id || order.order_id || order.order_number;

            if (discountCode?.code && orderId) {
              try {
                await apiWithAuth.get(`/discount-codes/${discountCode.code}/${orderId}/`);
              } catch (e) {
                console.error(" Discount retry failed", e);
              }
            }

            dispatch(clearCart());
            navigate("/order_successful", {
              state: {
                orderNumber: order.id || order.order_number || order.number || order.order_id,
                email: orderData.customer_data?.email || user.email || email,
                firstName: orderData.billing_details?.first_name || firstName,
                lastName: orderData.billing_details?.last_name || lastName,
                total: total - discountAmount,
                orderId: order.id,
              },
            });
          }
        } catch (error) {
          console.error("Error retrying order after login:", error);
        }
      }, 500);
    }
  }, [user, token, openLogin, dispatch, navigate, discountCode, discountAmount]);

  const handleContinue = () => {
    const contactErrors = validateContact({ firstName, lastName, email, phone, street, region, state, zip, country });
    setErrors(contactErrors);
    if (Object.keys(contactErrors).length === 0) setStep(2);
  };

  const handleCompletePayment = async () => {
    const accessToken = token || localStorage.getItem("access");

    if (!accessToken || !user) {
      console.warn("User not authenticated, opening login modal");
      setOpenLogin(true);
      setErrors({ submit: "Please log in to complete your order." });
      return;
    }

    const contactErrors = validateContact({
      firstName, lastName, email, phone, street, region, state, zip, country
    });

    const newErrors = { ...contactErrors };
    
    if (!cardName.trim()) newErrors.cardName = "Card holder name required";
    else if (!/^[A-Za-z]+([ '-][A-Za-z]+)*$/.test(cardName))
      newErrors.cardName = "Invalid card name. Please enter first and last name.";

    if (!cardNumber.trim()) newErrors.cardNumber = "Card number required";
    else if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, "")))
      newErrors.cardNumber = "Must be 16 digits";

    if (!expiry.trim()) newErrors.expiry = "Expire date required";
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry))
      newErrors.expiry = "Format MM/YY";

    if (!cvv.trim()) newErrors.cvv = "CVV required";
    else if (!/^\d{3}$/.test(cvv)) newErrors.cvv = "Must be 3 digits";

    if (!agreed) newErrors.agreed = "You must agree to the Privacy Policy and Terms of Use.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;

    const orderData = {
      billing_details: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        country, state, region,
        street_name: street,
        apartment_number: apartment,
        zip_code: zip,
        phone_number: formattedPhone
      },
      order_notes: "",
      customer_data: { email: email.trim() },
      discount_code: discountCode?.code || null,
    };

    pendingOrderDataRef.current = orderData;

    try {
      const order = await dispatch(createOrder(orderData)).unwrap();

      dispatch(clearCart());
      await dispatch(fetchProfile());

      navigate("/order_successful", {
        state: {
          orderNumber: order.id,
          email: email.trim(),
          total: order.total_price || total,
          orderId: order.id
        }
      });

    } catch (backendError) {
      console.error("Error creating order:", backendError);

      let errorMessage = "Order creation failed";
      if (backendError?.non_field_errors) errorMessage = backendError.non_field_errors[0];
      else if (backendError?.discount_code) errorMessage = `Promo code: ${backendError.discount_code[0]}`;
      else if (backendError?.detail) errorMessage = backendError.detail;
      else if (typeof backendError === 'string') errorMessage = backendError;

      setErrors({ submit: errorMessage });
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
      console.error(" Discount code error:", err.response?.data || err.message);
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
    <Grid sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, md: 4 } }}>
      <Typography sx={{ ...titlePage, textAlign: "center", mb: { xs: 2, md: 3 }, fontSize: { xs: '24px', md: '32px' } }}>Checkout page</Typography>
      <Box sx={{ display: "flex", flexDirection: { xs: 'column', lg: 'row' }, flexWrap: { xs: 'wrap', lg: 'nowrap' }, gap: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: { xs: "100%", lg: "50%" }, order: { xs: 1, lg: 1 } }}>

          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            <CartSummary items={items} handleRemove={handleRemove} handleQuantityChange={handleQuantityChange} icondelete={icondelete} />
          </Box>

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
            apartment={apartment} setApartment={setApartment}
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

          <Box sx={{ display: { xs: "block", lg: "none" }, backgroundColor: "#fff", p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}>
              <TextField fullWidth placeholder="Discount code" value={discount}
                onChange={(e) => {
                  setDiscount(e.target.value);
                  setDiscountError("");
                }} error={!!discountError} sx={{ ...inputStyles }} />
              <Button onClick={handleApplyDiscount} disabled={discountLoading} sx={{ ...btnStyles, textTransform: "none", width: { xs: '100%', sm: 127 }, height: { xs: 44, md: 52 }, minWidth: { xs: 'auto', sm: 127 } }}>
                {discountLoading ? <CircularProgress size={20} color="inherit" /> : "Apply"}
              </Button>
            </Box>
            {discountError && (
              <Typography sx={{ ...helperTextRed, mb: 1, fontSize: { xs: "12px", md: "14px" } }}>
                {discountError}
              </Typography>
            )}
            {discountCode && (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography sx={{ color: "#09d05fff", fontSize: "14px", fontWeight: 600 }}>
                  Discount code "{discountCode.code}" applied!
                </Typography>
                <Button size="small" sx={{ color: "red", textTransform: "none", minWidth: "auto" }}
                  onClick={() => {
                    setDiscountCode(null);
                    setDiscountAmount(0);
                    setDiscount("");
                  }} >
                  Remove
                </Button>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Subtotal:</Typography><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>{formatPrice(total, currency)}</Typography></Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Discount:</Typography><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>-{formatPrice(discountAmount, currency)}</Typography></Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Total:</Typography><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>{formatPrice(total - discountAmount, currency)}</Typography></Box>

            <Divider sx={{ my: { xs: 2, md: 3 }, borderColor: "#3E3027" }} />
            <FormControlLabel control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />} label={<span>I agree to the Privacy Policy and Terms of Use. <span style={{ color: "#d32f2f" }}>*</span></span>} sx={{ ...h6, ...checkboxStyles, fontSize: { xs: '12px', md: '14px' } }} />
            {errors.agreed && (<Typography sx={{ ...helperTextRed, mt: 0.5, fontSize: { xs: '11px', md: '12px' } }}>{errors.agreed}</Typography>)}
            {errors.submit && (<Typography sx={{ ...helperTextRed, mt: 0.5, fontSize: { xs: '11px', md: '12px' } }}>{errors.submit}</Typography>)}
            <Button
              fullWidth sx={{ ...btnCart, mt: { xs: 2, md: 3 }, fontSize: { xs: '12px', md: '14px' }, py: { xs: 1, md: 1.5 } }}
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: { xs: "100%", lg: "50%" }, order: { xs: 2, lg: 2 } }}>

          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <CartSummary items={items} handleRemove={handleRemove} handleQuantityChange={handleQuantityChange} icondelete={icondelete} />
          </Box>
          <Box sx={{ display: { xs: "none", lg: "block" }, flex: 1, backgroundColor: "#fff", p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}>
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
                sx={{ ...btnStyles, textTransform: "none", width: { xs: '100%', sm: 127 }, height: { xs: 44, md: 52 }, minWidth: { xs: 'auto', sm: 127 } }}
              >
                {discountLoading ? <CircularProgress size={20} color="inherit" /> : "Apply"}
              </Button>
            </Box>
            {discountError && (
              <Typography sx={{ ...helperTextRed, mb: 1, fontSize: { xs: "12px", md: "14px" } }}>
                {discountError}
              </Typography>
            )}
            {discountCode && (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography sx={{ color: "#09d05fff", fontSize: "14px", fontWeight: 600 }}>
                  Discount code "{discountCode.code}" applied!
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    setDiscountCode(null);
                    setDiscountAmount(0);
                    setDiscount("");
                  }}
                  sx={{ color: "red", textTransform: "none", minWidth: "auto" }}
                >
                  Remove
                </Button>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Subtotal:</Typography><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>{formatPrice(total, currency)}</Typography></Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Discount:</Typography><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>-{formatPrice(discountAmount, currency)}</Typography></Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Total:</Typography><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>{formatPrice(total - discountAmount, currency)}</Typography></Box>

            <Divider sx={{ my: { xs: 2, md: 3 }, borderColor: "#3E3027" }} />
            <FormControlLabel control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />} label={<span>I agree to the Privacy Policy and Terms of Use. <span style={{ color: "#d32f2f" }}>*</span></span>} sx={{ ...h6, ...checkboxStyles, fontSize: { xs: '12px', md: '14px' } }} />
            {errors.agreed && (<Typography sx={{ ...helperTextRed, mt: 0.5, fontSize: { xs: '11px', md: '12px' } }}>{errors.agreed}</Typography>)}
            {errors.submit && (<Typography sx={{ ...helperTextRed, mt: 0.5, fontSize: { xs: '11px', md: '12px' } }}>{errors.submit}</Typography>)}
            <Button
              fullWidth
              sx={{ ...btnCart, mt: { xs: 2, md: 3 }, fontSize: { xs: '12px', md: '14px' }, py: { xs: 1, md: 1.5 } }}
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