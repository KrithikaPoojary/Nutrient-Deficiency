import axios from "axios";

// =====================================
// BASE API
// =====================================

const API = axios.create({

  baseURL: "http://127.0.0.1:5000"

});

// =====================================
// PREDICT
// =====================================

export const predict = async (formData) => {

  const res = await API.post(

    "/predict",

    formData,

    {
      headers: {

        "Content-Type":
        "multipart/form-data"

      }
    }

  );

  return res.data;
};

// =====================================
// LOGIN
// =====================================

export const loginUser = async (data) => {

  const res = await API.post(
    "/login",
    data
  );

  return res.data;
};

// =====================================
// REGISTER
// =====================================

export const registerUser = async (data) => {

  const res = await API.post(
    "/register",
    data
  );

  return res.data;
};

// =====================================
// TREND
// =====================================

export const getTrend = async (username) => {

  const res = await API.get(
    `/trend/${username}`
  );

  return res.data;
};

// =====================================
// FOOD SUGGESTIONS
// =====================================

export const getSuggestions = async (query) => {

  if (!query) return [];

  const res = await API.get(
    `/suggest/${query}`
  );

  return res.data;
};

