import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../store/slice/cartSlice.jsx';
import { btnCart } from '../../styles/btnStyles.jsx';
import { headTitle } from '../../styles/typographyStyles.jsx';
import tornbottombg from '../../assets/images/home/tornbottombg.svg';
import api from '../../store/api/axios';
import { getPrice, getProductPrice, formatPrice } from '../utils/priceUtils.jsx';
import CoffeeIcon from '@mui/icons-material/Coffee';

 
const CoffeeBanner = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const { items: products, loading } = useSelector((state) => state.products);
  const currency = useSelector((state) => state.settings?.currency || 'USD');
  const [specialProduct, setSpecialProduct] = useState(null);
  const [loadingSpecial, setLoadingSpecial] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  
  const getProductImageUrl = (product) => {
    if (!product) return null;
    
    let imageUrl = null;
    if (product.photos_url && Array.isArray(product.photos_url) && product.photos_url.length > 0) {
      const firstPhoto = product.photos_url[0];
      imageUrl = firstPhoto?.url || firstPhoto?.photo || (typeof firstPhoto === 'string' ? firstPhoto : null);
    }
    
    if (!imageUrl && product.product_photos && Array.isArray(product.product_photos) && product.product_photos.length > 0) {
      const firstPhoto = product.product_photos[0];
      if (firstPhoto.photo) {
        imageUrl = typeof firstPhoto.photo === 'string' ? firstPhoto.photo : (firstPhoto.photo.url || firstPhoto.photo.photo_url);
      } else {
        imageUrl = firstPhoto?.url || firstPhoto?.photo || null;
      }
    }
    
    if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
      const baseUrl = 'https://onlinestore-928b.onrender.com';
      imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
    }
    
    return imageUrl;
  };

  useEffect(() => {
    const loadSpecialProduct = async () => {
      setLoadingSpecial(true);
      
      try {
        let foundProduct = null;
        if (products && Array.isArray(products) && products.length > 0) {
          foundProduct = products.find(product => 
            product.is_special === true || 
            product.is_special === 'true' ||
            product.isSpecial === true
          );
        }

        if (!foundProduct) {
          try {
            const response = await api.get('/products', {
              params: {
                is_special: true,
                page: 1,
                size: 10 
              }
            });
            
            const responseData = response.data?.data || response.data?.results || response.data;
            if (Array.isArray(responseData) && responseData.length > 0) {
              const specialProducts = responseData.filter(p => {
                const isSpecial = p.is_special === true || 
                                 p.is_special === 'true' ||
                                 p.isSpecial === true;
                return isSpecial;
              });
              
              if (specialProducts.length > 0) {
                foundProduct = specialProducts[0];
              }
            } else if (responseData && !Array.isArray(responseData)) {
              const isSpecial = responseData.is_special === true || 
                               responseData.is_special === 'true' ||
                               responseData.isSpecial === true;
              if (isSpecial) {
                foundProduct = responseData;
              }
            }
          } catch (error) {
            // Silently handle error
          }
        }

        if (foundProduct) {
          const isActuallySpecial = foundProduct.is_special === true || 
                                   foundProduct.is_special === 'true' ||
                                   foundProduct.isSpecial === true;
          
          if (!isActuallySpecial) {
            setSpecialProduct(null);
            return;
          }
          
          const productId = foundProduct.id || foundProduct.product_id || foundProduct._id;
          
          if (!productId) {
            setSpecialProduct(null);
            return;
          }
          
          if (!foundProduct.supplies || foundProduct.supplies.length === 0) {
            setSpecialProduct(null);
            return;
          }
          
          setSpecialProduct(foundProduct);
          setHasImageError(false);
        } else {
          setSpecialProduct(null);
        }
        
      } catch (error) {
        setSpecialProduct(null);
      } finally {
        setLoadingSpecial(false);
      }
    };

    loadSpecialProduct();
  }, [products, loading]); 

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) playPromise.catch(() => { });
    }
  }, []);

  const handleAddToCart = () => {
    if (!specialProduct) {
      return;
    }

    const product = specialProduct;
    const productId = product.id || product.product_id || product._id;
    if (!productId) {
      return;
    }

    const selectedSupply = product.supplies?.[0];
    if (!selectedSupply) {
      return;
    }

    const originalPrice = Number(selectedSupply.price) || Number(product.price) || 0;
    const discountedPrice = Number((originalPrice * 0.85).toFixed(2)); // 15% скидка
    const updatedSupplies = product.supplies.map((supply, index) => 
      index === 0 
        ? { ...supply, price: discountedPrice }
        : supply
    );

    dispatch(addToCart({
      product: {
        ...product,
        id: productId, 
        price: discountedPrice,
        supplies: updatedSupplies,
        originalPrice: originalPrice, 
        selectedSupplyId: selectedSupply.id,
      },
      quantity: 1,
    }));
  };

  const canAddToCart = !!specialProduct && 
                       (specialProduct.id || specialProduct.product_id || specialProduct._id) &&
                       specialProduct.supplies && 
                       specialProduct.supplies.length > 0;
  
  const isLoading = loading || loadingSpecial;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: { xs: 560, sm: 700, md: 600 }, overflow: 'hidden', backgroundImage: 'url(/images/preview.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <video
        ref={videoRef}
        src="/videos/bannervideopreview.mp4"
        poster="/images/preview.jpg"
        autoPlay loop muted playsInline preload="auto"
        style={{ position: "absolute", top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
      />

      <Box component="img" src={tornbottombg} alt="tornbottombg" sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', zIndex: 3, pointerEvents: 'none' }} />

      {specialProduct && (() => {
        const imageUrl = getProductImageUrl(specialProduct);

        return (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 2, 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: '90%', md: 'auto' },
            px: { xs: 2, md: 0 }
          }}>
            {imageUrl && (
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 200, sm: 300, md: 400 },
                  height: { xs: 200, sm: 300, md: 400 },
                  mr: { xs: 0, md: 8 },
                  mb: { xs: 2, md: 0 },
                  padding: { xs: 1, md: 2 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: !hasImageError ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                }}
              >
                {!hasImageError ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={specialProduct.name || 'Weekly Special Product'}
                    onError={() => setHasImageError(true)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    width: '100%',
                    height: '100%',
                  }}>
                    <CoffeeIcon sx={{ color: '#EAD9C9', fontSize: { xs: 60, md: 80 }, opacity: 0.6 }} />
                    <Typography sx={{ fontSize: '14px', color: '#EAD9C9', opacity: 0.6 }}>No Image</Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ 
              width: { xs: '100%', md: 460 }, 
              height: { xs: 'auto', md: 460 }, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              textAlign: { xs: 'center', md: 'left' }
            }}>
              <Typography sx={{ ...headTitle, mb: 1, fontSize: { xs: '24px', md: '32px' } }}>Weekly Special</Typography>
              <Typography sx={{ mb: 2, fontWeight: 400, fontSize: { xs: 16, sm: 20, md: 24 }, color: '#EAD9C9' }}>
                {specialProduct.name}
              </Typography>
              <Typography sx={{ fontFamily: "Vujahday Script, cursive", fontWeight: 400, fontSize: { xs: 28, sm: 32, md: 40 }, color: '#FE9400' }}>
                Limited time 15% off
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: 32, sm: 40, md: 48 }, color: '#fff' }}>
                  {formatPrice(((specialProduct.supplies?.[0] ? getPrice(specialProduct.supplies[0], currency) : getProductPrice(specialProduct, currency)) * 0.85), currency)}
                </Typography>

                <Typography sx={{ fontWeight: 600, fontSize: { xs: 20, sm: 24, md: 32 }, color: '#999', ml: 1, textDecoration: 'line-through'}}>
                  {formatPrice((specialProduct.supplies?.[0] ? getPrice(specialProduct.supplies[0], currency) : getProductPrice(specialProduct, currency)), currency)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={handleAddToCart}
                disabled={isLoading || !canAddToCart}
                sx={{ ...btnCart, textTransform: 'none', width: { xs: "100%", md: "100%" }, fontSize: { xs: '14px', md: '16px' } }}
              >
                {isLoading ? 'Loading...' : canAddToCart ? 'Add to cart' : 'Product unavailable'}
              </Button>
            </Box>
          </Box>
        );
      })()}
    </Box>
  );
};

export default CoffeeBanner;