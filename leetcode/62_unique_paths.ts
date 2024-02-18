function uniquePaths(m: number, n: number): number {
  const maxRow = m - 1
  const maxCol = n - 1
  const cache: number[][] = []
  return countPaths(0, 0)

  function countPaths(row: number, col: number): number {
    if (row === maxRow && col === maxCol) {
      return 1
    }
    if (cache[row]?.[col] !== undefined) {
      return cache[row][col]
    }
    const right = col === maxCol ? 0 : countPaths(row, col + 1)
    const down = row === maxRow ? 0 : countPaths(row + 1, col)
    if (!cache[row]) {
      cache[row] = []
    }
    return (cache[row][col] = right + down)
  }
}
