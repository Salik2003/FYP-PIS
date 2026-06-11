import axios from 'axios';

const API_HOST = window.location.hostname;
const BASE = import.meta.env.VITE_ODOO_API_URL ?? `http://${API_HOST}:3002/api/odoo`;

export const odooService = {
    getProducts: async (): Promise<any[]> => {
        const res = await axios.get(`${BASE}/products/all`);
        return Array.isArray(res.data) ? res.data : [];
    },
    getOrders: async (): Promise<any[]> => {
        const res = await axios.get(`${BASE}/orders`, { params: { limit: 200 } });
        return Array.isArray(res.data) ? res.data : [];
    },
    getInventory: async (): Promise<any[]> => {
        const res = await axios.get(`${BASE}/inventory`, { params: { limit: 200 } });
        return Array.isArray(res.data) ? res.data : [];
    },
    getVariants: async (): Promise<any[]> => {
        const res = await axios.get(`${BASE}/variants`, { params: { limit: 200 } });
        return Array.isArray(res.data) ? res.data : [];
    },
    getInvoices: async (): Promise<any[]> => {
        const res = await axios.get(`${BASE}/invoices`);
        return Array.isArray(res.data) ? res.data : [];
    },
    getPurchaseOrders: async (): Promise<any[]> => {
        const res = await axios.get(`${BASE}/purchase-orders`);
        return Array.isArray(res.data) ? res.data : [];
    },
    getStats: async () => {
        const res = await axios.get(`${BASE}/stats`);
        return res.data as { totalProducts: number; totalOrders: number; connected: boolean };
    },
};
