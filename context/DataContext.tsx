// context/DataContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Team, Actividad, Games } from '@/types';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

type DataContextType = {
  teams: Team[];
  activities: Actividad[];
  games: Games[],
  loading: boolean;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType>({
  teams: [],
  activities: [],
  games: [],
  loading: true,
  refreshData: async () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [activities, setActivities] = useState<Actividad[]>([]);
  const [games, setGames] = useState<Games[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const teamsRef = collection(db, "Teams");
      const q = query(teamsRef, orderBy("score", "desc"));
      const querySnapshot = await getDocs(q);
      
      const teamData: Team[] = [];
      querySnapshot.forEach(doc => {
        teamData.push({
          id: doc.id, 
          name: doc.data().name, 
          score: doc.data().score,
          trend: doc.data().trend
        });
      });
      setTeams(teamData);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);      
      const querySnapshot = await getDocs(collection(db, "Activities"));
      const acts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        titulo: doc.data().titulo,
        fecha: doc.data().fecha,
        hora: doc.data().hora,
        lugar: doc.data().lugar,
        tipo: doc.data().tipo,
        tipoCompetencia: doc.data().tipoCompetencia,
        enfrentamientos: doc.data().enfrentamientos || [],
        grupos: doc.data().grupos || [],
      }));

      setActivities(acts);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);      
      const querySnapshot = await getDocs(collection(db, "Games"));
      const acts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        calificacion: doc.data().calificacion,
        jugado: doc.data().jugado
      }));

      setGames(acts);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have data
    if (teams.length === 0) {
      fetchTeams();
    }
    if (activities.length === 0) {
      fetchActivities();
    }
    if (games.length === 0) {
      fetchGames();
    }
  }, []);

  const refreshData = async () => {
    await Promise.all([fetchTeams(), fetchActivities(), fetchGames()]);
  };  

  return (
    <DataContext.Provider value={{ teams, activities, games, loading, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);