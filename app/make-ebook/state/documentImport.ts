export type DocumentImport =
  | { status: "closed" }
  | { status: "open" }
  | { status: "importing" }
  | { status: "failed"; error: string };

export type DocumentImportEvent =
  | { type: "open" }
  | { type: "close" }
  | { type: "start" }
  | { type: "done" }
  | { type: "failed"; error: string };

export const initialDocumentImport: DocumentImport = { status: "closed" };

export function documentImport(
  state: DocumentImport,
  event: DocumentImportEvent,
): DocumentImport {
  switch (event.type) {
    case "open":
      return state.status === "importing" ? state : { status: "open" };
    case "close":
      return state.status === "importing" ? state : { status: "closed" };
    case "start":
      return { status: "importing" };
    case "done":
      return { status: "closed" };
    case "failed":
      return { status: "failed", error: event.error };
  }
}

export function describeDocumentImport(state: DocumentImport) {
  return {
    importDialogOpen: state.status !== "closed",
    importing: state.status === "importing",
    importError: state.status === "failed" ? state.error : null,
  };
}
