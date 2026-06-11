import axiosClient from '../api/axiosClient';

export interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export const auditService = {
  getAll: (limit = 50): Promise<AuditLog[]> =>
    axiosClient.get('/audit-logs', { params: { limit } }).then(r => r.data),
};
