"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

function Footer({ theme }) {
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: "white",
        mt: 8,
        py: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="body2">© 2025 Fashion Store. All Rights Reserved.</Typography>
      <Typography variant="body2" sx={{ mt: 1, fontSize: "0.875rem", opacity: 0.8 }}>
        Designed & Developed with care
      </Typography>
    </Box>
  );
}

export default Footer;
