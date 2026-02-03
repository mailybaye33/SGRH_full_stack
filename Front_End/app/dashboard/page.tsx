'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import Link from 'next/link';

const DashboardCard = ({ 
  title, 
  description, 
  href, 
  color = 'primary' 
}: { 
  title: string; 
  description: string; 
  href: string; 
  color?: string; 
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h5" component="div" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small" component={Link} href={href}>
        Accéder
      </Button>
    </CardActions>
  </Card>
);

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Container>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenue, {user?.username} ! Rôle: {user?.role}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Gestion des Employés"
            description="Ajouter, modifier et gérer les employés"
            href="/employees"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Départements"
            description="Organiser les départements de l'entreprise"
            href="/departments"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Gestion des Salaires"
            description="Calcul et suivi des salaires"
            href="/salaries"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Congés"
            description="Demandes et validation de congés"
            href="/leaves"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Présence"
            description="Suivi des heures de travail"
            href="/attendance"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Promotions"
            description="Suivi des évolutions professionnelles"
            href="/promotions"
          />
        </Grid>
      </Grid>
    </Container>
  );
}