import React, { useState, useMemo } from "react";
import { Box, Grid, Card, FormControl, Select, MenuItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import UploadImages from "../AdminComponents/UploadImages.jsx";
import ProductForm from "../AdminComponents/ProductForm.jsx";
import ProductSettings from "../AdminComponents/ProductSettings.jsx";
import RelatedItems from "../AdminComponents/RelatedItems.jsx";
import BottomButtons from "../AdminComponents/BottomButtons.jsx";
import { apiWithAuth } from "../../store/api/axios.js";
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
      const formData = new FormData();
      
      formData.append("name", productName.trim());
      formData.append("category", category);
      
      if (stock !== null && stock !== undefined) {
        formData.append("stock", stock.toString());
      }
      
      formData.append("price", priceNum.toString());
      
      // Для аксессуаров вес не отправляем
      if (productType !== 'accessory' && weight && weight.trim().length > 0) {
        formData.append("weight", weight.trim());
      }
      
      formData.append("description", description.trim());
      // Если visible === null, отправляем false (по умолчанию скрыто)
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

      // Отладочная информация
      console.log("📤 Creating product/accessory:", {
        productType,
        totalImages: images.length,
        hasCover: !!cover?.file,
        formDataKeys: Array.from(formData.keys())
      });

      let response;
      
      if (productType === 'accessory') {
        // Для аксессуаров используем POST /accessories
        response = await apiWithAuth.post("/accessories", formData);
        console.log("✅ Accessory created successfully:", response.data);
        alert("Accessory has been created successfully!");
      } else {
        // Для продуктов используем POST /products/product
        response = await apiWithAuth.post("/products/product", formData);
        console.log("✅ Product created successfully:", response.data);
        alert("Product has been created successfully!");
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

      // Переходим на страницу списка продуктов
      navigate("/admin/products");
      
    } catch (err) {
      console.error("❌ Error when adding product/accessory:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.response?.data?.error ||
                          "Error when adding product. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
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
            />
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
            isProductReady={isProductReady && !loading} 
            onSave={handleSaveProduct}
            loading={loading}
            onPreview={() => {
              // Preview не доступен для новых продуктов
              alert("Preview is only available after the product is created.");
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
