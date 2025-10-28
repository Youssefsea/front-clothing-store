"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
  Fade,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axiosInstance from "../axios";

const testimonial = {
  imageUrl: "https://www.dresscodeme.com/wp-content/uploads/2023/09/Untitled-design-31.jpg",
};

export default function SignUp() {
  const theme = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", otp: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [showMsg, setShowMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [OTPG,setOTPG]=useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleChange = (e) =>
     setForm(
      { ...form, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

const confirmOTP=async()=>
  {
    try
    {
setLoading(true);
setMsg("");
setShowMsg(false);
await axiosInstance.post("/send-otp",{
email:form.email,
phone:form.phone,
});
setOTPG(true);
setMsg("OTP sent successfully!");
setShowMsg(true);
setLoading(false);
    }catch(err)
    {
      console.log(err);
      setMsg("Failed to send OTP. Please try again.");
      setShowMsg(true);
    }
  }


  const Signup = async () => {
    setLoading(true);
    setMsg("");
    setShowMsg(false);
    try {
      await axiosInstance.post("/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        otp: form.otp,
      });
      setMsg("Account created successfully!");
      setShowMsg(true);
      setTimeout(() => { router.push("/login"); }, 2000);
      setTimeout(() => { setShowMsg(false); }, 3000);
    } catch (err) {
      console.log(err);
      setMsg("Signup failed. Please try again.");
      setShowMsg(true);
      setTimeout(() => { setShowMsg(false); }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 6 }, display: "flex", flexDirection: "column", justifyContent: "center", bgcolor: "background.paper" }}>
        <Box sx={{ maxWidth: 400, width: "100%" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
            <Box component="span" sx={{ bgcolor: theme.palette.warning.dark, color: "#fff", borderRadius: "50%", width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", mr: 1, fontWeight: "bold" }}>
              C
            </Box>
            Clothing.
          </Typography>

          <Typography variant="h4" fontWeight={700} mb={1} mt={3}>Sign Up</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Fill your information below or register with your social account.</Typography>

          <Grid container spacing={2} mb={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name *" placeholder="Enter Name" size="small" required name="name" value={form.name} onChange={handleChange} />
            </Grid>
          </Grid>

          <TextField fullWidth label="Email *" placeholder="Enter Email Address" size="small" required type="email" sx={{ mb: 2 }} name="email" value={form.email} onChange={handleChange} />
          <TextField fullWidth label="Password *" placeholder="Enter Password" size="small" required type={showPassword ? "text" : "password"} sx={{ mb: 2 }} name="password" value={form.password} onChange={handleChange} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={handleClickShowPassword} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
          <TextField fullWidth label="Phone Number *" placeholder="Enter Phone Number" size="small" required type="tel" sx={{ mb: 2 }} name="phone" value={form.phone} onChange={handleChange} />
{OTPG && (
  <TextField
    fullWidth
    label="Enter OTP *"
    placeholder="Enter the code sent to your email"
    size="small"
    required
    sx={{ mb: 2 }}
    name="otp"
    value={form.otp}
    onChange={handleChange}
  />
)}

     {!OTPG && (
  <Button
    variant="outlined"
    fullWidth
    sx={{
      mb: 2,
      py: 1.5,
      fontWeight: "bold",
      borderColor: theme.palette.warning.dark,
      color: theme.palette.warning.dark,
      "&:hover": { borderColor: theme.palette.warning.main },
    }}
    onClick={confirmOTP}
    disabled={loading || !form.email || !form.phone}
  >
    {loading ? <CircularProgress size={24} /> : "Send OTP"}
  </Button>
)}

       <Button
  variant="contained"
  fullWidth
  sx={{
    bgcolor: theme.palette.warning.dark,
    "&:hover": { bgcolor: theme.palette.warning.main },
    mb: 2,
    py: 1.5,
    fontWeight: "bold",
  }}
  onClick={Signup}
  disabled={loading || !OTPG || !form.otp}
>
  {loading ? <CircularProgress size={24} /> : "Sign Up"}
</Button>

          <Fade in={showMsg} timeout={600}>
            <Typography color={msg.includes("failed") ? "error" : "success.main"} mb={2} textAlign="center">{msg}</Typography>
          </Fade>

          <Typography variant="body2" color="text.primary" textAlign="center">
            Already have an account? <Link href="/login" underline="hover" color="warning.dark" fontWeight="bold">Sign In</Link>
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12} md={6} sx={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", bgcolor: "grey.100", p: { xs: 1.5, md: 3 } }}>
        <Box component="img" src={testimonial.imageUrl} alt="Sign Up" sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2 }} />
        <Box sx={{ position: "absolute", left: 24, right: 24, bottom: 24, bgcolor: "rgba(0,0,0,0.35)", color: "#fff", p: { xs: 2, md: 3 }, borderRadius: 2, backdropFilter: "blur(2px)" }}>
          <Typography sx={{ fontStyle: "italic", lineHeight: 1.8 }}>
            “Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto.”
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography fontWeight={700}>Leslie Alexander</Typography>
            <Typography variant="caption">Fashion Enthusiast</Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}