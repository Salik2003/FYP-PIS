import axiosClient from '../api/axiosClient';
import type { PullJob, CreatePullRequest, DataSourcePullTargetType } from '../types/engine.types';

export const engineService = {
    getPulls: async (targetType: DataSourcePullTargetType, targetId: number) => {
        const response = await axiosClient.get<PullJob[]>('/data_source_pulls', {
            params: { targetType, targetId }
        });
        return response.data;
    },

    createPull: async (data: CreatePullRequest) => {
        const response = await axiosClient.post<PullJob>('/data_source_pulls', data);
        return response.data;
    },

    getPullById: async (id: number) => {
        const response = await axiosClient.get<PullJob>(`/data_source_pulls/${id}`);
        return response.data;
    }
};
