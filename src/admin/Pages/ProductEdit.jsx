import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Grid, Card, Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Paper, FormControlLabel, Checkbox } from "@mui/material";
import { useSelector } from "react-redux";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import UploadImages from "../AdminComponents/UploadImages.jsx";
import ProductForm from "../AdminComponents/ProductForm.jsx";
import ProductSettings from "../AdminComponents/ProductSettings.jsx";
import RelatedItems from "../AdminComponents/RelatedItems.jsx";
import BottomButtons from "../AdminComponents/BottomButtons.jsx";
import api from "../../store/api/axios.js";
import { apiWithAuth } from "../../store/api/axios.js";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  
  // Получаем тип продукта из URL параметра, если он есть
  const urlProductType = searchParams.get('type'); // 'product' или 'accessory'

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(null);
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState('product');
  const [isSpecial, setIsSpecial] = useState(false);

  const [images, setImages] = useState([]);
  const [cover, setCover] = useState(null);
  const coverRef = useRef(null);
  const fetchingRef = useRef(false);
  const fetchedIdRef = useRef(null);
  const initialPhotoIdsRef = useRef([]); // Сохраняем исходные фото ID при загрузке продукта
  
  // Синхронизируем ref с состоянием cover
  // НО не перезаписываем, если coverRef уже содержит файл (чтобы не потерять file при асинхронных обновлениях)
  useEffect(() => {
    // Если coverRef содержит file, а cover state не содержит file, не перезаписываем
    // Это защищает от потери file при асинхронных обновлениях state
    if (coverRef.current?.file && !cover?.file) {
      // coverRef содержит file, но cover state потерял его - не перезаписываем
      return;
    }
    coverRef.current = cover;
  }, [cover]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [debugLogs, setDebugLogs] = useState([]);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const addDebugLog = (message, data = null) => {
    const logEntry = { 
      timestamp: new Date().toLocaleTimeString(), 
      message, 
      data: data ? JSON.stringify(data, null, 2) : null 
    };
    setDebugLogs(prev => {
      const newLogs = [...prev, logEntry];
      // Сохраняем в localStorage для просмотра позже
      localStorage.setItem('productEditDebugLogs', JSON.stringify(newLogs.slice(-50))); // Последние 50 логов
      return newLogs;
    });
    console.log(`[${logEntry.timestamp}] ${message}`, data || '');
  };

  // Загружаем логи из localStorage при монтировании
  useEffect(() => {
    const savedLogs = localStorage.getItem('productEditDebugLogs');
    if (savedLogs) {
      try {
        setDebugLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error('Error loading logs:', e);
      }
    }
  }, []);

  const isProductReady = useMemo(() => {
    const nameValid = productName && String(productName).trim().length > 0;
    const categoryValid = category && String(category).trim().length > 0;
    const priceStr = price ? String(price).trim() : "";
    const priceValid = priceStr.length > 0 && !isNaN(Number(priceStr)) && Number(priceStr) > 0;
    const weightStr = weight ? String(weight).trim() : "";
    const weightValid = productType === 'accessory' ? true : weightStr.length > 0;
    
    return nameValid && categoryValid && priceValid && weightValid;
  }, [productName, category, price, weight, productType]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (fetchingRef.current && fetchedIdRef.current === id) {
        // console.log("⏸️ Already fetching this product, skipping...");
        return;
      }
      
      if (fetchedIdRef.current === id && !fetchingRef.current) {
        // console.log("⏸️ Product already loaded, skipping...");
        return;
      }
      
      fetchingRef.current = true;
      fetchedIdRef.current = id;
      try {
        let response;
        let lastError = null;
        
        // Пробуем загрузить продукт или аксессуар
        // Если в URL есть параметр type, используем его для определения типа
        let loadedSuccessfully = false;
        
        // Если в URL указан тип, загружаем соответствующий тип
        if (urlProductType === 'accessory') {
          // Загружаем аксессуар
          try {
            response = await apiWithAuth.get(`/accessories/${id}`);
            setProductType('accessory');
            loadedSuccessfully = true;
            // console.log(`✅ Accessory loaded via /accessories/${id}`);
          } catch (eAccessory) {
            throw eAccessory;
          }
        } else if (urlProductType === 'product') {
          // Загружаем продукт (сначала пробуем публичный эндпоинт, потом админский)
          try {
            response = await apiWithAuth.get(`/products/${id}`);
            setProductType('product');
            loadedSuccessfully = true;
            // console.log(`✅ Product loaded via /products/${id}`);
          } catch (e1) {
            if (e1.response?.status === 404 || e1.response?.status === 403) {
              // Если публичный не работает, пробуем админский (но он может не поддерживать GET)
              try {
                response = await apiWithAuth.get(`/products/product/${id}`);
                setProductType('product');
                loadedSuccessfully = true;
                // console.log(`✅ Product loaded via /products/product/${id}`);
              } catch (e2) {
                // Если админский тоже не работает, пробуем публичный API без авторизации
                try {
                  response = await api.get(`/products/${id}`);
                  setProductType('product');
                  loadedSuccessfully = true;
                  // console.log(`✅ Product loaded via public /products/${id}`);
                } catch (e3) {
                  throw e3;
                }
              }
            } else {
              throw e1;
            }
          }
        } else {
          // Если тип не указан, пробуем оба варианта (старая логика для обратной совместимости)
          // Сначала пробуем аксессуар, так как для продуктов может быть 403
          try {
            response = await apiWithAuth.get(`/accessories/${id}`);
            setProductType('accessory');
            loadedSuccessfully = true;
            // console.log(`✅ Accessory loaded via /accessories/${id}`);
          } catch (eAccessory) {
            // Если это не аксессуар (404), пробуем продукт
            if (eAccessory.response?.status === 404) {
              // Пробуем обычный эндпоинт для продуктов
              try {
                response = await apiWithAuth.get(`/products/${id}`);
                setProductType('product');
                loadedSuccessfully = true;
                // console.log(`✅ Product loaded via /products/${id}`);
              } catch (e1) {
                // Если обычный не работает, пробуем админский
                if (e1.response?.status === 404 || e1.response?.status === 403) {
                  try {
                    response = await apiWithAuth.get(`/products/product/${id}`);
                    setProductType('product');
                    loadedSuccessfully = true;
                    // console.log(`✅ Product loaded via /products/product/${id}`);
                  } catch (e2) {
                    // Если ничего не сработало, выбрасываем ошибку
                    throw e2;
                  }
                } else {
                  throw e1;
                }
              }
            } else {
              // Если ошибка не 404, пробуем продукт
              try {
                response = await apiWithAuth.get(`/products/${id}`);
                setProductType('product');
                loadedSuccessfully = true;
                // console.log(`✅ Product loaded via /products/${id}`);
              } catch (e1) {
                if (e1.response?.status === 404 || e1.response?.status === 403) {
                  try {
                    response = await apiWithAuth.get(`/products/product/${id}`);
                    setProductType('product');
                    loadedSuccessfully = true;
                    // console.log(`✅ Product loaded via /products/product/${id}`);
                  } catch (e2) {
                    throw e2;
                  }
                } else {
                  throw e1;
                }
              }
            }
          }
        }

        const product = response.data;
        
        if (!product) {
          throw new Error("Product data is empty");
        }

        // console.log("📦 Product data structure:", {
        //   name: product.name,
        //   category: product.category,
        //   price: product.price,
        //   weight: product.weight,
        //   supplies: product.supplies,
        //   brand: product.brand,
        //   firstSupply: product.supplies?.[0],
        //   fullProduct: product
        // });

        let productPrice = "";
        if (product.supplies && Array.isArray(product.supplies) && product.supplies.length > 0) {
          const supplyPrice = product.supplies[0].price;
          if (supplyPrice !== undefined && supplyPrice !== null) {
            productPrice = supplyPrice.toString();
          } else if (product.price !== undefined && product.price !== null) {
            productPrice = product.price.toString();
          }
        } else {
          if (product.price !== undefined && product.price !== null) {
            productPrice = product.price.toString();
          }
        }

        let productCategory = product.category || product.brand || "";
        
        // Для веса проверяем разные варианты
        let productWeight = "";
        if (product.weight) {
          productWeight = product.weight.toString();
        } else if (product.supplies && Array.isArray(product.supplies) && product.supplies.length > 0) {
          const supplyWeight = product.supplies[0].weight;
          if (supplyWeight !== undefined && supplyWeight !== null) {
            productWeight = supplyWeight.toString();
          }
        }

        setProductName(product.name || "");
        setCategory(productCategory || "");
        // Для продуктов stock может быть в supplies[0].quantity, для аксессуаров в quantity
        let productStock = null;
        if (product.stock !== undefined && product.stock !== null) {
          productStock = product.stock;
        } else if (product.supplies && Array.isArray(product.supplies) && product.supplies.length > 0) {
          // Для продуктов берем quantity из первого supply
          const supplyQuantity = product.supplies[0].quantity;
          if (supplyQuantity !== undefined && supplyQuantity !== null) {
            productStock = supplyQuantity;
          }
        } else if (product.quantity !== undefined && product.quantity !== null) {
          // Для аксессуаров
          productStock = product.quantity;
        }
        setStock(productStock);
        setPrice(productPrice || "");
        setWeight(productWeight || "");
        setDescription(product.description || "");
        // Для аксессуаров visible может быть в другом поле
        setVisible(product.visible !== undefined ? product.visible : 
                  (product.visible !== null ? product.visible : false));
        // Загружаем is_special
        setIsSpecial(product.is_special === true || product.is_special === 'true' || product.isSpecial === true);

        // console.log("✅ Set values:", {
        //   name: product.name || "",
        //   category: productCategory,
        //   price: productPrice,
        //   weight: productWeight,
        //   stock: product.stock !== undefined ? product.stock : null
        // });

        let imageUrls = [];
        // Обрабатываем фото для продуктов и аксессуаров
        if (product.photos_url && Array.isArray(product.photos_url) && product.photos_url.length > 0) {
          imageUrls = product.photos_url.map(photo => {
            let photoUrl = null;
            if (typeof photo === 'string') {
              photoUrl = photo;
            } else if (photo && typeof photo === 'object') {
              photoUrl = photo.url || photo.photo || photo.photo_url || photo.image_url || null;
            }
            
            // Если URL относительный, добавляем базовый URL
            if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
              const baseUrl = 'https://onlinestore-928b.onrender.com';
              photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
            }
            
            return {
              id: photo.id || photo.photo_id || null,
              url: photoUrl,
            };
          }).filter(img => img.url !== null);
        } else if (product.product_photos && Array.isArray(product.product_photos) && product.product_photos.length > 0) {
          // Обрабатываем product_photos для продуктов
          imageUrls = product.product_photos.map(photo => {
            let photoUrl = null;
            // product_photos может содержать объект с полем photo (строка или объект)
            // Согласно документации: ProductPhoto{id, photo}
            if (photo.photo) {
              // photo может быть строкой (URL) или объектом
              if (typeof photo.photo === 'string') {
                photoUrl = photo.photo;
              } else if (photo.photo.url) {
                photoUrl = photo.photo.url;
              } else if (photo.photo.photo_url) {
                photoUrl = photo.photo.photo_url;
              }
            } else {
              // Если нет поля photo, пробуем другие варианты
              photoUrl = photo.url || photo.photo_url || photo.image_url || null;
            }
            
            // Если URL относительный, добавляем базовый URL
            if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
              const baseUrl = 'https://onlinestore-928b.onrender.com';
              photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
            }
            
            return {
              id: photo.id || photo.photo_id || null,
              url: photoUrl,
            };
          }).filter(img => img.url !== null);
        } else if (product.accessory_photos && Array.isArray(product.accessory_photos) && product.accessory_photos.length > 0) {
          imageUrls = product.accessory_photos.map(photo => {
            let photoUrl = null;
            if (typeof photo === 'string') {
              photoUrl = photo;
            } else if (photo && typeof photo === 'object') {
              photoUrl = photo.url || photo.photo || photo.photo_url || photo.image_url || null;
            }
            
            // Если URL относительный, добавляем базовый URL
            if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
              const baseUrl = 'https://onlinestore-928b.onrender.com';
              photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
            }
            
            return {
              id: photo.id || photo.photo_id || null,
              url: photoUrl,
            };
          }).filter(img => img.url !== null);
        } else if (product.images && Array.isArray(product.images)) {
          imageUrls = product.images.map((img, idx) => {
            let photoUrl = null;
            if (typeof img === 'string') {
              photoUrl = img;
            } else if (img && typeof img === 'object') {
              photoUrl = img.url || img.photo || img.photo_url || img.image_url || null;
            }
            
            // Если URL относительный, добавляем базовый URL
            if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
              const baseUrl = 'https://onlinestore-928b.onrender.com';
              photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
            }
            
            return {
              id: img.id || idx,
              url: photoUrl,
            };
          }).filter(img => img.url !== null);
        }

        setImages(imageUrls);
        // Сохраняем исходные фото ID для определения новых фото при обновлении
        initialPhotoIdsRef.current = imageUrls.filter(img => img.id).map(img => img.id);
        console.log("📸 Initial photo IDs saved:", initialPhotoIdsRef.current);
        const firstImage = imageUrls[0] || null;
        setCover(firstImage);
        coverRef.current = firstImage; // Обновляем ref сразу

        // console.log("✅ Product loaded:", { 
        //   name: product.name, 
        //   hasImages: imageUrls.length > 0,
        //   imagesCount: imageUrls.length 
        // });
      } catch (error) {
        // console.error("❌ Error loading the product:", error.response?.data || error.message);
        fetchedIdRef.current = null;
        
        // Проверяем, является ли ошибка связанной с авторизацией
        const isAuthError = error.response?.status === 401 || error.response?.status === 403;
        const isRefreshError = error.message?.includes("No refresh token") || 
                              error.response?.data?.detail?.includes("token") ||
                              error.response?.data?.code === 'token_not_valid';
        const isNotFound = error.response?.status === 404 || 
                          error.response?.data?.detail?.includes("No Product matches") ||
                          error.response?.data?.detail?.includes("not found");
        
        let errorMessage;
        if (isAuthError || isRefreshError) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (isNotFound) {
          errorMessage = `Product with ID ${id} not found. It may have been deleted or you don't have permission to view it.`;
        } else {
          errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message ||
                        "Product not found or you don't have permission to view it.";
        }
        
        showNotification(errorMessage, "error");
      } finally {
        fetchingRef.current = false;
      }
    };

    if (id) {
      fetchProduct();
    }
    
    return () => {
      fetchingRef.current = false;
    };
  }, [id]);

  // Функция для удаления всех битых фото (с внешних доменов, например rozetka.com.ua)
  const handleDeleteBrokenPhotos = async () => {
    // Находим все фото с внешними URL (rozetka.com.ua и т.д.)
    const brokenPhotos = images.filter(img => {
      if (!img.url) return false;
      const url = typeof img.url === 'string' ? img.url : '';
      // Проверяем, является ли URL внешним (не с нашего сервера)
      return url.includes('rozetka.com.ua') || 
             (url.startsWith('http') && !url.includes('onlinestore-928b.onrender.com') && !url.startsWith('blob:'));
    });

    if (brokenPhotos.length === 0) {
      showNotification("No broken photos found!", "info");
      return;
    }

    const confirmDelete = window.confirm(
      `Found ${brokenPhotos.length} broken photo(s) (rozetka.com.ua). Delete them?`
    );

    if (!confirmDelete) return;

    setLoading(true);
    let deletedCount = 0;
    let failedCount = 0;

    // Удаляем каждое битое фото через API
    for (const photo of brokenPhotos) {
      if (photo.id) {
        try {
          // Используем ту же логику, что и в handleDeletePhoto, но без показа уведомлений для каждого
          if (productType === 'accessory') {
            const endpoints = [
              `/accessories/${id}/remove_photo`, // Пробуем сначала официальный endpoint
              `/accessories/${id}/photo/${photo.id}`,
              `/accessories/photo/${photo.id}`
            ];
            let deleted = false;
            for (const endpoint of endpoints) {
              try {
                if (endpoint.includes('remove_photo')) {
                  // Согласно API: DELETE /accessories/{id}/remove_photo
                  // Пробуем передать photo_id в теле запроса
                  await apiWithAuth.delete(endpoint, { data: { photo_id: photo.id } });
                } else {
                  await apiWithAuth.delete(endpoint);
                }
                deleted = true;
                console.log(`✅ Successfully deleted photo ${photo.id} via ${endpoint}`);
                break;
              } catch (error) {
                if (error.response?.status !== 404) {
                  // Если это не 404, логируем ошибку, но продолжаем пробовать другие endpoints
                  console.warn(`⚠️ Failed to delete photo ${photo.id} via ${endpoint}:`, error.response?.status, error.response?.data);
                }
              }
            }
            if (!deleted) {
              console.warn(`⚠️ Could not delete photo ${photo.id} from server`);
              failedCount++;
            } else {
              deletedCount++;
            }
          } else {
            // Пробуем разные варианты endpoint для удаления фото продукта
            // Используем паттерн, похожий на /products/{id}/deletion
            const endpoints = [
              `/products/${id}/photo/${photo.id}/deletion`, // По аналогии с /products/{id}/deletion
              `/products/photo/${photo.id}/deletion`,
              `/products/${id}/photo/${photo.id}`,
              `/products/product/${id}/photo/${photo.id}`,
              `/products/photo/${photo.id}`
            ];
            let deleted = false;
            for (const endpoint of endpoints) {
              try {
                await apiWithAuth.delete(endpoint);
                deleted = true;
                console.log(`✅ Successfully deleted photo ${photo.id} via ${endpoint}`);
                break;
              } catch (error) {
                if (error.response?.status !== 404) {
                  // Если это не 404, логируем ошибку, но продолжаем пробовать другие endpoints
                  console.warn(`⚠️ Failed to delete photo ${photo.id} via ${endpoint}:`, error.response?.status, error.response?.data);
                }
              }
            }
            if (!deleted) {
              console.warn(`⚠️ Could not delete photo ${photo.id} from server`);
              failedCount++;
            } else {
              deletedCount++;
            }
          }
        } catch (error) {
          console.error(`Failed to delete photo ${photo.id}:`, error);
          failedCount++;
        }
      } else {
        // Если фото без ID (новое, не сохраненное), просто удаляем из состояния
        deletedCount++;
      }
    }

    // Удаляем все битые фото из локального состояния
    const remainingImages = images.filter(img => {
      if (!img.url) return true;
      const url = typeof img.url === 'string' ? img.url : '';
      const isBroken = url.includes('rozetka.com.ua') || 
                      (url.startsWith('http') && !url.includes('onlinestore-928b.onrender.com') && !url.startsWith('blob:'));
      return !isBroken;
    });
    
    // Обновляем состояние сразу
    setImages(remainingImages);

    // Если cover был битым, устанавливаем первый доступный
    // Проверяем по ID или URL, так как brokenPhotos.includes(cover) может не сработать из-за ссылок на объекты
    let newCover = cover;
    const isCoverBroken = cover && (
      brokenPhotos.some(bp => bp.id === cover.id) ||
      (cover.url && typeof cover.url === 'string' && 
       (cover.url.includes('rozetka.com.ua') || 
        (cover.url.startsWith('http') && !cover.url.includes('onlinestore-928b.onrender.com') && !cover.url.startsWith('blob:'))))
    );
    
    if (isCoverBroken) {
      newCover = remainingImages[0] || null;
      setCover(newCover);
      coverRef.current = newCover;
      console.log("🔄 Cover was broken, replaced with:", newCover);
    }

    // Обновляем исходный список фото ID
    initialPhotoIdsRef.current = remainingImages.filter(img => img.id).map(img => img.id);
    
    // ВАЖНО: Сохраняем продукт без битых фото, чтобы они удалились с сервера
    // Это единственный способ удалить фото, так как API не поддерживает DELETE для фото продуктов
    try {
      console.log("💾 Saving product without broken photos to remove them from server...");
      console.log("📸 Remaining images (will be sent to API):", remainingImages);
      showNotification("Saving product to remove broken photos from server...", "info");
      
      // ВАЖНО: Передаем remainingImages напрямую в handleUpdateProduct,
      // так как setImages асинхронный и состояние еще не обновилось
      await handleUpdateProduct(remainingImages);
      
      showNotification(`Successfully deleted ${deletedCount} broken photo(s) from server!`, "success");
    } catch (error) {
      console.error("❌ Error saving product after deleting broken photos:", error);
      if (failedCount > 0) {
        showNotification(
          `Removed ${deletedCount} broken photo(s) from preview, but failed to save to server. Please click 'Publish' to save changes.`,
          "warning"
        );
      } else {
        showNotification(
          `Removed ${deletedCount} broken photo(s) from preview. Please click 'Publish' to save changes.`,
          "warning"
        );
      }
    }
    
    setLoading(false);
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      if (productType === 'accessory') {
        // Пробуем разные варианты endpoint для удаления фото аксессуара
        // Начинаем с официального endpoint согласно API документации
        const endpoints = [
          { url: `/accessories/${id}/remove_photo`, useBody: true }, // Официальный endpoint
          { url: `/accessories/${id}/photo/${photoId}`, useBody: false },
          { url: `/accessories/photo/${photoId}`, useBody: false }
        ];
        
        let deleted = false;
        for (const endpoint of endpoints) {
          try {
            if (endpoint.useBody) {
              // Согласно API: DELETE /accessories/{id}/remove_photo
              // Передаем photo_id в теле запроса
              await apiWithAuth.delete(endpoint.url, { data: { photo_id: photoId } });
            } else {
              await apiWithAuth.delete(endpoint.url);
            }
            deleted = true;
            console.log(`✅ Successfully deleted photo ${photoId} via ${endpoint.url}`);
            break;
          } catch (error) {
            if (error.response?.status === 404) {
              // Пробуем следующий endpoint
              continue;
            } else {
              // Если это не 404, выбрасываем ошибку
              throw error;
            }
          }
        }
        
        if (!deleted) {
          // Если все варианты не работают, просто удаляем из локального состояния
          console.warn("⚠️ Photo deletion endpoint not found. Removing from local state only.");
          showNotification("Photo removed from preview. Note: API endpoint for photo deletion may not be available.", "info");
        }
      } else {
        // Пробуем разные варианты endpoint для удаления фото продукта
        // Используем паттерн, похожий на /products/{id}/deletion
        let deleted = false;
        const endpoints = [
          `/products/${id}/photo/${photoId}/deletion`, // По аналогии с /products/{id}/deletion
          `/products/photo/${photoId}/deletion`,
          `/products/${id}/photo/${photoId}`,
          `/products/product/${id}/photo/${photoId}`,
          `/products/photo/${photoId}`
        ];
        
        for (const endpoint of endpoints) {
          try {
            await apiWithAuth.delete(endpoint);
            deleted = true;
            console.log(`✅ Successfully deleted photo ${photoId} via ${endpoint}`);
            break;
          } catch (error) {
            // Если это не 404, логируем ошибку, но продолжаем пробовать другие endpoints
            if (error.response?.status !== 404) {
              console.warn(`⚠️ Failed to delete photo ${photoId} via ${endpoint}:`, error.response?.status, error.response?.data);
            }
            // Для 404 просто продолжаем пробовать следующий вариант
          }
        }
        
        if (!deleted) {
          // Если все варианты не работают, просто удаляем из локального состояния
          console.warn("⚠️ Photo deletion endpoint not found. Removing from local state only.");
          showNotification("Photo removed from preview. Note: API endpoint for photo deletion may not be available.", "info");
        }
      }
      
      setImages(prev => {
        const filtered = prev.filter(img => img.id !== photoId);
        if (cover?.id === photoId) {
          setCover(filtered[0] || null);
        }
        return filtered;
      });
      
      showNotification("Photo deleted successfully!", "success");
      // console.log("✅ Photo deleted:", photoId);
    } catch (error) {
      // console.error("❌ Error when deleting photo:", error.response?.data || error.message);
      showNotification(error.response?.data?.detail || error.response?.data?.message || "Error deleting photo. Please try again.", "error");
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(file => ({
        id: null,
        url: URL.createObjectURL(file),
        file,
      }));
      setImages(prev => [...prev, ...newFiles]);
      if (!cover) setCover(newFiles[0]);
    }
  };

  const handleCoverUpload = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0]; // Берем только первый файл для cover
      const newCover = {
        id: null,
        url: URL.createObjectURL(file),
        file, // Важно: сохраняем file в объекте cover
      };
      
      console.log("📤 New cover created:", { hasFile: !!newCover.file, fileName: newCover.file?.name, fileSize: newCover.file?.size });
      
      // Получаем текущий cover из ref
      const currentCover = coverRef.current;
      
      // Если у старого cover есть id, удаляем его из images (чтобы он не отправлялся в photo_ids)
      // Это заставит API удалить старое фото, так как оно не будет в списке существующих
      if (currentCover?.id) {
        console.log("🔄 Replacing cover photo, old photo ID:", currentCover.id);
        // Удаляем старое фото из images, чтобы оно не отправлялось в photo_ids
        setImages(prev => prev.filter(img => img.id !== currentCover.id));
        
        // Также пытаемся удалить старое фото с сервера явно
        try {
          await handleDeletePhoto(currentCover.id);
          console.log("✅ Old cover photo deleted from server");
        } catch (error) {
          // Если не удалось удалить с сервера, продолжаем - оно не будет в photo_ids, так что должно удалиться
          console.warn("⚠️ Could not delete old cover from server, but it will be excluded from photo_ids");
        }
      }
      
      // Сначала обновляем cover и ref синхронно (ВАЖНО: до обновления images)
      // Это гарантирует, что cover сохраняет свой file
      setCover(newCover);
      coverRef.current = newCover; // Обновляем ref сразу
      console.log("✅ Cover state updated, file preserved:", !!coverRef.current?.file);
      
      // Затем добавляем новый cover в начало images
      setImages(prev => {
        // Убеждаемся, что старый cover не в списке (на случай, если он был добавлен обратно)
        const filtered = prev.filter(img => !currentCover || img.id !== currentCover.id);
        // Используем newCover напрямую, чтобы сохранить file
        return [newCover, ...filtered];
      });
      
      // Очищаем input, чтобы можно было загрузить тот же файл снова
      e.target.value = '';
      
      showNotification("Cover photo replaced. Click 'Publish' to update the product.", "info");
    }
  };

  const handleUpdateProduct = async (imagesToUse = null) => {
    // Если передан imagesToUse, используем его вместо images из состояния
    // Это нужно для удаления битых фото, когда состояние еще не обновилось
    // Убеждаемся, что imagesForUpdate всегда является массивом
    const imagesForUpdate = Array.isArray(imagesToUse) ? imagesToUse : (Array.isArray(images) ? images : []);
    if (!isProductReady) {
      showNotification("Please fill in all required fields!", "warning");
      return;
    }

    setLoading(true);

    // Для аксессуаров обрабатываем отдельно, чтобы не попасть в общий catch
    if (productType === 'accessory') {
      // Для аксессуаров API не поддерживает обновление данных (name, category, price и т.д.)
      // Можно обновить только фото через PUT /accessories/{id}/photo
      
      // Для аксессуаров отправляем все фото (и новые, и существующие)
      const newImages = imagesForUpdate.filter(img => img.file);
      const existingImages = imagesForUpdate.filter(img => img.id && !img.file && img.id !== null && img.id !== undefined);
      const hasAnyPhotos = newImages.length > 0 || existingImages.length > 0 || cover?.file || cover?.id;
      
      if (hasAnyPhotos) {
        // Обновляем фото
        const photoFormData = new FormData();
        
        // Отправляем новые файлы
        // Упрощаем: отправляем только images, без cover (cover может быть первым в images)
        // Проверяем формат файлов - API принимает JPEG/JPG и JFIF
        const unsupportedFiles = [];
        
        newImages.forEach(img => {
          if (img.file) {
            const fileType = img.file.type.toLowerCase();
            const fileName = img.file.name.toLowerCase();
            const isJpeg = fileType === 'image/jpeg' || fileType === 'image/jpg' || 
                          fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ||
                          fileName.endsWith('.jfif');
            
            if (isJpeg) {
              photoFormData.append("images", img.file);
            } else {
              unsupportedFiles.push(img.file.name);
            }
          }
        });
        
        if (unsupportedFiles.length > 0) {
          showNotification(`Warning: Some files were skipped. Only JPEG/JPG/JFIF format is supported. Skipped: ${unsupportedFiles.join(', ')}`, "warning");
        }
        
        if (photoFormData.getAll("images").length === 0 && existingImages.length === 0 && !cover?.id) {
          showNotification("No valid JPEG/JFIF images to upload. Please select JPEG/JPG/JFIF files.", "error");
          setLoading(false);
          return;
        }
        
        // Если cover - это отдельный файл, не входящий в images, добавляем его
        if (cover?.file) {
          const isCoverInImages = newImages.some(img => img.file === cover.file);
          if (!isCoverInImages) {
            // Если cover не в images, добавляем его как первый элемент
            // Но лучше не отправлять cover отдельно, так как API может не принимать оба поля
            // photoFormData.append("cover", cover.file);
          }
        }
        
        // Отправляем ID существующих фото, чтобы они сохранились
        existingImages.forEach(img => {
          if (img.id) {
            photoFormData.append("photo_ids", img.id.toString());
          }
        });
        
        // Проверяем права доступа перед попыткой обновления
        if (!isAdmin) {
          showNotification("You don't have permission to update accessories. Please contact an administrator.", "error");
          setLoading(false);
          return;
        }
        
        // Предупреждение о возможной проблеме с правами доступа на бэкенде
        console.warn("⚠️ Attempting to update accessory photos. Note: If you receive a 403 error, this indicates a backend permission issue that requires backend administrator intervention.");
        
        try {
          // Логируем содержимое FormData для отладки
          const uploadLog = {
            accessoryId: id,
            totalImages: imagesForUpdate.length,
            newImagesCount: newImages.length,
            existingImagesCount: existingImages.length,
            existingImageIds: existingImages.map(img => img.id),
            hasCover: !!cover?.file,
            hasCoverId: !!cover?.id,
            formDataKeys: Array.from(photoFormData.keys()),
            isAdmin: isAdmin
          };
          console.log("📤 Uploading accessory photos:", uploadLog);
          addDebugLog("📤 Uploading accessory photos", uploadLog);
          
          // Логируем все ключи FormData с их значениями
          const formDataContents = [];
          console.log("📋 FormData contents:");
          for (let pair of photoFormData.entries()) {
            if (pair[1] instanceof File) {
              const fileInfo = `File(${pair[1].name}, ${pair[1].size} bytes)`;
              console.log(`  ${pair[0]}: ${fileInfo}`);
              formDataContents.push({ key: pair[0], value: fileInfo });
            } else {
              console.log(`  ${pair[0]}: ${pair[1]}`);
              formDataContents.push({ key: pair[0], value: pair[1] });
            }
          }
          addDebugLog("📋 FormData contents", formDataContents);
          
          // Пробуем PUT, если не работает - пробуем POST
          let photoResponse;
          try {
            // НЕ указываем Content-Type явно - axios должен установить его автоматически с правильным boundary
            photoResponse = await apiWithAuth.put(`/accessories/${id}/photo`, photoFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            console.log("✅ Accessory photos updated successfully via PUT:", photoResponse.data);
            console.log("📊 Response status:", photoResponse.status);
            console.log("📊 Response headers:", photoResponse.headers);
          } catch (putError) {
            // Если PUT возвращает 400, 403 или 405, пробуем POST
            if (putError.response?.status === 400 || putError.response?.status === 403 || putError.response?.status === 405) {
              console.log("⚠️ PUT failed with", putError.response?.status, ", trying POST...");
              addDebugLog("⚠️ PUT failed, trying POST", {
                status: putError.response?.status,
                error: putError.response?.data
              });
              try {
                photoResponse = await apiWithAuth.post(`/accessories/${id}/photo`, photoFormData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });
                console.log("✅ Accessory photos updated successfully via POST:", photoResponse.data);
                addDebugLog("✅ Accessory photos updated successfully via POST", photoResponse.data);
              } catch (postError) {
                // Если и POST не работает, логируем детали ошибки
                console.error("❌ POST also failed:", postError.response?.data || postError.message);
                addDebugLog("❌ POST also failed", {
                  status: postError.response?.status,
                  error: postError.response?.data || postError.message
                });
                throw postError;
              }
            } else {
              console.error("❌ PUT failed with unexpected status:", putError.response?.status);
              addDebugLog("❌ PUT failed", {
                status: putError.response?.status,
                error: putError.response?.data || putError.message
              });
              throw putError;
            }
          }
          
          console.log("✅ Accessory photos response:", photoResponse.data);
          console.log("📸 Response accessory_photos:", photoResponse.data?.accessory_photos);
          console.log("📊 Response status:", photoResponse.status);
          addDebugLog("✅ Accessory photos response", photoResponse.data);
          
          // Проверяем, есть ли фото в ответе
          if (!photoResponse.data?.accessory_photos || photoResponse.data.accessory_photos.length === 0) {
            console.error("❌ API returned empty accessory_photos array. This indicates a backend issue.");
            addDebugLog("❌ API returned empty accessory_photos array", {
              status: photoResponse.status,
              response: photoResponse.data,
              warning: "Backend may not be saving photos correctly"
            });
          }
          
          // Обновляем фото из ответа, если они есть
          if (photoResponse.data?.accessory_photos && Array.isArray(photoResponse.data.accessory_photos) && photoResponse.data.accessory_photos.length > 0) {
            const updatedPhotos = photoResponse.data.accessory_photos.map(photo => {
              // Обрабатываем разные форматы данных от API
              let photoUrl = null;
              
              if (typeof photo === 'string') {
                // Если photo - это строка (URL)
                photoUrl = photo;
              } else if (photo && typeof photo === 'object') {
                // Если photo - это объект, пробуем разные поля
                photoUrl = photo.url || photo.photo || photo.photo_url || photo.image_url || photo.url_path || null;
              }
              
              // Если URL относительный, добавляем базовый URL
              if (photoUrl && typeof photoUrl === 'string') {
                if (!photoUrl.startsWith('http')) {
                  const baseUrl = 'https://onlinestore-928b.onrender.com';
                  photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
                }
              } else {
                // Если URL не найден, логируем предупреждение
                console.warn("⚠️ Photo URL not found in photo object:", photo);
                photoUrl = null;
              }
              
              return {
                id: photo.id || photo.photo_id || null,
                url: photoUrl,
              };
            }).filter(photo => photo.url !== null); // Убираем фото без URL
            
            console.log("✅ Photos with processed URLs:", updatedPhotos);
            setImages(updatedPhotos);
            if (updatedPhotos.length > 0) {
              setCover(updatedPhotos[0]);
            }
            console.log("✅ Photos updated in state:", updatedPhotos);
            addDebugLog("✅ Photos updated in state", updatedPhotos);
            showNotification("Photos have been updated successfully! Refresh preview page to see them.", "success");
          } else {
            // Если фото нет в ответе, пробуем загрузить данные заново через API
            console.warn("⚠️ No photos in response, fetching fresh data from API...");
            addDebugLog("⚠️ No photos in response, fetching fresh data", null);
            
            try {
              // Загружаем аксессуар заново, чтобы получить актуальные фото
              const freshResponse = await apiWithAuth.get(`/accessories/${id}`);
              console.log("🔄 Fresh accessory data:", freshResponse.data);
              addDebugLog("🔄 Fresh accessory data", freshResponse.data);
              
              if (freshResponse.data?.accessory_photos && Array.isArray(freshResponse.data.accessory_photos) && freshResponse.data.accessory_photos.length > 0) {
                const freshPhotos = freshResponse.data.accessory_photos.map(photo => ({
                  id: photo.id,
                  url: photo.url || photo,
                }));
                setImages(freshPhotos);
                if (freshPhotos.length > 0) {
                  setCover(freshPhotos[0]);
                }
                console.log("✅ Photos loaded from fresh data:", freshPhotos);
                addDebugLog("✅ Photos loaded from fresh data", freshPhotos);
                showNotification("Photos have been updated successfully!", "success");
              } else {
                console.error("❌ Still no photos after reload. API may not be saving photos correctly.");
                addDebugLog("❌ Still no photos after reload", freshResponse.data);
                showNotification("Photos uploaded but not appearing. Please check API response.", "warning");
                // Перезагружаем страницу как последний вариант
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }
            } catch (fetchError) {
              console.error("❌ Error fetching fresh data:", fetchError);
              addDebugLog("❌ Error fetching fresh data", fetchError.response?.data || fetchError.message);
              showNotification("Photos updated, reloading page...", "info");
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          }
          
          setLoading(false);
          return; // Выходим из функции после успешного обновления
        } catch (photoError) {
          console.error("❌ Error updating accessory photos:", {
            status: photoError.response?.status,
            data: photoError.response?.data,
            message: photoError.message,
            isAdmin: isAdmin,
            errorDetail: photoError.response?.data?.detail || photoError.response?.data?.message || "No error details"
          });
          
          // Если 403, возможно проблема с правами доступа или токеном
          if (photoError.response?.status === 403) {
            const errorDetail = photoError.response?.data?.detail || photoError.response?.data?.message || photoError.response?.data?.error || "";
            console.log("🔍 403 Error details:", {
              detail: photoError.response?.data?.detail,
              message: photoError.response?.data?.message,
              error: photoError.response?.data?.error,
              fullResponse: photoError.response?.data
            });
            
            let errorMsg;
            
            // Проверяем различные варианты сообщений об ошибке
            const errorText = errorDetail.toLowerCase();
            if (errorText.includes("permission") || errorText.includes("not allowed") || errorText.includes("forbidden") || errorText.includes("access denied")) {
              errorMsg = `⚠️ Backend Permission Issue (403)\n\nCannot update accessory photos due to backend permission restrictions.\n\nError: "${errorDetail}"\n\n🔧 This is a BACKEND configuration issue, not a frontend problem.\n\n📋 Action Required:\nPlease contact your backend administrator to:\n\n1. ✅ Verify endpoint access:\n   - PUT /accessories/{id}/photo\n   - PATCH /accessories/{id}/photo\n\n2. ✅ Check user permissions:\n   - Your role: Admin (isAdmin: ${isAdmin})\n   - Required: Permission to update accessory photos\n\n3. ✅ Backend configuration:\n   - Ensure the endpoint is properly configured\n   - Verify permission classes/roles are set correctly\n   - Check if the endpoint requires special admin permissions\n\n💡 Note: Both PUT and PATCH methods were attempted, both returned 403.\nThis indicates the endpoint exists but is restricted by backend permissions.`;
            } else if (errorText.includes("token") || errorText.includes("expired") || errorText.includes("session") || errorText.includes("unauthorized")) {
              errorMsg = "Your session has expired. Please try logging in again.";
            } else if (errorDetail) {
              errorMsg = `Failed to update accessory photos: ${errorDetail}`;
            } else {
              errorMsg = "You don't have permission to update accessory photos, or your session has expired. Please try logging in again.";
            }
            
            showNotification(errorMsg, "error");
          } else if (photoError.response?.status === 401) {
            showNotification("Your session has expired. Please try logging in again.", "error");
          } else {
            const errorMsg = photoError.response?.data?.detail || 
                           photoError.response?.data?.message || 
                           `Failed to update accessory photos. Status: ${photoError.response?.status || 'Unknown'}. Please try again.`;
            showNotification(errorMsg, "error");
          }
          setLoading(false);
          return; // Выходим из функции, чтобы не попасть в общий catch
        }
      } else {
        // Если нет новых фото, но пользователь пытается обновить данные
        showNotification("Updating accessory data (name, category, price, description, etc.) is not currently supported by the API. You can only add/remove photos through the photo management interface.", "info");
        setLoading(false);
        return;
      }
    }

    // Для продуктов продолжаем обычную обработку
    try {
      const formData = new FormData();
      
      formData.append("name", productName.trim());
      formData.append("category", category);
      // FormData автоматически конвертирует boolean в строку, но бэкенд может ожидать строку "true"/"false"
      // Проверяем оба варианта: отправляем как строку для совместимости
      formData.append("is_special", isSpecial ? "true" : "false");
      
      if (stock !== null && stock !== undefined) {
        formData.append("stock", stock.toString());
      }
      
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        showNotification("Price must be a positive number!", "warning");
        setLoading(false);
        return;
      }
      
      formData.append("price", priceNum.toString());
      // Для аксессуаров вес не отправляем
      if (productType !== 'accessory' && weight && weight.trim().length > 0) {
        formData.append("weight", weight.trim());
      }
      formData.append("description", description.trim());
      formData.append("visible", visible ? "true" : "false");

      // Добавляем изображения
      // При обновлении продукта через PUT нужно отправлять все изображения:
      // - Новые файлы (с полем file)
      // - ID существующих изображений (чтобы они сохранились)
      const newImages = imagesForUpdate.filter(img => img.file);
      const existingImages = imagesForUpdate.filter(img => img.id && !img.file && img.id !== null && img.id !== undefined);
      
      // Проверяем, является ли cover частью images
      const coverInImages = cover && imagesForUpdate.some(img => {
        if (cover.file && img.file) {
          return cover.file === img.file;
        }
        if (cover.id && img.id) {
          return cover.id === img.id;
        }
        return cover === img;
      });
      
      // Отправляем новые файлы (исключая cover, если он будет отправлен отдельно)
      const currentCoverForCheck = coverRef.current || cover;
      newImages.forEach(img => {
        // Если это cover и он будет отправлен отдельно, пропускаем его в images
        if (currentCoverForCheck?.file && img.file === currentCoverForCheck.file) {
          // Cover будет отправлен отдельно, пропускаем
          return;
        }
        formData.append("images", img.file);
      });
      
      // Отправляем ID всех существующих изображений, чтобы они сохранились
      // ВАЖНО: исключаем старый cover ID, если он был заменен новым cover с file
      const existingImagesToSend = existingImages.filter(img => {
        // Если есть новый cover с file, исключаем старый cover из existingImages
        if (currentCoverForCheck?.file && img.id === currentCoverForCheck.id) {
          // Это старый cover, который был заменен - не отправляем его ID
          return false;
        }
        return true;
      });
      
      // Отправляем как массив ID
      if (existingImagesToSend.length > 0) {
        const existingIds = existingImagesToSend.map(img => img.id.toString());
        console.log("📤 Sending existing photo IDs (excluding old cover):", existingIds);
        // Пробуем разные варианты формата
        existingIds.forEach(imgId => {
          formData.append("photo_ids[]", imgId);
          formData.append("image_ids[]", imgId);
        });
        // Также отправляем как обычный массив
        formData.append("photo_ids", JSON.stringify(existingIds));
        formData.append("image_ids", JSON.stringify(existingIds));
      } else {
        // Если imagesToUse был явно передан (не null) и массив пустой,
        // это означает, что мы хотим удалить все фото - отправляем пустой массив
        if (imagesToUse !== null && imagesForUpdate.length === 0 && existingImages.length === 0) {
          console.log("📤 Explicitly removing all photos - sending empty photo_ids array");
          formData.append("photo_ids", JSON.stringify([]));
          formData.append("image_ids", JSON.stringify([]));
        } else {
          console.log("📤 No existing photo IDs to send (all were replaced or removed)");
        }
      }
      
      console.log("📸 Photo data:", {
        totalImages: imagesForUpdate.length,
        newImagesCount: newImages.length,
        existingImagesCount: existingImages.length,
        existingImageIds: existingImages.map(img => img.id),
        coverInImages: coverInImages,
        coverHasFile: !!cover?.file,
        coverHasId: !!cover?.id,
        coverObject: cover ? { hasFile: !!cover.file, hasId: !!cover.id, id: cover.id } : null
      });

      // Обрабатываем обложку
      // Используем coverRef.current для получения актуального значения cover
      const currentCover = coverRef.current || cover;
      
      // Проверяем, является ли cover битым фото (rozetka.com.ua или другой внешний домен)
      const isCoverBroken = currentCover?.url && typeof currentCover.url === 'string' && 
                           (currentCover.url.includes('rozetka.com.ua') || 
                            (currentCover.url.startsWith('http') && !currentCover.url.includes('onlinestore-928b.onrender.com') && !currentCover.url.startsWith('blob:')));
      
      // Проверяем, есть ли cover в imagesForUpdate (если передан список)
      const coverInRemainingImages = imagesToUse !== null && currentCover?.id && 
                                     imagesForUpdate.some(img => img.id === currentCover.id);
      
      // Детальное логирование cover перед отправкой
      console.log("🔍 Cover state before sending:", {
        coverRefHasFile: !!coverRef.current?.file,
        coverStateHasFile: !!cover?.file,
        currentCoverHasFile: !!currentCover?.file,
        coverRefId: coverRef.current?.id,
        coverStateId: cover?.id,
        currentCoverId: currentCover?.id,
        isCoverBroken: isCoverBroken,
        coverInRemainingImages: coverInRemainingImages,
        coverRef: coverRef.current,
        coverState: cover,
        currentCover: currentCover
      });
      
      // Всегда отправляем cover отдельно, если у него есть file
      if (currentCover?.file) {
        // Новый файл обложки - отправляем отдельно
        formData.append("cover", currentCover.file);
        console.log("📤 Sending cover file:", currentCover.file.name, "size:", currentCover.file.size);
      } else if (currentCover?.id && currentCover.id !== null && currentCover.id !== undefined && !currentCover.file) {
        // Существующая обложка (без нового файла) - отправляем ID только если:
        // 1. Cover не является битым фото
        // 2. Cover есть в remainingImages (если передан список)
        if (isCoverBroken) {
          console.warn("⚠️ Cover is broken photo (rozetka.com.ua), not sending coverId:", currentCover.id);
        } else if (imagesToUse !== null && !coverInRemainingImages) {
          console.warn("⚠️ Cover not in remaining images, not sending coverId:", currentCover.id);
        } else {
          formData.append("coverId", currentCover.id.toString());
          console.log("📤 Sending cover ID:", currentCover.id);
        }
      } else if (currentCover) {
        console.warn("⚠️ Cover exists but has no file or id:", { 
          hasFile: !!currentCover.file, 
          hasId: !!currentCover.id, 
          id: currentCover.id,
          cover: currentCover 
        });
      }
      
      // Отладочная информация
      console.log("📤 Sending FormData:", {
        productType,
        totalImages: imagesForUpdate.length,
        newImages: imagesForUpdate.filter(img => img.file).length,
        existingImages: imagesForUpdate.filter(img => img.id && !img.file).length,
        hasCoverFile: !!currentCover?.file,
        hasCoverId: !!(currentCover?.id && currentCover.id !== null && currentCover.id !== undefined),
        stock: stock,
        formDataKeys: Array.from(formData.keys())
      });

      // Для продуктов используем PATCH вместо PUT, так как PUT требует все обязательные поля (sku, supplies, flavor_profiles)
      // PATCH позволяет частичное обновление и работает с фото
      let response;
      const maxRetries = 2;
      let lastError = null;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`🔄 Retrying request (attempt ${attempt + 1}/${maxRetries + 1})...`);
            showNotification(`Retrying request (${attempt + 1}/${maxRetries + 1})...`, "info");
            // Небольшая задержка перед повтором
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
          
          response = await apiWithAuth.patch(`/products/product/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 секунд таймаут
          });
          
          // Если успешно, выходим из цикла
          break;
        } catch (patchError) {
          lastError = patchError;
          
          // Если это 502, 503, 504 или сетевые ошибки - пробуем повторить
          const isRetryableError = 
            patchError.response?.status === 502 || 
            patchError.response?.status === 503 || 
            patchError.response?.status === 504 ||
            patchError.code === 'ECONNABORTED' ||
            patchError.code === 'ERR_NETWORK' ||
            patchError.message?.includes('Network Error') ||
            patchError.message?.includes('timeout') ||
            patchError.message?.includes('CORS');
          
          if (isRetryableError && attempt < maxRetries) {
            console.warn(`⚠️ Request failed with ${patchError.response?.status || patchError.code || patchError.message}, retrying...`);
            continue; // Пробуем еще раз
          }
          
          // Если PATCH не работает, пробуем PUT (на случай, если API изменился)
          if (patchError.response?.status === 400 || patchError.response?.status === 403 || patchError.response?.status === 405) {
            console.log("⚠️ PATCH failed with", patchError.response?.status, ", trying PUT...");
            try {
              response = await apiWithAuth.put(`/products/product/${id}`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
              });
              break; // Если PUT успешен, выходим
            } catch (putError) {
              // Логируем детали ошибки
              if (putError.response?.status === 400) {
                console.error("❌ PUT also failed - Error details:", {
                  status: putError.response?.status,
                  data: putError.response?.data,
                  message: putError.response?.data?.detail || putError.response?.data?.message || putError.response?.data?.error,
                });
                console.error("❌ Full error response:", JSON.stringify(putError.response?.data, null, 2));
              }
              throw putError;
            }
          } else {
            // Если это не повторяемая ошибка или мы исчерпали попытки, выбрасываем ошибку
            throw patchError;
          }
        }
      }
      
      // Если после всех попыток не получилось, выбрасываем последнюю ошибку
      if (!response && lastError) {
        const errorMsg = lastError.response?.data?.detail || 
                        lastError.response?.data?.message || 
                        lastError.message ||
                        "Failed to update product. The server may be temporarily unavailable. Please try again later.";
        throw new Error(errorMsg);
      }

      console.log("✅ Product updated successfully:", response.data);
      console.log("📸 Response photos_url:", response.data?.photos_url);
      console.log("📸 Response accessory_photos:", response.data?.accessory_photos);
      console.log("📸 Response photos:", response.data?.photos);
      console.log("📸 Response images:", response.data?.images);
      console.log("📸 Full response:", JSON.stringify(response.data, null, 2));
      
      // Обновляем фото из ответа API, если они есть
      if (response.data) {
        const updatedProduct = response.data;
        let imageUrls = [];
        
        // Обрабатываем фото из ответа
        if (updatedProduct.photos_url && Array.isArray(updatedProduct.photos_url)) {
          imageUrls = updatedProduct.photos_url.map(photo => {
            let photoUrl = null;
            if (typeof photo === 'string') {
              photoUrl = photo;
            } else if (photo && typeof photo === 'object') {
              photoUrl = photo.url || photo.photo || photo.photo_url || photo.image_url || null;
            }
            
            // Если URL относительный, добавляем базовый URL
            if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
              const baseUrl = 'https://onlinestore-928b.onrender.com';
              photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
            }
            
            return {
              id: photo.id || photo.photo_id || null,
              url: photoUrl,
            };
          }).filter(img => img.url !== null);
          console.log("✅ Found photos_url:", imageUrls);
        } else if (updatedProduct.accessory_photos && Array.isArray(updatedProduct.accessory_photos)) {
          imageUrls = updatedProduct.accessory_photos.map(photo => {
            let photoUrl = null;
            if (typeof photo === 'string') {
              photoUrl = photo;
            } else if (photo && typeof photo === 'object') {
              photoUrl = photo.url || photo.photo || photo.photo_url || photo.image_url || null;
            }
            
            // Если URL относительный, добавляем базовый URL
            if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
              const baseUrl = 'https://onlinestore-928b.onrender.com';
              photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
            }
            
            return {
              id: photo.id || photo.photo_id || null,
              url: photoUrl,
            };
          }).filter(img => img.url !== null);
          console.log("✅ Found accessory_photos:", imageUrls);
        } else if (updatedProduct.images && Array.isArray(updatedProduct.images)) {
          imageUrls = updatedProduct.images.map((img, idx) => {
            let photoUrl = null;
            if (typeof img === 'string') {
              photoUrl = img;
            } else if (img && typeof img === 'object') {
              photoUrl = img.url || img.photo || img.photo_url || img.image_url || null;
            }
            
            // Если URL относительный, добавляем базовый URL
            if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
              const baseUrl = 'https://onlinestore-928b.onrender.com';
              photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
            }
            
            return {
              id: img.id || idx,
              url: photoUrl,
            };
          }).filter(img => img.url !== null);
          console.log("✅ Found images:", imageUrls);
        }
        
        // Сохраняем новые фото (которые были загружены, но еще не имеют id) перед обновлением
        const newImagesWithFiles = images.filter(img => img && img.file);
        // Используем coverRef.current для проверки, был ли загружен новый cover (так как cover state может потерять file)
        const hadNewCover = coverRef.current?.file || cover?.file; // Проверяем, был ли загружен новый cover
        const newCoverFile = (coverRef.current?.file ? coverRef.current : null) || (cover?.file ? cover : null); // Сохраняем ссылку на новый cover
        
        // Используем исходный список фото ID (которые были при загрузке продукта)
        // Это правильный способ определить, какие фото новые, а какие старые
        const originalPhotoIds = initialPhotoIdsRef.current || [];
        
        // Инициализируем переменные для фото из API
        let newPhotosFromAPI = [];
        let oldPhotosFromAPI = [];
        
        // Если есть фото в ответе, обновляем состояние
        if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
          // Находим новые фото в ответе API (те, которых не было в исходном списке)
          newPhotosFromAPI = imageUrls.filter(apiPhoto => {
            // Если это фото не было в исходном списке, значит оно новое
            return apiPhoto && apiPhoto.id && !originalPhotoIds.includes(apiPhoto.id);
          });
          
          // Находим старые фото (те, которые были в исходном списке)
          oldPhotosFromAPI = imageUrls.filter(apiPhoto => {
            return apiPhoto && apiPhoto.id && originalPhotoIds.includes(apiPhoto.id);
          });
          
          console.log("🔍 Photo analysis:", {
            hadNewCover,
            newPhotosFromAPICount: newPhotosFromAPI.length,
            oldPhotosFromAPICount: oldPhotosFromAPI.length,
            totalPhotosInResponse: imageUrls.length,
            originalPhotoIds,
            newPhotosFromAPI: newPhotosFromAPI.map(p => ({ id: p.id, url: p.url?.substring(0, 50) })),
            oldPhotosFromAPI: oldPhotosFromAPI.map(p => ({ id: p.id, url: p.url?.substring(0, 50) }))
          });
          
          // Если мы отправляли новый cover, но его нет в ответе API, перезагружаем страницу
          // Проверяем: если был отправлен новый cover, но в ответе нет новых фото, значит API еще не обработал загрузку
          console.log("🔍 Checking if reload is needed:", {
            hadNewCover: !!hadNewCover,
            hadNewCoverType: typeof hadNewCover,
            newPhotosFromAPICount: newPhotosFromAPI.length,
            willReload: hadNewCover && newPhotosFromAPI.length === 0
          });
          
          if (hadNewCover) {
            if (newPhotosFromAPI.length === 0) {
              console.warn("⚠️ New cover was sent but no new photos found in API response! Reloading page to get fresh data...");
              console.warn("⚠️ Reload will happen in 1.5 seconds...");
              showNotification("Product updated, reloading to get photos...", "info");
              setLoading(false);
              setTimeout(() => {
                console.log("🔄 Reloading page now...");
                window.location.reload();
              }, 1500);
              return; // Выходим, не обновляем состояние
            } else {
              console.log("✅ New cover found in API response:", newPhotosFromAPI[0]);
            }
          } else {
            console.log("ℹ️ No new cover was sent, skipping reload check");
          }
          
          // Объединяем новые фото из API с новыми фото, которые были загружены локально
          // Новые фото из API должны быть в начале (они только что загружены)
          const safeNewPhotosFromAPI = newPhotosFromAPI || [];
          const safeOldPhotosFromAPI = oldPhotosFromAPI || [];
          const safeNewImagesWithFiles = newImagesWithFiles || [];
          
          const mergedImages = [...safeNewPhotosFromAPI, ...safeNewImagesWithFiles.filter(img => {
            if (!img) return false;
            // Исключаем cover из newImagesWithFiles, если он уже в newPhotosFromAPI
            if (img.file === newCoverFile?.file) {
              // Если cover уже есть в ответе API, не добавляем его дважды
              return !safeNewPhotosFromAPI.some(apiPhoto => {
                if (!apiPhoto) return false;
                // Проверяем, может ли это быть тот же файл (по отсутствию в исходном списке)
                return apiPhoto.id && !originalPhotoIds.includes(apiPhoto.id);
              });
            }
            return true;
          })];
          
          // Добавляем старые фото, которые остались (если они есть в ответе)
          mergedImages.push(...safeOldPhotosFromAPI);
          
          // Убираем дубликаты по id
          const uniqueImages = mergedImages.filter(img => img != null).reduce((acc, img) => {
            if (!img || !img.id) {
              // Если нет id, это новое фото - добавляем
              if (img) acc.push(img);
            } else {
              // Если есть id, проверяем, нет ли его уже в списке
              const existing = acc.find(existingImg => existingImg && existingImg.id === img.id);
              if (!existing) {
                acc.push(img);
              }
            }
            return acc;
          }, []);
          
          // Вспомогательная функция для проверки, является ли фото битым
          const isBrokenPhoto = (img) => {
            if (!img || !img.url) return false;
            const url = typeof img.url === 'string' ? img.url : '';
            return url.includes('rozetka.com.ua') || 
                   (url.startsWith('http') && !url.includes('onlinestore-928b.onrender.com') && !url.startsWith('blob:'));
          };
          
          // Фильтруем битые фото из uniqueImages перед установкой в состояние
          const validUniqueImages = (uniqueImages || []).filter(img => img && !isBrokenPhoto(img));
          
          // Если были отфильтрованы битые фото, логируем это
          if (validUniqueImages.length < uniqueImages.length) {
            const brokenCount = uniqueImages.length - validUniqueImages.length;
            console.warn(`⚠️ Filtered out ${brokenCount} broken photo(s) (rozetka.com.ua) from API response`);
          }
          
          try {
            setImages(validUniqueImages);
          } catch (setImagesError) {
            console.error("❌ Error setting images state:", setImagesError);
            throw setImagesError;
          }
          
          // Устанавливаем cover: приоритет новому cover из API, затем локальному новому cover
          
          let newCover = null;
          if (newPhotosFromAPI.length > 0 && hadNewCover) {
            // Если в ответе API есть новые фото и мы отправляли cover, используем первое новое фото из API
            // (оно должно быть cover, так как мы отправили его отдельно)
            // Но только если оно не битое
            const validNewPhotos = newPhotosFromAPI.filter(img => !isBrokenPhoto(img));
            if (validNewPhotos.length > 0) {
              newCover = validNewPhotos[0];
              console.log("✅ Using new cover from API response:", newCover);
            } else {
              console.warn("⚠️ New cover from API is broken, skipping");
            }
          } else if (hadNewCover && newCoverFile) {
            // Если cover был отправлен, но не появился в ответе, используем локальный
            newCover = newCoverFile;
            console.log("✅ Using local new cover (not in API response yet):", newCover);
          } else if (newImagesWithFiles.length > 0) {
            // Или первое новое фото
            newCover = newImagesWithFiles[0];
            console.log("✅ Using first new image as cover:", newCover);
          } else if (validUniqueImages.length > 0) {
            // Иначе первое из ответа API (уже отфильтровано от битых)
            newCover = validUniqueImages[0];
            console.log("✅ Using first valid image from API as cover:", newCover);
          } else {
            // Все фото битые или их нет, не устанавливаем cover
            newCover = null;
            console.warn("⚠️ No valid images from API, not setting cover");
          }
          
          try {
            setCover(newCover);
            coverRef.current = newCover; // Обновляем ref сразу
            // Обновляем исходный список фото ID для следующего обновления (только валидные фото)
            initialPhotoIdsRef.current = validUniqueImages.filter(img => img && img.id).map(img => img.id);
            console.log("✅ Photos updated in state:", validUniqueImages.length, "photos (", (newImagesWithFiles || []).length, "new local,", (newPhotosFromAPI || []).length, "new from API,", (oldPhotosFromAPI || []).length, "old remaining)");
            console.log("📸 Updated initial photo IDs:", initialPhotoIdsRef.current);
          } catch (stateError) {
            console.error("❌ Error updating state:", stateError);
            throw stateError;
          }
          
          // Если был отправлен новый cover, но он не стал cover в результате, перезагружаем страницу
          if (hadNewCover && newCover && !newCover.file && newCover.id && originalPhotoIds.includes(newCover.id)) {
            console.warn("⚠️ New cover was sent but old cover is still being used! Reloading page to get fresh data...");
            showNotification("Product updated, reloading to get photos...", "info");
            setLoading(false);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            return;
          }
          
          showNotification("The product has been updated successfully!", "success");
        } else {
          // Если фото нет в ответе, но мы отправляли новые фото, возможно API не вернул их сразу
          // Проверяем, были ли новые фото
          if (newImagesWithFiles.length > 0) {
            console.warn("⚠️ No photos found in API response, but we sent new images! Reloading page to get fresh data...");
            showNotification("Product updated, reloading to get photos...", "info");
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            // Если новых фото не было, просто обновляем без перезагрузки
            showNotification("The product has been updated successfully!", "success");
          }
        }
      } else {
        showNotification("The product has been updated successfully!", "success");
      }
    } catch (error) {
      console.error("❌ Error when updating the product:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          "Error when updating the product. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 3 } }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <AdminBreadcrumbs />
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }} flexWrap={{ xs: 'wrap', md: 'nowrap' }} sx={{ width: "100%", boxSizing: "border-box", m: 0 }}>
        <Grid item xs={12} md={7} sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: { xs: 2, md: 3 }, 
          width: "100%", 
          boxSizing: "border-box", 
          p: 0 
        }}>
          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: "24px", width: "100%", boxSizing: "border-box", overflow: "hidden" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <UploadImages 
              images={images}
              cover={cover}
              setCover={setCover}
              handleImageUpload={handleImageUpload}
              handleCoverUpload={handleCoverUpload}
              handleDeletePhoto={handleDeletePhoto}
            />
            {/* Кнопка для удаления битых фото */}
            {images.some(img => {
              if (!img.url) return false;
              const url = typeof img.url === 'string' ? img.url : '';
              return url.includes('rozetka.com.ua') || 
                     (url.startsWith('http') && !url.includes('onlinestore-928b.onrender.com') && !url.startsWith('blob:'));
            }) && (
              <Button
                variant="outlined"
                color="warning"
                onClick={handleDeleteBrokenPhotos}
                disabled={loading}
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                }}
              >
                🗑️ Delete broken photos (rozetka.com.ua)
              </Button>
            )}
          </Box>
            <ProductForm
              productName={productName} setProductName={setProductName}
              category={category} setCategory={setCategory}
              stock={stock} setStock={setStock}
              price={price} setPrice={setPrice}
              weight={weight} setWeight={setWeight}
              description={description} setDescription={setDescription}
              productType={productType}
              availableCategories={[]}
            />
            
            {productType === 'product' && (
              <Box sx={{ mt: 2, px: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSpecial}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setIsSpecial(newValue);
                        
                        // Проверяем наличие фото при установке isSpecial
                        if (newValue) {
                          const hasPhotos = (images && images.length > 0) || 
                                           (cover && (cover.file || cover.id));
                          
                          if (!hasPhotos) {
                            showNotification(
                              "⚠️ Warning: This product has no photos. Special products should have photos to display correctly on the homepage banner.",
                              "warning"
                            );
                          }
                        }
                      }}
                      sx={{
                        color: '#3E3027',
                        '&.Mui-checked': {
                          color: '#A4795B',
                        },
                      }}
                    />
                  }
                  label="Special Product (Weekly Special)"
                  sx={{ fontSize: '14px', mb: 2 }}
                />
                {isSpecial && images.length === 0 && !cover && (
                  <Typography sx={{ fontSize: '12px', color: '#FF9800', mt: -1, mb: 2 }}>
                    ⚠️ This product has no photos. It may not display correctly on the homepage banner.
                  </Typography>
                )}
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={5} sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: { xs: 2, md: 3 }, 
          width: "100%", 
          boxSizing: "border-box", 
          p: 0 
        }}>
          <ProductSettings visible={visible} setVisible={setVisible} stock={stock} />
          <RelatedItems onAddItems={() => showNotification("Feature coming soon!", "info")} />
          <BottomButtons 
            isProductReady={isProductReady} 
            onSave={handleUpdateProduct} 
            loading={loading}
            onPreview={() => {
              const path = productType === 'accessory' 
                ? `/accessories/product/${id}` 
                : `/coffee/product/${id}`;
              // Открываем в новой вкладке с параметром для обновления кеша
              const url = new URL(path, window.location.origin);
              url.searchParams.set('_t', Date.now()); // Добавляем timestamp для обхода кеша
              window.open(url.toString(), '_blank');
            }}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>


      {/* Диалог с логами */}
      <Dialog
        open={logsDialogOpen}
        onClose={() => setLogsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Debug Logs
          <Button
            onClick={() => {
              setDebugLogs([]);
              localStorage.removeItem('productEditDebugLogs');
            }}
            sx={{ ml: 2 }}
            size="small"
          >
            Clear
          </Button>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
            {debugLogs.length === 0 ? (
              <Typography>No logs yet</Typography>
            ) : (
              debugLogs.map((log, index) => (
                <Paper key={index} sx={{ p: 2, mb: 1, backgroundColor: "#f5f5f5" }}>
                  <Typography variant="caption" sx={{ color: "#666" }}>
                    [{log.timestamp}]
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: "bold" }}>
                    {log.message}
                  </Typography>
                  {log.data && (
                    <Box
                      component="pre"
                      sx={{
                        mt: 1,
                        p: 1,
                        backgroundColor: "#fff",
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        overflow: "auto",
                        maxHeight: "200px"
                      }}
                    >
                      {log.data}
                    </Box>
                  )}
                </Paper>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            const logsText = debugLogs.map(log => 
              `[${log.timestamp}] ${log.message}\n${log.data || ''}`
            ).join('\n\n');
            navigator.clipboard.writeText(logsText);
            showNotification("Logs copied to clipboard!", "success");
          }}>
            Copy All
          </Button>
          <Button onClick={() => setLogsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

 