// prettier-ignore
const board = [
  ' o     xx', 
  '  oo o  x', 
  ' o oo   x', 
  'o oo oo x', 
  ' o  o  xx'
]

function calPosition(row: number, col: number, direction: string) {
  switch (direction) {
    case 'up':
      return [row - 1, col, row - 2, col]
    case 'down':
      return [row + 1, col, row + 2, col]
    case 'left':
      return [row, col - 1, row, col - 2]
    case 'right':
      return [row, col + 1, row, col + 2]
  }
}

function calNextBoard(board: string[], row: number, col: number, direction: string): [boolean, string[]] {
  const [killRow, killCol, moveToRow, moveToCol] = calPosition(row, col, direction)

  if (board[killRow]?.[killCol] !== 'o') {
    return [false, null]
  }
  if (board[moveToRow]?.[moveToCol] !== ' ') {
    return [false, null]
  }

  const array = board.map(it => it.split(''))
  array[row][col] = ' '
  array[killRow][killCol] = ' '
  array[moveToRow][moveToCol] = 'o'
  const nextBoard = array.map(it => it.join(''))
  return [true, nextBoard]
}

function* chipjump(board: string[]) {
  if (board.join('').match(/o/g).length === 1) {
    return yield [{ board }]
  }

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col] !== 'o') {
        continue
      }

      for (const direction of ['up', 'down', 'left', 'right']) {
        const [success, nextBoard] = calNextBoard(board, row, col, direction)
        if (!success) {
          continue
        }

        for (const solution of chipjump(nextBoard)) {
          const action = { row, col, direction }
          yield [{ board, action }, ...solution]
        }
      }
    }
  }
}

const result = chipjump(board)
const solution = result.next().value
for (const { board, action } of solution) {
  console.table(board.map(it => it.split('')))
  console.log(action)
}
