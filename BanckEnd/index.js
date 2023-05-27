const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const port = 3001;

app.use(express.json());

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

function calculateHeuristic(positions) {
  const board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 0));

  positions.forEach(({ row, col }) => {
    // Incrementar el puntaje de las filas y columnas
    for (let i = 0; i < 8; i++) {
      board[row][i]++;
      board[i][col]++;
    }

    // Incrementar el puntaje de las diagonales
    for (let i = 1; i < 8; i++) {
      if (row - i >= 0 && col - i >= 0) board[row - i][col - i]++;
      if (row - i >= 0 && col + i < 8) board[row - i][col + i]++;
      if (row + i < 8 && col - i >= 0) board[row + i][col - i]++;
      if (row + i < 8 && col + i < 8) board[row + i][col + i]++;
    }
  });

  return board;
}

app.post('/solve', (req, res) => {
  const positions = req.body.positions; // Posiciones de las reinas enviadas por el cliente

  // Verificar si las posiciones son válidas
  const validationResult = validatePositions(positions);

  if (validationResult.success) {
    const heuristic = calculateHeuristic(positions);
    res.json({ success: true, heuristic });
  } else {
    const heuristic = calculateHeuristic(positions);
    res.json({
      success: false,
      message: validationResult.message, heuristic
    });
  }
});

function validatePositions(positions) {
  // Verificar si hay 8 reinas seleccionadas
  if (positions.length !== 8) {
    return {
      success: false,
      message: 'Debes seleccionar exactamente 8 reinas',
      conflictingRowsCols: [],
      conflictingDiagonals: [],
    };
  }

  const conflictingRowsCols = [];
  const conflictingDiagonals = [];

  // Verificar si hay alguna reina en la misma fila, columna o diagonal
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      const { row: row1, col: col1 } = positions[i];
      const { row: row2, col: col2 } = positions[j];

      // Verificar fila y columna
      if (row1 === row2 || col1 === col2) {
        conflictingRowsCols.push({ row: row1, col: col1 });
        conflictingRowsCols.push({ row: row2, col: col2 });
      }

      // Verificar diagonal
      if (Math.abs(row1 - row2) === Math.abs(col1 - col2)) {
        conflictingDiagonals.push({ row: row1, col: col1 });
        conflictingDiagonals.push({ row: row2, col: col2 });
      }
    }
  }

  if (conflictingRowsCols.length > 0 || conflictingDiagonals.length > 0) {
    let message = '';

    if (conflictingRowsCols.length > 0) {
      const conflictingRowsColsMessage = conflictingRowsCols
        .map(({ row, col }) => `(${row}, ${col})`)
        .join(' y ');
      message += `Hay reinas que se están atacando entre sí en las posiciones de las filas o columnas ${conflictingRowsColsMessage}. `;
    }

    if (conflictingDiagonals.length > 0) {
      const conflictingDiagonalsMessage = conflictingDiagonals
        .map(({ row, col }) => `(${row}, ${col})`)
        .join(' y ');
      message += `Hay reinas que se están atacando entre sí en las posiciones de las diagonales ${conflictingDiagonalsMessage}.`;
    }

    return {
      success: false,
      message,
      conflictingRowsCols,
      conflictingDiagonals,
    };
  }

  // Si no se encontraron reinas atacándose entre sí, se considera válido
  return { success: true };
}
