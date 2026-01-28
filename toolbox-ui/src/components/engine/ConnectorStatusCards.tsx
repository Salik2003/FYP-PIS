import { Card, CardContent, Typography, Box, Grid, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { DataSource } from '../../types/pis.types';

interface ConnectorStatusCardsProps {
    dataSources: DataSource[];
}

export default function ConnectorStatusCards({ dataSources }: ConnectorStatusCardsProps) {
    return (
        <Grid container spacing={3}>
            {dataSources.map((ds) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={ds.id}>
                    <Card elevation={0} sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        transition: 'box-shadow 0.3s',
                        '&:hover': {
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                        }
                    }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: ds.active ? '#ecfdf5' : '#fef2f2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Typography variant="h6" sx={{ color: ds.active ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                                        {ds.name.charAt(0)}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={ds.active ? 'Active' : 'Disconnected'}
                                    size="small"
                                    color={ds.active ? 'success' : 'error'}
                                    sx={{
                                        bgcolor: ds.active ? '#ecfdf5' : '#fef2f2',
                                        color: ds.active ? '#059669' : '#dc2626',
                                        fontWeight: 600,
                                        borderRadius: 1
                                    }}
                                />
                            </Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {ds.name}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}

            {dataSources.length === 0 && (
                <Grid size={{ xs: 12 }}>
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        No connectors configured. Add a new data source to get started.
                    </Typography>
                </Grid>
            )}
        </Grid>
    );
}
