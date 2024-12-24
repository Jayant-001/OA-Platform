import axiosInstance from "./axiosConfig";

const apiService = {
    get: async (url: string, config = { withCredentials: true }) => {
        const response = await axiosInstance.get(url, config);
        return response.data;
    },
    post: async (url: string, data: any, config = { withCredentials: true }) => {
        const response = await axiosInstance.post(url, data, config);
        return response.data;
    },
    put: async (url: string, data: any, config = { withCredentials: true }) => {
        const response = await axiosInstance.put(url, data, config);
        return response.data;
    },
    delete: async (url: string, config = { withCredentials: true }) => {
        const response = await axiosInstance.delete(url, config);
        return response.data;
    },
};

export default apiService;
