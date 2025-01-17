import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:4242",
    headers: {
        "Content-Type": "application/json",
    },
});


export default axiosInstance;
