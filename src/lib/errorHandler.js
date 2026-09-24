// Error handling utilities
export const normalizeError = (error) => {
  if (error.data?.error) {
    return error.data.error;
  }
  if (error.data?.message) {
    return error.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
};

export const isAuthError = (error) => {
  return error.status === 401 || error.data?.error?.includes("unauthorized");
};

export const isNetworkError = (error) => {
  return !error.status || error.message === "Network Error";
};

export const getErrorMessage = (error, defaultMsg = "An error occurred") => {
  const normalized = normalizeError(error);
  return normalized || defaultMsg;
};
