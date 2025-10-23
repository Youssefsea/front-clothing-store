import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://67cf9d27-29c3-4ae2-9d43-5127d353738b-00-232r5v6zioq8p.worf.replit.dev:3001/",
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
      if (pathname === "/admin") {
        window.location.href = "/unauthorized";
        return Promise.reject(error);
      }
      
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
