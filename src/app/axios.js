import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const pathname = window.location.pathname;

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // إذا كان المستخدم في صفحة الإدارة وفشل التحقق من الصلاحيات
      if (pathname === "/admin") {
        window.location.href = "/unauthorized";
        return Promise.reject(error);
      }
      
      // للصفحات الأخرى المحمية
      if (
        pathname !== "/" &&
        pathname !== "/login" &&
        pathname !== "/signup" &&
        pathname !== "/shop" &&
        !pathname.startsWith("/product/")
      ) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
