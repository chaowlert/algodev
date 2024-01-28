function solveSudoku(board: string[][]): void {
  // convert string[][] to Cell[]
  const cells: Cell[] = []
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board[row][col]
      const options = value === '.' ? ['1', '2', '3', '4', '5', '6', '7', '8', '9'] : [value]
      const colGroup = (col / 3) | 0
      const rowGroup = (row / 3) | 0
      const grid = rowGroup * 3 + colGroup
      cells.push({ row, col, value, options, grid })
    }
  }

  // solve Sudoku
  const result = sudoku([], cells)
  const first: Cell[] = result.next().value

  // convert Cell[] back to string[][]
  for (const cell of first) {
    board[cell.row][cell.col] = cell.value
  }
}

interface Cell {
  row: number
  col: number
  grid: number
  value: string
  options: string[]
}

function* sudoku(solvedCells: Cell[], unsolvedCells: Cell[]): Generator<Cell[]> {
  if (solvedCells.length === 81) {
    return yield solvedCells
  }

  unsolvedCells.sort((a, b) => a.options.length - b.options.length)
  const [head, ...tail] = unsolvedCells
  for (const value of head.options) {
    const nextUnsolvedCells = tail.map(it =>
      it.row === head.row || it.col === head.col || it.grid === head.grid
        ? { ...it, options: it.options.filter(c => c !== value) }
        : it,
    )
    const nextSolvedCells = solvedCells.concat({ ...head, value })
    yield* sudoku(nextSolvedCells, nextUnsolvedCells)
  }
}
