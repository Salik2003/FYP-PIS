import axios, { AxiosError, type AxiosInstance } from "axios";

const getToken = () => localStorage.getItem("access_token");

const toolboxEngineAPI: AxiosInstance = axios.create({
    baseURL: "http://localhost:3003",
    timeout: 3000,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// ✅ Add request interceptor to dynamically add token
toolboxEngineAPI.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Handle 401 errors globally
toolboxEngineAPI.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export { toolboxEngineAPI };
