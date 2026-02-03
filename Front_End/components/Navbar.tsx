'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
    { name: 'Employés', href: '/employees', icon: <PeopleIcon /> },
    { name: 'Départements', href: '/departments', icon: <BusinessIcon /> },
    { name: 'Salaires', href: '/salaries', icon: <MoneyIcon /> },
    { name: 'Congés', href: '/leaves', icon: <CalendarIcon /> },
    { name: 'Présence', href: '/attendance', icon: <TimeIcon /> },
    { name: 'Promotions', href: '/promotions', icon: <TrendingIcon /> },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/dashboard"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            SGRH
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navigation.map((item) => (
              <Button
                key={item.name}
                component={Link}
                href={item.href}
                startIcon={item.icon}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  backgroundColor: pathname === item.href ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleMenu} sx={{ p: 0 }}>
              <Avatar alt={user?.username} src="/avatar.png" />
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
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
              <MenuItem disabled>
                <Typography textAlign="center">
                  {user?.username} ({user?.role})
                </Typography>
              </MenuItem>
              <MenuItem onClick={logout}>
                <Typography textAlign="center">Déconnexion</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;