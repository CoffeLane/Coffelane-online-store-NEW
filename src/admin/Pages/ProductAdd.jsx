import React, { useState, useMemo, useEffect } from "react";
import { Box, Grid, Card, FormControl, Select, MenuItem, Typography, Snackbar, Alert, TextField, FormControlLabel, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import UploadImages from "../AdminComponents/UploadImages.jsx";
import ProductForm from "../AdminComponents/ProductForm.jsx";
import ProductSettings from "../AdminComponents/ProductSettings.jsx";
import RelatedItems from "../AdminComponents/RelatedItems.jsx";
import BottomButtons from "../AdminComponents/BottomButtons.jsx";
import { apiWithAuth } from "../../store/api/axios.js";
import api from "../../store/api/axios.js";
import { inputStyles, inputDropdown, selectMenuProps } from '../../styles/inputStyles.jsx';
import { h7 } from "../../styles/typographyStyles.jsx";

export default function ProductsAdd() {
  const navigate = useNavigate();
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  
  const [productType, setProductType] = useState('product'); // 'product' или 'accessory'
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(null); 
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(null); // null = не выбрано, false = скрыто, true = видимо 
  const [images, setImages] = useState([]);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Дополнительные поля для продуктов
  const [brand, setBrand] = useState("");
  const [caffeineType, setCaffeineType] = useState("");
  const [sort, setSort] = useState("");
  const [roast, setRoast] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  
  // Список категорий из таблицы
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // Загружаем категории из существующих продуктов
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allBrands = ['Lavazza', 'Blasercafe', 'Nescafé', 'Jacobs', "L'OR", 'Starbucks', 'Nespresso'];
        
        // Загружаем первую страницу для получения total_pages
        const firstPageRes = await api.get('/products', { params: { page: 1 } });
        const totalPages = firstPageRes.data.total_pages || 1;
        
        // Загружаем все страницы параллельно
        const allPagesPromises = [];
        for (let p = 1; p <= totalPages; p++) {
          allPagesPromises.push(api.get('/products', { params: { page: p } }));
        }
        
        const allPagesRes = await Promise.all(allPagesPromises);
        const allProducts = allPagesRes.flatMap(res => res.data.data || []);
        
        // Загружаем аксессуары
        const accessoriesRes = await api.get('/accessories');
        const allAccessories = accessoriesRes.data.data || [];
        
        // Извлекаем уникальные категории
        const productCategories = new Set();
        allProducts.forEach(p => {
          const cat = p.brand || p.category;
          if (cat && cat.trim()) {
            productCategories.add(cat.trim());
          }
        });
        allAccessories.forEach(a => {
          const cat = a.brand || a.category;
          if (cat && cat.trim()) {
            productCategories.add(cat.trim());
          }
        });
        
        // Объединяем все категории
        const allCategories = [...allBrands, ...Array.from(productCategories)].filter(Boolean);
        setAvailableCategories(Array.from(new Set(allCategories)));
      } catch (error) {
        // Если ошибка, используем только базовые бренды
        const allBrands = ['Lavazza', 'Blasercafe', 'Nescafé', 'Jacobs', "L'OR", 'Starbucks', 'Nespresso'];
        setAvailableCategories(allBrands);
      }
    };
    
    fetchCategories();
  }, []);

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Валидация полей (как в ProductEdit)
  const isProductReady = useMemo(() => {
    const nameValid = productName && String(productName).trim().length > 0;
    const categoryValid = category && String(category).trim().length > 0;
    const priceStr = price ? String(price).trim() : "";
    const priceValid = priceStr.length > 0 && !isNaN(Number(priceStr)) && Number(priceStr) > 0;
    
    // Для аксессуаров вес не обязателен
    const weightStr = weight ? String(weight).trim() : "";
    const weightValid = productType === 'accessory' ? true : weightStr.length > 0;
    
    return nameValid && categoryValid && priceValid && weightValid;
  }, [productName, category, price, weight, productType]);

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

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newCover = {
        id: null,
        url: URL.createObjectURL(file),
        file,
      };
      setCover(newCover);
      // Если cover уже есть в images, заменяем его, иначе добавляем в начало
      setImages(prev => {
        const filtered = prev.filter(img => img !== cover && img.id !== cover?.id);
        return [newCover, ...filtered];
      });
    }
  };

  const handleDeletePhoto = (photoIdOrImg) => {
    // Для новых фото (которые еще не загружены), photoId будет null
    // Можем получить либо id, либо сам объект изображения
    setImages(prev => {
      let imageToDelete = null;
      
      if (typeof photoIdOrImg === 'object' && photoIdOrImg !== null) {
        // Если передан объект изображения
        imageToDelete = prev.find(img => img === photoIdOrImg);
      } else if (photoIdOrImg === null || photoIdOrImg === undefined) {
        // Если передан null, удаляем последнее фото
        imageToDelete = prev[prev.length - 1];
      } else {
        // Ищем фото по id
        imageToDelete = prev.find(img => img.id === photoIdOrImg);
      }
      
      if (!imageToDelete) return prev;
      
      // Освобождаем URL объекта
      if (imageToDelete.url) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      
      const filtered = prev.filter(img => img !== imageToDelete);
      
      // Если удалили cover, устанавливаем первый доступный
      if (cover === imageToDelete) {
        setCover(filtered[0] || null);
      }
      
      return filtered;
    });
  };

  const handleSaveProduct = async () => {
    if (!isProductReady) {
      setError("Please fill in all required fields!");
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;
      
      if (productType === 'product') {
        // Для продуктов используем двухэтапный подход:
        // 1. Создаем продукт с JSON данными (без файлов)
        // 2. Затем загружаем файлы отдельно
        
        // Генерируем SKU
        const sku = `${productName.trim().substring(0, 20).replace(/\s+/g, '').toUpperCase()}_${Date.now()}`;
        
        // Создаем массив supplies
        const weightNum = weight && weight.trim().length > 0 ? parseFloat(weight.trim()) : 0;
        const stockNum = stock !== null && stock !== undefined ? Number(stock) : 0;
        const weightValue = weightNum > 0 ? weightNum.toString() : "0";
        
        const productData = {
          sku: sku,
          name: productName.trim(),
          category: category === "custom" ? "" : category, // Обрабатываем "custom" как пустую строку
          description: description.trim(),
          supplies: [{
            serving_type: "Ground",
            price: priceNum.toString(),
            quantity: stockNum,
            weight: weightValue
          }],
          flavor_profiles: [{
            name: ""
          }],
          is_special: isSpecial
        };
        
        // Дополнительные поля (nullable, можно не отправлять если пустые)
        if (brand && brand.trim().length > 0) {
          productData.brand = brand.trim();
        } else {
          productData.brand = null;
        }
        
        if (caffeineType && caffeineType.trim().length > 0) {
          productData.caffeine_type = caffeineType;
        } else {
          productData.caffeine_type = null;
        }
        
        if (sort && sort.trim().length > 0) {
          productData.sort = sort;
        } else {
          productData.sort = null;
        }
        
        if (roast && roast.trim().length > 0) {
          productData.roast = roast;
        } else {
          productData.roast = null;
        }
        
        if (stock !== null && stock !== undefined) {
          productData.stock = stock;
        }
        
        if (weight && weight.trim().length > 0) {
          productData.weight = weight.trim();
        }
        
        productData.visible = visible === true;
        
        console.log("📤 Creating product with JSON data:", productData);
        
        // Шаг 1: Создаем продукт с JSON данными
        response = await apiWithAuth.post("/products/product", productData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log("✅ Product created successfully:", response.data);
        const productId = response.data.id;
        
        // Даем серверу время обработать создание продукта перед загрузкой фото
        console.log("⏳ Waiting 1 second for server to process product creation...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Шаг 2: Загружаем файлы отдельно, если они есть
        if ((images.length > 0 && images.some(img => img.file)) || cover?.file) {
          const photoFormData = new FormData();
          
          // Для новых продуктов отправляем только новые файлы
          // Если cover есть в images, не отправляем его отдельно
          const imagesToSend = images.filter(img => img.file);
          
          imagesToSend.forEach(img => {
            if (img.file) {
              // Проверяем формат файла (JPEG/JFIF/PNG - согласно ошибке PUT: "Allowed extensions: jpg, jpeg, png")
              const fileType = img.file.type.toLowerCase();
              const fileName = img.file.name.toLowerCase();
              const supportedFormats = ['image/jpeg', 'image/jpg', 'image/jfif', 'image/png'];
              const isValidFormat = 
                supportedFormats.includes(fileType) ||
                fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.jfif');
              
              if (isValidFormat) {
                photoFormData.append("images", img.file);
                console.log(`✅ Added image to FormData: ${img.file.name} (${fileType}, ${img.file.size} bytes)`);
              } else {
                console.warn(`⚠️ Unsupported file format: ${fileType}. Only JPEG/JFIF/PNG are supported. File: ${img.file.name}`);
              }
            }
          });
          
          // Отправляем cover только если он не в images или это отдельный файл
          if (cover?.file && !imagesToSend.some(img => img.file === cover.file)) {
            const fileType = cover.file.type.toLowerCase();
            const fileName = cover.file.name.toLowerCase();
            const supportedFormats = ['image/jpeg', 'image/jpg', 'image/jfif', 'image/png'];
            const isValidFormat = 
              supportedFormats.includes(fileType) ||
              fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.jfif');
            
            if (isValidFormat) {
              photoFormData.append("cover", cover.file);
              console.log(`✅ Added cover to FormData: ${cover.file.name} (${fileType}, ${cover.file.size} bytes)`);
            } else {
              console.warn(`⚠️ Unsupported cover file format: ${fileType}. Only JPEG/JFIF/PNG are supported. File: ${cover.file.name}`);
            }
          }
          
          // Для новых продуктов отправляем пустой массив photo_ids в разных форматах
          // Это может помочь серверу правильно обработать загрузку фото
          // Пробуем разные варианты формата, как в ProductEdit.jsx
          photoFormData.append("photo_ids", JSON.stringify([]));
          photoFormData.append("image_ids", JSON.stringify([]));
          console.log("📤 Sending empty photo_ids and image_ids arrays for new product");
          
          console.log("📤 Uploading photos for product:", productId);
          console.log("📋 FormData contents:", {
            imagesCount: images.filter(img => img.file).length,
            hasCover: !!cover?.file,
            totalFiles: Array.from(photoFormData.entries()).length
          });
          
          // Детальное логирование FormData
          const formDataEntries = Array.from(photoFormData.entries());
          console.log("📋 FormData entries:", formDataEntries.map(([key, value]) => {
            if (value instanceof File) {
              return [key, { name: value.name, type: value.type, size: value.size }];
            }
            return [key, value];
          }));
          
          // Для новых продуктов пробуем сначала PUT /products/{id}/photo (специальный эндпоинт для фото)
          // Если не работает, используем PATCH /products/product/{id} (как в ProductEdit.jsx)
          let photoResponse;
          let lastError = null;
          const maxRetries = 2;
          
          // Пробуем PUT /products/{id}/photo как основной метод для новых продуктов
          // НО: для PUT нужно убедиться, что файлы в правильном формате (jpg, jpeg, png)
          try {
            // Проверяем, что все файлы в правильном формате перед отправкой
            const formDataEntries = Array.from(photoFormData.entries());
            const invalidFiles = [];
            const validFiles = [];
            
            formDataEntries.forEach(([key, value]) => {
              if (value instanceof File) {
                const fileName = value.name.toLowerCase();
                const fileType = value.type.toLowerCase();
                const isValidFormat = 
                  fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png' ||
                  fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
                
                if (isValidFormat) {
                  validFiles.push({ key, fileName, fileType, size: value.size });
                } else {
                  invalidFiles.push({ key, fileName, fileType });
                }
              }
            });
            
            console.log("📋 File validation:", {
              validFiles: validFiles.length,
              invalidFiles: invalidFiles.length,
              validFilesDetails: validFiles,
              invalidFilesDetails: invalidFiles
            });
            
            if (invalidFiles.length > 0) {
              console.warn("⚠️ Some files have invalid format for PUT endpoint:", invalidFiles);
              // Не выбрасываем ошибку, а просто предупреждаем - попробуем PATCH
            }
            
            if (validFiles.length === 0) {
              throw new Error("No valid files to upload. Only jpg, jpeg, png are allowed for PUT endpoint.");
            }
            
            // Создаем новый FormData только с валидными файлами для PUT
            const putFormData = new FormData();
            formDataEntries.forEach(([key, value]) => {
              if (value instanceof File) {
                const fileName = value.name.toLowerCase();
                const fileType = value.type.toLowerCase();
                const isValidFormat = 
                  fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png' ||
                  fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
                
                if (isValidFormat) {
                  putFormData.append(key, value);
                }
              } else {
                // Не отправляем photo_ids для PUT, так как это может вызывать проблемы
                // putFormData.append(key, value);
              }
            });
            
            console.log("📤 Sending PUT request with", Array.from(putFormData.entries()).length, "files");
            
            photoResponse = await apiWithAuth.put(`/products/${productId}/photo`, putFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000, // 30 секунд таймаут
            });
            console.log("✅ Photos uploaded successfully via PUT /products/{id}/photo");
            console.log("📊 Response status:", photoResponse.status);
            console.log("📸 PUT Response data:", photoResponse.data);
            
            // Проверяем, есть ли фото в ответе PUT
            const hasPhotosInPutResponse = 
              (photoResponse.data?.photos_url && photoResponse.data.photos_url.length > 0) ||
              (photoResponse.data?.product_photos && photoResponse.data.product_photos.length > 0);
            
            if (!hasPhotosInPutResponse) {
              console.warn("⚠️ PUT returned 200 but no photos in response. This might indicate a backend issue.");
              throw new Error("PUT returned success but no photos in response");
            }
          } catch (putError) {
            // Если PUT не работает, пробуем PATCH с retry логикой
            if (putError.response?.status === 404 || putError.response?.status === 405 || putError.response?.status === 400) {
              console.log("⚠️ PUT /products/{id}/photo failed with", putError.response?.status, ", trying PATCH /products/product/{id}...");
              console.log("⚠️ PUT error details:", putError.response?.data);
              
              for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                  if (attempt > 0) {
                    console.log(`🔄 Retrying photo upload via PATCH (attempt ${attempt + 1}/${maxRetries + 1})...`);
                    // Небольшая задержка перед повтором
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                  }
                  
                  photoResponse = await apiWithAuth.patch(`/products/product/${productId}`, photoFormData, {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000, // 30 секунд таймаут
                  });
                  
                  console.log("✅ Photos uploaded successfully via PATCH /products/product/{id}");
                  console.log("📊 Response status:", photoResponse.status);
                  
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
                    console.warn(`⚠️ PATCH request failed with ${patchError.response?.status || patchError.code || patchError.message}, retrying...`);
                    continue; // Пробуем еще раз
                  } else {
                    // Если это не retryable ошибка или мы исчерпали попытки, выбрасываем ошибку
                    console.error("❌ PATCH failed:", {
                      status: patchError.response?.status,
                      data: patchError.response?.data,
                      message: patchError.message
                    });
                    throw patchError;
                  }
                }
              }
            } else {
              // Если PUT вернул другую ошибку, выбрасываем её
              console.error("❌ PUT failed with unexpected error:", {
                status: putError.response?.status,
                data: putError.response?.data,
                message: putError.message
              });
              throw putError;
            }
          }
          
          if (!photoResponse) {
            throw lastError || new Error("Failed to upload photos after all retries");
          }
          
          console.log("✅ Photos uploaded successfully");
          console.log("📸 Photo response:", photoResponse.data);
          console.log("📸 Photos in response:", {
            photos_url: photoResponse.data?.photos_url,
            product_photos: photoResponse.data?.product_photos,
            photos: photoResponse.data?.photos
          });
          
          // Проверяем, есть ли фото в ответе
          const hasPhotosInResponse = 
            (photoResponse.data?.photos_url && photoResponse.data.photos_url.length > 0) ||
            (photoResponse.data?.product_photos && photoResponse.data.product_photos.length > 0);
          
          if (!hasPhotosInResponse) {
            console.warn("⚠️ Photos uploaded but not found in response. Photos may be processed asynchronously on the server.");
            console.warn("⚠️ This might indicate that PATCH doesn't save photos for new products. Trying alternative approach...");
            
            // Если PATCH не сохранил фото, пробуем еще раз через PUT после небольшой задержки
            // Возможно, продукт нужно "активировать" перед загрузкой фото
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Пробуем загрузить фото через PUT еще раз
            try {
              console.log("🔄 Retrying photo upload via PUT after delay...");
              const retryPhotoFormData = new FormData();
              
              const imagesToRetry = images.filter(img => img.file);
              imagesToRetry.forEach(img => {
                if (img.file) {
                  const fileType = img.file.type.toLowerCase();
                  const fileName = img.file.name.toLowerCase();
                  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
                  const isValidFormat = 
                    supportedFormats.includes(fileType) ||
                    fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
                  
                  if (isValidFormat) {
                    retryPhotoFormData.append("images", img.file);
                  }
                }
              });
              
              if (cover?.file) {
                const fileType = cover.file.type.toLowerCase();
                const fileName = cover.file.name.toLowerCase();
                const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
                const isValidFormat = 
                  supportedFormats.includes(fileType) ||
                  fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
                
                if (isValidFormat && !imagesToRetry.some(img => img.file === cover.file)) {
                  retryPhotoFormData.append("cover", cover.file);
                }
              }
              
              if (Array.from(retryPhotoFormData.entries()).length > 0) {
                const retryResponse = await apiWithAuth.put(`/products/${productId}/photo`, retryPhotoFormData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                  timeout: 30000,
                });
                console.log("✅ Retry PUT successful:", retryResponse.status);
                console.log("📸 Retry response:", retryResponse.data);
              }
            } catch (retryError) {
              console.warn("⚠️ Retry PUT also failed:", retryError.response?.status, retryError.response?.data);
            }
            
            // Даем больше времени серверу обработать фото (фото могут обрабатываться асинхронно)
            for (let waitAttempt = 0; waitAttempt < 3; waitAttempt++) {
              const waitTime = 2000 * (waitAttempt + 1); // 2s, 4s, 6s
              console.log(`⏳ Waiting ${waitTime}ms for server to process photos (attempt ${waitAttempt + 1}/3)...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              
              try {
                // Пробуем получить продукт с фото через публичный эндпоинт
                const updatedProduct = await api.get(`/products/${productId}`);
                const hasPhotos = (updatedProduct.data?.photos_url?.length > 0 || updatedProduct.data?.product_photos?.length > 0);
                console.log(`📸 Updated product data from /products/{id} (attempt ${waitAttempt + 1}):`, {
                  photos_url: updatedProduct.data?.photos_url,
                  product_photos: updatedProduct.data?.product_photos,
                  hasPhotos: hasPhotos
                });
                
                if (hasPhotos) {
                  console.log("✅ Photos found in product data!");
                  break; // Фото найдены, выходим из цикла
                }
              } catch (fetchError) {
                console.warn(`⚠️ Could not fetch updated product data (attempt ${waitAttempt + 1}):`, fetchError.response?.status);
              }
            }
          }
        }
        
        showNotification("Product has been created successfully!", "success");
      } else {
        // Для аксессуаров используем FormData как раньше
        const formData = new FormData();
      
      formData.append("name", productName.trim());
      formData.append("category", category);
      
      if (stock !== null && stock !== undefined) {
        formData.append("stock", stock.toString());
      }
      
      formData.append("price", priceNum.toString());
      
      formData.append("description", description.trim());
      formData.append("visible", visible === true ? "true" : "false");

      // Добавляем изображения
      images.forEach(img => {
        if (img.file) {
          formData.append("images", img.file);
        }
      });
      
      if (cover?.file) {
        formData.append("cover", cover.file);
      }

        response = await apiWithAuth.post("/accessories", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log("✅ Accessory created successfully:", response.data);
        showNotification("Accessory has been created successfully!", "success");
      }

      // Очищаем форму
      setProductName("");
      setCategory("");
      setStock(null);
      setPrice("");
      setWeight("");
      setDescription("");
      setVisible(null); // Сбрасываем в null (Draft статус)
      setImages([]);
      setCover(null);
      setError("");
      // Очищаем дополнительные поля
      setBrand("");
      setCaffeineType("");
      setSort("");
      setRoast("");
      setIsSpecial(false);

      // Увеличиваем задержку, чтобы уведомление успело показаться и фото обработались на сервере
      // Фото могут обрабатываться асинхронно на сервере, поэтому даем больше времени
      // Особенно важно для новых продуктов - серверу нужно время на обработку и сохранение фото
      setTimeout(() => {
      // Переходим на страницу списка продуктов
        // Используем replace: true, чтобы не добавлять в историю
        // И state для принудительного обновления списка
        navigate("/admin/products", { 
          replace: true,
          state: { refresh: true, timestamp: Date.now() }
        });
      }, 5000); // Увеличено до 5 секунд, чтобы дать время серверу обработать и сохранить фото
      
    } catch (err) {
      console.error("❌ Error when adding product/accessory:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        fullError: err
      });
      
      // Детальное логирование ошибки для отладки
      if (err.response?.data) {
        console.error("❌ Error details:", JSON.stringify(err.response.data, null, 2));
        // Если есть ошибки валидации, показываем их
        if (err.response.data.sku) {
          console.error("❌ SKU error:", err.response.data.sku);
        }
        if (err.response.data.supplies) {
          console.error("❌ Supplies error:", err.response.data.supplies);
        }
        if (err.response.data.flavor_profiles) {
          console.error("❌ Flavor profiles error:", err.response.data.flavor_profiles);
        }
      }
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          (err.response?.data?.sku ? `SKU: ${Array.isArray(err.response.data.sku) ? err.response.data.sku[0] : err.response.data.sku}` : '') ||
                          (err.response?.data?.supplies ? `Supplies: ${Array.isArray(err.response.data.supplies) ? err.response.data.supplies[0] : err.response.data.supplies}` : '') ||
                          (err.response?.data?.flavor_profiles ? `Flavor profiles: ${Array.isArray(err.response.data.flavor_profiles) ? err.response.data.flavor_profiles[0] : err.response.data.flavor_profiles}` : '') ||
                          err.response?.data?.error ||
                          "Error when adding product. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 3 }, boxSizing: "border-box" }}>
      <Box mb={{ xs: 2, md: 3 }} display="flex" justifyContent="space-between" alignItems="center">
        <AdminBreadcrumbs />
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }} flexWrap={{ xs: 'wrap', md: 'nowrap' }} sx={{ width: "100%", boxSizing: "border-box", m: 0 }}>
        <Grid size={{ xs: 12, md: 7, lg: 7 }} sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 }, width: "100%", boxSizing: "border-box", p: 0 }}>
          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: "24px", width: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            {/* Выбор типа продукта */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ ...h7 }} mb={1}>Product Type</Typography>
              <FormControl fullWidth sx={{ ...h7, ...inputDropdown, ...inputStyles }}>
                <Select 
                  value={productType} 
                  onChange={(e) => {
                    setProductType(e.target.value);
                    // При смене типа очищаем вес, если это аксессуар
                    if (e.target.value === 'accessory') {
                      setWeight("");
                    }
                  }}
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="product">Product (Coffee/Tea)</MenuItem>
                  <MenuItem value="accessory">Accessory</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <UploadImages 
              images={images}
              cover={cover}
              setCover={setCover}
              handleImageUpload={handleImageUpload}
              handleDeletePhoto={handleDeletePhoto}
              handleCoverUpload={handleCoverUpload}
            />
            <ProductForm
              productName={productName} 
              setProductName={setProductName}
              category={category} 
              setCategory={setCategory}
              stock={stock} 
              setStock={setStock}
              price={price} 
              setPrice={setPrice}
              weight={weight} 
              setWeight={setWeight}
              description={description} 
              setDescription={setDescription}
              productType={productType}
              availableCategories={availableCategories}
            />
            
            {/* Дополнительные поля для продуктов (только для productType === 'product') */}
            {productType === 'product' && (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ ...h7 }} mb={1}>Brand</Typography>
                <TextField 
                  fullWidth 
                  value={brand || ""} 
                  onChange={(e) => setBrand(e.target.value)} 
                  sx={{ ...inputStyles, mb: 2 }}
                  placeholder="Enter brand (optional)"
                />
                
                <Typography sx={{ ...h7 }} mb={1}>Caffeine Type</Typography>
                <FormControl fullWidth sx={{ ...h7, ...inputDropdown, ...inputStyles, mb: 2 }}>
                  <Select 
                    value={caffeineType || ""} 
                    onChange={(e) => setCaffeineType(e.target.value)} 
                    MenuProps={selectMenuProps}
                    displayEmpty
                  >
                    <MenuItem value="">Select caffeine type (optional)</MenuItem>
                    <MenuItem value="Caffeine">Caffeine</MenuItem>
                    <MenuItem value="Caffeine Medium">Caffeine Medium</MenuItem>
                    <MenuItem value="Decaffeinated">Decaffeinated</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography sx={{ ...h7 }} mb={1}>Sort</Typography>
                <FormControl fullWidth sx={{ ...h7, ...inputDropdown, ...inputStyles, mb: 2 }}>
                  <Select 
                    value={sort || ""} 
                    onChange={(e) => setSort(e.target.value)} 
                    MenuProps={selectMenuProps}
                    displayEmpty
                  >
                    <MenuItem value="">Select sort (optional)</MenuItem>
                    <MenuItem value="Arabica">Arabica</MenuItem>
                    <MenuItem value="Robusta">Robusta</MenuItem>
                    <MenuItem value="Arabica/robusta blend">Arabica/robusta blend</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography sx={{ ...h7 }} mb={1}>Roast</Typography>
                <FormControl fullWidth sx={{ ...h7, ...inputDropdown, ...inputStyles, mb: 2 }}>
                  <Select 
                    value={roast || ""} 
                    onChange={(e) => setRoast(e.target.value)} 
                    MenuProps={selectMenuProps}
                    displayEmpty
                  >
                    <MenuItem value="">Select roast (optional)</MenuItem>
                    <MenuItem value="Light">Light</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Dark">Dark</MenuItem>
                  </Select>
                </FormControl>
                
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
                            setSnackbar({
                              open: true,
                              message: "⚠️ Warning: This product has no photos. Special products should have photos to display correctly on the homepage banner.",
                              severity: "warning"
                            });
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
                  sx={{ ...h7, mb: 2 }}
                />
                {isSpecial && images.length === 0 && !cover && (
                  <Typography sx={{ ...h7, color: '#FF9800', fontSize: '12px', mt: -1, mb: 2 }}>
                    ⚠️ This product has no photos. It may not display correctly on the homepage banner.
                  </Typography>
                )}
              </Box>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5, lg: 5 }} sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 }, width: "100%", boxSizing: "border-box", p: 0 }}>
          <ProductSettings visible={visible} setVisible={setVisible} stock={stock} />
          <RelatedItems onAddItems={() => alert("ADD")} />
          {error && (
            <Box sx={{ p: 2, backgroundColor: "#ffebee", borderRadius: 2, color: "#c62828", fontSize: { xs: "12px", md: "14px" } }}>
              {error}
            </Box>
          )}
          <BottomButtons 
            isProductReady={isProductReady} 
            onSave={handleSaveProduct}
            loading={loading}
            onPreview={() => {
              // Preview не доступен для новых продуктов
              showNotification("Preview is only available after the product is created.", "info");
            }}
          />
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
