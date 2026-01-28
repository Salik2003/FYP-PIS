import axios from "axios";

export default function handleAxiosError(error: any): string {
    if (axios.isAxiosError(error) && error.response) {
        return error.response.data.message;
    }
    if (error.response) {
        return error.response.data.message || error.response.statusText;
    } else {
        return error.message || "An unexpected error occurred";
    }
}