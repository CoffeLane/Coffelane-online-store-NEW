import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Card } from "@mui/material";
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
  const isAdmin = useSelector((state) => state.auth.isAdmin);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(null);
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState('product'); // 'product' или 'accessory'

  const [images, setImages] = useState([]);
  const [cover, setCover] = useState(null);
  const fetchingRef = useRef(false);
  const fetchedIdRef = useRef(null);

  const isProductReady = useMemo(() => {
    const nameValid = productName && String(productName).trim().length > 0;
    const categoryValid = category && String(category).trim().length > 0;
    const priceStr = price ? String(price).trim() : "";
    const priceValid = priceStr.length > 0 && !isNaN(Number(priceStr)) && Number(priceStr) > 0;
    
    // Для аксессуаров вес не обязателен
    const weightStr = weight ? String(weight).trim() : "";
    const weightValid = productType === 'accessory' ? true : weightStr.length > 0;
    
    // Временная отладка (можно убрать позже)
    // console.log("🔍 isProductReady check:", {
    //   nameValid, categoryValid, priceValid, weightValid,
    //   productName, category, price, weight, productType
    // });
    
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
        
        // Пробуем разные эндпоинты: админский, обычный продукт, аксессуар
        let lastError = null;
        
        // Пробуем загрузить продукт или аксессуар
        // Сначала пробуем аксессуар, так как для продуктов может быть 403
        let loadedSuccessfully = false;
        
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
        
        // Отладочная информация
        console.log("📦 Stock loading:", {
          productStock,
          productStockField: product.stock,
          suppliesQuantity: product.supplies?.[0]?.quantity,
          productQuantity: product.quantity,
          hasSupplies: !!product.supplies,
          suppliesLength: product.supplies?.length
        });
        setPrice(productPrice || "");
        setWeight(productWeight || "");
        setDescription(product.description || "");
        // Для аксессуаров visible может быть в другом поле
        setVisible(product.visible !== undefined ? product.visible : 
                  (product.visible !== null ? product.visible : false));

        // console.log("✅ Set values:", {
        //   name: product.name || "",
        //   category: productCategory,
        //   price: productPrice,
        //   weight: productWeight,
        //   stock: product.stock !== undefined ? product.stock : null
        // });

        let imageUrls = [];
        // Обрабатываем фото для продуктов и аксессуаров
        if (product.photos_url && Array.isArray(product.photos_url)) {
          imageUrls = product.photos_url.map(photo => ({
            id: photo.id,
            url: photo.url || photo,
          }));
        } else if (product.accessory_photos && Array.isArray(product.accessory_photos)) {
          imageUrls = product.accessory_photos.map(photo => ({
            id: photo.id,
            url: photo.url || photo,
          }));
        } else if (product.images && Array.isArray(product.images)) {
          imageUrls = product.images.map((img, idx) => ({
            id: img.id || idx,
            url: img.url || img,
          }));
        }

        setImages(imageUrls);
        setCover(imageUrls[0] || null);

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
        
        alert(errorMessage);
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

  const handleDeletePhoto = async (photoId) => {
    try {
      if (productType === 'accessory') {
        // Для аксессуаров используем DELETE /accessories/{id}/remove_photo
        // Согласно документации API, нужно отправить photo_id в теле запроса
        await apiWithAuth.delete(`/accessories/${id}/remove_photo`, {
          data: { photo_id: photoId }
        });
      } else {
        // Для продуктов используем DELETE /products/photo/{id}/deletion
        await apiWithAuth.delete(`/products/photo/${photoId}/deletion`);
      }
      
      setImages(prev => {
        const filtered = prev.filter(img => img.id !== photoId);
        if (cover?.id === photoId) {
          setCover(filtered[0] || null);
        }
        return filtered;
      });
      // console.log("✅ Photo deleted:", photoId);
    } catch (error) {
      // console.error("❌ Error when deleting photo:", error.response?.data || error.message);
      alert(error.response?.data?.detail || error.response?.data?.message || "Error deleting photo. Please try again.");
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

  const handleUpdateProduct = async () => {
    if (!isProductReady) {
      alert("Please fill in all required fields!");
      return;
    }

    setLoading(true);

    // Для аксессуаров обрабатываем отдельно, чтобы не попасть в общий catch
    if (productType === 'accessory') {
      // Для аксессуаров API не поддерживает обновление данных (name, category, price и т.д.)
      // Можно обновить только фото через PUT /accessories/{id}/photo
      
      // Проверяем, есть ли новые фото для обновления
      const newImages = images.filter(img => img.file);
      const hasNewPhotos = newImages.length > 0 || cover?.file;
      
      if (hasNewPhotos) {
        // Обновляем только фото
        const photoFormData = new FormData();
        newImages.forEach(img => {
          if (img.file) {
            photoFormData.append("images", img.file);
          }
        });
        if (cover?.file) {
          photoFormData.append("cover", cover.file);
        }
        
        // Проверяем права доступа перед попыткой обновления
        if (!isAdmin) {
          alert("You don't have permission to update accessories. Please contact an administrator.");
          setLoading(false);
          return;
        }
        
        // Предупреждение о возможной проблеме с правами доступа на бэкенде
        console.warn("⚠️ Attempting to update accessory photos. Note: If you receive a 403 error, this indicates a backend permission issue that requires backend administrator intervention.");
        
        try {
          // Логируем содержимое FormData для отладки
          console.log("📤 Uploading accessory photos:", {
            accessoryId: id,
            newImagesCount: newImages.length,
            hasCover: !!cover?.file,
            formDataKeys: Array.from(photoFormData.keys()),
            isAdmin: isAdmin
          });
          
          // Пробуем PUT, если не работает - пробуем PATCH
          let photoResponse;
          try {
            // НЕ указываем Content-Type явно - axios должен установить его автоматически с правильным boundary
            photoResponse = await apiWithAuth.put(`/accessories/${id}/photo`, photoFormData);
            console.log("✅ Accessory photos updated successfully via PUT:", photoResponse.data);
          } catch (putError) {
            // Если PUT возвращает 403 или 405, пробуем PATCH
            if (putError.response?.status === 403 || putError.response?.status === 405) {
              console.log("⚠️ PUT failed, trying PATCH...");
              try {
                photoResponse = await apiWithAuth.patch(`/accessories/${id}/photo`, photoFormData);
                console.log("✅ Accessory photos updated successfully via PATCH:", photoResponse.data);
              } catch (patchError) {
                // Если и PATCH не работает, выбрасываем ошибку
                throw patchError;
              }
            } else {
              throw putError;
            }
          }
          
          alert("Accessory photos have been updated successfully! Note: Other fields (name, category, price, etc.) cannot be updated through the API.");
          setLoading(false);
          window.location.reload();
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
            
            alert(errorMsg);
          } else if (photoError.response?.status === 401) {
            alert("Your session has expired. Please try logging in again.");
          } else {
            const errorMsg = photoError.response?.data?.detail || 
                           photoError.response?.data?.message || 
                           `Failed to update accessory photos. Status: ${photoError.response?.status || 'Unknown'}. Please try again.`;
            alert(errorMsg);
          }
          setLoading(false);
          return; // Выходим из функции, чтобы не попасть в общий catch
        }
      } else {
        // Если нет новых фото, но пользователь пытается обновить данные
        alert("Updating accessory data (name, category, price, description, etc.) is not currently supported by the API. You can only add/remove photos through the photo management interface.");
        setLoading(false);
        return;
      }
    }

    // Для продуктов продолжаем обычную обработку
    try {
      const formData = new FormData();
      
      formData.append("name", productName.trim());
      formData.append("category", category);
      
      if (stock !== null && stock !== undefined) {
        formData.append("stock", stock.toString());
      }
      
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        alert("Price must be a positive number!");
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
      images.forEach(img => {
        if (img.file) {
          // Новые файлы
          formData.append("images", img.file);
        }
      });
      
      // Отправляем ID всех существующих изображений, чтобы они сохранились
      // (API может требовать явного указания, какие изображения оставить)
      const existingImageIds = images
        .filter(img => img.id && !img.file && img.id !== null && img.id !== undefined)
        .map(img => img.id.toString());
      
      existingImageIds.forEach(imgId => {
        formData.append("photo_ids", imgId); // Попробуем photo_ids вместо image_ids
      });

      // Обрабатываем обложку
      if (cover?.file) {
        // Новый файл обложки
        formData.append("cover", cover.file);
      } else if (cover?.id && cover.id !== null && cover.id !== undefined) {
        // Существующая обложка - отправляем ID
        formData.append("coverId", cover.id.toString());
      }
      
      // Отладочная информация
      console.log("📤 Sending FormData:", {
        productType,
        totalImages: images.length,
        newImages: images.filter(img => img.file).length,
        existingImages: images.filter(img => img.id && !img.file).length,
        hasCoverFile: !!cover?.file,
        hasCoverId: !!(cover?.id && cover.id !== null && cover.id !== undefined),
        stock: stock,
        formDataKeys: Array.from(formData.keys())
      });

      // Для продуктов используем PUT /products/product/{id} для полного обновления (включая фото)
      // Пробуем PUT, если не работает - пробуем PATCH
      let response;
      try {
        response = await apiWithAuth.put(`/products/product/${id}`, formData);
      } catch (putError) {
        // Если PUT возвращает 403, пробуем PATCH
        if (putError.response?.status === 403 || putError.response?.status === 405) {
          try {
            console.log("⚠️ PUT failed with 403/405, trying PATCH...");
            response = await apiWithAuth.patch(`/products/product/${id}`, formData);
          } catch (patchError) {
            // Если и PATCH не работает, выбрасываем ошибку с понятным сообщением
            const errorMsg = patchError.response?.data?.detail || 
                           patchError.response?.data?.message || 
                           "Failed to update product. You may not have permission to update this product, or the API endpoint is not available.";
            throw new Error(errorMsg);
          }
        } else {
          throw putError;
        }
      }

      // console.log("✅ Product updated successfully:", response.data);
      alert("The product has been updated successfully!");
      
      // Перезагружаем страницу, чтобы увидеть обновленные данные (включая новые фото)
      window.location.reload();
    } catch (error) {
      // console.error("❌ Error when updating the product:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          "Error when updating the product. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 3 } }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <AdminBreadcrumbs />
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }} flexWrap={{ xs: 'wrap', md: 'nowrap' }} sx={{ maxWidth: "100%", width: "100%" }}>
        <Grid item xs={12} md={9} lg={10} sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 }, maxWidth: "100%", width: "100%" }}>
          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: "24px", width: "100%" }}>
            <UploadImages
              images={images}
              cover={cover}
              setCover={setCover}
              handleImageUpload={handleImageUpload}
              handleDeletePhoto={handleDeletePhoto}
            />
            <ProductForm
              productName={productName} setProductName={setProductName}
              category={category} setCategory={setCategory}
              stock={stock} setStock={setStock}
              price={price} setPrice={setPrice}
              weight={weight} setWeight={setWeight}
              description={description} setDescription={setDescription}
              productType={productType}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={3} lg={2} sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
          <ProductSettings visible={visible} setVisible={setVisible} stock={stock} />
          <RelatedItems onAddItems={() => alert("ADD")} />
          <BottomButtons 
            isProductReady={isProductReady} 
            onSave={handleUpdateProduct} 
            loading={loading}
            onPreview={() => {
              const path = productType === 'accessory' 
                ? `/accessories/product/${id}` 
                : `/coffee/product/${id}`;
              window.open(path, '_blank');
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

 