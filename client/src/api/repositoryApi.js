import axiosInstance from "./axiosInstance";

export const repositoryApi = {
  getAll: () => axiosInstance.get("/repositories"),
  getOne: (id) => axiosInstance.get(`/repositories/${id}`),
  delete: (id) => axiosInstance.delete(`/repositories/${id}`),
};
