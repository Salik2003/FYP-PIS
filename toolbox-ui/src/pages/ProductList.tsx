import { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Breadcrumbs,
    Link as MuiLink
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { pisService } from '../services/pisService';
import { shopifyService } from '../services/shopifyService';
import type { DataSource, DataSourceEntity } from '../types/pis.types';
import EntityDataGrid from '../components/pis/EntityDataGrid';

export default function ProductList() {
    // State
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [selectedDsId, setSelectedDsId] = useState<number | string>('');

    const [entities, setEntities] = useState<DataSourceEntity[]>([]);
    const [selectedEntityId, setSelectedEntityId] = useState<number | string>('');
    const [selectedEntityName, setSelectedEntityName] = useState<string>('');

    const [entityData, setEntityData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [dataLoading, setDataLoading] = useState<boolean>(false);

    // Fetch Data Sources on mount
    useEffect(() => {
        const fetchDataSources = async () => {
            try {
                const ds = await pisService.getAllDataSources();
                setDataSources(ds);
                if (ds.length > 0) {
                    setSelectedDsId(ds[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch data sources", error);
            }
        };
        fetchDataSources();
    }, []);

    // Fetch Entities when DS is selected
    useEffect(() => {
        if (!selectedDsId) return;

        const fetchEntities = async () => {
            setLoading(true);
            try {
                const ents = await pisService.getEntities(Number(selectedDsId));
                setEntities(ents);

                if (ents.length > 0) {
                    setSelectedEntityId(ents[0].id);
                    setSelectedEntityName(ents[0].name || `Entity ${ents[0].id}`);
                } else {
                    setSelectedEntityId('');
                    setSelectedEntityName('');
                    setEntityData([]);
                }
            } catch (error) {
                console.error("Failed to fetch entities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntities();
    }, [selectedDsId]);

    // Fetch Data when Entity is selected
    useEffect(() => {
        if (!selectedEntityId) return;

        const fetchData = async () => {
            setDataLoading(true);
            try {
                // Check if we are looking at Shopify's Product or Order entity
                const ds = dataSources.find(ds => ds.id === Number(selectedDsId));
                const isShopify = ds?.name === 'Shopify Store';
                const isProduct = selectedEntityName.toLowerCase() === 'product';
                const isOrder = selectedEntityName.toLowerCase() === 'order';

                let response: any;

                if (isShopify && isProduct) {
                    const products = await shopifyService.getProducts();
                    response = { data: products };
                } else if (isShopify && isOrder) {
                    const orders = await shopifyService.getOrders();
                    response = { data: orders };
                } else {
                    response = await pisService.getEntityData(Number(selectedEntityId));
                }

                if (response && Array.isArray(response.data)) {
                    setEntityData(response.data);
                } else {
                    setEntityData([]);
                }
            } catch (error) {
                console.error("Failed to fetch entity data", error);
                setEntityData([]);
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [selectedEntityId]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: 2 }}>
            {/* Top Navigation / Selection Bar */}
            <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Typography variant="h6" sx={{ fontWeight: 700, mr: 2, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ color: 'primary.main' }}>PIS</Box>
                    </Typography>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel id="ds-select-label" sx={{ fontSize: '0.875rem' }}>Data Source</InputLabel>
                        <Select
                            labelId="ds-select-label"
                            label="Data Source"
                            value={selectedDsId}
                            onChange={(e) => setSelectedDsId(e.target.value)}
                            sx={{ borderRadius: 1.5, bgcolor: '#f8fafc', '& .MuiSelect-select': { py: 1 } }}
                        >
                            {dataSources.map((ds) => (
                                <MenuItem key={ds.id} value={ds.id}>{ds.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }} disabled={loading}>
                        <InputLabel id="ent-select-label" sx={{ fontSize: '0.875rem' }}>Entity</InputLabel>
                        <Select
                            labelId="ent-select-label"
                            label="Entity"
                            value={selectedEntityId}
                            onChange={(e) => {
                                const id = e.target.value;
                                setSelectedEntityId(id);
                                const ent = entities.find(en => en.id === Number(id));
                                setSelectedEntityName(ent?.name || '');
                            }}
                            sx={{ borderRadius: 1.5, bgcolor: '#f8fafc', '& .MuiSelect-select': { py: 1 } }}
                        >
                            {entities.map((ent) => (
                                <MenuItem key={ent.id} value={ent.id}>{ent.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Optional Right Side Stats or Actions could go here */}
                </Stack>
            </Paper>

            {/* Main Panel: Data Grid */}
            <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
                <EntityDataGrid
                    data={entityData}
                    loading={dataLoading}
                    entityName={selectedEntityName}
                />
            </Box>
        </Box>
    );
}

