import axios from "axios";

// This is the local backend URL used while running React on localhost:3000.
const localBaseURL = "http://localhost:5000/api";

// This reads the backend URL from .env when it is a full http/https URL.
const envBaseURL = process.env.REACT_APP_API_URL?.trim();

// This avoids broken relative values like "/api", because those call localhost:3000/api by mistake.
const rawBaseURL = envBaseURL?.startsWith("http") ? envBaseURL : localBaseURL;

// This removes ending slashes so URL joining stays clean.
const cleanBaseURL = rawBaseURL.replace(/\/+$/, "");

// This guarantees every request goes to /api even if .env only has http://localhost:5000.
const apiBaseURL = cleanBaseURL.endsWith("/api") ? cleanBaseURL : `${cleanBaseURL}/api`;

// This creates one Axios client so every page uses the same backend URL.
const API = axios.create({
  // This final URL is used before paths like /auth/signup and /users.
  baseURL: apiBaseURL,

  // This stops requests from hanging too long when the backend is asleep or offline.
  timeout: 12000,
});

// This attaches the login token automatically before every API request.
API.interceptors.request.use((req) => {
  // This reads the token saved after login.
  const token = localStorage.getItem("token");

  // This sends the token to protected backend routes.
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  // This returns the updated request back to Axios.
  return req;
});

// This exports the API client for pages and components to use.
export default API;
