import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Card } from "@mui/material";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import UploadImages from "../AdminComponents/UploadImages.jsx";
import ProductForm from "../AdminComponents/ProductForm.jsx";
import ProductSettings from "../AdminComponents/ProductSettings.jsx";
import RelatedItems from "../AdminComponents/RelatedItems.jsx";
import BottomButtons from "../AdminComponents/BottomButtons.jsx";
import api from "../../store/api/axios.js";

export default function ProductEdit() {
  const { id } = useParams();

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(null);
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(false);

  const [images, setImages] = useState([]); // {id, url, file?}
  const [cover, setCover] = useState(null);

  const isProductReady = productName && category && price && weight;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data;

        setProductName(product.name || "");
        setCategory(product.category || "");
        setStock(product.stock || null);
        setPrice(product.price || "");
        setWeight(product.weight || "");
        setDescription(product.description || "");
        setVisible(product.visible ?? false);

        const imageUrls = product.photos_url?.map(photo => ({
          id: photo.id,
          url: photo.url,
        })) || [];

        setImages(imageUrls);
        setCover(imageUrls[0] || null);

        console.log("Продукт загружен:", product);
      } catch (error) {
        console.error("Error loading the product:", error.response || error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDeletePhoto = async (photoId) => {
    try {
      await api.delete(`/products/photo/${photoId}/deletion`);
      setImages(prev => prev.filter(img => img.id !== photoId));
      if (cover?.id === photoId) setCover(images[0] || null);
      console.log("Фото удалено:", photoId);
    } catch (error) {
      console.error("Error when deleting photo:", error.response || error);
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
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("category", category);
      formData.append("stock", stock);
      formData.append("price", price);
      formData.append("weight", weight);
      formData.append("description", description);
      formData.append("visible", visible);

      images.forEach(img => {
        if (img.file) formData.append("images", img.file);
      });

      if (cover?.file) {
        formData.append("cover", cover.file);
      } else if (cover?.id) {
        formData.append("coverId", cover.id);
      }

      const response = await api.put(`/products/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Продукт обновлен:", response.data);
      alert("The product has been updated successfully!");
    } catch (error) {
      console.error("Error when updating the product:", error.response || error);
      alert("Error when updating the product. See the console.");
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





 
 