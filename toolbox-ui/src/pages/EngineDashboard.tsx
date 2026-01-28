import { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Container } from '@mui/material';
import ConnectorStatusCards from '../components/engine/ConnectorStatusCards';
import DashboardStats from '../components/dashboard/DashboardStats';
import JobsListTable from '../components/engine/JobsListTable';
import { pisService } from '../services/pisService';
import { engineService } from '../services/engineService';
import { shopifyService } from '../services/shopifyService';
import type { DataSource } from '../types/pis.types';

import type { PullJob } from '../types/engine.types';

export default function EngineDashboard() {
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [jobs, setJobs] = useState<PullJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0 });


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Parallel Fetch
                const [dsData, shopifyStats] = await Promise.all([
                    pisService.getAllDataSources(),
                    shopifyService.getStats().catch(err => {
                        console.error("Failed to fetch shopify stats", err);
                        return { totalProducts: 0, totalOrders: 0 };
                    }),
                    Promise.resolve([]) // Mock for all jobs
                ]);

                setDataSources(dsData);
                setStats(shopifyStats);


                // Try to fetch jobs for the first available data source to show something
                if (dsData.length > 0) {
                    const firstDsJobs = await engineService.getPulls('DATA_SOURCE', dsData[0].id);
                    setJobs(firstDsJobs);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Mock stats based on loaded data
    const activeConnectors = dataSources.filter(d => d.active).length;

    return (
        <Container maxWidth="xl">

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight={700}>
                    Overview
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    Welcome back, Admin. Here's what's happening today.
                </Typography>
            </Box>

            <DashboardStats
                activeConnectors={activeConnectors}
                totalProducts={stats.totalProducts}
                totalOrders={stats.totalOrders}
            />


            <Box sx={{ mb: 5 }}>
                <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                    Integration Status
                </Typography>
                <ConnectorStatusCards dataSources={dataSources} />
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                    Recent Sync Activity
                </Typography>
                <JobsListTable jobs={jobs} />
            </Box>
        </Container>
    );
}
