import { Paper, Box, Typography, Grid } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LinkIcon from '@mui/icons-material/Link';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    gradient: string;
}

function StatCard({ title, value, icon, gradient }: StatCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 4,
                background: gradient,
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }
            }}
        >
            <Box sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                mr: 2.5,
                display: 'flex',
                backdropFilter: 'blur(4px)'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: 'white', letterSpacing: '-0.5px' }}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );
}

export default function DashboardStats({ totalProducts = 0, totalOrders = 0, activeConnectors = 0 }) {
    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                    title="Total Products"
                    value={totalProducts}
                    icon={<ShoppingBagIcon fontSize="large" />}
                    gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" // Blue gradient
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                    title="Total Orders"
                    value={totalOrders}
                    icon={<ReceiptIcon fontSize="large" />}
                    gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" // Violet gradient
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                    title="Active Connectors"
                    value={activeConnectors}
                    icon={<LinkIcon fontSize="large" />}
                    gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" // Emerald gradient
                />
            </Grid>
        </Grid>
    );
}
