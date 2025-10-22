"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../axios';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // محاولة جلب معلومات المستخدم الحالي من خلال endpoint مؤقت
        // سنستخدم endpoint موجود للتحقق من الصلاحيات
        const response = await axiosInstance.get('/admin/users');
        // إذا نجح الطلب، فهذا يعني أن المستخدم مدير
        const userData = { role: 'admin' };
        
        setUser(userData);
        
        // التحقق من أن المستخدم مدير
        if (userData && userData.role === 'admin') {
          setIsAdmin(true);
        } else {
          // إذا لم يكن مدير، إعادة توجيه لصفحة الخطأ
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        // إذا فشل التحقق، إعادة توجيه للصفحة الرئيسية
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  return { isAdmin, loading, user };
};

// Higher Order Component لحماية الصفحات الإدارية
export const withAdminAuth = (WrappedComponent) => {
  return function AdminProtectedComponent(props) {
    const { isAdmin, loading } = useAdminAuth();

    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <div>جاري التحقق من الصلاحيات...</div>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h2>غير مصرح لك بالوصول لهذه الصفحة</h2>
          <p>تحتاج صلاحيات مدير للوصول لهذه الصفحة</p>
          <button onClick={() => window.location.href = '/'}>
            العودة للصفحة الرئيسية
          </button>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};
