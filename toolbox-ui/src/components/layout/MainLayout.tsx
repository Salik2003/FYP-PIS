import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthProvider';

const drawerWidth = 260;

export default function MainLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { logout } = useAuth();

    const currentWidth = collapsed ? 80 : drawerWidth;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapseToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'PIS', icon: <InventoryIcon />, path: '/pis' },
        { text: 'Admin', icon: <SettingsIcon />, path: '/admin' },
    ];

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', color: 'white', transition: 'width 0.3s' }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', px: [1], justifyContent: collapsed ? 'center' : 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
                    <InventoryIcon sx={{ mr: collapsed ? 0 : 1, color: '#4da5ff', flexShrink: 0 }} />
                    {!collapsed && (
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                            Toolbox
                        </Typography>
                    )}
                </Box>
                {/* Collapse Toggle inside Sidebar */}
                {!collapsed && (
                    <IconButton onClick={handleCollapseToggle} sx={{ color: 'rgba(255,255,255,0.7)', p: 0.5 }}>
                        <MenuIcon fontSize="small" />
                    </IconButton>
                )}
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <List sx={{ px: 2, pt: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    justifyContent: collapsed ? 'center' : 'initial',
                                    px: 2.5,
                                    bgcolor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: isActive ? '#4da5ff' : '#94a3b8',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        color: 'white'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 0, mr: collapsed ? 0 : 3, justifyContent: 'center' }}>
                                    {item.icon}
                                </ListItemIcon>
                                {!collapsed && <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
                                />}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <List sx={{ px: collapsed ? 1 : 2, pb: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, justifyContent: collapsed ? 'center' : 'initial', px: 2.5, color: '#94a3b8', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 0, mr: collapsed ? 0 : 3, justifyContent: 'center' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        {!collapsed && <ListItemText primary="Logout" />}
                    </ListItemButton>
                </ListItem>
            </List>
        </Box >
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${currentWidth}px)` },
                    ml: { sm: `${currentWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: 'none',
                    borderBottom: '1px solid #e2e8f0',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Collapsed Sidebar Toggle (when closed) - optional, or just rely on sidebar header one. 
                        Actually, when collapsed, the sidebar is small but visible. The header button is gone.
                        We need a way to expand it if the user wants. 
                        User asked to place toggle button INSIDE left menu. 
                        If it's collapsed, we show the icon in the sidebar header to toggle back?
                        Let's put the toggle on the InventoryIcon or a dedicated button in the sidebar header when collapsed.
                    */}
                    {collapsed && (
                        <IconButton
                            onClick={handleCollapseToggle}
                            sx={{ display: { xs: 'none', sm: 'inline-flex' }, mr: 2, color: 'text.secondary' }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}


                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                            {menuItems.find(i => i.path === location.pathname)?.text || 'Dashboard'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
                            Admin
                        </Typography>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                            sx={{ p: 0.5 }}
                        >
                            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, fontSize: '0.875rem' }}>A</Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: currentWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s' }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: currentWidth,
                            borderRight: 'none',
                            transition: 'width 0.3s',
                            overflowX: 'hidden'
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${currentWidth}px)` },
                    mt: 8,
                    transition: 'width 0.3s'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
