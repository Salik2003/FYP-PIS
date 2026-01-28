import axiosClient from '../api/axiosClient';
import type { DataSource, CreateDataSourceRequest, DataSourceEntity, DataSourceData } from '../types/pis.types';

export const pisService = {
    // --- Data Sources ---
    getAllDataSources: async () => {
        const response = await axiosClient.get<DataSource[]>('/data_sources');
        return response.data;
    },

    getDataSourceById: async (id: number) => {
        const response = await axiosClient.get<DataSource>(`/data_sources/${id}`);
        return response.data;
    },

    createDataSource: async (data: CreateDataSourceRequest) => {
        const response = await axiosClient.post<DataSource>('/data_sources', data);
        return response.data;
    },

    updateDataSource: async (id: number, data: Partial<CreateDataSourceRequest>) => {
        const response = await axiosClient.put<DataSource>(`/data_sources/${id}`, data);
        return response.data;
    },

    deleteDataSource: async (id: number) => {
        return await axiosClient.delete(`/data_sources/${id}`);
    },

    // --- Entities ---
    getEntities: async (dataSourceId: number) => {
        const response = await axiosClient.get<DataSourceEntity[]>(`/data_source_entities`, {
            params: { dataSourceId }
        });
        return response.data;
    },

    // --- Data (Actual Product Rows) ---
    getEntityData: async (entityId: number) => {
        // Determine return type based on backend response structure (likely array of records)
        const response = await axiosClient.get<DataSourceData[] | Record<string, any>[]>(`/data_source_data`, {
            params: { entityId }
        });
        return response.data;
    }
};
