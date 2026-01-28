export type DataSourcePullTargetType = 'DATA_SOURCE' | 'ENTITY'; // inferred from likely Prisma enum

export interface PullJob {
    id: number;
    targetType: DataSourcePullTargetType;
    targetId: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'; // Common status fields
    createdAt: string;
    finishedAt?: string;
    error?: string;
}

export interface CreatePullRequest {
    targetType: DataSourcePullTargetType;
    targetId: number;
}
