function solveNQueens(n: number): string[][] {
  return [...nqueens([], n)]
}

function totalNQueens(n: number): number {
  return [...nqueens([], n)].length
}

function* nqueens(board: number[], n: number) {
  const row = board.length
  if (row === n) {
    return yield board.map(q_col => 'Q'.padStart(q_col + 1, '.').padEnd(n, '.'))
  }
  for (let col = 0; col < n; col++) {
    if (board.some((q_col, q_row) => q_col === col || row - q_row === Math.abs(col - q_col))) {
      continue
    }

    yield* nqueens([...board, col], n)
  }
}
