import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-grid-system';
import { FaCrown } from 'react-icons/fa';
import './App.css';

function App() {
  const [positions, setPositions] = useState([]);
  const [heuristicTable, setHeuristicTable] = useState([]);

  const handleSquareClick = (row, col) => {
    const queenExists = positions.some((pos) => pos.row === row && pos.col === col);
    let updatedPositions = [];

    if (queenExists) {
      // Desseleccionar la reina si ya existe en la posición
      updatedPositions = positions.filter((pos) => !(pos.row === row && pos.col === col));
    } else {
      // Seleccionar la reina solo si aún no se han seleccionado 8 reinas
      if (positions.length < 8) {
        updatedPositions = [...positions, { row, col }];
      }
    }

    setPositions(updatedPositions);
  };

  const renderSquare = (row, col) => {
    const isQueen = positions.some((pos) => pos.row === row && pos.col === col);
    const isSelected = isQueen ? 'selected' : '';
  
  return (
    <div
      key={col}
      className={`square ${isSelected}`}
      onClick={() => handleSquareClick(row, col)}
    >
      {isQueen && <FaCrown className="queen-icon" />}
    </div>
  );
  };

  const renderRow = (row) => {
    return (
      <Row key={row} className="row">
        {Array.from({ length: 8 }, (_, col) => (
          <Col key={col}>{renderSquare(row, col)}</Col>
        ))}
      </Row>
    );
  };

  const renderHeuristicTable = () => {
    return (
      <div className="heuristic-table-container">
        <h2>Heurística</h2>
        <table>
          <tbody>
            {heuristicTable.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((value, colIndex) => (
                  <td key={colIndex}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  

  const handleValidation = async () => {
    const response = await axios.post('http://localhost:3001/solve', { positions });

    if (response.data.success) {
      // No hay reinas que se estén atacando
      // Mostrar una ventana emergente con un mensaje de felicitación
      alert('¡Felicitaciones! No hay reinas que se estén atacando entre sí');
      
    } else {
      // Reinas atacándose entre sí
      // Mostrar una ventana emergente con el mensaje de advertencia
      alert(`Advertencia: ${response.data.message}`);
      // Imprimir el valor de calculateHeuristic(positions)
      console.log('Heuristic:', calculateHeuristic(positions));

      const calculatedHeuristic = calculateHeuristic(positions);
      setHeuristicTable(calculatedHeuristic);
    }
  };

  function calculateHeuristic(positions) {
    const heuristic = [];
  
    // Calcular la heurística para cada posición en el tablero
    for (let row = 0; row < 8; row++) {
      heuristic[row] = [];
      for (let col = 0; col < 8; col++) {
        // Verificar si la posición contiene una reina
        const isQueen = positions.some((pos) => pos.row === row && pos.col === col);
  
        if (isQueen) {
          // Si hay una reina en la posición, la heurística es 0
          heuristic[row][col] = 0;
        } else {
          // Calcular la heurística basada en la cantidad de reinas atacando la posición
          let attackingQueens = 0;
          for (const { row: queenRow, col: queenCol } of positions) {
            if (row === queenRow || col === queenCol || Math.abs(row - queenRow) === Math.abs(col - queenCol)) {
              attackingQueens++;
            }
          }
          heuristic[row][col] = attackingQueens;
        }
      }
    }
  
    return heuristic;
  }
  

  return (
    <div>
      <h2>Coloca las reinas en el tablero</h2>
      <Container className="board">
        {Array.from({ length: 8 }, (_, row) => renderRow(row))}
      </Container>
      <button onClick={handleValidation}>Validar Posiciones</button>
      {heuristicTable.length > 0 && renderHeuristicTable()}
    </div>
  );
}

export default App;