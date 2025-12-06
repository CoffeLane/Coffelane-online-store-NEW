import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Card } from "@mui/material";
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

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(null);
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(false);

  const [images, setImages] = useState([]);
  const [cover, setCover] = useState(null);
  const fetchingRef = useRef(false);
  const fetchedIdRef = useRef(null);

  const isProductReady = productName && category && price && weight;

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
        const token = localStorage.getItem("access");
        const refreshToken = localStorage.getItem("refresh");
        let response;
        
        if (token) {
          try {
            const apiAuth = apiWithAuth(token);
            try {
              response = await apiAuth.get(`/products/product/${id}`);
              // console.log(`✅ Product loaded via /products/product/${id}`);
            } catch (e1) {
              if (e1.response?.status !== 401) {
                // console.log(`⚠️ Admin endpoint failed (${e1.response?.status}), trying /products/${id}`);
                response = await apiAuth.get(`/products/${id}`);
                // console.log(`✅ Product loaded via /products/${id}`);
              } else {
                throw e1;
              }
            }
          } catch (authError) {
            if (authError.response?.status === 401 && refreshToken) {
              try {
                // console.log("🔄 Token expired, trying to refresh...");
                const refreshResponse = await api.post("/auth/refresh", {
                  refresh: refreshToken
                });
                
                const newToken = refreshResponse.data?.access || refreshResponse.data?.access_token;
                if (newToken) {
                  localStorage.setItem("access", newToken);
                  const apiAuth = apiWithAuth(newToken);
                  try {
                    response = await apiAuth.get(`/products/product/${id}`);
                    // console.log(`✅ Product loaded after token refresh via /products/product/${id}`);
                  } catch (e1) {
                    if (e1.response?.status !== 401) {
                      response = await apiAuth.get(`/products/${id}`);
                      // console.log(`✅ Product loaded after token refresh via /products/${id}`);
                    } else {
                      throw e1;
                    }
                  }
                } else {
                  throw new Error("No access token in refresh response");
                }
              } catch (refreshError) {
                if (refreshError.response?.status === 401) {
                  // console.warn("⚠️ Refresh token expired, clearing tokens");
                  localStorage.removeItem("access");
                  localStorage.removeItem("refresh");
                }
                throw new Error("Authentication required. Please log in again.");
              }
            } else {
              // console.warn("⚠️ Auth failed, trying without auth as fallback");
              try {
                response = await api.get(`/products/${id}`);
                // console.log(`✅ Product loaded without auth via /products/${id}`);
              } catch (e) {
                throw new Error("Product not found or requires authentication");
              }
            }
          }
        } else {
          // console.log("⚠️ No token, trying without auth");
          try {
            response = await api.get(`/products/${id}`);
            // console.log(`✅ Product loaded without auth via /products/${id}`);
          } catch (e) {
            throw new Error("Product not found or requires authentication");
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
          // console.log("💰 Price from supplies[0]:", supplyPrice, "→ Final price:", productPrice);
        } else {
          if (product.price !== undefined && product.price !== null) {
            productPrice = product.price.toString();
          }
        }

        let productCategory = product.category || product.brand || "";
        // console.log("🏷️ Category/Brand:", productCategory);

        let productWeight = product.weight || product.supplies?.[0]?.weight || "";
        // console.log("⚖️ Weight:", productWeight, "from:", product.weight ? "product.weight" : product.supplies?.[0]?.weight ? "supplies[0].weight" : "none");

        setProductName(product.name || "");
        setCategory(productCategory);
        setStock(product.stock !== undefined ? product.stock : null);
        setPrice(productPrice);
        setWeight(productWeight);
        setDescription(product.description || "");
        setVisible(product.visible ?? false);

        // console.log("✅ Set values:", {
        //   name: product.name || "",
        //   category: productCategory,
        //   price: productPrice,
        //   weight: productWeight,
        //   stock: product.stock !== undefined ? product.stock : null
        // });

        let imageUrls = [];
        if (product.photos_url && Array.isArray(product.photos_url)) {
          imageUrls = product.photos_url.map(photo => ({
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
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           error.message ||
                           "Product not found or you don't have permission to view it.";
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
      const token = localStorage.getItem("access");
      if (!token) {
        // console.error("No token found");
        return;
      }
      const apiAuth = apiWithAuth(token);
      await apiAuth.delete(`/products/photo/${photoId}/deletion`);
      setImages(prev => prev.filter(img => img.id !== photoId));
      if (cover?.id === photoId) setCover(images[0] || null);
      // console.log("✅ Photo deleted:", photoId);
    } catch (error) {
      // console.error("❌ Error when deleting photo:", error.response?.data || error.message);
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
    if (!isProductReady) return;

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        alert("You must be logged in to update products!");
        return;
      }

      const apiAuth = apiWithAuth(token);
      const formData = new FormData();
      
      formData.append("name", productName.trim());
      formData.append("category", category);
      
      if (stock !== null && stock !== undefined) {
        formData.append("stock", stock);
      }
      
      const priceNum = Number(price);
      formData.append("price", priceNum.toString());
      formData.append("weight", weight.trim());
      formData.append("description", description.trim());
      formData.append("visible", visible ? "true" : "false");

      images.forEach(img => {
        if (img.file) formData.append("images", img.file);
      });

      if (cover?.file) {
        formData.append("cover", cover.file);
      } else if (cover?.id) {
        formData.append("coverId", cover.id);
      }

      const response = await apiAuth.put(`/products/product/${id}`, formData);

      // console.log("✅ Product updated successfully:", response.data);
      alert("The product has been updated successfully!");
    } catch (error) {
      // console.error("❌ Error when updating the product:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          "Error when updating the product. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 4, mb: 3 }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <AdminBreadcrumbs />
      </Box>

      <Grid flexWrap="nowrap" container spacing={3}>
        <Grid sx={{ display: "flex", flexDirection: "column", gap: 3, width: "60%" }}>
          <Card sx={{ p: 3, borderRadius: "24px" }}>
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
            />
          </Card>
        </Grid>

        <Grid sx={{ display: "flex", flexDirection: "column", gap: 3, width: "40%" }}>
          <ProductSettings visible={visible} setVisible={setVisible} stock={stock} />
          <RelatedItems onAddItems={() => alert("ADD")} />
          <BottomButtons isProductReady={isProductReady} onSave={handleUpdateProduct} />
        </Grid>
      </Grid>
    </Box>
  );
}

 