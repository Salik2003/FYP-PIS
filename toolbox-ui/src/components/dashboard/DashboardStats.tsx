import { Box, Typography, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                src?: string;
                trigger?: string;
                delay?: string;
                colors?: string;
            }, HTMLElement>;
        }
    }
}

interface KpiProps {
    label: string;
    value: string | number;
    lordSrc: string;
    accent: string;
    primaryColor: string;
    secondaryColor: string;
    trend?: string;
}

function KpiCard({ label, value, lordSrc, accent, primaryColor, secondaryColor, trend }: KpiProps) {
    return (
        <Box sx={{
            bgcolor: '#fff',
            borderRadius: 2.5,
            border: '1px solid #eef0f3',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'transform 0.18s, box-shadow 0.18s',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' },
        }}>
            {/* Colored top accent bar */}
            <Box sx={{ height: 3, bgcolor: accent }} />

            <Box sx={{ p: 2.5 }}>
                {/* Label + animated icon */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{
                        fontSize: 11.5, fontWeight: 600, color: '#94a3b8',
                        textTransform: 'uppercase', letterSpacing: '0.08em', pt: 0.5,
                    }}>
                        {label}
                    </Typography>
                    <Box sx={{
                        width: 48, height: 48,
                        borderRadius: 2,
                        bgcolor: `${accent}14`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <lord-icon
                            src={lordSrc}
                            trigger="loop"
                            delay="2500"
                            colors={`primary:${primaryColor},secondary:${secondaryColor}`}
                            style={{ width: '32px', height: '32px' }}
                        />
                    </Box>
                </Box>

                {/* Big number */}
                <Typography sx={{
                    fontSize: 32, fontWeight: 800, color: '#0f172a',
                    lineHeight: 1, mb: 1.5, letterSpacing: '-0.5px',
                }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>

                {/* Trend line */}
                {trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 13, color: accent }} />
                        <Typography sx={{ fontSize: 11.5, color: accent, fontWeight: 600 }}>
                            {trend}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default function DashboardStats({ totalProducts = 0, totalOrders = 0, activeConnectors = 0 }) {
    return (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <KpiCard
                    label="Total Products"
                    value={totalProducts}
                    lordSrc="https://cdn.lordicon.com/anwjdbhf.json"
                    accent="#2563eb"
                    primaryColor="#121331"
                    secondaryColor="#30c9e8"
                    trend="Synced from Shopify & Odoo"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <KpiCard
                    label="Total Orders"
                    value={totalOrders}
                    lordSrc="https://cdn.lordicon.com/slduhdil.json"
                    accent="#7c3aed"
                    primaryColor="#7c3aed"
                    secondaryColor="#c4b5fd"
                    trend="Tracked across channels"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <KpiCard
                    label="Active Connectors"
                    value={activeConnectors}
                    lordSrc="https://cdn.lordicon.com/xjugsqts.json"
                    accent="#059669"
                    primaryColor="#059669"
                    secondaryColor="#6ee7b7"
                    trend="Shopify · Odoo live"
                />
            </Grid>
        </Grid>
    );
}
