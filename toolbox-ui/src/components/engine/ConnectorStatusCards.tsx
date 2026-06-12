import { Box, Typography, Chip, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import shopifyIcon from '../../assets/shopify-icon.png';
import odooIcon from '../../assets/odoo-icon.png';
import type { DataSource } from '../../types/pis.types';

const DS_ICON: Record<string, string> = {
    'Shopify Store': shopifyIcon,
    'Odoo ERP': odooIcon,
};

export default function ConnectorStatusCards({ dataSources }: { dataSources: DataSource[] }) {
    return (
        <Grid container spacing={2}>
            {dataSources.map(ds => {
                const icon = DS_ICON[ds.name];
                return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ds.id}>
                        <Box sx={{
                            bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2,
                            p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            transition: 'box-shadow 0.2s',
                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.09)' },
                        }}>
                            {/* Logo or letter avatar */}
                            <Box sx={{ width: 44, height: 44, borderRadius: 1.5, flexShrink: 0, bgcolor: '#f8fafc', border: '1px solid #eef0f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {icon
                                    ? <img src={icon} alt={ds.name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                                    : <Typography sx={{ fontWeight: 700, fontSize: 16, color: ds.active ? '#059669' : '#dc2626' }}>{ds.name.charAt(0)}</Typography>
                                }
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{ds.name}</Typography>
                            </Box>
                            <Chip
                                icon={ds.active ? <CheckCircleIcon sx={{ fontSize: '13px !important' }} /> : <CancelIcon sx={{ fontSize: '13px !important' }} />}
                                label={ds.active ? 'Active' : 'Offline'}
                                size="small"
                                sx={{
                                    bgcolor: ds.active ? '#ecfdf5' : '#fef2f2',
                                    color: ds.active ? '#059669' : '#dc2626',
                                    border: `1px solid ${ds.active ? '#a7f3d0' : '#fca5a5'}`,
                                    fontWeight: 600, fontSize: 11.5,
                                    '& .MuiChip-icon': { color: 'inherit' },
                                }}
                            />
                        </Box>
                    </Grid>
                );
            })}
            {dataSources.length === 0 && (
                <Grid size={{ xs: 12 }}>
                    <Typography color="text.secondary" align="center" sx={{ py: 3, fontSize: 13.5 }}>
                        No connectors configured.
                    </Typography>
                </Grid>
            )}
        </Grid>
    );
}
