let API_URL;

// Dynamically set API_URL based on environment weather dev or prod

if (import.meta.env.MODE === "production") {
    API_URL = import.meta.env.VITE_API_URL_PROD;
} else {
    API_URL = import.meta.env.VITE_API_URL_DEV;
    console.log("Using Development API URL:", API_URL);
}

export const helper = {
    API_URL
};