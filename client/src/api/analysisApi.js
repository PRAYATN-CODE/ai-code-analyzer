import axiosInstance from "./axiosInstance";

export const analysisApi = {
  submitGithub: (data) => axiosInstance.post("/analysis/github", data),
  submitSnippet: (data) => axiosInstance.post("/analysis/snippet", data),
  getStatus: (jobId) => axiosInstance.get(`/analysis/status/${jobId}`),
  getReport: (jobId) => axiosInstance.get(`/analysis/report/${jobId}`),
  getHistory: (params) => axiosInstance.get("/analysis/history", { params }),
  deleteReport: (jobId) => axiosInstance.delete(`/analysis/report/${jobId}`),
};
