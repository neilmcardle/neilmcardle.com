import { describe, expect, it } from "vitest";
import { decide } from "./sync";

const local = (revision: number, syncedRevision: number) => ({
  revision,
  syncedRevision,
});
const remote = (revision: number, deleted = false) => ({ revision, deleted });

describe("decide", () => {
  it("does nothing when neither side has the book", () => {
    expect(decide(null, null)).toBe("nothing");
  });

  it("pulls a book that only the cloud has", () => {
    expect(decide(null, remote(3))).toBe("pull");
  });

  it("ignores a book the cloud deleted and this device never had", () => {
    expect(decide(null, remote(3, true))).toBe("nothing");
  });

  it("pushes a saved book the cloud has never seen", () => {
    expect(decide(local(1, 0), null)).toBe("push");
  });

  it("pushes again when the cloud lost a book it had confirmed", () => {
    expect(decide(local(4, 4), null)).toBe("push");
  });

  it("leaves a never-saved book alone", () => {
    expect(decide(local(0, 0), null)).toBe("nothing");
  });

  it("does nothing when both sides hold the synced revision", () => {
    expect(decide(local(5, 5), remote(5))).toBe("nothing");
  });

  it("pushes local edits when the cloud has not moved", () => {
    expect(decide(local(7, 5), remote(5))).toBe("push");
  });

  it("pulls cloud edits when this device has not changed", () => {
    expect(decide(local(5, 5), remote(8))).toBe("pull");
  });

  it("reports a conflict when both sides changed", () => {
    expect(decide(local(6, 5), remote(7))).toBe("conflict");
  });

  it("reports a conflict on first sync when both devices saved", () => {
    expect(decide(local(1, 0), remote(1))).toBe("conflict");
  });

  it("deletes the local copy when the cloud deleted an unchanged book", () => {
    expect(decide(local(5, 5), remote(5, true))).toBe("deleteLocal");
  });

  it("pushes local edits made after the cloud deleted the book", () => {
    expect(decide(local(6, 5), remote(5, true))).toBe("push");
  });

  it("treats a cloud revision behind the synced one as unchanged", () => {
    expect(decide(local(5, 5), remote(3))).toBe("nothing");
    expect(decide(local(6, 5), remote(3))).toBe("push");
  });
});
