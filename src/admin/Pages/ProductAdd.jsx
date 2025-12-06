import React, { useState, useEffect, useRef } from "react";
import { Box, Grid, Card, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import UploadImages from "../AdminComponents/UploadImages.jsx";
import ProductForm from "../AdminComponents/ProductForm.jsx";
import ProductSettings from "../AdminComponents/ProductSettings.jsx";
import RelatedItems from "../AdminComponents/RelatedItems.jsx";
import BottomButtons from "../AdminComponents/BottomButtons.jsx";
import { apiWithAuth } from "../../store/api/axios.js"; 

export default function ProductsAdd() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(null); 
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(null); 
  const [images, setImages] = useState([]);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const imageUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      imageUrlsRef.current.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      imageUrlsRef.current = [];
    };
  }, []);

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const newUrls = fileArray.map(file => URL.createObjectURL(file));
      imageUrlsRef.current.push(...newUrls);
      setImages((prev) => [...prev, ...fileArray]);
      if (!cover) setCover(fileArray[0]);
    }
  };

  const isProductReady = productName && category && price && weight;

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
      const token = localStorage.getItem("access");
      if (!token) {
        setError("You must be logged in to add products!");
        setLoading(false);
        return;
      }

      const apiAuth = apiWithAuth(token);
      const formData = new FormData();
      
      formData.append("name", productName.trim());
      formData.append("category", category);
      
      if (stock !== null && stock !== undefined) {
        formData.append("stock", stock);
      }
      
      formData.append("price", priceNum.toString());
      formData.append("weight", weight.trim());
      formData.append("description", description.trim());
      
      formData.append("visible", visible === true ? "true" : "false");

      images.forEach((file) => formData.append("images", file));
      if (cover) formData.append("cover", cover);

      const response = await apiAuth.post("/products/product", formData);

      // console.log("✅ Product added successfully:", response.data);
      
      imageUrlsRef.current.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      imageUrlsRef.current = [];

      setProductName("");
      setCategory("");
      setStock(null);
      setPrice("");
      setWeight("");
      setDescription("");
      setVisible(null);
      setImages([]);
      setCover(null);
      setError("");

      navigate("/admin/products");
      
    } catch (err) {
      // console.error("❌ Error when adding a product:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.response?.data?.error ||
                          "Error when adding product. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
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
              images={images.map((file, index) => {
                const url = imageUrlsRef.current[index] || URL.createObjectURL(file);
                if (!imageUrlsRef.current[index]) {
                  imageUrlsRef.current[index] = url;
                }
                return url;
              })} 
              cover={cover ? (imageUrlsRef.current[images.indexOf(cover)] || URL.createObjectURL(cover)) : null} 
              setCover={setCover} 
              handleImageUpload={handleImageUpload} 
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
          {error && (
            <Box sx={{ p: 2, backgroundColor: "#ffebee", borderRadius: 2, color: "#c62828", fontSize: "14px" }}>
              {error}
            </Box>
          )}
          <BottomButtons 
            isProductReady={isProductReady && !loading} 
            onSave={handleSaveProduct}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

