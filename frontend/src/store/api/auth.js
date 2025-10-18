import { axiosInstance } from "../../lib/axios";

export const registerAPI = async (reqBody) => {
  return await axiosInstance.post("/auth/signup", reqBody);
};

export const checkAuthAPI = async () => {
  return await axiosInstance.get("/auth/check");
};

export const loginAPI = async (reqBody) => {
  return await axiosInstance.post("/auth/login", reqBody);
};

export const logoutAPI = async () => {
  return await axiosInstance.post("/auth/logout");
};

export const updateProfileAPI = async (reqBody) => {
  return await axiosInstance.put("/auth/update-profile", reqBody);
};
