export type LastBoard = { id: string; name: string };

const LAST_BOARD_KEY = "coverly:last-board";

export function getLastBoard(): LastBoard | null {
  try {
    return JSON.parse(localStorage.getItem(LAST_BOARD_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function rememberLastBoard(board: LastBoard) {
  try {
    localStorage.setItem(LAST_BOARD_KEY, JSON.stringify(board));
  } catch {}
}

export function clearLastBoard() {
  try {
    localStorage.removeItem(LAST_BOARD_KEY);
  } catch {}
}
