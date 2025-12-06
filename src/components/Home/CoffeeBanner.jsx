import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../store/slice/cartSlice.jsx';
import imageBg from '../../assets/images/home/imagebg.png';
import { btnCart } from '../../styles/btnStyles.jsx';
import { headTitle } from '../../styles/typographyStyles.jsx';
import tornbottombg from '../../assets/images/home/tornbottombg.svg';

const CoffeeBanner = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const { items: products, loading } = useSelector((state) => state.products);

  const fallbackProduct = {
    name: 'Coffee Starbucks Veranda Blend natural roasted ground coffee',
    price: 20,
    supplies: [{ id: 'default', price: 2 }],
    photos_url: [{ id: 'default', url: imageBg, position: 0 }]
  };

  const weeklySpecialProduct = React.useMemo(() => {
    if (!products || !Array.isArray(products)) return null;
    return products.find(product => product.is_special) || fallbackProduct;
  }, [products]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) playPromise.catch(() => { });
    }
  }, []);

  const handleAddToCart = () => {
    const product = weeklySpecialProduct || fallbackProduct;
    if (!product) return;

    const selectedSupply = product.supplies?.[0] || { id: 'default', price: product.price || 0 };

    const originalPrice = Number(selectedSupply.price) || Number(product.price) || 0;
    const discountedPrice = Number((originalPrice * 0.85).toFixed(2)); // 15% скидка, округляем до 2 знаков

    const updatedSupplies = product.supplies
      ? product.supplies.map(supply =>
        supply.id === selectedSupply.id
          ? { ...supply, price: discountedPrice } // Сохраняем как число для консистентности
          : supply
      )
      : [{ id: 'default', price: discountedPrice }];

    dispatch(addToCart({
      product: {
        ...product,
        price: discountedPrice,
        supplies: updatedSupplies,
        originalPrice: originalPrice,
        selectedSupplyId: selectedSupply.id,
      },
      quantity: 1,
    }));
  };

  const productToShow = weeklySpecialProduct || fallbackProduct;

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

      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, display: 'flex' }}>
        <Box
          component="img"
          src={productToShow?.photos_url?.[0]?.url || imageBg}
          alt={productToShow?.name || 'Weekly Special Product'}
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

        <Box sx={{ width: 460, height: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography sx={{ ...headTitle, mb: 1 }}>Weekly Special</Typography>
          <Typography sx={{ mb: 2, fontWeight: 400, fontSize: 24, color: '#EAD9C9' }}>
            {productToShow?.name}
          </Typography>
          <Typography sx={{ fontFamily: "Vujahday Script, cursive", fontWeight: 400, fontSize: 40, color: '#FE9400' }}>
            Limited time 15% off
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 48, color: '#fff' }}>
              ${((Number(productToShow?.supplies?.[0]?.price) || Number(productToShow?.price) || 0) * 0.85).toFixed(2)}
            </Typography>

            <Typography sx={{ fontWeight: 600, fontSize: 32, color: '#999', ml: 1, textDecoration: 'line-through'}}>
              ${(Number(productToShow?.supplies?.[0]?.price) || Number(productToShow?.price) || 0).toFixed(2)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleAddToCart}
            disabled={loading}
            sx={{ ...btnCart, textTransform: 'none', width: "100%" }}
          >
            {loading ? 'Loading...' : 'Add to cart'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CoffeeBanner;
