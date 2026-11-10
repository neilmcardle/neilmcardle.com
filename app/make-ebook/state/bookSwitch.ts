export interface BookSwitch {
  token: number;
  pending: number | null;
}

export type BookSwitchEvent =
  { type: "begin" } | { type: "applied"; token: number };

export const initialBookSwitch: BookSwitch = { token: 0, pending: null };

export function bookSwitch(
  state: BookSwitch,
  event: BookSwitchEvent,
): BookSwitch {
  switch (event.type) {
    case "begin": {
      const token = state.token + 1;
      return { token, pending: token };
    }
    case "applied":
      return state.pending === event.token
        ? { ...state, pending: null }
        : state;
  }
}

export function isCurrentSwitch(state: BookSwitch, token: number) {
  return state.pending === token;
}
