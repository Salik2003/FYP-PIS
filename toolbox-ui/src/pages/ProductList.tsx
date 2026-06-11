import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel, Button, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import shopifyIcon from '../assets/shopify-icon.png';
import odooIcon from '../assets/odoo-icon.png';
import { pisService } from '../services/pisService';
import { shopifyService } from '../services/shopifyService';
import { odooService } from '../services/odooService';
import type { DataSource, DataSourceEntity } from '../types/pis.types';
import EntityDataGrid from '../components/pis/EntityDataGrid';

// Default entities for known sources — shown even before a real sync
const DEFAULT_ENTITIES: Record<string, Array<{ id: number; name: string }>> = {
    'Shopify Store': [
        { id: -1, name: 'Product' },
        { id: -2, name: 'Order' },
    ],
    'Odoo ERP': [
        { id: -10, name: 'Product' },
        { id: -11, name: 'Inventory' },
        { id: -12, name: 'Sales Order' },
    ],
};

const DS_ICON: Record<string, string> = {
    'Shopify Store': shopifyIcon,
    'Odoo ERP': odooIcon,
};

export default function ProductList() {
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [selectedDsId, setSelectedDsId] = useState<number | ''>('');
    const [entities, setEntities] = useState<Array<{ id: number; name: string }>>([]);
    const [selectedEntityId, setSelectedEntityId] = useState<number | ''>('');
    const [selectedEntityName, setSelectedEntityName] = useState('');
    const [entityData, setEntityData] = useState<any[]>([]);
    const [loadingEntities, setLoadingEntities] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Load data sources
    useEffect(() => {
        pisService.getAllDataSources().then(ds => {
            setDataSources(ds);
            if (ds.length > 0) setSelectedDsId(ds[0].id);
        }).catch(console.error);
    }, []);

    // Load entities when DS changes
    useEffect(() => {
        if (!selectedDsId) return;
        setLoadingEntities(true);
        setEntityData([]);
        setSelectedEntityId('');
        setSelectedEntityName('');

        const dsName = dataSources.find(d => d.id === Number(selectedDsId))?.name ?? '';

        pisService.getEntities(Number(selectedDsId)).then(ents => {
            const resolved = ents.length > 0
                ? ents.map((e: DataSourceEntity) => ({ id: e.id, name: e.name }))
                : (DEFAULT_ENTITIES[dsName] ?? []);

            setEntities(resolved);
            if (resolved.length > 0) {
                setSelectedEntityId(resolved[0].id);
                setSelectedEntityName(resolved[0].name);
            }
        }).catch(() => {
            const fallback = DEFAULT_ENTITIES[dsName] ?? [];
            setEntities(fallback);
            if (fallback.length > 0) { setSelectedEntityId(fallback[0].id); setSelectedEntityName(fallback[0].name); }
        }).finally(() => setLoadingEntities(false));
    }, [selectedDsId, dataSources]);

    // Load data when entity or refresh changes
    useEffect(() => {
        if (!selectedEntityName || !selectedDsId) return;

        const dsName = dataSources.find(d => d.id === Number(selectedDsId))?.name ?? '';
        const entityLower = selectedEntityName.toLowerCase();

        setLoadingData(true);
        setEntityData([]);

        let fetchPromise: Promise<any[]>;

        if (dsName === 'Shopify Store') {
            fetchPromise = entityLower === 'product'
                ? shopifyService.getProducts()
                : shopifyService.getOrders();
        } else if (dsName === 'Odoo ERP') {
            fetchPromise = entityLower === 'product'
                ? odooService.getProducts()
                : entityLower === 'inventory'
                    ? odooService.getInventory()
                    : odooService.getOrders();
        } else {
            fetchPromise = pisService.getEntityData(Number(selectedEntityId)).then((res: any) =>
                Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
            );
        }

        fetchPromise
            .then(data => setEntityData(Array.isArray(data) ? data : []))
            .catch(err => { console.error('Data fetch error', err); setEntityData([]); })
            .finally(() => setLoadingData(false));
    }, [selectedEntityId, selectedEntityName, refreshKey]);

    const selectedDs = dataSources.find(d => d.id === Number(selectedDsId));
    const dsIcon = selectedDs ? DS_ICON[selectedDs.name] : undefined;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', gap: 2 }}>

            {/* Toolbar */}
            <Box sx={{
                bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2,
                px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexWrap: 'wrap',
            }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1e293b', mr: 0.5 }}>PIS</Typography>

                {/* DS selector */}
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ fontSize: 13 }}>Data Source</InputLabel>
                    <Select
                        label="Data Source"
                        value={selectedDsId}
                        onChange={e => setSelectedDsId(Number(e.target.value))}
                        sx={{ fontSize: 13, borderRadius: 1.5 }}
                        renderValue={val => {
                            const ds = dataSources.find(d => d.id === Number(val));
                            if (!ds) return '';
                            const ic = DS_ICON[ds.name];
                            return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {ic && <img src={ic} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />}
                                    <span>{ds.name}</span>
                                </Box>
                            );
                        }}
                    >
                        {dataSources.map(ds => (
                            <MenuItem key={ds.id} value={ds.id} sx={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {DS_ICON[ds.name] && <img src={DS_ICON[ds.name]} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />}
                                {ds.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Entity selector */}
                <FormControl size="small" sx={{ minWidth: 150 }} disabled={loadingEntities}>
                    <InputLabel sx={{ fontSize: 13 }}>Entity</InputLabel>
                    <Select
                        label="Entity"
                        value={selectedEntityId}
                        onChange={e => {
                            const id = Number(e.target.value);
                            setSelectedEntityId(id);
                            setSelectedEntityName(entities.find(en => en.id === id)?.name ?? '');
                        }}
                        sx={{ fontSize: 13, borderRadius: 1.5 }}
                    >
                        {entities.map(ent => (
                            <MenuItem key={ent.id} value={ent.id} sx={{ fontSize: 13 }}>{ent.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Status badge */}
                {selectedDs && (
                    <Chip size="small" label={selectedDs.active ? 'Connected' : 'Offline'}
                        sx={{
                            bgcolor: selectedDs.active ? '#ecfdf5' : '#fef2f2',
                            color: selectedDs.active ? '#059669' : '#dc2626',
                            border: `1px solid ${selectedDs.active ? '#a7f3d0' : '#fca5a5'}`,
                            fontWeight: 600, fontSize: 11.5,
                        }}
                    />
                )}

                <Box sx={{ flex: 1 }} />

                {entityData.length > 0 && (
                    <Box sx={{ px: 1.5, py: 0.4, bgcolor: '#f1f5f9', borderRadius: 1, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        {entityData.length.toLocaleString()} records
                    </Box>
                )}

                <Button size="small" variant="outlined"
                    startIcon={loadingData ? <CircularProgress size={13} color="inherit" /> : <RefreshIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setRefreshKey(k => k + 1)}
                    disabled={loadingData || !selectedEntityId}
                    sx={{ fontSize: 13, textTransform: 'none', color: '#64748b', borderColor: '#e2e8f0', borderRadius: 1.5 }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Data grid */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
                <EntityDataGrid
                    data={entityData}
                    loading={loadingData}
                    entityName={selectedEntityName}
                    sourceType={selectedDs?.name === 'Odoo ERP' ? 'odoo' : 'shopify'}
                />
            </Box>
        </Box>
    );
}
