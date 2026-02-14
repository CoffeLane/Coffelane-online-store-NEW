import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  Snackbar,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import UploadImages from "../AdminComponents/UploadImages.jsx";
import ProductForm from "../AdminComponents/ProductForm.jsx";
import ProductSettings from "../AdminComponents/ProductSettings.jsx";
import RelatedItems from "../AdminComponents/RelatedItems.jsx";
import BottomButtons from "../AdminComponents/BottomButtons.jsx";
import api, { apiWithAuth } from "../../store/api/axios.js";
import { buildImageUrl } from "../../components/utils/helpers.js";

const ALL_BRANDS = [
  "Lavazza",
  "Blasercafe",
  "Nescafé",
  "Jacobs",
  "L'OR",
  "Starbucks",
  "Nespresso",
];

const extractPhotoUrl = (photo) => {
  if (!photo) return null;
  if (typeof photo === "string") return photo;
  if (typeof photo === "object") {
    return (
      photo?.url || photo?.photo || photo?.photo_url || photo?.image_url || null
    );
  }
  return null;
};

const processPhotoArray = (photos) => {
  if (!photos || !Array.isArray(photos) || photos.length === 0) return [];

  return photos
    .map((photo) => {
      let photoUrl = null;

      if (photo.photo) {
        if (typeof photo.photo === "string") {
          photoUrl = photo.photo;
        } else if (photo.photo.url) {
          photoUrl = photo.photo.url;
        } else if (photo.photo.photo_url) {
          photoUrl = photo.photo.photo_url;
        }
      } else {
        photoUrl = extractPhotoUrl(photo);
      }

      photoUrl = buildImageUrl(photoUrl);

      return {
        id: photo.id || photo.photo_id || null,
        url: photoUrl,
      };
    })
    .filter((img) => img.url !== null);
};

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProductType = searchParams.get("type");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(null);
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productType, setProductType] = useState("product");
  const [isSpecial, setIsSpecial] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [cover, setCover] = useState(null);
  const coverRef = useRef(null);
  const fetchingRef = useRef(false);
  const fetchedIdRef = useRef(null);
  const initialPhotoIdsRef = useRef([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [caffeineType, setCaffeineType] = useState("Caffeine");
  const [servingType, setServingType] = useState("Ground");

  // Функция для получения похожих товаров по бренду
  const fetchRelatedProducts = async (currentBrand) => {
    if (!currentBrand || currentBrand === "Category") {
      setRelatedProducts([]);
      return;
    }

    try {
      const response = await api.get("/products", {
        params: { brand: currentBrand, size: 10 },
      });

      // Смотрим в консоль: что именно пришло в массиве?
      console.log("API Response for Related:", response.data.data);

      const rawProducts = response.data.data || [];

      const processed = rawProducts
        .filter((p) => String(p.id) !== String(id)) // Убираем текущий товар
        .map((p) => ({
          ...p,
          // Вытаскиваем цену из supplies специально для отображения
          displayPrice: p.supplies?.[0]?.price || p.price || "0",
        }));

      setRelatedProducts(processed.slice(0, 4));
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  useEffect(() => {
    // Вызываем поиск похожих товаров, когда категория (бренд) загружена
    if (category && category !== "Category") {
      fetchRelatedProducts(category);
    } else {
      setRelatedProducts([]);
    }
  }, [category, id]);

  useEffect(() => {
    if (coverRef.current?.file && !cover?.file) {
      return;
    }
    coverRef.current = cover;
  }, [cover]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const firstPageRes = await api.get("/products", {
          params: { page: 1, _admin: "true" },
          timeout: 5000,
        });
        const totalPages = firstPageRes.data.total_pages || 1;

        const allPagesPromises = [];
        for (let p = 1; p <= totalPages; p++) {
          allPagesPromises.push(
            api.get("/products", {
              params: { page: p, _admin: "true" },
              timeout: 5000,
            }),
          );
        }

        const allPagesRes = await Promise.all(allPagesPromises);
        const allProducts = allPagesRes.flatMap((res) => res.data.data || []);

        const accessoriesRes = await api.get("/accessories", {
          params: { _admin: "true" },
          timeout: 5000,
        });
        const allAccessories = accessoriesRes.data.data || [];

        const productCategories = new Set();
        allProducts.forEach((p) => {
          const cat = p.brand || p.category;
          if (cat && cat.trim()) {
            productCategories.add(cat.trim());
          }
        });
        allAccessories.forEach((a) => {
          const cat = a.brand || a.category;
          if (cat && cat.trim()) {
            productCategories.add(cat.trim());
          }
        });

        const allCategories = [
          "Category",
          ...ALL_BRANDS,
          ...Array.from(productCategories),
        ];
        setAvailableCategories(Array.from(new Set(allCategories)));
      } catch (error) {
        const allCategories = ["Category", ...ALL_BRANDS];
        setAvailableCategories(allCategories);
      }
    };

    fetchCategories();
  }, []);

  const isProductReady = useMemo(() => {
    const nameValid = productName && String(productName).trim().length > 0;
    const categoryValid =
      category && category !== "custom" && String(category).trim().length > 0;
    const priceStr = price ? String(price).trim() : "";
    const priceValid =
      priceStr.length > 0 && !isNaN(Number(priceStr)) && Number(priceStr) > 0;
    const weightStr = weight ? String(weight).trim() : "";
    const weightValid =
      productType === "accessory" ? true : weightStr.length > 0;

    const hasCover =
      cover &&
      ((typeof cover === "object" && (cover.url || cover.file)) ||
        (typeof cover === "string" && cover.length > 0));

    const hasImages =
      Array.isArray(images) &&
      images.length > 0 &&
      images.some((img) => {
        if (!img) return false;
        if (typeof img === "string") return img.length > 0;
        if (typeof img === "object") {
          return !!(img.url || img.file);
        }
        return false;
      });

    const hasPhoto = hasCover || hasImages;

    const result =
      nameValid && categoryValid && priceValid && weightValid && hasPhoto;

    return result;
  }, [productName, category, price, weight, productType, cover, images]);

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

      let loadedSuccessfully = false;

      if (urlProductType === "accessory") {
        try {
          response = await apiWithAuth.get(`/accessories/${id}`);
          setProductType("accessory");
          loadedSuccessfully = true;
        } catch (eAccessory) {
          throw eAccessory;
        }
      } else if (urlProductType === "product") {
        try {
          response = await apiWithAuth.get(`/products/${id}`);
          setProductType("product");
          loadedSuccessfully = true;
        } catch (e1) {
          if (e1.response?.status === 404 || e1.response?.status === 403) {
            try {
              response = await apiWithAuth.get(`/products/product/${id}`);
              setProductType("product");
              loadedSuccessfully = true;
            } catch (e2) {
              try {
                response = await api.get(`/products/${id}`);
                setProductType("product");
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
          setProductType("accessory");
          loadedSuccessfully = true;
        } catch (eAccessory) {
          if (eAccessory.response?.status === 404) {
            try {
              response = await apiWithAuth.get(`/products/${id}`);
              setProductType("product");
              loadedSuccessfully = true;
            } catch (e1) {
              if (e1.response?.status === 404 || e1.response?.status === 403) {
                try {
                  response = await apiWithAuth.get(`/products/product/${id}`);
                  setProductType("product");
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
              setProductType("product");
              loadedSuccessfully = true;
            } catch (e1) {
              if (e1.response?.status === 404 || e1.response?.status === 403) {
                try {
                  response = await apiWithAuth.get(`/products/product/${id}`);
                  setProductType("product");
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
      if (
        product.supplies &&
        Array.isArray(product.supplies) &&
        product.supplies.length > 0
      ) {
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
      } else if (
        product.supplies &&
        Array.isArray(product.supplies) &&
        product.supplies.length > 0
      ) {
        const supplyWeight = product.supplies[0].weight;
        if (supplyWeight !== undefined && supplyWeight !== null) {
          productWeight = supplyWeight.toString();
        }
      }

      setProductName(product.name || "");
      const finalCategory = productCategory || "";
      setCategory(finalCategory);
      let productStock = null;
      if (product.stock !== undefined && product.stock !== null) {
        productStock = product.stock;
      } else if (
        product.supplies &&
        Array.isArray(product.supplies) &&
        product.supplies.length > 0
      ) {
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
      if (product.status === "Hidden" || product.status === "hidden") {
        productVisible = false;
      } else if (product.visible !== undefined && product.visible !== null) {
        productVisible = product.visible === true || product.visible === "true";
      } else if (
        product.status &&
        product.status !== "Active" &&
        product.status !== "active"
      ) {
        productVisible = false;
      }
      setVisible(productVisible);

      setIsSpecial(
        product.is_special === true ||
          product.is_special === "true" ||
          product.isSpecial === true,
      );

      let imageUrls = [];

      if (
        product.product_photos &&
        Array.isArray(product.product_photos) &&
        product.product_photos.length > 0
      ) {
        imageUrls = processPhotoArray(product.product_photos);
      } else if (
        product.photos_url &&
        Array.isArray(product.photos_url) &&
        product.photos_url.length > 0
      ) {
        imageUrls = processPhotoArray(product.photos_url);
      } else if (
        product.accessory_photos &&
        Array.isArray(product.accessory_photos) &&
        product.accessory_photos.length > 0
      ) {
        imageUrls = processPhotoArray(product.accessory_photos);
      } else if (product.images && Array.isArray(product.images)) {
        imageUrls = product.images
          .map((img, idx) => {
            const photoUrl = buildImageUrl(extractPhotoUrl(img));
            return {
              id: img?.id || idx,
              url: photoUrl,
            };
          })
          .filter((img) => img.url !== null);
      }

      setImages(imageUrls);
      initialPhotoIdsRef.current = imageUrls
        .filter((img) => img.id)
        .map((img) => img.id);

      if (imageUrls.length === 0) {
      }
      const firstImage = imageUrls[0] || null;
      setCover(firstImage);
      coverRef.current = firstImage;
    } catch (error) {
      fetchedIdRef.current = null;

      const isAuthError =
        error.response?.status === 401 || error.response?.status === 403;
      const isRefreshError =
        error.message?.includes("No refresh token") ||
        error.response?.data?.detail?.includes("token") ||
        error.response?.data?.code === "token_not_valid";
      const isNotFound =
        error.response?.status === 404 ||
        error.response?.data?.detail?.includes("No Product matches") ||
        error.response?.data?.detail?.includes("not found");

      let errorMessage;
      if (isAuthError || isRefreshError) {
        errorMessage = "Your session has expired. Please log in again.";
      } else if (isNotFound) {
        errorMessage = `Product with ID ${id} not found. It may have been deleted or you don't have permission to view it.`;
      } else {
        errorMessage =
          error.response?.data?.detail ||
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

  const handleDeletePhoto = async (photoId) => {
    if (typeof photoId === "object" && photoId !== null && !photoId.id) {
      setImages((prev) => {
        const filtered = prev.filter((img) => img !== photoId);
        if (cover === photoId) {
          setCover(filtered[0] || null);
        }
        return filtered;
      });
      showNotification("Photo removed from preview!", "success");
      return;
    }

    let deleted = false;
    try {
      if (productType === "accessory") {
        // DELETE /accessories/{id}/remove_photo
        try {
          await apiWithAuth.delete(`/accessories/${id}/remove_photo`, {
            data: { photo_id: photoId },
          });
          deleted = true;
        } catch (error) {
          const errorDetail =
            error.response?.data?.detail || error.response?.data?.message || "";
          if (
            errorDetail.includes("No AccessoryPhotosModel matches") ||
            errorDetail.includes("not found") ||
            errorDetail.includes("does not exist") ||
            (error.response?.status === 404 && errorDetail.includes("No"))
          ) {
            deleted = true;
          } else if (error.response?.status === 404) {
            deleted = true;
          } else {
            throw error;
          }
        }

        if (!deleted) {
          showNotification(
            "Photo removed from preview. Click 'Publish' to save changes and remove it from the server.",
            "info",
          );
        }
      } else {
        const endpoints = [`/products/photo/${photoId}/deletion`];

        for (const endpoint of endpoints) {
          try {
            await apiWithAuth.delete(endpoint);
            deleted = true;
            break;
          } catch (error) {
            const errorDetail =
              error.response?.data?.detail ||
              error.response?.data?.message ||
              "";
            if (
              errorDetail.includes("not found") ||
              errorDetail.includes("does not exist") ||
              (errorDetail.includes("No") && errorDetail.includes("matches"))
            ) {
              deleted = true;
              break;
            }
          }
        }

        if (!deleted) {
          showNotification(
            "Photo removed from preview. Note: API endpoint for photo deletion may not be available.",
            "info",
          );
        }
      }

      setImages((prev) => {
        const filtered = prev.filter((img) => {
          if (typeof photoId === "object" && photoId !== null) {
            return img !== photoId;
          }
          return img.id !== photoId;
        });
        const isCoverBeingDeleted =
          typeof photoId === "object" && photoId !== null
            ? cover === photoId
            : cover?.id === photoId;

        if (isCoverBeingDeleted) {
          setCover(filtered[0] || null);
        }
        return filtered;
      });
      if (productType !== "accessory" || deleted) {
        showNotification("Photo deleted successfully!", "success");
      }
    } catch (error) {
      showNotification(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Error deleting photo. Please try again.",
        "error",
      );
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((file) => ({
        id: null,
        url: URL.createObjectURL(file),
        file,
      }));
      setImages((prev) => [...prev, ...newFiles]);
      if (!cover) setCover(newFiles[0]);
    }
  };
  const convertJfifToJpg = (file) => {
    if (file.name.toLowerCase().endsWith(".jfif")) {
      const newFileName = file.name.replace(/\.jfif$/i, ".jpg");
      return new File([file], newFileName, { type: "image/jpeg" });
    }
    return file;
  };

  const handleCoverUpload = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const originalFile = files[0];
      const file = convertJfifToJpg(originalFile);
      const newCover = {
        id: null,
        url: URL.createObjectURL(file),
        file,
      };

      const currentCover = coverRef.current;

      if (currentCover?.id) {
        setImages((prev) => prev.filter((img) => img.id !== currentCover.id));

        try {
          await handleDeletePhoto(currentCover.id);
        } catch (error) {
          // Error handled silently
        }
      }

      setCover(newCover);
      coverRef.current = newCover;

      setImages((prev) => {
        const filtered = prev.filter(
          (img) => !currentCover || img.id !== currentCover.id,
        );
        return [newCover, ...filtered];
      });

      e.target.value = "";

      showNotification(
        "Cover photo replaced. Click 'Publish' to update the product.",
        "info",
      );
    }
  };

  const handleUpdateProduct = async (imagesToUse = null) => {
  const imagesForUpdate = Array.isArray(imagesToUse)
    ? imagesToUse
    : Array.isArray(images)
      ? images
      : [];

  if (!isProductReady) {
    showNotification("Please fill in all required fields!", "warning");
    return;
  }

  setLoading(true);

  try {
    const productBrand = category || "General";
    const validatedPrice = parseFloat(price) || 0;
    const cleanWeight = String(weight).replace(/[^\d.]/g, "");
    const validatedWeight = parseFloat(cleanWeight) || 0;
    const validatedQuantity = parseInt(stock) || 0;

    // 1. Базовый payload (общие поля)
    let productPayload = {
      name: productName.trim(),
      brand: productBrand,
      description: description.trim(),
      is_special: !!isSpecial,
      sku: productName.trim().toUpperCase().replace(/\s+/g, '_') + '_' + id,
    };

    // 2. Логика распределения полей (Аксессуары vs Кофе)
    if (productType === "accessory") {
      productPayload.price = validatedPrice.toString();
      productPayload.quantity = validatedQuantity;
    } else {
      // Для кофе (продуктов) используем массив supplies и тип кофеина
      productPayload.supplies = [
        {
          serving_type: servingType || "Ground", 
          price: validatedPrice.toString(),
          quantity: validatedQuantity,
          weight: validatedWeight.toFixed(2),
        },
      ];
      
      productPayload.caffeine_type = caffeineType || "Caffeine"; 
      productPayload.status = visible ? "Active" : "Hidden";
      productPayload.flavor_profiles = []; 
    }
    const baseEndpoint =
      productType === "accessory"
        ? `/accessories/${id}/update`
        : `/products/product/${id}`;

    // 3. Отправка основного запроса (PATCH)
    await apiWithAuth.patch(baseEndpoint, productPayload, {
      headers: { "Content-Type": "application/json" },
    });

    // 4. Логика обновления фотографий
    const newImages = imagesForUpdate.filter((img) => img.file);
    const currentCover = coverRef.current || cover;
    
    if (newImages.length > 0 || currentCover?.file) {
      const photoFormData = new FormData();

      newImages.forEach((img) => {
        if (img.file) {
          photoFormData.append("images", convertJfifToJpg(img.file));
        }
      });

      if (currentCover?.file) {
        photoFormData.append("cover", convertJfifToJpg(currentCover.file));
      }

      const existingImages = imagesForUpdate.filter(
        (img) => img.id && !img.file,
      );
      existingImages.forEach((img) => {
        photoFormData.append("photo_ids", img.id.toString());
      });

      const photoEndpoint =
        productType === "accessory"
          ? `/accessories/${id}/photo`
          : `/products/${id}/photo`;

      await apiWithAuth.put(photoEndpoint, photoFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    showNotification("Successfully updated!", "success");
    imagesForUpdate.forEach((img) => {
      if (img.url && img.url.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
    });

    setTimeout(() => {
      navigate("/admin/products", { state: { refresh: true } });
    }, 1500);

  } catch (error) {
    console.error("Update error:", error);
    const errorData = error.response?.data;
    let errorMsg = errorData?.detail || errorData?.message || error.message || "Update failed";
    showNotification(`Error: ${errorMsg}`, "error");
  } finally {
    setLoading(false);
  }
};
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        mt: { xs: 2, md: 4 },
        mb: { xs: 2, md: 3 },
      }}
    >
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <AdminBreadcrumbs />
      </Box>

      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        flexWrap={{ xs: "wrap", md: "nowrap" }}
        sx={{ width: "100%", boxSizing: "border-box", m: 0 }}
      >
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, md: 3 },
            width: "100%",
            boxSizing: "border-box",
            p: 0,
          }}
        >
          <Card
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: "24px",
              width: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <UploadImages
                images={images}
                cover={cover}
                setCover={setCover}
                handleImageUpload={handleImageUpload}
                handleCoverUpload={handleCoverUpload}
                handleDeletePhoto={handleDeletePhoto}
              />
            </Box>
            <ProductForm
              productName={productName}
              setProductName={setProductName}
              category={category}
              setCategory={setCategory}
              stock={stock}
              setStock={setStock}
              availableCategories={availableCategories}
              price={price}
              setPrice={setPrice}
              weight={weight}
              setWeight={setWeight}
              description={description}
              setDescription={setDescription}
              productType={productType}
              caffeineType={caffeineType}
              setCaffeineType={setCaffeineType}
              servingType={servingType}
              setServingType={setServingType}
            />

            {productType === "product" && (
              <Box sx={{ mt: 2, px: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSpecial}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setIsSpecial(newValue);
                        if (newValue) {
                          const hasPhotos =
                            (images && images.length > 0) ||
                            (cover && (cover.file || cover.id));

                          if (!hasPhotos) {
                            showNotification(
                              "⚠️ Warning: This product has no photos. Special products should have photos to display correctly on the homepage banner.",
                              "warning",
                            );
                          }
                        }
                      }}
                      sx={{
                        color: "#3E3027",
                        "&.Mui-checked": {
                          color: "#A4795B",
                        },
                      }}
                    />
                  }
                  label="Special Product (Weekly Special)"
                  sx={{ fontSize: "14px", mb: 2 }}
                />
                {isSpecial && images.length === 0 && !cover && (
                  <Typography
                    sx={{ fontSize: "12px", color: "#FF9800", mt: -1, mb: 2 }}
                  >
                    ⚠️ This product has no photos. It may not display correctly
                    on the homepage banner.
                  </Typography>
                )}
              </Box>
            )}
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, md: 3 },
            width: "100%",
            boxSizing: "border-box",
            p: 0,
          }}
        >
          <ProductSettings
            visible={visible}
            setVisible={setVisible}
            stock={stock}
          />
          <RelatedItems items={relatedProducts} />
          <BottomButtons
            isProductReady={isProductReady}
            onSave={handleUpdateProduct}
            loading={loading}
            onPreview={() => {
              const path =
                productType === "accessory"
                  ? `/accessories/product/${id}`
                  : `/coffee/product/${id}`;
              navigate(path, { state: { preview: true } });
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
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
