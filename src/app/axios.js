import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://geophysically-subdentated-johnsie.ngrok-free.dev",
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
