import React, { useState, useEffect, useMemo } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

// Компоненты
import Search from "../../components/Search/index.jsx";
import ProductsTableOrders from "../AdminComponents/ProductsTableOrders.jsx";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import OrderDetails from "../AdminComponents/OrderDetails.jsx";

// Стили и Store
import { h5 } from "../../styles/typographyStyles.jsx";
import { fetchOrders } from "../../store/slice/ordersSlice.jsx";
import { default as api } from "../../store/api/axios.js";

// Утилиты
import { buildImageUrl } from "../../components/utils/helpers.js";

const PRODUCT_PLACEHOLDER = "https://via.placeholder.com/150?text=No+Product";

export default function Orders() {
  const dispatch = useDispatch();
  const { orders, loading, error, count } = useSelector(
    (state) => state.orders,
  );

  const [page, setPage] = useState(1);
  const rowsPerPage = 20;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [photoCache, setPhotoCache] = useState(new Map());
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Загрузка списка заказов при смене страницы
  useEffect(() => {
    dispatch(fetchOrders({ page, size: rowsPerPage, ordering: "-id" }));
  }, [dispatch, page]);

  // 2. Оптимизированная загрузка фотографий товаров
  useEffect(() => {
    if (!orders?.length) return;

    const loadPhotos = async () => {
      const itemsToFetch = [];

      // Собираем ID товаров, которых еще нет в кэше
      orders.forEach((order) => {
        (order.positions || []).forEach((pos) => {
          const item = pos.product || pos.accessory;
          const type = pos.product ? "product" : "accessory";

          if (item?.id && !photoCache.has(`${type}-${item.id}`)) {
            // Проверка, чтобы не добавлять один и тот же товар в очередь дважды
            if (
              !itemsToFetch.find((i) => i.id === item.id && i.type === type)
            ) {
              itemsToFetch.push({ id: item.id, type });
            }
          }
        });
      });

      if (itemsToFetch.length === 0) return;

      const results = await Promise.allSettled(
        itemsToFetch.map(async ({ id, type }) => {
          try {
            const endpoint =
              type === "product" ? `/products/${id}` : `/accessories/${id}`;
            const { data } = await api.get(endpoint);

            // Ищем путь к фото в разных полях (универсально для разных моделей)
            const rawPath =
              data.photos_url?.[0]?.url ||
              data.photos_url?.[0]?.photo ||
              data.product_photos?.[0]?.photo ||
              data.accessory_photos?.[0]?.photo ||
              (typeof data.photos_url?.[0] === "string"
                ? data.photos_url[0]
                : null) ||
              data.image ||
              data.photo;

            return {
              key: `${type}-${id}`,
              url: rawPath ? buildImageUrl(rawPath) : PRODUCT_PLACEHOLDER,
            };
          } catch (err) {
            console.warn(`Failed to fetch photo for ${type} ${id}`);
            return { key: `${type}-${id}`, url: PRODUCT_PLACEHOLDER };
          }
        }),
      );

      // Обновляем кэш одной пачкой
      setPhotoCache((prev) => {
        const next = new Map(prev);
        results.forEach((res) => {
          if (res.status === "fulfilled") {
            next.set(res.value.key, res.value.url);
          }
        });
        return next;
      });
    };

    loadPhotos();
  }, [orders]);

  // 3. Подготовка данных для таблицы (Трансформация)
  const transformedOrders = useMemo(() => {
    const statusLabels = {
      processing: "Processing",
      preparing: "Preparing",
      shipping: "Shipping",
      in_transit: "In Transit",
      delivered: "Delivered",
      delivering: "Delivered",
      cancelled: "Cancelled",
      canceled: "Cancelled",
    };

    return (orders || [])
      .map((order) => {
        // Форматирование даты
        const date = new Date(order.created_at);
        const displayDate = isNaN(date.getTime())
          ? "N/A"
          : date.toLocaleDateString("en-GB");

        // Формирование списка позиций внутри заказа
        const itemsList = (order.positions || []).map((pos) => {
          const itemData = pos.product || pos.accessory || {};
          const type = pos.product ? "product" : "accessory";
          const cacheKey = `${type}-${itemData.id}`;

          // Используем вложенные данные из твоего JSON (quantity и total_price)
          const quantity = Number(itemData.quantity || pos.quantity || 1);
          const price = Number(itemData.price || pos.price || 0);

          const totalPrice = Number(
            itemData.total_price || pos.total_price || price * quantity,
          );

          return {
            name: itemData.name || "Unknown Item",
            quantity: quantity,
            price: totalPrice, // Теперь здесь будет 40, а не 20
            image: photoCache.get(cacheKey) || PRODUCT_PLACEHOLDER,
          };
        });

        return {
          id: order.id,
          ID: String(order.id),
          status: statusLabels[order.status?.toLowerCase()] || "Pending",
          date: displayDate,
          customer: order.first_name
            ? `${order.first_name} ${order.last_name || ""}`
            : `ID: ${order.customer}`,
          total: Number(order.order_amount || 0),
          items: itemsList.reduce((sum, item) => sum + item.quantity, 0),
          itemsList,
          originalOrder: order, // сохраняем оригинал для OrderDetails
        };
      })
      .sort((a, b) => b.id - a.id);
  }, [orders, photoCache]);

  // 4. Поиск/Фильтрация
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return transformedOrders;
    return transformedOrders.filter(
      (o) =>
        o.ID.includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q),
    );
  }, [transformedOrders, searchQuery]);

  // Обработчики
  const handlePageChange = (e, newPage) => {
    setPage(newPage);
    setSelectedOrder(null);
  };

  // Рендеринг загрузки
  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#A4795B" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        width: "100%",
        gap: 3,
        my: 3,
      }}
    >
      {/* Левая часть: Таблица */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          mb={3}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <AdminBreadcrumbs />
          <Search
            value={searchQuery}
            onChange={(v) => {
              setSearchQuery(v);
              setSelectedOrder(null);
            }}
          />
        </Box>

        <ProductsTableOrders
          products={filteredOrders}
          h5={h5}
          page={page}
          totalPages={Math.ceil((count || 0) / rowsPerPage)}
          onPageChange={handlePageChange}
          variant="admin"
          onRowClick={setSelectedOrder}
          selectedOrderId={selectedOrder?.id}
        />
      </Box>

      {/* Правая часть: Детали (появляется при клике) */}
      {selectedOrder && (
        <Box sx={{ width: { xs: "100%", lg: 400 }, flexShrink: 0 }}>
          <OrderDetails
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        </Box>
      )}
    </Box>
  );
}
