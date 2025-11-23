"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { CheckCircle, LocalShipping, Payment, Support, Person, Email, Phone } from "@mui/icons-material";
import axiosInstance from "../axios";

export default function OrderCompletedPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/orders/orderForUser");
      if (res.data.orders && res.data.orders.length > 0) {
        setOrders(res.data.orders); 
      }
    } catch (e) {
      setError(" Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchUserOrders();
    }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="info">لا توجد طلبات</Alert>
      </Container>
    );
  }

    function ProductImage({ image_url, title }) {
      const images = image_url.split(",").map((img) => img.trim());
      const [currentIndex, setCurrentIndex] = useState(0);
      const [fade, setFade] = useState(true);
    
      useEffect(() => {
        if (images.length <= 1) return;
    
        const interval = setInterval(() => {
          setFade(false); 
          setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
            setFade(true); 
          }, 300); 
        }, 3000);
    
        return () => clearInterval(interval);
      }, [images.length]);
    
      return (
        <Box
          sx={{
            width: 60,
            height: 60,
            objectFit: "cover",
            borderRadius: 1,
            border: "1px solid #eee",
          }}
        >
          <Box
            component="img"
            src={images[currentIndex]}
            alt={`${title} image`}
            sx={{
            height: "100%",
            width: "100%",
            objectFit: "contain",
            transition: "opacity 0.4s ease-in-out, transform 0.3s ease",
            opacity: fade ? 1 : 0,
            "&:hover": { transform: "scale(1.05)" },
            }}
          />
        </Box>
      );
    }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ bgcolor: "#f7f7f7", py: 4, mb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" fontWeight={800} color="#333" mb={1}>
            My Orders
          </Typography>
          <Typography fontSize={14} color="#777">
            Home / My Orders
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Orders List */}
        <Stack spacing={4}>
          {orders.map((order, index) => {
            const subTotal = order.items?.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0) || 0;
            const total = parseFloat(order.total) || subTotal;

            return (
              <Paper key={order.id} variant="outlined" sx={{ p: 4 }}>
                {/* Order Header */}
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="#333">
                      Order #{order.id}
                    </Typography>
                    <Typography fontSize={14} color="#666">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      bgcolor: 
                        order.status === "pending" ? "#ff9800" :
                        order.status === "paid" ? "#4caf50" :
                        order.status === "shipped" ? "#2196f3" :
                        order.status === "delivered" ? "#8bc34a" :
                        order.status === "cancelled" ? "#f44336" : "#666",
                      color: "white",
                    }}
                  >
                    {order.status}
                  </Box>
                </Stack>                {/* Customer Information */}
                <Paper
                  sx={{
                    bgcolor: "#f5f5f5",
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="#333" mb={2}>
                    Customer Information
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Person sx={{ color: "#c99746", fontSize: 18 }} />
                        <Typography fontWeight={600} color="#333">Name</Typography>
                      </Stack>
                      <Typography fontSize={14} color="#666" sx={{ ml: 3 }}>
                        {order.customer_name || order.user_name || "غير متوفر"}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Email sx={{ color: "#c99746", fontSize: 18 }} />
                        <Typography fontWeight={600} color="#333">Email</Typography>
                      </Stack>
                      <Typography fontSize={14} color="#666" sx={{ ml: 3 }}>
                        {order.customer_email || order.user_email || "غير متوفر"}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Phone sx={{ color: "#c99746", fontSize: 18 }} />
                        <Typography fontWeight={600} color="#333">Phone</Typography>
                      </Stack>
                      <Typography fontSize={14} color="#666" sx={{ ml: 3 }}>
                        {order.customer_phone || order.phone || "غير متوفر"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper
                  sx={{
                    bgcolor: "#c99746",
                    color: "#333",
                    p: 2,
                    mb: 3,
                    borderRadius: 1,
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <Box flex={1}>
                      <Typography fontWeight={600} mb={0.5}>Payment Method</Typography>
                      <Typography fontSize={14} sx={{ textTransform: "capitalize" }}>
                        {order.payment_method?.replace("_", " ")}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography fontWeight={600} mb={0.5}>Total Amount</Typography>
                      <Typography fontSize={14} fontWeight={700}>
                        ${total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Typography variant="h6" fontWeight={700} color="#333" mb={2}>
                  Order Items
                </Typography>
                
                {order.items?.map((item, itemIndex) => (
                  <Box key={itemIndex} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <ProductImage image_url={item.image_url} title={item.title} />

                      <Box flex={1}>
                        <Typography fontWeight={600} mb={0.5}>
                          {item.title}
                        </Typography>
                        <Typography fontSize={14} color="#666">
                          Quantity: {item.quantity}
                        </Typography>
                      </Box>
                      <Typography fontWeight={600}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={700} fontSize={18}>
                    Total: ${total.toFixed(2)}
                  </Typography>
                  <Typography fontSize={14} color="#666">
                    Address: {order.address}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} alignItems="center">
                  <Person sx={{ color: "#c99746" }} />
                  <Typography fontWeight={600} fontSize={14}>
                    Name: {order.customer_name}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Email sx={{ color: "#c99746" }} />
                  <Typography fontWeight={600} fontSize={14}>
                    Email: {order.customer_email}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Phone sx={{ color: "#c99746" }} />
                  <Typography fontWeight={600} fontSize={14}>
                    Phone: {order.customer_phone}
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
        </Stack>


        <Stack direction={{ xs: "column", md: "row" }} spacing={4} sx={{ mb: 6 }}>
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <LocalShipping
              sx={{
                fontSize: 48,
                color: "#c99746",
                mb: 2,
              }}
            />
            <Typography fontWeight={700} mb={1}>
              Free Shipping
            </Typography>
            <Typography fontSize={14} color="#666">
              Free shipping for order above $180
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Payment
              sx={{
                fontSize: 48,
                color: "#c99746",
                mb: 2,
              }}
            />
            <Typography fontWeight={700} mb={1}>
              Flexible Payment
            </Typography>
            <Typography fontSize={14} color="#666">
              Multiple secure payment options
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Support
              sx={{
                fontSize: 48,
                color: "#c99746",
                mb: 2,
              }}
            />
            <Typography fontWeight={700} mb={1}>
              24x7 Support
            </Typography>
            <Typography fontSize={14} color="#666">
              We support online all days
            </Typography>
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            sx={{
              bgcolor: "#4f2a0e",
              color: "white",
              textTransform: "none",
              px: 4,
              py: 1.5,
            }}
            href="/"
          >
            Continue Shopping
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#4f2a0e",
              color: "#4f2a0e",
              textTransform: "none",
              px: 4,
              py: 1.5,
            }}
            href="/cart"
          >
            View Cart
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}