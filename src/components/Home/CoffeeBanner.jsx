import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../store/slice/cartSlice.jsx';
import { btnCart } from '../../styles/btnStyles.jsx';
import { headTitle } from '../../styles/typographyStyles.jsx';
import tornbottombg from '../../assets/images/home/tornbottombg.svg';
import api from '../../store/api/axios';

// Конфигурация: ID акционного товара (fallback, если в API нет поля is_special)
// Приоритет: 1) is_special из API, 2) SPECIAL_PRODUCT_ID
// TODO: После добавления поля is_special в бэкенд, можно убрать SPECIAL_PRODUCT_ID
const SPECIAL_PRODUCT_ID = 130;
 
const CoffeeBanner = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const { items: products, loading } = useSelector((state) => state.products);
  const [specialProduct, setSpecialProduct] = useState(null);
  const [loadingSpecial, setLoadingSpecial] = useState(false);

  // Загружаем акционный товар
  useEffect(() => {
    const loadSpecialProduct = async () => {
      setLoadingSpecial(true);
      
      try {
        let foundProduct = null;

        // ПРИОРИТЕТ 1: Ищем в загруженных продуктах по полю is_special из API
        // Это основной способ после добавления поля в бэкенд
        if (products && Array.isArray(products) && products.length > 0) {
          foundProduct = products.find(product => 
            product.is_special === true || 
            product.is_special === 'true' ||
            product.isSpecial === true
          );
        }

        // ПРИОРИТЕТ 2: Fallback - загружаем по ID (если is_special еще не добавлено в API)
        if (!foundProduct && SPECIAL_PRODUCT_ID) {
          try {
            const response = await api.get(`/products/${SPECIAL_PRODUCT_ID}`);
            foundProduct = response.data;
          } catch (error) {
            console.error("Failed to load special product by ID:", error);
          }
        }

        // Проверяем валидность найденного продукта
        if (foundProduct) {
          const productId = foundProduct.id || foundProduct.product_id || foundProduct._id;
          
          if (!productId) {
            console.warn("Special product has no ID:", foundProduct);
            setSpecialProduct(null);
            return;
          }
          
          if (!foundProduct.supplies || foundProduct.supplies.length === 0) {
            console.warn("Special product has no supplies:", foundProduct);
            setSpecialProduct(null);
            return;
          }
          
          setSpecialProduct(foundProduct);
        } else {
          setSpecialProduct(null);
        }
        
      } catch (error) {
        console.error("Error loading special product:", error);
        setSpecialProduct(null);
      } finally {
        setLoadingSpecial(false);
      }
    };

    loadSpecialProduct();
  }, [products]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) playPromise.catch(() => { });
    }
  }, []);

  const handleAddToCart = () => {
    if (!specialProduct) {
      console.warn("No special product available to add to cart");
      return;
    }

    const product = specialProduct;
    
    // Проверяем наличие id у продукта
    const productId = product.id || product.product_id || product._id;
    if (!productId) {
      console.error("Product has no ID, cannot add to cart:", product);
      return;
    }

    // Выбираем первый supply (или можно выбрать по умолчанию)
    const selectedSupply = product.supplies?.[0];
    if (!selectedSupply) {
      console.error("Product has no supplies, cannot add to cart:", product);
      return;
    }

    // Вычисляем цены: оригинальная и со скидкой 15%
    const originalPrice = Number(selectedSupply.price) || Number(product.price) || 0;
    const discountedPrice = Number((originalPrice * 0.85).toFixed(2)); // 15% скидка

    // Обновляем supplies с новой ценой (только для первого supply)
    const updatedSupplies = product.supplies.map((supply, index) => 
      index === 0 
        ? { ...supply, price: discountedPrice }
        : supply
    );

    // Добавляем в корзину с правильной структурой
    dispatch(addToCart({
      product: {
        ...product,
        id: productId, // Убеждаемся, что id присутствует
        price: discountedPrice, // Цена со скидкой
        supplies: updatedSupplies,
        originalPrice: originalPrice, // Сохраняем оригинальную цену
        selectedSupplyId: selectedSupply.id,
      },
      quantity: 1,
    }));
  };

  // Проверяем, можно ли добавить товар в корзину
  const canAddToCart = !!specialProduct && 
                       (specialProduct.id || specialProduct.product_id || specialProduct._id) &&
                       specialProduct.supplies && 
                       specialProduct.supplies.length > 0;
  
  const isLoading = loading || loadingSpecial;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 600, overflow: 'hidden', backgroundImage: 'url(/images/preview.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <video
        ref={videoRef}
        src="/videos/bannervideopreview.mp4"
        poster="/images/preview.jpg"
        autoPlay loop muted playsInline preload="auto"
        style={{ position: "absolute", top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
      />

      <Box component="img" src={tornbottombg} alt="tornbottombg" sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', zIndex: 3, pointerEvents: 'none' }} />

      {specialProduct && (
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, display: 'flex' }}>
          {specialProduct.photos_url?.[0]?.url && (
            <Box
              component="img"
              src={specialProduct.photos_url[0].url}
              alt={specialProduct.name || 'Weekly Special Product'}
              sx={{
                width: 400,
                height: 400,
                mr: 8,
                objectFit: 'contain',
                backgroundColor: 'transparent',
                padding: 2,
                mixBlendMode: 'multiply',
                filter: 'contrast(1.1) brightness(1.05)'
              }}
            />
          )}

          <Box sx={{ width: 460, height: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography sx={{ ...headTitle, mb: 1 }}>Weekly Special</Typography>
            <Typography sx={{ mb: 2, fontWeight: 400, fontSize: 24, color: '#EAD9C9' }}>
              {specialProduct.name}
            </Typography>
            <Typography sx={{ fontFamily: "Vujahday Script, cursive", fontWeight: 400, fontSize: 40, color: '#FE9400' }}>
              Limited time 15% off
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 48, color: '#fff' }}>
                ${((Number(specialProduct.supplies?.[0]?.price) || Number(specialProduct.price) || 0) * 0.85).toFixed(2)}
              </Typography>

              <Typography sx={{ fontWeight: 600, fontSize: 32, color: '#999', ml: 1, textDecoration: 'line-through'}}>
                ${(Number(specialProduct.supplies?.[0]?.price) || Number(specialProduct.price) || 0).toFixed(2)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleAddToCart}
              disabled={isLoading || !canAddToCart}
              sx={{ ...btnCart, textTransform: 'none', width: "100%" }}
            >
              {isLoading ? 'Loading...' : canAddToCart ? 'Add to cart' : 'Product unavailable'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CoffeeBanner;
