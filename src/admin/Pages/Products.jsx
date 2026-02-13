import React, { useEffect, useState, useMemo } from "react";
import { Box, Divider, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Search from "../../components/Search/index.jsx";
import { h5 } from "../../styles/typographyStyles.jsx";
import { btnCart, btnAdminCheck } from "../../styles/btnStyles.jsx";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import { checkboxStyles } from "../../styles/inputStyles.jsx";
import hideIcon from "../../assets/admin/hide.svg";
import deleteIcon from "../../assets/admin/delete.svg";
import ProductsTable from "../AdminComponents/Dashboard/ProductsTable.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../store/api/axios.js";
import { apiWithAuth } from "../../store/api/axios.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("Category");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const handleProductUpdated = (productId, updates) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const updatedProduct = { ...p, ...updates };
          if (
            updatedProduct.visible === false ||
            updatedProduct.visible === "false" ||
            updatedProduct.status === "Hidden"
          ) {
            updatedProduct.status = "Hidden";
          }
          return updatedProduct;
        }
        return p;
      }),
    );
  };

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const needFullDataset = useMemo(() => {
    const q = (debouncedSearchQuery || "").trim();
    return (categoryFilter !== "Category" && !!categoryFilter) || q.length > 0;
  }, [categoryFilter, debouncedSearchQuery]);

  useEffect(() => {
    if (needFullDataset) {
      if (page !== 1) setPage(1);
      fetchAllProductsForFilter();
      return;
    }
    fetchAllProducts(page);
  }, [page, needFullDataset]);

  useEffect(() => {
    if (location.state?.refresh) {
      const timer = setTimeout(() => {
        fetchAllProducts(page);
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname, page]);

  useEffect(() => {
    const tableTop = document.getElementById("products-table-top");
    if (tableTop) {
      tableTop.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, [page]);

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [categoryFilter]);

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [debouncedSearchQuery]);

  const fetchAllProducts = async (pageNumber = 1) => {
    try {
      let productsRes;
      try {
        productsRes = await apiWithAuth.get("/products", {
          params: { page: pageNumber, _admin: "true" },
        });
      } catch (authError) {
        if (
          authError.response?.status === 401 ||
          authError.response?.status === 403
        ) {
          productsRes = await api.get("/products", {
            params: { page: pageNumber, _admin: "true" },
          });
        } else {
          throw authError;
        }
      }

      const firstAccRes = await api.get("/accessories", {
        params: { _admin: "true", page: 1 },
      });
      const totalAccPages = firstAccRes.data.total_pages || 1;

      let allAccessories = [];
      if (totalAccPages > 1) {
        const accPromises = [];
        for (let p = 1; p <= totalAccPages; p++) {
          accPromises.push(
            api.get("/accessories", { params: { _admin: "true", page: p } }),
          );
        }
        const accResponses = await Promise.all(accPromises);
        allAccessories = accResponses.flatMap((res) => res.data.data || []);
      } else {
        allAccessories = firstAccRes.data.data || [];
      }

      const combined = [
        ...(productsRes.data.data || []).map((p) => ({
          ...p,
          type: "product",
        })),
        ...allAccessories.map((a) => ({ ...a, type: "accessory" })),
      ];

      setProducts(combined);
      setTotalPages(productsRes.data.total_pages || 1);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchAllProductsForFilter = async () => {
    try {
      let firstPageRes;
      try {
        firstPageRes = await apiWithAuth.get("/products", {
          params: { page: 1, _admin: "true" },
        });
      } catch (authError) {
        if (
          authError.response?.status === 401 ||
          authError.response?.status === 403
        ) {
          firstPageRes = await api.get("/products", {
            params: { page: 1, _admin: "true" },
          });
        } else {
          throw authError;
        }
      }

      const totalPages = firstPageRes.data.total_pages;

      const allPagesPromises = [];
      for (let p = 1; p <= totalPages; p++) {
        allPagesPromises.push(
          apiWithAuth
            .get("/products", {
              params: { page: p, _admin: "true" },
            })
            .catch((authError) => {
              if (
                authError.response?.status === 401 ||
                authError.response?.status === 403
              ) {
                return api.get("/products", {
                  params: { page: p, _admin: "true" },
                });
              }
              throw authError;
            }),
        );
      }

      const allPagesRes = await Promise.all(allPagesPromises);
      const allProducts = allPagesRes.flatMap((res) =>
        res.data.data.map((p) => ({ ...p, type: "product" })),
      );

      const accessoriesRes = await api.get("/accessories", {
        params: { _admin: "true" },
      });
      const allAccessories = accessoriesRes.data.data.map((a) => ({
        ...a,
        type: "accessory",
      }));

      const combined = [...allProducts, ...allAccessories];
      setProducts(combined);
      setTotalPages(1);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error fetching products for filter:", error);
      if (error.response?.status === 500) {
        console.error("Server error (500). Please check backend logs.");
      }
    }
  };

  const adminProducts = products.map((item) => {
    let imageUrl = null;
    if (
      item.photos_url &&
      Array.isArray(item.photos_url) &&
      item.photos_url.length > 0
    ) {
      const firstPhoto = item.photos_url[0];
      if (typeof firstPhoto === "string") {
        imageUrl = firstPhoto;
      } else if (firstPhoto && typeof firstPhoto === "object") {
        imageUrl =
          firstPhoto.url ||
          firstPhoto.photo ||
          firstPhoto.photo_url ||
          firstPhoto.image_url ||
          null;
      }
    } else if (
      item.product_photos &&
      Array.isArray(item.product_photos) &&
      item.product_photos.length > 0
    ) {
      const firstPhoto = item.product_photos[0];
      if (firstPhoto && typeof firstPhoto === "object") {
        if (firstPhoto.photo) {
          if (typeof firstPhoto.photo === "string") {
            imageUrl = firstPhoto.photo;
          } else if (firstPhoto.photo && typeof firstPhoto.photo === "object") {
            imageUrl =
              firstPhoto.photo.url ||
              firstPhoto.photo.photo_url ||
              firstPhoto.photo.image_url ||
              null;
          }
        } else {
          imageUrl =
            firstPhoto.url ||
            firstPhoto.photo ||
            firstPhoto.photo_url ||
            firstPhoto.image_url ||
            null;
        }
      } else if (typeof firstPhoto === "string") {
        imageUrl = firstPhoto;
      }
    } else if (
      item.accessory_photos &&
      Array.isArray(item.accessory_photos) &&
      item.accessory_photos.length > 0
    ) {
      const firstPhoto = item.accessory_photos[0];
      if (typeof firstPhoto === "string") {
        imageUrl = firstPhoto;
      } else if (firstPhoto && typeof firstPhoto === "object") {
        imageUrl =
          firstPhoto.url ||
          firstPhoto.photo ||
          firstPhoto.photo_url ||
          firstPhoto.image_url ||
          null;
      }
    }

    if (
      imageUrl &&
      typeof imageUrl === "string" &&
      !imageUrl.startsWith("http")
    ) {
      imageUrl = `https://onlinestore-928b.onrender.com${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }

    const stockQuantity = item.supplies?.[0]?.quantity || item.quantity || 0;

    let productStatus = "Active";

    if (
      item.visible === false ||
      item.visible === "false" ||
      item.status === "Hidden"
    ) {
      productStatus = "Hidden";
    } else if (stockQuantity === 0) {
      productStatus = "Out of stock";
    } else if (item.status) {
      productStatus = item.status;
    } else {
      productStatus = "Active";
    }
    return {
      id: item.id,
      image: imageUrl,
      name: item.name,
      category: item.brand || item.category || "Other",
      price: item.supplies?.[0]?.price || item.price || 0,
      stock: stockQuantity,
      status: productStatus,
      type: item.type,
    };
  });

  const normalize = (v) =>
    String(v ?? "")
      .trim()
      .toLowerCase();
  const shouldLocalPaginate = useMemo(() => {
    return (
      (categoryFilter !== "Category" && !!categoryFilter) ||
      !!normalize(debouncedSearchQuery)
    );
  }, [categoryFilter, debouncedSearchQuery]);

  const filteredProducts = useMemo(() => {
    const q = normalize(debouncedSearchQuery);

    let result =
      categoryFilter === "Category" || !categoryFilter
        ? adminProducts
        : adminProducts.filter(
            (p) => p.category.toLowerCase() === categoryFilter.toLowerCase(),
          );

    if (!q) return result;
    return result.filter((p) => {
      const haystack = [p.id, p.name, p.category, p.status]
        .map(normalize)
        .join(" ");
      return haystack.includes(q);
    });
  }, [adminProducts, categoryFilter, debouncedSearchQuery]);

  const itemsPerPage = 10;

  const visibleRows = useMemo(() => {
    if (!shouldLocalPaginate) return filteredProducts;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, page, shouldLocalPaginate]);

  const isAllSelectedForView = useMemo(() => {
    if (visibleRows.length === 0) return false;
    return visibleRows.every((p) => selectedIds.includes(p.id));
  }, [visibleRows, selectedIds]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(visibleRows.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm("Are you sure you want to delete selected items?"))
      return;

    try {
      await Promise.all(
        selectedIds.map((id) => {
          const rawItem = products.find((p) => p.id === id);
          if (rawItem?.type === "accessory") {
            // Для аксессуаров по списку Django: api/accessories/<id>
            return apiWithAuth.delete(`/accessories/${id}`);
          } else {
            // Для кофе оставляем как было (видимо там роут другой)
            return apiWithAuth.delete(`/products/${id}/deletion`);
          }
        }),
      );

      fetchAllProducts(page);
      setSelectedIds([]);
    } catch (error) {
      console.error(
        "Error deleting selected items:",
        error.response?.data || error.message,
      );
    }
  };

  const handleHideSelected = async () => {
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const rawItem = products.find((p) => p.id === id);

          if (rawItem?.type === "accessory") {
            return apiWithAuth.put(`/accessories/${id}/update`, {
              name: rawItem.name,
              price: rawItem.price,
              quantity: rawItem.stock || rawItem.quantity || 0,
              sku: rawItem.sku || "N/A",
              visible: false,
              status: "Hidden",
            });
          } else {
            return apiWithAuth.patch(`/products/product/${id}`, {
              visible: false,
              status: "Hidden",
            });
          }
        }),
      );

      fetchAllProducts(page);
      setSelectedIds([]);
    } catch (error) {
      console.error(
        "Error hiding selected items:",
        error.response?.data || error.message,
      );
      alert("Some items couldn't be hidden. Check console for details.");
    }
  };

  return (
    <Box sx={{ width: "100%", mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 3 } }}>
      <Box
        mb={3}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: { xs: 2, md: 0 },
        }}
      >
        <AdminBreadcrumbs />

        {selectedIds.length > 0 && (
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mr: 1,
                bgcolor: "#999",
                width: "1px",
                display: { xs: "none", md: "block" },
              }}
            />

            <Button
              sx={{
                ...btnAdminCheck,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: { xs: "12px", md: "14px" },
                py: { xs: 0.5, md: 1 },
              }}
              onClick={handleDeleteSelected}
            >
              <Box
                component="img"
                src={deleteIcon}
                sx={{ width: { xs: 16, md: 20 }, height: { xs: 16, md: 20 } }}
              />
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                Delete items
              </Box>
              <Box sx={{ display: { xs: "block", sm: "none" } }}>Delete</Box>
            </Button>

            <Button
              sx={{
                ...btnAdminCheck,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: { xs: "12px", md: "14px" },
                py: { xs: 0.5, md: 1 },
              }}
              onClick={handleHideSelected}
            >
              <Box
                component="img"
                src={hideIcon}
                sx={{ width: { xs: 16, md: 20 }, height: { xs: 16, md: 20 } }}
              />
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                Hide items
              </Box>
              <Box sx={{ display: { xs: "block", sm: "none" } }}>Hide</Box>
            </Button>
          </Box>
        )}

        <Box
          display="flex"
          gap={2}
          flexDirection={{ xs: "column", sm: "row" }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Search value={searchQuery} onChange={(v) => setSearchQuery(v)} />
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("add")}
            startIcon={<AddIcon />}
            sx={{
              ...btnCart,
              fontSize: { xs: "12px", md: "14px" },
              py: { xs: 0.75, md: 1 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              Add new product
            </Box>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>Add product</Box>
          </Button>
        </Box>
      </Box>

      <Box id="products-table-top" />
      <ProductsTable
        onRefresh={() => fetchAllProducts(page)}
        products={adminProducts}
        selectedIds={selectedIds}
        handleSelectAll={handleSelectAll}
        handleSelectOne={handleSelectOne}
        allSelected={isAllSelectedForView}
        h5={h5}
        checkboxStyles={checkboxStyles}
        page={page}
        totalPages={totalPages}
        onPageChange={(e, newPage) => {
          setPage(newPage);
        }}
        variant="admin"
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        searchQuery={debouncedSearchQuery}
        onProductUpdated={handleProductUpdated}
      />
    </Box>
  );
}
