import axios from "axios";
import i18n from "../i18n";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  config.headers["Accept-Language"] = i18n.language || "hi";
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 429) {
      const msg = "Thoda ruko, dobara try karein";
      return Promise.reject(new Error(msg));
    }
    return Promise.reject(error);
  }
);

export const queryLegal = async (payload) => {
  const { data } = await api.post("/query-legal/", payload);
  return data;
};

export const draftFIR = async (payload) => {
  const { data } = await api.post("/draft-fir/", payload);
  return data;
};

export const scanContract = async (payload) => {
  const { data } = await api.post("/scan-contract/", payload, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const mapBNS = async (payload) => {
  const { data } = await api.post("/map-bns/", payload);
  return data;
};

export const analyzeCase = async (payload) => {
  const { data } = await api.post("/analyze-case/", payload);
  return data;
};

export const submitReport = async (payload) => {
  const { data } = await api.post("/submit-report/", payload);
  return data;
};

export const findNGOs = async (params) => {
  const { data } = await api.get("/ngos/", { params });
  return data;
};

export default api;
