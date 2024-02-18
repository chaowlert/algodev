function minPathSum(grid: number[][]): number {
  const maxRow = grid.length - 1
  const maxCol = grid[0].length - 1
  const cache: number[][] = []
  return minSum(0, 0)

  function minSum(row: number, col: number): number {
    if (row === maxRow && col === maxCol) {
      return grid[row][col]
    }
    if (cache[row]?.[col] !== undefined) {
      return cache[row][col]
    }
    const right = col === maxCol ? Infinity : minSum(row, col + 1)
    const down = row === maxRow ? Infinity : minSum(row + 1, col)
    if (!cache[row]) {
      cache[row] = []
    }
    return (cache[row][col] = grid[row][col] + Math.min(right, down))
  }
}
