"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Stack,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Add, Remove, Close } from "@mui/icons-material";
import axiosInstance from "../axios";

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemLoading, setItemLoading] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const getCart = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/cart");
      setCartItems(res.data.items);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

const handleQuantityChange = async (cartItemId, delta) => {
  const item = cartItems.find((i) => i.cart_item_id === cartItemId);
  if (!item) return;

  setItemLoading((prev) => ({ ...prev, [cartItemId]: true }));

  try {
    await axiosInstance.post("/cart/update", {
      product_id: item.product_id,
      delta,
      size: item.size,
      color: item.color,
    });

    const newQuantity = item.quantity + delta;

    setCartItems((items) =>
      newQuantity <= 0
        ? items.filter((i) => i.cart_item_id !== cartItemId)
        : items.map((i) =>
            i.cart_item_id === cartItemId ? { ...i, quantity: newQuantity } : i
          )
    );

    window.dispatchEvent(new Event("cartUpdated"));

  } catch (err) {
    console.error(err);
  } finally {
    setItemLoading((prev) => ({ ...prev, [cartItemId]: false }));
  }
};

const handleRemoveItem = async (cartItemId) => {
  const item = cartItems.find((i) => i.cart_item_id === cartItemId);
  if (!item) return;
  handleQuantityChange(cartItemId, -item.quantity);
};

const handleClearCart = async () => {
  setLoading(true);
  try {
    for (let item of cartItems) {
      await axiosInstance.post("/cart/update", {
        product_id: item.product_id,
        delta: -item.quantity,
        size: item.size,
        color: item.color,
      });
    }
    setCartItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
    setCouponCode("");
    setCouponDiscount(0);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

function ProductImage({ image_url, title, size = 64 }) {
  const images = image_url ? image_url.split(",").map((img) => img.trim()) : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return; // لو صورة واحدة فقط ما يعملش تبديل

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // ← التبديل كل 3 ثواني

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
        }}
      >
        <Typography fontSize={12} color="#777">
          لا توجد صورة
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: "relative",
        overflow: "hidden",
        borderRadius: 1,
      }}
    >
      <Box
        component="img"
        src={images[currentIndex]}
        alt={`${title} image`}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.5s ease-in-out",
        }}
      />
    </Box>
  );
}


  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.final_price * item.quantity,
    0
  );
  const total = subTotal;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress />
        <Typography ml={2}>Loading your cart...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ bgcolor: "#f7f7f7", py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" fontWeight="bold" color="#333" mb={1}>
            Shopping Cart
          </Typography>
          <Typography fontSize={14} color="#777">
            Home / Shopping Cart
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        <Box flex={3}>
          {cartItems.length === 0 ? (
            <Typography>Your cart is empty.</Typography>
          ) : (
            <>
            {/* Desktop table */}
            <Table sx={{ display: { xs: "none", md: "table" } }}>
              <TableHead sx={{ bgcolor: "#f5b642" }}>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map(
                  ({
                    cart_item_id,
                    title,
                    color,
                    size,
                    final_price,
                    quantity,
                    image,
                  }) => (
                    <TableRow key={cart_item_id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(cart_item_id)}
                            sx={{ color: "#4f2a0e" }}
                            disabled={itemLoading[cart_item_id]}
                          >
                            {itemLoading[cart_item_id] ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Close />
                            )}
                          </IconButton>
                         <ProductImage image_url={image} title={title} size={64} />
                          <Box>
                            <Typography fontWeight={600}>{title}</Typography>
                            <Typography fontSize={12} color="#666">
                              Color: {color} | Size: {size}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>${final_price}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(cart_item_id, -1)
                            }
                            disabled={itemLoading[cart_item_id]}
                          >
                            {itemLoading[cart_item_id] ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Remove />
                            )}
                          </IconButton>
                          <Typography>{quantity}</Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(cart_item_id, +1)
                            }
                            disabled={itemLoading[cart_item_id]}
                          >
                            {itemLoading[cart_item_id] ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Add />
                            )}
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell>${(final_price * quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>

            {/* Mobile list */}
            <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
              {cartItems.map(({ cart_item_id, title, color, size, final_price, quantity, image }) => (
                <Paper key={`m-${cart_item_id}`} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box component="img" src={image} alt={title} sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        fontWeight={700} 
                        sx={{ 
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {title}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: color?.toLowerCase?.() || "#ccc", border: "1px solid #eee" }} />
                        <Typography variant="caption" color="text.secondary">{color} • {size}</Typography>
                      </Stack>
                    </Box>
                    <IconButton size="small" onClick={() => handleRemoveItem(cart_item_id)} disabled={itemLoading[cart_item_id]}>
                      {itemLoading[cart_item_id] ? <CircularProgress size={18} /> : <Close />}
                    </IconButton>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton size="small" onClick={() => handleQuantityChange(cart_item_id, -1)} disabled={itemLoading[cart_item_id]}>
                        {itemLoading[cart_item_id] ? <CircularProgress size={18} /> : <Remove />}
                      </IconButton>
                      <Typography>{quantity}</Typography>
                      <IconButton size="small" onClick={() => handleQuantityChange(cart_item_id, +1)} disabled={itemLoading[cart_item_id]}>
                        {itemLoading[cart_item_id] ? <CircularProgress size={18} /> : <Add />}
                      </IconButton>
                    </Stack>
                    <Typography fontWeight={700} sx={{ fontSize: "1rem" }}>${(final_price * quantity).toFixed(2)}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
            </>
          )}

          <Stack direction="row" spacing={2} mt={3} alignItems="center">
            <Button
              variant="text"
              sx={{ textTransform: "none", color: "#4f2a0e", fontWeight: "bold" }}
              onClick={handleClearCart}
            >
              Clear Shopping Cart
            </Button>
          </Stack>
        </Box>

        <Box flex={1}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography fontWeight={700} mb={2}>
              Order Summary
            </Typography>
            <Stack spacing={1} mb={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Items</Typography>
                <Typography>{itemsCount}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Sub Total</Typography>
                <Typography>${subTotal.toFixed(2)}</Typography>
              </Stack>
            
            </Stack>
            <Typography fontWeight={700} mb={2}>
              Total: ${total.toFixed(2)}
            </Typography>
            {cartItems.length > 0 && (
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: "#4f2a0e", textTransform: "none", py: 1.5 }}
                href="/checkout"
              >
                Proceed to Checkout
              </Button>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
