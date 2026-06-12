import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, CssBaseline, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Typography, Avatar, Divider,
    IconButton, Tooltip, AppBar, Toolbar, Menu, MenuItem, Badge,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import GppGoodIcon from '@mui/icons-material/GppGood';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import logoIcon from '../../assets/PISync icon.png';
import { useAuth } from '../../context/AuthProvider';

const FULL = 230;
const MINI = 64;

const BRAND = '#0f2d52';
const ACCENT = '#4da5ff';
const HOVER = 'rgba(255,255,255,0.07)';
const ACTIVE = 'rgba(77,165,255,0.15)';

const ALL_NAV = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} />, path: '/',           roles: ['ADMIN','SALES','PRODUCTION','COMPLIANCE','R&D','USER'] },
    { text: 'PIS',       icon: <InventoryIcon sx={{ fontSize: 20 }} />, path: '/pis',         roles: ['ADMIN','SALES','PRODUCTION','R&D'] },
    { text: 'Compliance',icon: <GppGoodIcon sx={{ fontSize: 20 }} />,   path: '/compliance',  roles: ['ADMIN','PRODUCTION','COMPLIANCE'] },
    { text: 'Conflicts', icon: <CompareArrowsIcon sx={{ fontSize: 20 }} />, path: '/conflicts', roles: ['ADMIN','SALES','COMPLIANCE'] },
    { text: 'Finance',   icon: <AccountBalanceIcon sx={{ fontSize: 20 }} />, path: '/finance', roles: ['ADMIN','SALES'] },
    { text: 'Margins',   icon: <TrendingUpIcon sx={{ fontSize: 20 }} />, path: '/margins',    roles: ['ADMIN','SALES','R&D'] },
    { text: 'Users',     icon: <PeopleIcon sx={{ fontSize: 20 }} />,    path: '/admin',       roles: ['ADMIN'] },
];

export default function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    const NAV = ALL_NAV.filter(n => n.roles.includes(user?.role ?? 'USER'));
    const displayName = user?.name ?? 'User';
    const displayRole = user?.role ?? 'USER';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    const w = collapsed ? MINI : FULL;
    const activeLabel = NAV.find(n => n.path === location.pathname)?.text ?? 'Dashboard';

    /* ── sidebar content ───────────────────────────────────────── */
    const sidebarContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: BRAND, overflow: 'hidden' }}>

            {/* Logo row */}
            <Box sx={{
                height: 56, display: 'flex', alignItems: 'center',
                px: collapsed ? 0 : 2, justifyContent: collapsed ? 'center' : 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
            }}>
                {collapsed ? (
                    <Box sx={{ width: 32, height: 32 }}>
                        <img src={logoIcon} alt="PISync" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <img src={logoIcon} alt="PISync" style={{ height: 30, objectFit: 'contain' }} />
                            <Box>
                                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: 0.2 }}>PISync</Typography>
                                <Typography sx={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>Babylon x Purity Cosmetics</Typography>
                            </Box>
                        </Box>
                        <IconButton size="small" onClick={() => setCollapsed(true)}
                            sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff', bgcolor: HOVER }, borderRadius: 1.5 }}>
                            <ChevronLeftIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </>
                )}
            </Box>

            {/* Nav items */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, px: collapsed ? 0.75 : 1.5 }}>
                <List disablePadding>
                    {NAV.map(item => {
                        const active = location.pathname === item.path;
                        const btn = (
                            <ListItemButton
                                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                                sx={{
                                    borderRadius: 1.5, mb: 0.25, py: 0.85,
                                    px: collapsed ? 0 : 1.5,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    bgcolor: active ? ACTIVE : 'transparent',
                                    '&:hover': { bgcolor: active ? ACTIVE : HOVER },
                                    transition: 'background 0.15s',
                                    minHeight: 40,
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: active ? ACCENT : 'rgba(255,255,255,0.55)',
                                    minWidth: 0, mr: collapsed ? 0 : 1.5,
                                    justifyContent: 'center',
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                {!collapsed && (
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: 13.5, fontWeight: active ? 600 : 400,
                                            color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                                        }}
                                    />
                                )}
                                {active && !collapsed && (
                                    <Box sx={{ width: 3, height: 18, bgcolor: ACCENT, borderRadius: 2, ml: 'auto', flexShrink: 0 }} />
                                )}
                            </ListItemButton>
                        );
                        return (
                            <ListItem key={item.text} disablePadding>
                                {collapsed ? <Tooltip title={item.text} placement="right">{btn}</Tooltip> : btn}
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* User section */}
            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', px: collapsed ? 0.75 : 1.5, py: 1.25, flexShrink: 0 }}>
                {collapsed ? (
                    <Tooltip title="Logout" placement="right">
                        <IconButton onClick={() => { logout(); navigate('/login'); }}
                            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: HOVER }, width: '100%', borderRadius: 1.5, height: 40 }}>
                            <LogoutIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: ACCENT, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{avatarLetter}</Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#fff', lineHeight: 1.3 }} noWrap>{displayName}</Typography>
                            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>{displayRole}</Typography>
                        </Box>
                        <Tooltip title="Logout">
                            <IconButton size="small" onClick={() => { logout(); navigate('/login'); }}
                                sx={{ color: 'rgba(255,255,255,0.35)', '&:hover': { color: '#fff' }, flexShrink: 0 }}>
                                <LogoutIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f4f6f8' }}>
            <CssBaseline />

            {/* ── Desktop permanent sidebar ── */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: w,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: w,
                        border: 'none',
                        overflowX: 'hidden',
                        transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
                        boxSizing: 'border-box',
                    },
                    transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
                }}
            >
                {sidebarContent}
            </Drawer>

            {/* ── Mobile temporary sidebar ── */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: FULL, border: 'none' } }}
            >
                {sidebarContent}
            </Drawer>

            {/* ── Right side: top bar + content ── */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Top bar */}
                <AppBar position="static" elevation={0} sx={{
                    bgcolor: '#fff', borderBottom: '1px solid #e8ecf0',
                    color: 'text.primary', zIndex: 10, flexShrink: 0,
                }}>
                    <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, sm: 2.5 } }}>
                        {/* Mobile hamburger */}
                        <IconButton size="small" sx={{ mr: 1.5, display: { sm: 'none' } }} onClick={() => setMobileOpen(true)}>
                            <MenuIcon sx={{ fontSize: 20 }} />
                        </IconButton>

                        {/* Expand sidebar button (desktop, only when collapsed) */}
                        {collapsed && (
                            <IconButton size="small" sx={{ mr: 1.5, display: { xs: 'none', sm: 'inline-flex' } }}
                                onClick={() => setCollapsed(false)}>
                                <MenuIcon sx={{ fontSize: 20, color: '#64748b' }} />
                            </IconButton>
                        )}

                        {/* Breadcrumb */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography sx={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>PISync</Typography>
                            <Typography sx={{ fontSize: 12, color: '#cbd5e1' }}>/</Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{activeLabel}</Typography>
                        </Box>

                        <Box sx={{ flex: 1 }} />

                        {/* Right actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Notifications">
                                <IconButton size="small" sx={{ color: '#64748b' }} onClick={e => setNotifAnchor(e.currentTarget)}>
                                    <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 9, minWidth: 15, height: 15, p: 0 } }}>
                                        <NotificationsNoneIcon sx={{ fontSize: 20 }} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                anchorEl={notifAnchor}
                                open={Boolean(notifAnchor)}
                                onClose={() => setNotifAnchor(null)}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                PaperProps={{ sx: { mt: 0.5, width: 300, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', borderRadius: 2 } }}
                            >
                                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Notifications</Typography>
                                </Box>
                                {[
                                    { title: 'Shopify sync completed', sub: '1,357 products loaded from 100-pure', time: '2m ago', dot: '#059669' },
                                    { title: 'Odoo connector active', sub: 'Connected to Purity Cosmetics ERP', time: '15m ago', dot: '#2563eb' },
                                ].map((n, i) => (
                                    <MenuItem key={i} onClick={() => setNotifAnchor(null)} sx={{ px: 2, py: 1.5, alignItems: 'flex-start', gap: 1.5 }}>
                                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: n.dot, mt: 0.7, flexShrink: 0 }} />
                                        <Box>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>{n.title}</Typography>
                                            <Typography sx={{ fontSize: 11.5, color: '#94a3b8' }}>{n.sub}</Typography>
                                            <Typography sx={{ fontSize: 11, color: '#cbd5e1', mt: 0.3 }}>{n.time}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Menu>
                            <Divider orientation="vertical" flexItem sx={{ mx: 0.75, my: 1.5 }} />
                            <Box
                                onClick={e => setMenuAnchor(e.currentTarget)}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', px: 1, py: 0.5, borderRadius: 1.5, '&:hover': { bgcolor: '#f1f5f9' } }}
                            >
                                <Avatar sx={{ width: 28, height: 28, bgcolor: BRAND, fontSize: 11, fontWeight: 700 }}>{avatarLetter}</Avatar>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, display: { xs: 'none', sm: 'block' }, color: '#1e293b' }}>{displayName}</Typography>
                            </Box>
                            <Menu
                                anchorEl={menuAnchor}
                                open={Boolean(menuAnchor)}
                                onClose={() => setMenuAnchor(null)}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                PaperProps={{ sx: { mt: 0.5, minWidth: 160, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 2 } }}
                            >
                                <MenuItem onClick={() => { setMenuAnchor(null); navigate('/admin'); }} sx={{ fontSize: 13.5 }}>
                                    <PeopleIcon sx={{ fontSize: 16, mr: 1.5, color: '#64748b' }} /> User Management
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => { logout(); navigate('/login'); }} sx={{ fontSize: 13.5, color: '#ef4444' }}>
                                    <LogoutIcon sx={{ fontSize: 16, mr: 1.5 }} /> Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 2.5 } }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
