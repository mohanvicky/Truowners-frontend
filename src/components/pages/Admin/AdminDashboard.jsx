// AdminDashboard.jsx
import React, { useState } from 'react';
import {
  Box, Typography, AppBar, Toolbar, IconButton, Menu, MenuItem,
  Tabs, Tab, Drawer, BottomNavigation, BottomNavigationAction, Paper,
  Divider, useTheme
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  BookOnline as BookingsIcon,
  Logout as LogoutIcon,
  MoreVert as MoreVertIcon,  // <- Fixed import
  Menu as MenuIcon
} from '@mui/icons-material';

import { useAdminAuth } from '../../../context/AdminAuthContext';
import AnalyticsOverview from './AnalyticsOverview';
import UsersTab          from './UsersTab';
import PropertiesTab     from './PropertiesTab';
import BookingsTab       from './BookingsTab';

const navItems = [
  { label: 'Dashboard',  icon: <DashboardIcon /> },
  { label: 'Users',      icon: <PeopleIcon    /> },
  { label: 'Properties', icon: <HomeIcon      /> },
  { label: 'Bookings',   icon: <BookingsIcon  /> }
];

export default function AdminDashboard() {
  const { logout } = useAdminAuth();

  /* ───────── Responsive helpers ───────── */
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down('sm')); // <600 px
  const isTabletUp = !isMobile;

  /* ───────── Local state ───────── */
  const [tab,       setTab]       = useState(0);
  const [menuEl,    setMenuEl]    = useState(null);
  const [drawerOpen,setDrawerOpen]= useState(false);

  /* ───────── Handlers ───────── */
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleTabChange = (_e, newValue) => setTab(newValue);

  /* ───────── Render ───────── */
  return (
    <Box display="flex" flexDirection="column" height="100vh" width="100%">
      {/* ————— AppBar ————— */}
      <AppBar position="fixed" sx={{ bgcolor:'#1976d2' }}>
        <Toolbar sx={{ minHeight:{ xs:56, sm:64 } }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={()=>setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow:1 }}>
            Admin Dashboard
          </Typography>

          <IconButton color="inherit" onClick={e=>setMenuEl(e.currentTarget)}>
            <MoreVertIcon />  {/* <- Fixed usage */}
          </IconButton>
          <Menu
            anchorEl={menuEl}
            open={Boolean(menuEl)}
            onClose={()=>setMenuEl(null)}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr:1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ————— Side drawer (mobile) ————— */}
      <Drawer
        open={drawerOpen}
        onClose={()=>setDrawerOpen(false)}
        PaperProps={{ sx:{ width:240 } }}
      >
        <Box sx={{ mt:1 }}>
          {navItems.map((item, idx)=>(
            <Tab
              key={item.label}
              icon={item.icon}
              label={item.label}
              iconPosition="start"
              onClick={()=>{
                setTab(idx);
                setDrawerOpen(false);
              }}
              sx={{ justifyContent:'flex-start', textTransform:'none', px:3 }}
            />
          ))}
        </Box>
        <Divider/>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr:1 }}/> Logout
        </MenuItem>
      </Drawer>

      {/* ————— Spacer to push content below fixed bar ————— */}
      <Toolbar sx={{ minHeight:{ xs:56, sm:64 } }} />

      {/* ————— Optional top Tabs (tablet/desktop) ————— */}
      {isTabletUp && (
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {navItems.map(n=>(
            <Tab key={n.label} icon={n.icon} iconPosition="start" label={n.label}/>
          ))}
        </Tabs>
      )}

      {/* ————— Main content ————— */}
      <Box
        component="main"
        flex={1}
        overflow="auto"
        px={{ xs:1, md:3 }}
        py={3}
      >
        {tab===0 && <AnalyticsOverview />}
        {tab===1 && <UsersTab />}
        {tab===2 && <PropertiesTab />}
        {tab===3 && <BookingsTab />}
      </Box>

      {/* ————— Bottom nav (mobile) ————— */}
      {isMobile && (
        <Paper elevation={3}
               sx={{ position:'fixed', bottom:0, left:0, right:0 }}>
          <BottomNavigation
            showLabels
            value={tab}
            onChange={(_,newVal)=>setTab(newVal)}
          >
            {navItems.map(n=>(
              <BottomNavigationAction
                key={n.label}
                label={n.label}
                icon={n.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
