"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axiosInstance from "../axios";

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await axiosInstance.post("/login", form);
      console.log("Login done:", res.data);
      // window.location.href = "/";
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed";

      if (msg.includes("not found")) {
        setError("Email not found. Redirecting to signup...");
        setTimeout(() => (window.location.href = "/signup"), 2000);
      } else if (
        msg.includes("invalid password") ||
        msg.includes("wrong password")
      ) {
        setError("Incorrect email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          p: 6,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          bgcolor: "#fff",
        }}
      >
        <Box sx={{ mb: 6, display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              bgcolor: "#4A2F0A",
              color: "#fff",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: 20,
              userSelect: "none",
            }}
          >
            C
          </Box>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ userSelect: "none", color: "#1a1a1a" }}
          >
            Clothing.
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          Sign In
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 320 }}
        >
          Please fill your details to access your account.
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleLogin}
          sx={{ maxWidth: 360 }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ mb: 1, userSelect: "none" }}
          >
            Email *
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter Email Address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
            required
          />

          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ mb: 1, userSelect: "none" }}
          >
            Password *
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size="small"
                    sx={{ color: "#4A2F0A" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#4A2F0A",
              py: 1.5,
              fontWeight: 600,
              mb: 4,
              "&:hover": {
                bgcolor: "#3b2300",
              },
            }}
          >
            Sign In
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 5, userSelect: "none", color: "text.primary" }}
          >
            Don’t have an account?{" "}
            <Link
              href="/signup"
              underline="hover"
              sx={{ fontWeight: 600, color: "#4A2F0A" }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Grid>

      <Grid
        item
        xs={false}
        md={6}
        sx={{
          position: "relative",
          backgroundImage:
            "url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "flex-end",
          p: 4,
        }}
      >
        <Box
          sx={{
            bgcolor: "rgba(41, 41, 41, 0.75)",
            color: "#eee",
            p: 3,
            borderRadius: 1,
            maxWidth: 380,
            mb: 4,
            userSelect: "none",
          }}
        >
          <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
            “Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto.”
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ userSelect: "none" }}
          >
            Leslie Alexander
          </Typography>
          <Typography variant="body2" sx={{ userSelect: "none" }}>
            Fashion Enthusiast
          </Typography>
          <Box
            sx={{
              height: 4,
              width: 50,
              bgcolor: "#D9A44A",
              mt: 1,
              borderRadius: 2,
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default SignInPage;
