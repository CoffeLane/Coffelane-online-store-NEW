import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { h3, h5, h7 } from "../../styles/typographyStyles.jsx";
import exportIcon from "../../assets/admin/export.svg";
import { btnCart } from "../../styles/btnStyles.jsx";
import RevenueChart from "../AdminComponents/Dashboard/RevenueChart.jsx";
import dashboard1 from "../../assets/admin/dashboard1.svg";
import dashboard2 from "../../assets/admin/dashboard2.svg";
import dashboard3 from "../../assets/admin/dashboard3.svg";
import ProductsTable from "../AdminComponents/Dashboard/ProductsTable.jsx";
import { checkboxStyles } from "../../styles/inputStyles.jsx";
import api, { apiWithAuth } from "../../store/api/axios.js";
import { buildImageUrl } from "../../components/utils/helpers.js";

const salesCards = [
  { title: "Total Sales", value: "$1k", diff: "+8% from yesterday", color: "#ffe5e9", icon: dashboard1 },
  { title: "Total Order", value: "300", diff: "+5% from yesterday", color: "#e5ffe9", icon: dashboard2 },
  { title: "New Customers", value: "8", diff: "0.5% from yesterday", color: "#efe5ff", icon: dashboard3 },
];

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("Category");
  const [page, setPage] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchAllProducts = async () => {
    try {
      const firstPageRes = await apiWithAuth.get("/products", { params: { page: 1 } })
        .catch(() => api.get("/products", { params: { page: 1 } }));
      
      const totalPages = firstPageRes.data.total_pages || 1;
      const allPagesPromises = Array.from({ length: totalPages }, (_, i) => 
        apiWithAuth.get("/products", { params: { page: i + 1 } }).catch(() => api.get("/products", { params: { page: i + 1 } }))
      );

      const allPagesRes = await Promise.all(allPagesPromises);
      const allProducts = allPagesRes.flatMap((res) => res.data.data || []);
      const accessoriesRes = await api.get("/accessories");
      const allAccessories = accessoriesRes.data.data || [];

      setProducts([
        ...allProducts.map((p) => ({ ...p, type: "product" })),
        ...allAccessories.map((a) => ({ ...a, type: "accessory" })),
      ]);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

 // 1. Используем ваш хелпер buildImageUrl внутри
  const getImageUrl = (item) => {
    if (!item) return null;

    // Пытаемся найти сырую ссылку в разных местах (включая вложенный объект product)
    const rawPhoto = 
      item.img || 
      item.product?.product_photos?.[0]?.photo || 
      item.product?.photos_url?.[0] ||
      item.product_photos?.[0]?.photo || 
      item.product_photos?.[0] || 
      item.photos_url?.[0] || 
      item.accessory_photos?.[0] || 
      item.photo_url || 
      item.image;

    // Извлекаем строку, если пришел объект
    let path = (typeof rawPhoto === "object" && rawPhoto !== null) 
      ? (rawPhoto.photo || rawPhoto.url || rawPhoto.image) 
      : rawPhoto;

    // Прогоняем через ваш билд-хелпер для Cloudinary
    return buildImageUrl(path);
  };

  const adminProducts = products.map((item) => ({
    id: item.id,
    image: getImageUrl(item), // Теперь здесь всегда будет Cloudinary URL или ""
    name: item.name,
    category: item.brand || item.category || "Other",
    price: item.supplies?.[0]?.price || item.price || 0,
    stock: item.supplies?.[0]?.quantity || item.quantity || 0,
    status: (item.supplies?.[0]?.quantity || item.quantity || 0) > 0 ? "Active" : "Out of stock",
    type: item.type,
  }));
  const rowsPerPage = 5;
  const paginatedProducts = adminProducts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleExport = () => {
    const headers = ["ID", "Name", "Category", "Price", "Stock", "Status"];
    const csvContent = [
      headers.join(","),
      ...adminProducts.map(p => `${p.id},"${p.name}","${p.category}",${p.price},${p.stock},${p.status}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <Box sx={{ width: "100%", my: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography sx={{ ...h3, fontSize: { xs: "20px", md: "32px" } }}>Dashboard</Typography>
        <Button onClick={handleExport} sx={{ ...btnCart, gap: 1 }}>
          <Box component="img" src={exportIcon} sx={{ width: 20 }} />
          Export
        </Button>
      </Box>

      <Box sx={{ bgcolor: "#fff", borderRadius: "24px", p: 2, mb: 4 }}>
        <Typography sx={h5}>Today's Sales</Typography>
        <Typography sx={{ ...h7, color: "#999", mb: 2 }}>Sales Summary</Typography>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
          {salesCards.map((c) => (
            <Paper key={c.title} sx={{ flex: 1, p: 2, bgcolor: c.color, borderRadius: "24px" }}>
              <Box component="img" src={c.icon} sx={{ width: 32, mb: 1 }} />
              <Typography variant="h6">{c.value}</Typography>
              <Typography variant="subtitle2">{c.title}</Typography>
              <Typography variant="caption" color="primary">{c.diff}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      <RevenueChart />
      <ProductsTable
        products={paginatedProducts}
        selectedIds={selectedIds}
        handleSelectAll={(e) => setSelectedIds(e.target.checked ? paginatedProducts.map((p) => p.id) : [])}
        handleSelectOne={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
        allSelected={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0}
        page={page}
        totalPages={Math.ceil(adminProducts.length / rowsPerPage)}
        onPageChange={(_, newPage) => setPage(newPage)}
        variant="admin"
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        h5={h5}
        checkboxStyles={checkboxStyles}
      />
    </Box>
  );
}
