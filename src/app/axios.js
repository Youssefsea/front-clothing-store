import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://52b4921d-56a6-4eb8-9784-3f4d2fbcf02c-00-1go5xw9quc74d.picard.replit.dev:3000",
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
