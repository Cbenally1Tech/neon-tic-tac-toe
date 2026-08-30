export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[];

export const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function emptyBoard(): Board {
  return Array(9).fill(null);
}

export function getWinner(board: Board): { player: Player; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) {
      return { player: mark, line };
    }
  }
  return null;
}

export function isDraw(board: Board): boolean {
  return board.every(Boolean) && !getWinner(board);
}
