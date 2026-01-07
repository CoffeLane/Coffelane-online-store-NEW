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
  
  const urlProductType = searchParams.get('type'); 

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
  const initialPhotoIdsRef = useRef([]); 
  
  useEffect(() => {
    if (coverRef.current?.file && !cover?.file) {
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
      localStorage.setItem('productEditDebugLogs', JSON.stringify(newLogs.slice(-50))); 
      return newLogs;
    });
    console.log(`[${logEntry.timestamp}] ${message}`, data || '');
  };

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

  const fetchProduct = React.useCallback(async () => {
      if (fetchingRef.current && fetchedIdRef.current === id) {
        return;
      }
      
      if (fetchedIdRef.current === id && !fetchingRef.current) {
        return;
      }
      
      fetchingRef.current = true;
      fetchedIdRef.current = id;
      try {
        let response;
        let lastError = null;
        
        let loadedSuccessfully = false;
        
        if (urlProductType === 'accessory') {
          try {
            response = await apiWithAuth.get(`/accessories/${id}`);
            setProductType('accessory');
            loadedSuccessfully = true;
          } catch (eAccessory) {
            throw eAccessory;
          }
        } else if (urlProductType === 'product') {
          try {
            response = await apiWithAuth.get(`/products/${id}`);
            setProductType('product');
            loadedSuccessfully = true;
          } catch (e1) {
            if (e1.response?.status === 404 || e1.response?.status === 403) {
              try {
                response = await apiWithAuth.get(`/products/product/${id}`);
                setProductType('product');
                loadedSuccessfully = true;
              } catch (e2) {
                try {
                  response = await api.get(`/products/${id}`);
                  setProductType('product');
                  loadedSuccessfully = true;
                } catch (e3) {
                  throw e3;
                }
              }
            } else {
              throw e1;
            }
          }
        } else {
          try {
            response = await apiWithAuth.get(`/accessories/${id}`);
            setProductType('accessory');
            loadedSuccessfully = true;
          } catch (eAccessory) {
            if (eAccessory.response?.status === 404) {
              try {
                response = await apiWithAuth.get(`/products/${id}`);
                setProductType('product');
                loadedSuccessfully = true;
              } catch (e1) {
                if (e1.response?.status === 404 || e1.response?.status === 403) {
                  try {
                    response = await apiWithAuth.get(`/products/product/${id}`);
                    setProductType('product');
                    loadedSuccessfully = true;
                  } catch (e2) {
                    throw e2;
                  }
                } else {
                  throw e1;
                }
              }
            } else {
              try {
                response = await apiWithAuth.get(`/products/${id}`);
                setProductType('product');
                loadedSuccessfully = true;
              } catch (e1) {
                if (e1.response?.status === 404 || e1.response?.status === 403) {
                  try {
                    response = await apiWithAuth.get(`/products/product/${id}`);
                    setProductType('product');
                    loadedSuccessfully = true;
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
        let productStock = null;
        if (product.stock !== undefined && product.stock !== null) {
          productStock = product.stock;
        } else if (product.supplies && Array.isArray(product.supplies) && product.supplies.length > 0) {
          const supplyQuantity = product.supplies[0].quantity;
          if (supplyQuantity !== undefined && supplyQuantity !== null) {
            productStock = supplyQuantity;
          }
        } else if (product.quantity !== undefined && product.quantity !== null) {
          productStock = product.quantity;
        }
        setStock(productStock);
        setPrice(productPrice || "");
        setWeight(productWeight || "");
        setDescription(product.description || "");
        
        let productVisible = true;
        if (product.status === 'Hidden' || product.status === 'hidden') {
          productVisible = false;
        } else if (product.visible !== undefined && product.visible !== null) {
          productVisible = product.visible === true || product.visible === 'true';
        } else if (product.status && product.status !== 'Active' && product.status !== 'active') {
          productVisible = false;
        }
        setVisible(productVisible);
        
        setIsSpecial(product.is_special === true || product.is_special === 'true' || product.isSpecial === true);

        let imageUrls = [];
        
        if (product.photos_url && Array.isArray(product.photos_url) && product.photos_url.length > 0) {
          imageUrls = product.photos_url.map(photo => {
            let photoUrl = null;
            if (typeof photo === 'string') {
              photoUrl = photo;
            } else if (photo && typeof photo === 'object') {
              photoUrl = photo.url || photo.photo || photo.photo_url || photo.image_url || null;
            }
            
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
          imageUrls = product.product_photos.map(photo => {
            let photoUrl = null;

            if (photo.photo) {
              if (typeof photo.photo === 'string') {
                photoUrl = photo.photo;
              } else if (photo.photo.url) {
                photoUrl = photo.photo.url;
              } else if (photo.photo.photo_url) {
                photoUrl = photo.photo.photo_url;
              }
            } else {
              photoUrl = photo.url || photo.photo_url || photo.image_url || null;
            }
          
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
        initialPhotoIdsRef.current = imageUrls.filter(img => img.id).map(img => img.id);

        if (imageUrls.length === 0) {
          console.log("📸 Initial photo IDs saved: [] (no photos found in product)");
        } else if (initialPhotoIdsRef.current.length === 0) {
          console.log(`📸 Initial photo IDs saved: [] (found ${imageUrls.length} photos but none have IDs)`);
        } else {
          console.log(`📸 Initial photo IDs saved: [${initialPhotoIdsRef.current.join(', ')}] (${initialPhotoIdsRef.current.length} photos with IDs)`);
        }
        const firstImage = imageUrls[0] || null;
        setCover(firstImage);
        coverRef.current = firstImage; 

      } catch (error) {
        console.error("Error loading the product:", error.response?.data || error.message);
        fetchedIdRef.current = null;
        
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
    }, [id, urlProductType]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    
    return () => {
      fetchingRef.current = false;
    };
  }, [id, fetchProduct]);

  const handleDeleteBrokenPhotos = async () => {
    const brokenPhotos = images.filter(img => {
      if (!img.url) return false;
      const url = typeof img.url === 'string' ? img.url : '';
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

    for (const photo of brokenPhotos) {
      if (photo.id) {
        try {
          if (productType === 'accessory') {
            const endpoints = [
              `/accessories/${id}/remove_photo`,
              `/accessories/${id}/photo/${photo.id}`,
              `/accessories/photo/${photo.id}`
            ];
            let deleted = false;
            for (const endpoint of endpoints) {
              try {
                if (endpoint.includes('remove_photo')) {
                  await apiWithAuth.delete(endpoint, { data: { photo_id: photo.id } });
                } else {
                  await apiWithAuth.delete(endpoint);
                }
                deleted = true;
                console.log(`✅ Successfully deleted photo ${photo.id} via ${endpoint}`);
                break;
              } catch (error) {
                if (error.response?.status !== 404) {

                  console.warn(`Failed to delete photo ${photo.id} via ${endpoint}:`, error.response?.status, error.response?.data);
                }
              }
            }
            if (!deleted) {
              console.warn(`Could not delete photo ${photo.id} from server`);
              failedCount++;
            } else {
              deletedCount++;
            }
          } else {
            const endpoints = [
              `/products/${id}/photo/${photo.id}/deletion`,
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
                  console.warn(`Failed to delete photo ${photo.id} via ${endpoint}:`, error.response?.status, error.response?.data);
                }
              }
            }
            if (!deleted) {
              console.warn(`Could not delete photo ${photo.id} from server`);
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
        deletedCount++;
      }
    }

    const remainingImages = images.filter(img => {
      if (!img.url) return true;
      const url = typeof img.url === 'string' ? img.url : '';
      const isBroken = url.includes('rozetka.com.ua') || 
                      (url.startsWith('http') && !url.includes('onlinestore-928b.onrender.com') && !url.startsWith('blob:'));
      return !isBroken;
    });

    setImages(remainingImages);

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

    initialPhotoIdsRef.current = remainingImages.filter(img => img.id).map(img => img.id);

    try {
      console.log("💾 Saving product without broken photos to remove them from server...");
      console.log("📸 Remaining images (will be sent to API):", remainingImages);
      showNotification("Saving product to remove broken photos from server...", "info");
      
      await handleUpdateProduct(remainingImages);
      
      showNotification(`Successfully deleted ${deletedCount} broken photo(s) from server!`, "success");
    } catch (error) {
      console.error(" Error saving product after deleting broken photos:", error);
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
        const endpoints = [
          { url: `/accessories/${id}/remove_photo`, useBody: true }, 
          { url: `/accessories/${id}/photo/${photoId}`, useBody: false },
          { url: `/accessories/photo/${photoId}`, useBody: false }
        ];
        
        let deleted = false;
        for (const endpoint of endpoints) {
          try {
            if (endpoint.useBody) {
              await apiWithAuth.delete(endpoint.url, { data: { photo_id: photoId } });
            } else {
              await apiWithAuth.delete(endpoint.url);
            }
            deleted = true;
            console.log(`✅ Successfully deleted photo ${photoId} via ${endpoint.url}`);
            break;
          } catch (error) {
            if (error.response?.status === 404) {
              continue;
            } else {
              throw error;
            }
          }
        }
        
        if (!deleted) {
          console.warn("Photo deletion endpoint not found. Removing from local state only.");
          showNotification("Photo removed from preview. Note: API endpoint for photo deletion may not be available.", "info");
        }
      } else {
        let deleted = false;
        const endpoints = [
          `/products/${id}/photo/${photoId}/deletion`,
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
            if (error.response?.status !== 404) {
              console.warn(`Failed to delete photo ${photoId} via ${endpoint}:`, error.response?.status, error.response?.data);
            }
          }
        }
        
        if (!deleted) {
          console.warn("Photo deletion endpoint not found. Removing from local state only.");
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
    } catch (error) {
      console.error(" Error when deleting photo:", error.response?.data || error.message);
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
      const file = files[0];
      const newCover = {
        id: null,
        url: URL.createObjectURL(file),
        file, 
      };
      
      console.log("📤 New cover created:", { hasFile: !!newCover.file, fileName: newCover.file?.name, fileSize: newCover.file?.size });
      
      const currentCover = coverRef.current;

      if (currentCover?.id) {
        console.log("🔄 Replacing cover photo, old photo ID:", currentCover.id);
        setImages(prev => prev.filter(img => img.id !== currentCover.id));
        
        try {
          await handleDeletePhoto(currentCover.id);
          console.log("✅ Old cover photo deleted from server");
        } catch (error) {
          console.warn("Could not delete old cover from server, but it will be excluded from photo_ids");
        }
      }
 
      setCover(newCover);
      coverRef.current = newCover; 
      console.log("✅ Cover state updated, file preserved:", !!coverRef.current?.file);
      
      setImages(prev => {
        const filtered = prev.filter(img => !currentCover || img.id !== currentCover.id);
        return [newCover, ...filtered];
      });
      
      e.target.value = '';
      
      showNotification("Cover photo replaced. Click 'Publish' to update the product.", "info");
    }
  };

  const handleUpdateProduct = async (imagesToUse = null) => {
    const imagesForUpdate = Array.isArray(imagesToUse) ? imagesToUse : (Array.isArray(images) ? images : []);
    if (!isProductReady) {
      showNotification("Please fill in all required fields!", "warning");
      return;
    }

    setLoading(true);
    if (productType === 'accessory') {
 
      const newImages = imagesForUpdate.filter(img => img.file);
      const existingImages = imagesForUpdate.filter(img => img.id && !img.file && img.id !== null && img.id !== undefined);
      const hasAnyPhotos = newImages.length > 0 || existingImages.length > 0 || cover?.file || cover?.id;
      
      if (hasAnyPhotos) {
        const photoFormData = new FormData();
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
        
        if (cover?.file) {
          const isCoverInImages = newImages.some(img => img.file === cover.file);
          if (!isCoverInImages) {
          }
        }
        
        existingImages.forEach(img => {
          if (img.id) {
            photoFormData.append("photo_ids", img.id.toString());
          }
        });
        
        if (!isAdmin) {
          showNotification("You don't have permission to update accessories. Please contact an administrator.", "error");
          setLoading(false);
          return;
        }
        
        console.warn("Attempting to update accessory photos. Note: If you receive a 403 error, this indicates a backend permission issue that requires backend administrator intervention.");
        
        try {
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
          
          let photoResponse;
          try {
            photoResponse = await apiWithAuth.put(`/accessories/${id}/photo`, photoFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            console.log("✅ Accessory photos updated successfully via PUT:", photoResponse.data);
            console.log("📊 Response status:", photoResponse.status);
            console.log("📊 Response headers:", photoResponse.headers);
          } catch (putError) {
            if (putError.response?.status === 400 || putError.response?.status === 403 || putError.response?.status === 405) {
              console.log("⚠️ PUT failed with", putError.response?.status, ", trying POST...");
              addDebugLog("PUT failed, trying POST", {
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
                console.error("POST also failed:", postError.response?.data || postError.message);
                addDebugLog("POST also failed", {
                  status: postError.response?.status,
                  error: postError.response?.data || postError.message
                });
                throw postError;
              }
            } else {
              console.error("PUT failed with unexpected status:", putError.response?.status);
              addDebugLog("PUT failed", {
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
          
          if (!photoResponse.data?.accessory_photos || photoResponse.data.accessory_photos.length === 0) {
            console.error("API returned empty accessory_photos array. This indicates a backend issue.");
            addDebugLog("API returned empty accessory_photos array", {
              status: photoResponse.status,
              response: photoResponse.data,
              warning: "Backend may not be saving photos correctly"
            });
          }
          
          if (photoResponse.data?.accessory_photos && Array.isArray(photoResponse.data.accessory_photos) && photoResponse.data.accessory_photos.length > 0) {
            const updatedPhotos = photoResponse.data.accessory_photos.map(photo => {
              let photoUrl = null;
              
              if (typeof photo === 'string') {
                photoUrl = photo;
              } else if (photo && typeof photo === 'object') {
                photoUrl = photo.url || photo.photo || photo.photo_url || photo.image_url || photo.url_path || null;
              }
              
              if (photoUrl && typeof photoUrl === 'string') {
                if (!photoUrl.startsWith('http')) {
                  const baseUrl = 'https://onlinestore-928b.onrender.com';
                  photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
                }
              } else {
                console.warn("Photo URL not found in photo object:", photo);
                photoUrl = null;
              }
              
              return {
                id: photo.id || photo.photo_id || null,
                url: photoUrl,
              };
            }).filter(photo => photo.url !== null);
            
            console.log("✅ Photos with processed URLs:", updatedPhotos);
            setImages(updatedPhotos);
            if (updatedPhotos.length > 0) {
              setCover(updatedPhotos[0]);
            }
            console.log("✅ Photos updated in state:", updatedPhotos);
            addDebugLog("✅ Photos updated in state", updatedPhotos);
            showNotification("Photos have been updated successfully! Refresh preview page to see them.", "success");
          } else {
            console.warn("No photos in response, fetching fresh data from API...");
            addDebugLog(" No photos in response, fetching fresh data", null);
            
            try {
              const freshResponse = await apiWithAuth.get(`/accessories/${id}`);
              console.log("Fresh accessory data:", freshResponse.data);
              addDebugLog("Fresh accessory data", freshResponse.data);
              
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
                addDebugLog("Photos loaded from fresh data", freshPhotos);
                showNotification("Photos have been updated successfully!", "success");
              } else {
                console.error("Still no photos after reload. API may not be saving photos correctly.");
                addDebugLog("Still no photos after reload", freshResponse.data);
                showNotification("Photos uploaded but not appearing. Please check API response.", "warning");
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }
            } catch (fetchError) {
              console.error("Error fetching fresh data:", fetchError);
              addDebugLog("Error fetching fresh data", fetchError.response?.data || fetchError.message);
              showNotification("Photos updated, reloading page...", "info");
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          }
          
          setLoading(false);
          return;
        } catch (photoError) {
          console.error(" Error updating accessory photos:", {
            status: photoError.response?.status,
            data: photoError.response?.data,
            message: photoError.message,
            isAdmin: isAdmin,
            errorDetail: photoError.response?.data?.detail || photoError.response?.data?.message || "No error details"
          });
          
          if (photoError.response?.status === 403) {
            const errorDetail = photoError.response?.data?.detail || photoError.response?.data?.message || photoError.response?.data?.error || "";
            console.log("🔍 403 Error details:", {
              detail: photoError.response?.data?.detail,
              message: photoError.response?.data?.message,
              error: photoError.response?.data?.error,
              fullResponse: photoError.response?.data
            });
            
            let errorMsg;
            
            const errorText = errorDetail.toLowerCase();
            if (errorText.includes("permission") || errorText.includes("not allowed") || errorText.includes("forbidden") || errorText.includes("access denied")) {
              errorMsg = `Backend Permission Issue (403)\n\nCannot update accessory photos due to backend permission restrictions.\n\nError: "${errorDetail}"\n\n🔧 This is a BACKEND configuration issue, not a frontend problem.\n\n📋 Action Required:\nPlease contact your backend administrator to:\n\n1. ✅ Verify endpoint access:\n   - PUT /accessories/{id}/photo\n   - PATCH /accessories/{id}/photo\n\n2. ✅ Check user permissions:\n   - Your role: Admin (isAdmin: ${isAdmin})\n   - Required: Permission to update accessory photos\n\n3. ✅ Backend configuration:\n   - Ensure the endpoint is properly configured\n   - Verify permission classes/roles are set correctly\n   - Check if the endpoint requires special admin permissions\n\n💡 Note: Both PUT and PATCH methods were attempted, both returned 403.\nThis indicates the endpoint exists but is restricted by backend permissions.`;
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
          return;
        }
      } else {
     
        showNotification("Updating accessory data (name, category, price, description, etc.) is not currently supported by the API. You can only add/remove photos through the photo management interface.", "info");
        setLoading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      
      formData.append("name", productName.trim());
      formData.append("category", category);
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
      if (productType !== 'accessory' && weight && weight.trim().length > 0) {
        formData.append("weight", weight.trim());
      }
      formData.append("description", description.trim());
      formData.append("visible", visible ? "true" : "false");
      if (!visible) {
        formData.append("status", "Hidden");
      } else {
        formData.append("status", "Active");
      }

      const newImages = imagesForUpdate.filter(img => img.file);
      const existingImages = imagesForUpdate.filter(img => img.id && !img.file && img.id !== null && img.id !== undefined);
      const currentCover = coverRef.current || cover;
      const hasNewPhotos = newImages.length > 0 || currentCover?.file;
      
      console.log("📸 Photo data (will be sent separately via PUT /products/{id}/photo):", {
        totalImages: imagesForUpdate.length,
        newImagesCount: newImages.length,
        existingImagesCount: existingImages.length,
        existingImageIds: existingImages.map(img => img.id),
        hasCoverFile: !!currentCover?.file,
        hasCoverId: !!(currentCover?.id && currentCover.id !== null && currentCover.id !== undefined),
        hasNewPhotos: hasNewPhotos
      });
      
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

      let response;
      const maxRetries = 2;
      let lastError = null;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`🔄 Retrying request (attempt ${attempt + 1}/${maxRetries + 1})...`);
            showNotification(`Retrying request (${attempt + 1}/${maxRetries + 1})...`, "info");
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
          
          response = await apiWithAuth.patch(`/products/product/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, 
          });
  
          break;
        } catch (patchError) {
          lastError = patchError;
          
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
            console.warn(`Request failed with ${patchError.response?.status || patchError.code || patchError.message}, retrying...`);
            continue; 
          }
          
          if (patchError.response?.status === 400 || patchError.response?.status === 403 || patchError.response?.status === 405) {
            console.log("⚠️ PATCH failed with", patchError.response?.status, ", trying PUT...");
            try {
              response = await apiWithAuth.put(`/products/product/${id}`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
              });
              break; 
            } catch (putError) {
              if (putError.response?.status === 400) {
                console.error("PUT also failed - Error details:", {
                  status: putError.response?.status,
                  data: putError.response?.data,
                  message: putError.response?.data?.detail || putError.response?.data?.message || putError.response?.data?.error,
                });
                console.error("Full error response:", JSON.stringify(putError.response?.data, null, 2));
              }
              throw putError;
            }
          } else {
            throw patchError;
          }
        }
      }
      
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

      if (hasNewPhotos && productType === 'product') {
        console.log("📤 Uploading photos via PUT /products/{id}/photo...");
        try {
          const photoFormData = new FormData();
          
          newImages.forEach(img => {
            if (img.file) {
              photoFormData.append("images", img.file);
              console.log("📤 Adding image file:", img.file.name);
            }
          });
          
          if (currentCover?.file) {
            photoFormData.append("cover", currentCover.file);
            console.log("📤 Adding cover file:", currentCover.file.name);
          }
          
          if (existingImages.length > 0) {
            existingImages.forEach(img => {
              if (img.id) {
                photoFormData.append("photo_ids", img.id.toString());
              }
            });
            console.log("📤 Sending existing photo IDs:", existingImages.map(img => img.id));
          }
          
          const photoResponse = await apiWithAuth.put(`/products/${id}/photo`, photoFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000,
          });
          
          console.log("✅ Photos uploaded successfully via PUT /products/{id}/photo:", photoResponse.data);
          console.log("📸 Photo response photos_url:", photoResponse.data?.photos_url);
          console.log("📸 Photo response product_photos:", photoResponse.data?.product_photos);

          if (photoResponse.data?.photos_url || photoResponse.data?.product_photos) {
            response.data = {
              ...response.data,
              photos_url: photoResponse.data.photos_url || response.data.photos_url || [],
              product_photos: photoResponse.data.product_photos || response.data.product_photos || []
            };
            console.log("✅ Updated response.data with photos from PUT /products/{id}/photo");
            console.log("📸 Updated photos_url:", response.data.photos_url);
            console.log("📸 Updated product_photos:", response.data.product_photos);
            
            const hasPhotosInResponse = 
              (response.data.photos_url && Array.isArray(response.data.photos_url) && response.data.photos_url.length > 0) ||
              (response.data.product_photos && Array.isArray(response.data.product_photos) && response.data.product_photos.length > 0);
            
            if (hasPhotosInResponse) {
              console.log("🔄 Photos found in response, reloading page in 3 seconds to update products table...");
              showNotification("Photos uploaded successfully! Reloading page...", "success");
              setTimeout(() => {
                console.log("🔄 Reloading page now...");
                window.location.reload();
              }, 3000);
            } else {
              // Если фото нет в ответе, даем больше времени бэкенду обработать фото
              console.log("⚠️ No photos in response yet, waiting 5 seconds for backend to process...");
              showNotification("Photos uploaded, waiting for processing...", "info");
              setTimeout(() => {
                window.location.reload();
              }, 5000);
            }
            setLoading(false);
            return; // Выходим, не продолжаем обработку
          } else {
            console.warn("⚠️ PUT /products/{id}/photo returned success but no photos in response");
            console.warn("⚠️ Photo response data:", photoResponse.data);
            // Если фото нет в ответе, перезагружаем страницу через 3 секунды, чтобы дать время бэкенду обработать фото
            console.log("🔄 Will reload page in 3 seconds to get updated product data...");
            showNotification("Photos uploaded, reloading page to see changes...", "info");
            setTimeout(() => {
              window.location.reload();
            }, 3000);
            setLoading(false);
            return; // Выходим, не продолжаем обработку
          }
        } catch (photoError) {
          console.error("❌ Error uploading photos via PUT /products/{id}/photo:", photoError);
          console.error("❌ Photo upload error details:", {
            status: photoError.response?.status,
            data: photoError.response?.data,
            message: photoError.message
          });
          // Не выбрасываем ошибку - продукт уже обновлен, фото можно загрузить позже
          showNotification("Product updated, but photo upload failed. You can try uploading photos again.", "warning");
        }
      }
      
      // Сохраняем новые фото (которые были загружены, но еще не имеют id) перед обновлением
      // ВАЖНО: Объявляем эти переменные ДО их использования
      const newImagesWithFiles = imagesForUpdate.filter(img => img && img.file);
      // Используем coverRef.current для проверки, был ли загружен новый cover (так как cover state может потерять file)
      const hadNewCover = coverRef.current?.file || cover?.file; // Проверяем, был ли загружен новый cover
      const newCoverFile = (coverRef.current?.file ? coverRef.current : null) || (cover?.file ? cover : null); // Сохраняем ссылку на новый cover
      const hadNewImages = newImagesWithFiles.length > 0; // Проверяем, были ли отправлены новые фото
      
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
        } else if (updatedProduct.product_photos && Array.isArray(updatedProduct.product_photos) && updatedProduct.product_photos.length > 0) {
          // Обрабатываем product_photos для продуктов
          imageUrls = updatedProduct.product_photos.map(photo => {
            let photoUrl = null;
            // product_photos может содержать объект с полем photo (строка или объект)
            if (photo.photo) {
              if (typeof photo.photo === 'string') {
                photoUrl = photo.photo;
              } else if (photo.photo.url) {
                photoUrl = photo.photo.url;
              } else if (photo.photo.photo_url) {
                photoUrl = photo.photo.photo_url;
              }
            } else {
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
          console.log("✅ Found product_photos:", imageUrls);
        }
        
        // Если фото нет в ответе, но были отправлены новые фото, перезагружаем страницу
        console.log("🔍 Checking if reload is needed:", {
          imageUrlsLength: imageUrls?.length || 0,
          newImagesWithFilesLength: newImagesWithFiles.length,
          hadNewCover: !!hadNewCover,
          shouldReload: (!imageUrls || imageUrls.length === 0) && (newImagesWithFiles.length > 0 || hadNewCover)
        });
        
        if ((!imageUrls || imageUrls.length === 0) && (newImagesWithFiles.length > 0 || hadNewCover)) {
          console.warn("⚠️ New photos were sent but no photos found in API response! Reloading page to get fresh data...");
          console.warn("⚠️ Details:", {
            imageUrls: imageUrls,
            imageUrlsLength: imageUrls?.length || 0,
            newImagesWithFiles: newImagesWithFiles.length,
            hadNewCover: hadNewCover,
            responseData: response.data
          });
          showNotification("Product updated, reloading to get photos...", "info");
          setLoading(false);
          // Увеличиваем время ожидания, чтобы дать бэкенду время обработать фото
          setTimeout(() => {
            console.log("🔄 Reloading page now...");
            window.location.reload();
          }, 3000); // Увеличено с 1500 до 3000 мс
          return;
        }
        
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
          
          // Если мы отправляли новые фото (cover или images), но их нет в ответе API, перезагружаем страницу
          // Проверяем: если были отправлены новые фото, но в ответе нет новых фото, значит API еще не обработал загрузку
          console.log("🔍 Checking if reload is needed:", {
            hadNewCover: !!hadNewCover,
            hadNewImages: hadNewImages,
            newImagesCount: newImagesWithFiles.length,
            newPhotosFromAPICount: newPhotosFromAPI.length,
            willReload: (hadNewCover || hadNewImages) && newPhotosFromAPICount === 0
          });
          
          if (hadNewCover || hadNewImages) {
            if (newPhotosFromAPI.length === 0) {
              const photoType = hadNewCover ? "cover" : "images";
              console.warn(`⚠️ New ${photoType} was sent but no new photos found in API response! Reloading page to get fresh data...`);
              console.warn("⚠️ Reload will happen in 1.5 seconds...");
              showNotification("Product updated, reloading to get photos...", "info");
              setLoading(false);
              setTimeout(() => {
                console.log("🔄 Reloading page now...");
                window.location.reload();
              }, 1500);
              return; // Выходим, не обновляем состояние
            } else {
              console.log(`✅ New photos found in API response: ${newPhotosFromAPI.length} photo(s)`);
            }
          } else {
            console.log("ℹ️ No new photos were sent, skipping reload check");
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
          fetchingRef.current = false;
          fetchedIdRef.current = null;
          fetchProduct();
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
            fetchingRef.current = false;
            fetchedIdRef.current = null;
            fetchProduct();
          }
        }
      } else {
        showNotification("The product has been updated successfully!", "success");
        fetchingRef.current = false;
        fetchedIdRef.current = null;
        fetchProduct();
      }
    } catch (error) {
      console.error("❌ Error when updating the product:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      // Обработка ошибки 401 (Unauthorized) - токен истек
      // Axios interceptor должен автоматически попытаться обновить токен через refresh token
      // Если refresh token валиден, токены обновятся автоматически и запрос повторится
      // Если и refresh token истек, interceptor отправит событие 'tokenExpired'
      if (error.response?.status === 401) {
        const errorDetail = error.response?.data?.detail || error.response?.data?.message || '';
        // Проверяем, не пытался ли interceptor обновить токен (если _retry установлен, значит попытка была)
        const wasRetryAttempted = error.config?._retry === true;
        
        if (errorDetail.includes('Token is expired') || errorDetail.includes('token_not_valid')) {
          // Если это была попытка обновления токена (refresh token тоже истек)
          if (wasRetryAttempted) {
            showNotification("Your session has expired. Please log in again to continue.", "warning");
            setLoading(false);
            return;
          }
          // Если это первая попытка, interceptor должен попытаться обновить токен автоматически
          // Не показываем ошибку, так как токены должны обновиться автоматически
          // Если обновление не удалось, interceptor отправит событие tokenExpired
          setLoading(false);
          return;
        }
      }
      
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

 