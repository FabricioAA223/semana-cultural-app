"use client"; // Añadir esto al inicio de tu archivo

import styled from 'styled-components';
import { Team } from '../types';
import { FaTshirt as ShirtIcon } from 'react-icons/fa';
import { useData } from '@/context/DataContext';

// Styled components
const Container = styled.div`
  padding: 0 10px;
  min-height: 100vh;
  background-color: #222;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  border-radius: 10px;
`;

const Item = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #555;
  margin: 5px 0;
  border-radius: 5px;
  justify-content: space-between;
  align-items: center;
  height: 70px
`;

const ItemPos = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
  align-content: center;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  text-align: center;
  margin: auto 0;
  color: #fff;
  width: 10%;
  background-color: #555;
  height: 100%
`;

const TeamInfo = styled.div<{ bgColor?: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #555;
  width: 63%;
  height: 100%
`;

const TeamRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const ItemText = styled.div`
  font-size: 1.125rem;
  font-weight: bold;
  padding: 0 5px;
  margin-right: auto;
  color: #fff;
  flex-wrap: wrap;
  width: 90%;
`;

const ItemScore = styled.div<{ darkcolor?: string }>`
  font-size: 1.375rem;
  font-weight: bold;
  align-content: center;
  padding: 0 10px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  width: 27%;
  height: 100%;
  text-align: right;
  margin: auto 0;
  color: #fff;
  background-color: #555;
`;

const Shirt = styled(ShirtIcon)<{ color: string }>`
  margin: auto 5px auto 10px;
  color: white;
  font-size: 1.875rem;
`;

// Utility functions
function getColorShirt(color: string) {
  switch (color) {
    case 'Red': return 'red';
    case 'Green': return 'green';
    case 'Yellow': return 'yellow';
    case 'Black': return 'black';
    case 'White': return 'white';
    case 'Purple': return '#8D00E5';
    case 'Lightblue': return '#0197E5';
    case 'Orange': return '#E65000';
    default: return 'gray';
  }
}

function darkenColor(color: string, amount: number) {
  // Handle named colors
  if (color.startsWith('#')) {
    let colorCode = color.substring(1);
    let num = parseInt(colorCode, 16);
    
    let r = (num >> 16) - amount;
    let g = ((num >> 8) & 0x00FF) - amount;
    let b = (num & 0x0000FF) - amount;
  
    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;
  
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }
  
  // For named colors, return a default darkened version
  switch (color) {
    case 'red': return '#990000';
    case 'green': return '#004d00';
    case 'yellow': return '#999900';
    case 'black': return '#000000';
    case 'white': return '#cccccc';
    default: return '#666666';
  }
}

export default function TeamRanking() {
  const { teams, loading } = useData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderItem = ({ item, index }: { item: Team; index: number }) => {
    const shirtColor = getColorShirt(item.id);

    return (
      <Item key={item.name}>
        <ItemPos>{index + 1}</ItemPos>
        
        <TeamInfo>
          <TeamRow>
            <Shirt color={shirtColor} />
            <ItemText>{item.name}</ItemText>
          </TeamRow>
        </TeamInfo>

        <ItemScore>{item.score}</ItemScore>
      </Item>
    );
  };

  return (
    <Container>
      <Title>Tabla de Clasificación</Title>
      {teams.map((team, index) => renderItem({ item: team, index }))}
    </Container>
  );
}