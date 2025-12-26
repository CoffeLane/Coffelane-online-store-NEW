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

export default function CheckoutPage() {
    const items = useSelector(selectCartItems);
    const total = useSelector(selectCartTotal);
    const { creating: isCreatingOrder, currentOrder } = useSelector((state) => state.orders);
    const user = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);
    const isAdmin = useSelector((state) => state.auth.isAdmin);

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
    const [discountCode, setDiscountCode] = useState(null); // Сохраняем информацию о примененном коде
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState("");
    const [errors, setErrors] = useState({});
    const pendingOrderDataRef = useRef(null); // Сохраняем данные заказа для повторной попытки после логина

    // Автозаполнение формы данными пользователя при авторизации
    // НЕ заполняем форму данными админа - админ не должен использовать checkout page
    useEffect(() => {
        if (user && !isAdmin) {
            // Заполняем поля данными пользователя только если они пустые, чтобы не перезаписывать введенные данные
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
            pendingOrderDataRef.current = null;
            setOpenLogin(false);

            setTimeout(async () => {
                try {
                    const result = await dispatch(createOrder(orderData));
                    if (result.meta.requestStatus === "fulfilled") {
                        const order = result.payload;
                        console.log("✅ Order created successfully after login:", order);
                        dispatch(clearCart());
                        
                        // Корзина на бэке автоматически очищается при создании успешного заказа
                        
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

  // === 1️⃣ Проверка контактных данных ===
  const contactErrors = validateContact({
    firstName,
    lastName,
    email,
    phone,
    street,
    region,
    state,
    zip,
    country
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

  // === 2️⃣ Формирование позиций заказа ===
  console.log("🔍 [CHECKOUT] Starting to process items");
  console.log("🔍 [CHECKOUT] Items:", items);
  console.log("🔍 [CHECKOUT] Items type:", typeof items, "isArray:", Array.isArray(items));
  console.log("🔍 [CHECKOUT] Items length:", items?.length);
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.error("❌ [CHECKOUT] No items to process or items is not an array:", items);
    setErrors({ submit: "Your cart is empty. Please add items before checkout." });
    return;
  }
  
  console.log("🔍 [CHECKOUT] About to map items, items count:", items.length);
 const orderItems = items
  .map(([key, item], index) => {
    console.log(`🔍 [CHECKOUT] Processing item ${index}:`, { key, item, product: item?.product });
    console.log(`🔍 [CHECKOUT] Item structure:`, {
      key,
      hasItem: !!item,
      hasProduct: !!item?.product,
      productId: item?.product?.id,
      productKeys: item?.product ? Object.keys(item.product) : [],
      fullProduct: item?.product
    });
    const product = item.product;
    if (!product) {
      console.warn("⚠️ [CHECKOUT] Skipping item: no product", { key, item });
      return null;
    }
    
    // Проверяем разные варианты ID (id, product_id, _id)
    const productId = product.id || product.product_id || product._id;
    if (!productId) {
      console.warn("⚠️ [CHECKOUT] Skipping item: product has no ID field", { 
        key, 
        product, 
        productKeys: Object.keys(product),
        productId: product.id,
        product_id: product.product_id,
        _id: product._id
      });
      return null;
    }
    
    // Создаем продукт с правильным ID
    const productWithId = { ...product, id: productId };

    const position = { quantity: item.quantity || 1 };

    // Определяем, является ли продукт аксессуаром
    const isAccessory = product.isAccessory || 
                       product.type === 'accessory' || 
                       (!product.supplies || product.supplies.length === 0) && !key.includes('-');
    console.log("🔍 Product info:", { 
      productId: productId, 
      isAccessory, 
      hasSupplies: !!product.supplies, 
      suppliesLength: product.supplies?.length,
      key 
    });

    if (isAccessory) {
      // Для аксессуаров используем только accessory_id
      // API требует либо supply_id, либо accessory_id, либо product_id (но не несколько одновременно)
      position.accessory_id = productId;
      console.log("✅ Added accessory to order:", productId);
    } else {
      // Для продуктов обязательно нужен supply_id
      // API требует либо supply_id, либо accessory_id
      
      let supplyId = product.selectedSupplyId;
      
      // Если нет selectedSupplyId, пытаемся извлечь из ключа корзины (формат: "productId-supplyId")
      if (!supplyId && key.includes('-')) {
        const parts = key.split('-');
        if (parts.length === 2 && parts[0] === String(productId)) {
          const extractedId = parseInt(parts[1]);
          if (!isNaN(extractedId)) {
            supplyId = extractedId;
            console.log("✅ Extracted supply_id from cart key:", supplyId);
          }
        }
      }
      
      // Если все еще нет supplyId, пытаемся взять первый supply из массива
      if (!supplyId) {
        const supplies = product.supplies || [];
        if (supplies.length > 0) {
          // Берем первый supply, но проверяем, что это не 'default'
          const firstSupply = supplies.find(s => s.id !== 'default' && typeof s.id === 'number') || supplies[0];
          supplyId = firstSupply?.id;
          if (supplyId === 'default' || typeof supplyId !== 'number') {
            console.warn("⚠️ Supply ID is 'default' or not a number, trying to find valid supply");
            // Пытаемся найти валидный supply
            const validSupply = supplies.find(s => s.id !== 'default' && typeof s.id === 'number');
            if (validSupply) {
              supplyId = validSupply.id;
            } else {
              // Если нет валидного supply, но ключ не содержит дефис - это может быть аксессуар
              if (!key.includes('-')) {
                console.log("⚠️ Product has no valid supplies, treating as accessory");
                position.accessory_id = productId;
                return position;
              }
              console.error("❌ Product has no valid supply_id:", {
                productId: productId,
                productName: product.name,
                key,
                supplies
              });
              return null;
            }
          }
          console.warn("⚠️ No selectedSupplyId, using first valid supply:", supplyId);
        } else {
          // Если нет supplies, но ключ не содержит дефис - это может быть аксессуар
          if (!key.includes('-')) {
            console.log("⚠️ Product has no supplies and key has no supply_id, treating as accessory");
            position.accessory_id = productId;
            return position;
          }
          
          console.error("❌ Product has no supplies and cannot extract supply_id from key:", {
            productId: productId,
            productName: product.name,
            key,
            product
          });
          return null;
        }
      }
      
      // Проверяем, что supplyId валидный (не 'default' и число)
      if (supplyId === 'default' || typeof supplyId !== 'number') {
        console.error("❌ Invalid supply_id (must be a number, not 'default'):", {
          supplyId,
          productId: product.id,
          productName: product.name
        });
        // Если это не аксессуар и нет валидного supply_id, пропускаем товар
        return null;
      }
      
      if (supplyId) {
        position.supply_id = supplyId;
        // Не передаем product_id, если есть supply_id - API требует только одно поле
      }
    }

    // Проверяем, что есть либо supply_id, либо accessory_id (обязательно для API)
    if (!position.supply_id && !position.accessory_id) {
      console.error("❌ Skipping item with no supply_id or accessory_id:", { key, product });
      return null;
    }

    // Важно: убеждаемся, что не передаем оба поля одновременно
    // API не принимает позиции с и supply_id, и accessory_id
    if (position.supply_id && position.accessory_id) {
      console.error("❌ Position has both supply_id and accessory_id, this is invalid. Removing accessory_id:", position);
      delete position.accessory_id; // Удаляем accessory_id, оставляем supply_id
    }

    console.log("✅ Final position:", position);
    return position;
  })
  .filter(Boolean);

console.log("▶ orderItems to send:", orderItems);
console.log("▶ orderItems count:", orderItems.length);

  // === 3️⃣ Формируем orderData для API ===
  const orderData = {
    billing_details: {
      first_name: firstName,
      last_name: lastName,
      country: country || null,
      state: state || null,
      region: region || null,
      street_name: street || null,
      apartment_number: apartment || null,
      zip_code: zip || null,
      phone_number: phone.replace(/\s+/g, "") || null
    },
    positions: orderItems,
    // basket_id не нужен - бэкенд автоматически подтягивает корзину для авторизованного пользователя
    order_notes: "",
    customer_data: email ? { email: email } : null
  };

  pendingOrderDataRef.current = orderData;

  console.log("🛒 Starting order creation process...");
  console.log("📦 Order data:", JSON.stringify(orderData, null, 2));
  console.log("🛍️ Cart items count:", items.length);
  console.log("💰 Total amount:", total);
  console.log("🎫 Discount amount:", discountAmount);

  try {
    const result = await dispatch(createOrder(orderData));

    if (result.meta.requestStatus === "fulfilled") {
      const order = result.payload;
      console.log("✅ Order successfully created!", order);

      // Применяем дисконт-код к заказу, если он был введен
      if (discountCode && discountCode.code && order.id) {
        try {
          console.log("🎫 Applying discount code to order...");
          // Используем авторизованный API, так как заказ создан авторизованным пользователем
          const apiAuth = apiWithAuth(token);
          const discountResponse = await apiAuth.get(`/discount-codes/${discountCode.code}/${order.id}/`);
          console.log("✅ Discount code applied to order:", discountResponse.data);
        } catch (discountErr) {
          console.warn("⚠️ Failed to apply discount code to order:", discountErr.response?.data || discountErr.message);
          // Не блокируем успешное создание заказа, если применение скидки не удалось
        }
      }

      // Очищаем локальную корзину
      dispatch(clearCart());
      
      // Корзина на бэке автоматически очищается при создании успешного заказа
      // Не нужно делать запрос на очистку
      
      pendingOrderDataRef.current = null;

      const orderNumber = order.id || order.order_number || order.number || order.order_id;

      navigate("/order_successful", {
        state: {
          orderNumber,
          email: orderData.customer_data?.email || email,
          firstName,
          lastName,
          total: (total - discountAmount).toFixed(2),
          orderId: order.id
        }
      });
    } else {
      // Используем улучшенное сообщение об ошибке из ordersSlice
      const errorMsg = result.payload?.message || 
        result.payload?.error ||
        result.payload?.detail ||
        "Failed to create order. Please try again.";

      if (result.payload?.requiresLogin) {
        setOpenLogin(true);
        setErrors({ submit: "Your session has expired. Please log in and try again." });
      } else {
        setErrors({ submit: errorMsg });
      }

      console.error("❌ Order creation failed:", result.payload);
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
        <Grid sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, md: 4 } }}>
            <Typography sx={{ ...titlePage, textAlign: "center", mb: { xs: 2, md: 3 }, fontSize: { xs: '24px', md: '32px' } }}>Checkout page</Typography>
            <Box sx={{ display: "flex", flexDirection: { xs: 'column', lg: 'row' }, flexWrap: { xs: 'wrap', lg: 'nowrap' }, gap: { xs: 2, md: 4 } }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: { xs: "100%", lg: "50%" }, order: { xs: 2, lg: 1 } }}>
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
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: { xs: "100%", lg: "50%" }, order: { xs: 1, lg: 2 } }}>
                    <CartSummary items={items} handleRemove={handleRemove} handleQuantityChange={handleQuantityChange} icondelete={icondelete} />

                    <Box sx={{ flex: 1, backgroundColor: "#fff", p: { xs: 2, md: 3 }, borderRadius: 2 }}>
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
                            <Typography sx={{ color: "#16675C", mb: 1, fontSize: { xs: "12px", md: "14px" }, fontWeight: 600 }}>
                                Discount code "{discountCode.code}" applied!
                            </Typography>
                        )}
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Subtotal:</Typography><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>{total.toFixed(2)}$</Typography></Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Discount:</Typography><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>-{discountAmount.toFixed(2)}$</Typography></Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Total:</Typography><Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>{(total - discountAmount).toFixed(2)}$</Typography></Box>

                        <Divider sx={{ my: { xs: 2, md: 3 }, borderColor: "#3E3027" }} />
                        <FormControlLabel control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />} label="I agree to the Privacy Policy and Terms of Use." sx={{ ...h6, ...checkboxStyles, fontSize: { xs: '12px', md: '14px' } }} />
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