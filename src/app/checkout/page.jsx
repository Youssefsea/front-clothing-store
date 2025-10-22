"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import axiosInstance from "../axios";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [billing, setBilling] = useState({ address: "" });

  const [payment, setPayment] = useState({
    method: "vodafone_cash",
  });
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/cart");
      const items = res.data.items || [];
      setCartItems(items);
      const map = {};
      for (const item of items) map[item.cart_item_id] = true;
      setSelectedMap(map);
    } catch (e) {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const itemsCount = useMemo(
    () => cartItems.reduce((acc, i) => acc + i.quantity, 0),
    [cartItems]
  );

  const subTotal = useMemo(
    () => cartItems.reduce((acc, i) => acc + i.final_price * i.quantity, 0),
    [cartItems]
  );

  const total = subTotal; 

  const toggleItem = () => {};

  const handleBillingChange = (field) => (e) => {
    setBilling((b) => ({ ...b, [field]: e.target.value }));
  };

  const handlePaymentChange = (field) => (e) => {
    setPayment((p) => ({ ...p, [field]: e.target.value }));
  };

  const submitOrder = async () => {
    setError("");
    setSuccess("");

    if (!payment.method) return setError("اختر طريقة الدفع");
    if (!billing.address || billing.address.trim().length < 3)
      return setError("ادخل العنوان كاملًا");
    if (cartItems.length === 0) return setError("السلة فارغة");
    if (!paymentScreenshot) return setError("ارفع صورة إثبات الدفع");

    const address = billing.address.trim();

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("payment_method", payment.method);
      formData.append("address", address);
      formData.append("payment_screenshot", paymentScreenshot);

      const res = await axiosInstance.post("/orders/confirm", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("تم تأكيد الدفع وإنشاء الطلب بنجاح");
      window.dispatchEvent(new Event("cartUpdated"));
window.location.href = "/orderComplet";
    } catch (e) {
      setError(
        e?.response?.data?.message || "حدث خطأ أثناء تأكيد الدفع، حاول مرة أخرى"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ bgcolor: "#f7f7f7", py: 4, mb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" fontWeight={800} color="#333" mb={1}>
            Checkout
          </Typography>
          <Typography fontSize={14} color="#777">
            Home / Shopping Cart / Checkout
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        {/* Billing form */}
        <Box flex={3}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography fontWeight={700} mb={2}>Billing Details</Typography>

            <TextField fullWidth label="Address" value={billing.address} onChange={handleBillingChange("address")} required sx={{ mb: 2 }} />


            <Divider sx={{ my: 3 }} />

            <Typography fontWeight={700} mb={1}>Payment</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
              <TextField select fullWidth label="Payment Method" value={payment.method} onChange={handlePaymentChange("method")} required>
                <MenuItem value="vodafone_cash">Vodafone Cash</MenuItem>
                <MenuItem value="instapay">InstaPay</MenuItem>
              </TextField>
            </Stack>

            {payment.method && (
              <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography fontWeight={600} mb={1}>
                  {payment.method === "vodafone_cash" ? "Vodafone Cash Number:" : "InstaPay Email:"}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography 
                    sx={{ 
                      fontFamily: "monospace", 
                      bgcolor: "white", 
                      p: 1, 
                      borderRadius: 1, 
                      border: "1px solid #ddd",
                      flex: 1 
                    }}
                  >
                    {payment.method === "vodafone_cash" ? "01026212621" : "mohamedGamal@gmail.com"}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const text = payment.method === "vodafone_cash" ? "01026212621" : "mohamedGamal@gmail.com";
                      navigator.clipboard.writeText(text);
                      setSuccess("تم النسخ!");
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    Copy
                  </Button>
                </Stack>
              </Box>
            )}

            <Stack spacing={1} mb={2}>
              <Typography fontWeight={600}>Payment Screenshot</Typography>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
              />
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
            )}

            {cartItems.length > 0 && (
              <Button
                variant="contained"
                sx={{ bgcolor: "#4f2a0e", textTransform: "none", py: 1.5 }}
                disabled={submitting}
                onClick={submitOrder}
              >
                {submitting ? "Processing..." : "Continue to Payment"}
              </Button>
            )}
          </Paper>
        </Box>

        {/* Order summary */}
        <Box flex={1}>
          <Paper variant="outlined" sx={{ p: 3, position: { xs: "static", md: "sticky" }, top: 24 }}>
            <Typography fontWeight={700} mb={2}>Order Summary</Typography>

            <Stack spacing={1} mb={2}>
              {cartItems.map((item) => (
                <Stack key={item.cart_item_id} direction="row" alignItems="center" justifyContent="space-between">
                  <Typography>{`${item.title} x${item.quantity}`}</Typography>
                  <Typography>${(item.final_price * item.quantity).toFixed(2)}</Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1} mb={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Items</Typography>
                <Typography>{itemsCount}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Sub Total</Typography>
                <Typography>${subTotal.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Shipping</Typography>
                <Typography>$0.00</Typography>
              </Stack>
            </Stack>

            <Typography fontWeight={700}>Total: ${total.toFixed(2)}</Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

