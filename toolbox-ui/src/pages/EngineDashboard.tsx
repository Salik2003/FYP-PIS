import { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Chip, Divider } from '@mui/material';
import ConnectorStatusCards from '../components/engine/ConnectorStatusCards';
import DashboardStats from '../components/dashboard/DashboardStats';
import { pisService } from '../services/pisService';
import { shopifyService } from '../services/shopifyService';
import { auditService, type AuditLog } from '../services/auditService';
import type { DataSource } from '../types/pis.types';

const ACTION_STYLE: Record<string, { bg: string; color: string }> = {
    SYNC:   { bg: '#eff6ff', color: '#2563eb' },
    CREATE: { bg: '#f0fdf4', color: '#16a34a' },
    UPDATE: { bg: '#fffbeb', color: '#d97706' },
    DELETE: { bg: '#fef2f2', color: '#dc2626' },
};

export default function EngineDashboard() {
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0 });

    useEffect(() => {
        Promise.all([
            pisService.getAllDataSources(),
            shopifyService.getStats().catch(() => ({ totalProducts: 0, totalOrders: 0 })),
            auditService.getAll(10),
        ]).then(([ds, st, logs]) => {
            setDataSources(ds);
            setStats(st);
            setAuditLogs(logs);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><CircularProgress size={32} /></Box>;
    }

    const activeConnectors = dataSources.filter(d => d.active).length;

    return (
        <Box>
            {/* Page header */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1e293b', mb: 0.3 }}>Dashboard</Typography>
                <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>
                    Welcome back, Admin — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Typography>
            </Box>

            {/* KPI cards */}
            <DashboardStats activeConnectors={activeConnectors} totalProducts={stats.totalProducts} totalOrders={stats.totalOrders} />

            {/* Integration status */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#374151' }}>Integration Status</Typography>
                    <Typography sx={{ fontSize: 11.5, color: '#94a3b8' }}>{activeConnectors} of {dataSources.length} active</Typography>
                </Box>
                <ConnectorStatusCards dataSources={dataSources} />
            </Box>

            {/* Recent activity */}
            <Box>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#374151', mb: 1.5 }}>Recent Sync Activity</Typography>
                <Box sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    {/* Table header */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '100px 100px 1fr 120px 150px', px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' }}>
                        {['ACTION', 'ENTITY', 'DESCRIPTION', 'BY', 'TIME'].map(h => (
                            <Typography key={h} sx={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.7 }}>{h}</Typography>
                        ))}
                    </Box>
                    {auditLogs.map((log, i) => {
                        const style = ACTION_STYLE[log.action] ?? { bg: '#f3f4f6', color: '#374151' };
                        return (
                            <Box key={log.id}>
                                <Box sx={{
                                    display: 'grid', gridTemplateColumns: '100px 100px 1fr 120px 150px',
                                    px: 2.5, py: 1.5, alignItems: 'center',
                                    '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.12s',
                                }}>
                                    <Box>
                                        <Box component="span" sx={{
                                            display: 'inline-block', px: 1, py: 0.3,
                                            bgcolor: style.bg, color: style.color,
                                            borderRadius: 1, fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                                        }}>
                                            {log.action}
                                        </Box>
                                    </Box>
                                    <Typography sx={{ fontSize: 13, color: '#475569' }}>{log.entity}</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#334155' }} noWrap>{log.description}</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>{log.performedBy}</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                                        {new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                                {i < auditLogs.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                            </Box>
                        );
                    })}
                    {auditLogs.length === 0 && (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: 13.5, color: '#94a3b8' }}>No sync activity yet.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
