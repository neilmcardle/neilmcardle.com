export type SyncDecision =
  "push" | "pull" | "conflict" | "nothing" | "deleteLocal";

export interface LocalSyncState {
  revision: number;
  syncedRevision: number;
}

export interface RemoteSyncState {
  revision: number;
  deleted: boolean;
}

export function decide(
  local: LocalSyncState | null,
  remote: RemoteSyncState | null,
): SyncDecision {
  if (!local) {
    if (!remote || remote.deleted) return "nothing";
    return "pull";
  }

  const localChanged = local.revision > local.syncedRevision;

  if (!remote) return local.revision > 0 ? "push" : "nothing";

  if (remote.deleted) return localChanged ? "push" : "deleteLocal";

  const remoteChanged = remote.revision > local.syncedRevision;

  if (localChanged && remoteChanged) return "conflict";
  if (localChanged) return "push";
  if (remoteChanged) return "pull";
  return "nothing";
}
