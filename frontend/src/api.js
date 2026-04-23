import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json"
  }
});

// 🔥 Predict
export const predict = async (data) => {
  const res = await API.post("/predict", data);
  return res.data;
};

// 🔥 Login
export const loginUser = async (data) => {
  const res = await API.post("/login", data);
  return res.data;
};

// 🔥 Register
export const registerUser = async (data) => {
  const res = await API.post("/register", data);
  return res.data;
};

// 🔥 Trend (ONLY use this, not history)
export const getTrend = async (username) => {
  const res = await API.get(`/trend/${username}`);
  return res.data;
};

// 🔥 Food Suggestion (Auto-complete)
export const getSuggestions = async (query) => {
  if (!query) return [];
  
  const res = await API.get(`/suggest/${query}`);
  return res.data;
};