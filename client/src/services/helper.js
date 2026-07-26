const getApiUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PROD
      : import.meta.env.VITE_API_URL_DEV);

  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // Fallback: local backend port in development, empty string (relative path) in production
  return import.meta.env.MODE === "production" ? "" : "http://localhost:5000";
};

export const API_URL = getApiUrl();

export const helper = {
  API_URL
};