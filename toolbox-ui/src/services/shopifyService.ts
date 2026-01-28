import axios from 'axios';

const API_HOST = window.location.hostname;
const API_URL = `http://${API_HOST}:3000/api/shopify-api`; // Adjust base URL as needed




export interface ShopifyStats {
    totalProducts: number;
    totalOrders: number;
}

export const shopifyService = {
    getStats: async (): Promise<ShopifyStats> => {
        const response = await axios.get<ShopifyStats>(`${API_URL}/stats`);
        return response.data;
    },

    getProducts: async (): Promise<any[]> => {
        const response = await axios.get<any[]>(`${API_URL}/products`);
        return response.data;
    },

    getOrders: async (): Promise<any[]> => {
        const response = await axios.get<any[]>(`${API_URL}/orders`);
        return response.data;
    },


};
