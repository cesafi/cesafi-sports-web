import { useMemo } from 'react';
import { useAllVolunteers } from './use-volunteers';
import { useAllDepartments } from './use-departments';
import { useAllSeasons } from './use-seasons';

export interface VolunteerMetrics {
  totalActiveVolunteers: number;
  totalDepartments: number;
  totalSeasons: number;
  volunteersByDepartment: Array<{
    departmentName: string;
    count: number;
  }>;
  volunteersBySeason: Array<{
    seasonYear: number;
    count: number;
  }>;
  averageVolunteersPerDepartment: number;
  averageVolunteersPerSeason: number;
  isLoading: boolean;
  error: string | null;
}

export function useVolunteerMetrics(): VolunteerMetrics {
  const { 
    data: volunteers, 
    isLoading: volunteersLoading, 
    error: volunteersError 
  } = useAllVolunteers();
  
  const { 
    data: departments, 
    isLoading: departmentsLoading, 
    error: departmentsError 
  } = useAllDepartments();
  
  const { 
    data: seasons, 
    isLoading: seasonsLoading, 
    error: seasonsError 
  } = useAllSeasons();

  const metrics = useMemo(() => {
    const isLoading = volunteersLoading || departmentsLoading || seasonsLoading;
    const error = volunteersError?.message || departmentsError?.message || seasonsError?.message || null;

    if (isLoading || !volunteers || !departments || !seasons) {
      return {
        totalActiveVolunteers: 0,
        totalDepartments: 0,
        totalSeasons: 0,
        volunteersByDepartment: [],
        volunteersBySeason: [],
        averageVolunteersPerDepartment: 0,
        averageVolunteersPerSeason: 0,
        isLoading,
        error
      };
    }

    // Filter active volunteers
    const activeVolunteers = volunteers.filter(volunteer => volunteer.is_active !== false);
    
    // Calculate total active volunteers
    const totalActiveVolunteers = activeVolunteers.length;
    
    // Calculate total departments
    const totalDepartments = departments.length;
    
    // Calculate total seasons
    const totalSeasons = seasons.length;

    // Group volunteers by department
    const volunteersByDepartment = departments.map(department => {
      const count = activeVolunteers.filter(
        volunteer => volunteer.department_id === department.id
      ).length;
      return {
        departmentName: department.name,
        count
      };
    }).filter(dept => dept.count > 0); // Only include departments with volunteers

    // Group volunteers by season
    const volunteersBySeason = seasons.map(season => {
      const count = activeVolunteers.filter(
        volunteer => volunteer.season_id === season.id
      ).length;
      return {
        seasonYear: new Date(season.start_at).getFullYear(),
        count
      };
    }).filter(season => season.count > 0); // Only include seasons with volunteers

    // Calculate averages
    const averageVolunteersPerDepartment = volunteersByDepartment.length > 0 
      ? Math.round((totalActiveVolunteers / volunteersByDepartment.length) * 10) / 10
      : 0;
    
    const averageVolunteersPerSeason = volunteersBySeason.length > 0
      ? Math.round((totalActiveVolunteers / volunteersBySeason.length) * 10) / 10
      : 0;

    return {
      totalActiveVolunteers,
      totalDepartments,
      totalSeasons,
      volunteersByDepartment,
      volunteersBySeason,
      averageVolunteersPerDepartment,
      averageVolunteersPerSeason,
      isLoading,
      error
    };
  }, [volunteers, departments, seasons, volunteersLoading, departmentsLoading, seasonsLoading, volunteersError, departmentsError, seasonsError]);

  return metrics;
}

