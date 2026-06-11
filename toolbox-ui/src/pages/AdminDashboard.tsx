import { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Divider, Avatar } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { usersService, type AppUser } from '../services/usersService';

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
    ADMIN:      { bg: '#eff6ff', color: '#2563eb' },
    SALES:      { bg: '#f0fdf4', color: '#16a34a' },
    PRODUCTION: { bg: '#fffbeb', color: '#d97706' },
    COMPLIANCE: { bg: '#f5f3ff', color: '#7c3aed' },
    RD:         { bg: '#fff1f2', color: '#e11d48' },
};

function RoleBadge({ role }: { role: string }) {
    const s = ROLE_STYLE[role] ?? { bg: '#f3f4f6', color: '#374151' };
    return (
        <Box sx={{ display: 'inline-block', px: 1.2, py: 0.35, bgcolor: s.bg, borderRadius: 1, fontSize: 11.5, fontWeight: 700, color: s.color, letterSpacing: 0.3 }}>
            {role}
        </Box>
    );
}

function StatusDot({ status }: { status: string }) {
    const active = status === 'ACTIVE';
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.7 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: active ? '#22c55e' : '#94a3b8' }} />
            <Typography sx={{ fontSize: 12.5, color: active ? '#16a34a' : '#94a3b8' }}>{active ? 'Active' : 'Inactive'}</Typography>
        </Box>
    );
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        usersService.getAll().then(setUsers).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><CircularProgress size={32} /></Box>;
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <PeopleIcon sx={{ color: '#2563eb', mt: 0.2, fontSize: 22 }} />
                <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1e293b', mb: 0.3 }}>User Management</Typography>
                    <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>{users.length} users registered in the system</Typography>
                </Box>
            </Box>

            {/* Table card */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {/* Toolbar */}
                <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3', display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#374151' }}>
                        System Users
                        <Box component="span" sx={{ ml: 1, px: 1, py: 0.3, bgcolor: '#e2e8f0', borderRadius: 1, fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                            {users.length}
                        </Box>
                    </Typography>
                </Box>

                {/* Column headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 2fr 1fr 1fr 1fr 1.5fr', px: 2.5, py: 1.2, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' }}>
                    {['User', 'Email', 'Department', 'Role', 'Status', 'Last Login'].map(h => (
                        <Typography key={h} sx={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</Typography>
                    ))}
                </Box>

                {/* Rows */}
                {users.map((u, i) => (
                    <Box key={u.id}>
                        <Box sx={{
                            display: 'grid', gridTemplateColumns: '2.5fr 2fr 1fr 1fr 1fr 1.5fr',
                            px: 2.5, py: 1.5, alignItems: 'center',
                            '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.12s',
                        }}>
                            {/* Name + avatar */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: ROLE_STYLE[u.role]?.bg ?? '#f3f4f6', color: ROLE_STYLE[u.role]?.color ?? '#374151', fontSize: 13, fontWeight: 700 }}>
                                    {u.name?.charAt(0) ?? u.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>{u.name}</Typography>
                                    <Typography sx={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1 }}>@{u.username}</Typography>
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: 13, color: '#475569' }} noWrap>{u.email}</Typography>
                            <Typography sx={{ fontSize: 13, color: '#64748b' }}>{u.department}</Typography>
                            <Box><RoleBadge role={u.role} /></Box>
                            <Box><StatusDot status={u.status} /></Box>
                            <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                                {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </Typography>
                        </Box>
                        {i < users.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                    </Box>
                ))}

                {users.length === 0 && (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <PeopleIcon sx={{ fontSize: 36, color: '#e2e8f0', mb: 1 }} />
                        <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>No users found.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
