import { axiosInstance } from "../../lib/axios";

export const fetchUsersAPI = async () => {
  return await axiosInstance.get("/messages/users");
};

export const sendMessageAPI = async (receiverId, reqBody) => {
  return await axiosInstance.post(`/messages/send/${receiverId}`, reqBody);
};

export const getMessagesAPI = async (receiverId) => {
  return await axiosInstance.get(`/messages/${receiverId}`);
};
