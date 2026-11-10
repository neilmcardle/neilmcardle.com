export type ExportFormat = "epub" | "pdf" | "docx";

export type ExportState =
  | { status: "idle" }
  | { status: "exporting"; format: ExportFormat }
  | { status: "failed"; format: ExportFormat; error: string };

export type ExportEvent =
  | { type: "start"; format: ExportFormat }
  | { type: "done" }
  | { type: "failed"; error: string }
  | { type: "dismiss" };

export const initialExport: ExportState = { status: "idle" };

export function exportFlow(
  state: ExportState,
  event: ExportEvent,
): ExportState {
  switch (event.type) {
    case "start":
      return state.status === "exporting"
        ? state
        : { status: "exporting", format: event.format };
    case "done":
      return state.status === "exporting" ? initialExport : state;
    case "failed":
      return state.status === "exporting"
        ? { status: "failed", format: state.format, error: event.error }
        : state;
    case "dismiss":
      return state.status === "failed" ? initialExport : state;
  }
}

export function describeExport(state: ExportState) {
  return {
    exporting: state.status === "exporting",
    exportError: state.status === "failed" ? state.error : null,
  };
}
