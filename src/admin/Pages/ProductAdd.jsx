import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  FormControl,
  Select,
  MenuItem,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import UploadImages from "../AdminComponents/UploadImages.jsx";
import ProductForm from "../AdminComponents/ProductForm.jsx";
import ProductSettings from "../AdminComponents/ProductSettings.jsx";
import RelatedItems from "../AdminComponents/RelatedItems.jsx";
import BottomButtons from "../AdminComponents/BottomButtons.jsx";
import { apiWithAuth } from "../../store/api/axios.js";
import api from "../../store/api/axios.js";
import {
  inputStyles,
  inputDropdown,
  selectMenuProps,
} from "../../styles/inputStyles.jsx";
import { h7 } from "../../styles/typographyStyles.jsx";

export default function ProductsAdd() {
  const navigate = useNavigate();
  const [productType, setProductType] = useState("product");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(null);
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);
  const [images, setImages] = useState([]);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caffeineType, setCaffeineType] = useState("Caffeine");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("");
  const [roast, setRoast] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [servingType, setServingType] = useState("Ground");
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const firstPageRes = await api.get("/products", {
          params: { page: 1 },
        });
        const totalPages = firstPageRes.data.total_pages || 1;
        const allPagesPromises = [];
        for (let p = 1; p <= totalPages; p++) {
          allPagesPromises.push(api.get("/products", { params: { page: p } }));
        }
        const allPagesRes = await Promise.all(allPagesPromises);
        const allProducts = allPagesRes.flatMap((res) => res.data.data || []);
        const accessoriesRes = await api.get("/accessories");
        const allAccessories = accessoriesRes.data.data || [];

        const productCategories = new Set();
        allProducts.forEach((p) => {
          const cat = p.brand || p.category;
          if (cat) productCategories.add(cat.trim());
        });
        allAccessories.forEach((a) => {
          const cat = a.brand || a.category;
          if (cat) productCategories.add(cat.trim());
        });

        setAvailableCategories(Array.from(new Set([...productCategories])));
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const isProductReady = useMemo(() => {
    const nameValid = productName && productName.trim().length > 0;
    const categoryValid = category && category.trim().length > 0;
    const priceValid = !isNaN(parseFloat(price)) && parseFloat(price) > 0;
    const weightValid =
      productType === "accessory"
        ? true
        : weight && weight.toString().trim().length > 0;
    return nameValid && categoryValid && priceValid && weightValid;
  }, [productName, category, price, weight, productType]);

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        id: null,
        url: URL.createObjectURL(file),
        file,
      }));
      setImages((prev) => [...prev, ...newFiles]);
      if (!cover) setCover(newFiles[0]);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newCover = { id: null, url: URL.createObjectURL(file), file };
      setCover(newCover);
      setImages((prev) => [newCover, ...prev.filter((img) => img !== cover)]);
    }
  };

  const handleDeletePhoto = (photoIdOrImg) => {
    setImages((prev) => {
      const filtered = prev.filter(
        (img) => img !== photoIdOrImg && img.id !== photoIdOrImg,
      );
      if (cover === photoIdOrImg) setCover(filtered[0] || null);
      return filtered;
    });
  };

  const handleSaveProduct = async () => {
    if (!isProductReady) {
      setError("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;
      const priceNum = parseFloat(price);
      const stockNum = parseInt(stock) || 0;

      if (productType === "product") {
        const sku = `${productName.trim().substring(0, 10).toUpperCase()}_${Date.now()}`;
        const productData = {
          sku,
          name: productName.trim(),
          brand: brand || category,
          category: category === "custom" ? "" : category,
          description: description.trim(),
          caffeine_type: caffeineType,
          sort: sort || null,
          roast: roast || null,
          is_special: isSpecial,
          status: visible ? "Active" : "Hidden",
          flavor_profiles: [],
          supplies: [
            {
              serving_type: servingType,
              price: priceNum.toString(),
              quantity: stockNum,
              weight: parseFloat(weight) || 0,
            },
          ],
        };

        response = await apiWithAuth.post("/products/product", productData);
        const productId = response.data.id;

        if (images.some((img) => img.file) || cover?.file) {
          const photoFormData = new FormData();

          images
            .filter((img) => img.file)
            .forEach((img) => {
              photoFormData.append("photo", img.file);
            });

          if (cover?.file) {
            photoFormData.append("cover", cover.file);
          }

          await apiWithAuth.put(`/products/${productId}/photo`, photoFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        const sku = `ACC_${productName.trim().substring(0, 5).toUpperCase()}_${Date.now()}`;

        const accessoryData = {
          sku: sku,
          name: productName.trim(),
          category: category,
          price: priceNum.toString(),
          quantity: stockNum,
          description: description.trim(),
          visible: visible,
        };
        response = await apiWithAuth.post(
          "/accessories/new_accessory",
          accessoryData,
        );
        const accessoryId = response.data.id;

        if (images.some((img) => img.file) || cover?.file) {
          const photoFormData = new FormData();
          images
            .filter((img) => img.file)
            .forEach((img) => photoFormData.append("photo", img.file));
          if (cover?.file) photoFormData.append("cover", cover.file);

          await apiWithAuth.put(
            `/accessories/${accessoryId}/photo`,
            photoFormData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
        }
      }

      showNotification("Successfully created!", "success");
      setTimeout(() => navigate("/admin/products"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error saving item");
      showNotification("Error saving item", "error");
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
        boxSizing: "border-box",
      }}
    >
      <Box
        mb={{ xs: 2, md: 3 }}
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
          size={{ xs: 12, md: 7, lg: 7 }}
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
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ ...h7 }} mb={1}>
                Product Type
              </Typography>
              <FormControl
                fullWidth
                sx={{ ...h7, ...inputDropdown, ...inputStyles }}
              >
                <Select
                  value={productType}
                  onChange={(e) => {
                    setProductType(e.target.value);
                    if (e.target.value === "accessory") {
                      setWeight("");
                    }
                  }}
                  MenuProps={selectMenuProps}
                >
                  <MenuItem value="product">Coffee</MenuItem>
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
              caffeineType={caffeineType}
              setCaffeineType={setCaffeineType}
              servingType={servingType}
              setServingType={setServingType}
            />

            {productType === "product" && (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ ...h7 }} mb={1}>
                  Sort
                </Typography>
                <FormControl
                  fullWidth
                  sx={{ ...h7, ...inputDropdown, ...inputStyles, mb: 2 }}
                >
                  <Select
                    value={sort || ""}
                    onChange={(e) => setSort(e.target.value)}
                    MenuProps={selectMenuProps}
                    displayEmpty
                  >
                    <MenuItem value="">Select sort (optional)</MenuItem>
                    <MenuItem value="Arabica">Arabica</MenuItem>
                    <MenuItem value="Robusta">Robusta</MenuItem>
                    <MenuItem value="Arabica/robusta blend">
                      Arabica/robusta blend
                    </MenuItem>
                  </Select>
                </FormControl>

                <Typography sx={{ ...h7 }} mb={1}>
                  Roast
                </Typography>
                <FormControl
                  fullWidth
                  sx={{ ...h7, ...inputDropdown, ...inputStyles, mb: 2 }}
                >
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
                        if (newValue) {
                          const hasPhotos =
                            (images && images.length > 0) ||
                            (cover && (cover.file || cover.id));

                          if (!hasPhotos) {
                            setSnackbar({
                              open: true,
                              message:
                                "⚠️ Warning: This product has no photos. Special products should have photos to display correctly on the homepage banner.",
                              severity: "warning",
                            });
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
                  sx={{ ...h7, mb: 2 }}
                />
                {isSpecial && images.length === 0 && !cover && (
                  <Typography
                    sx={{
                      ...h7,
                      color: "#FF9800",
                      fontSize: "12px",
                      mt: -1,
                      mb: 2,
                    }}
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
          size={{ xs: 12, md: 5, lg: 5 }}
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
          <RelatedItems onAddItems={() => alert("ADD")} />
          {error && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#ffebee",
                borderRadius: 2,
                color: "#c62828",
                fontSize: { xs: "12px", md: "14px" },
              }}
            >
              {error}
            </Box>
          )}
          <BottomButtons
            isProductReady={isProductReady}
            onSave={handleSaveProduct}
            loading={loading}
            onPreview={() => {
              showNotification(
                "Preview is only available after the product is created.",
                "info",
              );
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
