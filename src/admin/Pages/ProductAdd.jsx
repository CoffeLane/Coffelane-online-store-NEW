import React, { useState } from "react";
import { Box, Grid, Card } from "@mui/material";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import UploadImages from "../AdminComponents/UploadImages.jsx";
import ProductForm from "../AdminComponents/ProductForm.jsx";
import ProductSettings from "../AdminComponents/ProductSettings.jsx";
import RelatedItems from "../AdminComponents/RelatedItems.jsx";
import BottomButtons from "../AdminComponents/BottomButtons.jsx";
import api from "../../store/api/axios.js"; 

export default function ProductsAdd() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(null); 
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(null); 
  const [images, setImages] = useState([]);
  const [cover, setCover] = useState(null);

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setImages((prev) => [...prev, ...fileArray]);
      if (!cover) setCover(fileArray[0]);
    }
  };

  const isProductReady = productName && category && price && weight;

  const handleSaveProduct = async () => {
    if (!isProductReady) {
      alert("Fill in all required fields!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("category", category);
      formData.append("stock", stock);
      formData.append("price", price);
      formData.append("weight", weight);
      formData.append("description", description);
      formData.append("visible", visible);

      images.forEach((file) => formData.append("images", file));
      if (cover) formData.append("cover", cover);

      const response = await api.post("/products/product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Продукт добавлен:", response.data); 
      alert("The product has been successfully added!");

      setProductName("");
      setCategory("");
      setStock(null);
      setPrice("");
      setWeight("");
      setDescription("");
      setVisible(null);
      setImages([]);
      setCover(null);

    } catch (error) {
      console.error("Error when adding a product:", error.response || error);
      alert("Error when adding product. Please try again.");
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
              images={images.map(file => URL.createObjectURL(file))} 
              cover={cover ? URL.createObjectURL(cover) : null} 
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
          <BottomButtons isProductReady={isProductReady} onSave={handleSaveProduct} />
        </Grid>
      </Grid>
    </Box>
  );
}


