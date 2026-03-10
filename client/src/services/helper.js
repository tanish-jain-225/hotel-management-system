let API_URL;

// Dynamically set API_URL based on environment weather dev or prod

if (import.meta.env.MODE === "production") {
    API_URL = import.meta.env.VITE_API_URL_PROD;
    console.log("Using Production API URL:", API_URL);
} else {
    API_URL = import.meta.env.VITE_API_URL_DEV;
    console.log("Using Development API URL:", API_URL);
}

console.log("Current Environment is being seen:", import.meta.env.MODE);

export const helper = {
    API_URL
};