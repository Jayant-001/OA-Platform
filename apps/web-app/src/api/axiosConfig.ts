import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_BASE_URL;
const axiosInstance = axios.create({
    baseURL: SERVER_URL || "http://localhost:4242",
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
    },
});


export default axiosInstance;
