import axiosClient from '../api/axiosClient';

export interface ComplianceRecord {
  id: number;
  productSku: string;
  productName: string;
  regulation: string;
  status: 'COMPLIANT' | 'UNDER_REVIEW' | 'NON_COMPLIANT';
  auditDate: string;
  nextAudit?: string;
  notes?: string;
  auditedBy: string;
  createdAt: string;
}

export interface ComplianceStats {
  compliant: number;
  underReview: number;
  nonCompliant: number;
  total: number;
}

export const complianceService = {
  getAll: (sku?: string): Promise<ComplianceRecord[]> => {
    const params = sku ? { sku } : {};
    return axiosClient.get('/compliance', { params }).then(r => r.data);
  },
  getStats: (): Promise<ComplianceStats> =>
    axiosClient.get('/compliance/stats').then(r => r.data),
};
