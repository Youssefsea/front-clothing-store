"use client";

import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#f5f7fb'
    }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom color="error">
            غير مصرح لك بالوصول
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            هذه الصفحة مخصصة للمديرين فقط
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            تحتاج إلى صلاحيات مدير للوصول إلى لوحة التحكم الإدارية.
            إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المدير.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<HomeIcon />}
              onClick={() => router.push('/')}
              sx={{ px: 3 }}
            >
              العودة للصفحة الرئيسية
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => router.push('/login')}
              sx={{ px: 3 }}
            >
              تسجيل الدخول
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
