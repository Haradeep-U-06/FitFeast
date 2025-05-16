const isDevelopment = import.meta.env.MODE === "development";

// Get the base URL based on environment
export const getBaseUrl = () => {
  return isDevelopment ? "http://localhost:4000" : "https://fitfeast-ve0p.onrender.com"; // Backend URL on Render
};