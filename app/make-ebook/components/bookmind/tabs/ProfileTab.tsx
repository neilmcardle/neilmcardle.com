"use client";

import React, { useState, useEffect, useCallback } from "react";
import { loadBookById } from "../../../utils/bookLibrary";
import {
  getProfile,
  isProfileFresh,
  patchProfileCharacter,
  removeProfileCharacter,
  addProfileCharacter,
  patchProfileLocation,
  removeProfileLocation,
  addProfileRule,
  removeProfileRule,
  addProfileFact,
  removeProfileFact,
  setProfile,
  addDecision,
  getMemory,
} from "../../../utils/bookmindMemory";
import { ensureBookProfile } from "../../../utils/bookmindProfile";
import type {
  ProfileCharacter,
  ProfileLocation,
  BookProfile,
} from "../../../types";

interface ProfileTabProps {
  bookId?: string;
  userId?: string;
}

type EditingChar = {
  id: string;
  name: string;
  role: string;
  description: string;
} | null;
type EditingLoc = { id: string; name: string; description: string } | null;

const ROLES = ["Protagonist", "Antagonist", "Supporting", "Minor"];

export default function ProfileTab({ bookId, userId }: ProfileTabProps) {
  const [version, setVersion] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [editingChar, setEditingChar] = useState<EditingChar>(null);
  const [editingLoc, setEditingLoc] = useState<EditingLoc>(null);
  const [addingChar, setAddingChar] = useState(false);
  const [newChar, setNewChar] = useState({
    name: "",
    role: "Supporting",
    description: "",
  });
  const [addingLoc, setAddingLoc] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: "", description: "" });
  const [newRule, setNewRule] = useState("");
  const [newFact, setNewFact] = useState("");
  const [editingStyle, setEditingStyle] = useState(false);
  const [styleForm, setStyleForm] = useState({ pov: "", tense: "", tone: "" });

  const bump = () => setVersion((v) => v + 1);

  const book = bookId && userId ? loadBookById(userId, bookId) : null;
  const profile = book ? getProfile(book) : null;
  const memory = book ? getMemory(book) : null;
  const fresh = book ? isProfileFresh(book) : false;
  const hasBrief = !!book?.bookmindMemory?.brief?.chapterSummaries?.length;

  const generate = useCallback(
    async (force = false) => {
      if (!bookId || !userId) return;
      const current = loadBookById(userId, bookId);
      if (!current) return;
      setGenerating(true);
      setGenError(null);
      const result = await ensureBookProfile({ userId, book: current, force });
      setGenerating(false);
      if (!result.ok) {
        setGenError(result.error ?? "Could not generate profile");
      } else {
        bump();
      }
    },
    [userId, bookId],
  );

  useEffect(() => {
    if (!fresh && hasBrief && !generating) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  if (!bookId || !userId) return null;

  if (!hasBrief && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-3">
        <p className="text-sm text-gray-500 dark:text-[#a3a3a3] text-balance">
          Send your first Book Mind message to generate your book profile.
        </p>
        <p className="text-xs text-gray-400 dark:text-[#737373] text-pretty">
          Book Mind needs to read your manuscript first.
        </p>
      </div>
    );
  }

  if (generating && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <svg
          className="w-5 h-5 animate-spin text-gray-400 dark:text-[#737373]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-xs text-gray-400 dark:text-[#737373]">
          Analysing manuscript…
        </p>
      </div>
    );
  }

  const saveChar = () => {
    if (!editingChar) return;
    patchProfileCharacter(userId, bookId, editingChar as ProfileCharacter);
    setEditingChar(null);
    bump();
  };

  const saveCharAdd = () => {
    if (!newChar.name.trim()) return;
    addProfileCharacter(userId, bookId, {
      name: newChar.name.trim(),
      role: newChar.role,
      description: newChar.description.trim(),
    });
    setNewChar({ name: "", role: "Supporting", description: "" });
    setAddingChar(false);
    bump();
  };

  const saveLoc = () => {
    if (!editingLoc) return;
    patchProfileLocation(userId, bookId, editingLoc as ProfileLocation);
    setEditingLoc(null);
    bump();
  };

  const saveLocAdd = () => {
    if (!newLoc.name.trim()) return;

    const b = loadBookById(userId, bookId);
    if (!b) return;
    const p = getProfile(b);
    if (!p) return;
    setProfile(userId, bookId, {
      ...p,
      locations: [
        ...p.locations,
        {
          id: `loc-${Date.now()}`,
          name: newLoc.name.trim(),
          description: newLoc.description.trim(),
          source: "user",
        },
      ],
    });
    setNewLoc({ name: "", description: "" });
    setAddingLoc(false);
    bump();
  };

  const saveStyle = () => {
    const b = loadBookById(userId, bookId);
    if (!b) return;
    const p = getProfile(b);
    if (!p) return;
    setProfile(userId, bookId, {
      ...p,
      style: {
        pov: styleForm.pov,
        tense: styleForm.tense,
        tone: styleForm.tone,
      },
    });
    setEditingStyle(false);
    bump();
  };

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    addProfileRule(userId, bookId, newRule.trim());
    setNewRule("");
    bump();
  };

  const handleAddFact = () => {
    if (!newFact.trim()) return;
    addProfileFact(userId, bookId, newFact.trim());
    setNewFact("");
    bump();
  };

  const writingRules = profile?.writingRules ?? [];
  const decisions = memory?.decisions ?? [];

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#3a3a3a]">
      {profile && !fresh && !generating && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-amber-50 dark:bg-[#2a2000] border-b border-amber-200 dark:border-[#4a3a00]">
          <span className="text-2xs text-amber-700 dark:text-amber-400">
            Manuscript changed — profile may be out of date
          </span>
          <button
            onClick={() => generate()}
            className="text-2xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            Refresh
          </button>
        </div>
      )}

      {generating && profile && (
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#232323] border-b border-gray-100 dark:border-[#2a2a2a]">
          <svg
            className="w-3 h-3 animate-spin text-gray-400 dark:text-[#737373]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-2xs text-gray-400 dark:text-[#737373]">
            Updating profile…
          </span>
        </div>
      )}

      {genError && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-red-50 dark:bg-[#2a0a0a] border-b border-red-200 dark:border-[#4a1a1a]">
          <span className="text-2xs text-red-600 dark:text-red-400">
            {genError}
          </span>
          <button
            onClick={() => generate(true)}
            className="text-2xs font-semibold text-red-600 dark:text-red-400 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex-shrink-0 px-4 pt-3 pb-1">
        <p className="text-2xs text-gray-400 dark:text-[#737373] leading-relaxed">
          Everything here is sent to Book Mind with every message — so it always
          knows your characters, style, and rules without you having to repeat
          yourself.
        </p>
      </div>

      <div className="px-4 py-4 space-y-6">
        {profile?.style && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3]">
                Style
              </p>
              {!editingStyle && (
                <button
                  onClick={() => {
                    setStyleForm({
                      pov: profile.style.pov,
                      tense: profile.style.tense,
                      tone: profile.style.tone,
                    });
                    setEditingStyle(true);
                  }}
                  className="text-2xs text-gray-400 dark:text-[#737373] hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            {editingStyle ? (
              <div className="space-y-1.5">
                {(["pov", "tense", "tone"] as const).map((field) => (
                  <input
                    key={field}
                    value={styleForm[field]}
                    onChange={(e) =>
                      setStyleForm((s) => ({ ...s, [field]: e.target.value }))
                    }
                    placeholder={
                      field === "pov"
                        ? "POV"
                        : field === "tense"
                          ? "Tense"
                          : "Tone"
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
                  />
                ))}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveStyle}
                    className="text-xs px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingStyle(false)}
                    className="text-xs px-3 py-2 rounded-lg text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {profile.style.pov && (
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d4]">
                    <span className="text-gray-400 dark:text-[#737373]">
                      POV
                    </span>{" "}
                    · {profile.style.pov}
                  </p>
                )}
                {profile.style.tense && (
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d4]">
                    <span className="text-gray-400 dark:text-[#737373]">
                      Tense
                    </span>{" "}
                    · {profile.style.tense}
                  </p>
                )}
                {profile.style.tone && (
                  <p className="text-xs text-gray-700 dark:text-[#d4d4d4]">
                    <span className="text-gray-400 dark:text-[#737373]">
                      Tone
                    </span>{" "}
                    · {profile.style.tone}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        <section>
          <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-2">
            Characters
          </p>
          <div className="space-y-2">
            {(profile?.characters ?? []).map((char) => (
              <div key={char.id}>
                {editingChar?.id === char.id ? (
                  <div className="space-y-1.5 p-2 rounded-lg bg-gray-50 dark:bg-[#232323]">
                    <input
                      value={editingChar.name}
                      onChange={(e) =>
                        setEditingChar(
                          (c) => c && { ...c, name: e.target.value },
                        )
                      }
                      placeholder="Name"
                      className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white"
                    />
                    <select
                      value={editingChar.role}
                      onChange={(e) =>
                        setEditingChar(
                          (c) => c && { ...c, role: e.target.value },
                        )
                      }
                      className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={editingChar.description}
                      onChange={(e) =>
                        setEditingChar(
                          (c) => c && { ...c, description: e.target.value },
                        )
                      }
                      placeholder="Description"
                      rows={2}
                      className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white resize-none leading-relaxed"
                      style={{
                        border: "none",
                        outline: "none",
                        boxShadow: "none",
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveChar}
                        className="text-xs px-3 py-1 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingChar(null)}
                        className="text-xs px-3 py-1 rounded-lg text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {char.name}
                        </span>
                        <span className="text-2xs text-gray-400 dark:text-[#737373]">
                          {char.role}
                        </span>
                      </div>
                      {char.description && (
                        <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed mt-1">
                          {char.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                      <button
                        onClick={() =>
                          setEditingChar({
                            id: char.id,
                            name: char.name,
                            role: char.role,
                            description: char.description,
                          })
                        }
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                        title="Edit"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          removeProfileCharacter(userId, bookId, char.id);
                          bump();
                        }}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {addingChar ? (
              <div className="space-y-1.5 p-2 rounded-lg bg-gray-50 dark:bg-[#232323] mt-2">
                <input
                  value={newChar.name}
                  onChange={(e) =>
                    setNewChar((c) => ({ ...c, name: e.target.value }))
                  }
                  placeholder="Name"
                  autoFocus
                  className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
                />
                <select
                  value={newChar.role}
                  onChange={(e) =>
                    setNewChar((c) => ({ ...c, role: e.target.value }))
                  }
                  className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <input
                  value={newChar.description}
                  onChange={(e) =>
                    setNewChar((c) => ({ ...c, description: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && saveCharAdd()}
                  placeholder="Description (optional)"
                  className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveCharAdd}
                    disabled={!newChar.name.trim()}
                    className="text-xs px-3 py-1 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium disabled:opacity-40 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingChar(false)}
                    className="text-xs px-3 py-1 rounded-lg text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingChar(true)}
                className="text-2xs text-gray-400 dark:text-[#737373] hover:text-gray-700 dark:hover:text-white transition-colors mt-1"
              >
                + Add character
              </button>
            )}
          </div>
        </section>

        {((profile?.locations ?? []).length > 0 || addingLoc) && (
          <section>
            <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-2">
              Locations
            </p>
            <div className="space-y-2">
              {(profile?.locations ?? []).map((loc) => (
                <div key={loc.id}>
                  {editingLoc?.id === loc.id ? (
                    <div className="space-y-1.5 p-2 rounded-lg bg-gray-50 dark:bg-[#232323]">
                      <input
                        value={editingLoc.name}
                        onChange={(e) =>
                          setEditingLoc(
                            (l) => l && { ...l, name: e.target.value },
                          )
                        }
                        placeholder="Location name"
                        className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white"
                      />
                      <input
                        value={editingLoc.description}
                        onChange={(e) =>
                          setEditingLoc(
                            (l) => l && { ...l, description: e.target.value },
                          )
                        }
                        placeholder="Description"
                        className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveLoc}
                          className="text-xs px-3 py-1 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingLoc(null)}
                          className="text-xs px-3 py-1 rounded-lg text-gray-500 dark:text-[#a3a3a3] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {loc.name}
                        </span>
                        {loc.description && (
                          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mt-1 leading-relaxed">
                            {loc.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                        <button
                          onClick={() =>
                            setEditingLoc({
                              id: loc.id,
                              name: loc.name,
                              description: loc.description,
                            })
                          }
                          className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            removeProfileLocation(userId, bookId, loc.id);
                            bump();
                          }}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {addingLoc ? (
                <div className="space-y-1.5 p-2 rounded-lg bg-gray-50 dark:bg-[#232323]">
                  <input
                    value={newLoc.name}
                    onChange={(e) =>
                      setNewLoc((l) => ({ ...l, name: e.target.value }))
                    }
                    placeholder="Location name"
                    autoFocus
                    className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
                  />
                  <input
                    value={newLoc.description}
                    onChange={(e) =>
                      setNewLoc((l) => ({ ...l, description: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && saveLocAdd()}
                    placeholder="Description (optional)"
                    className="w-full text-xs px-2 py-2 rounded-md bg-white dark:bg-[#2a2a2a] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveLocAdd}
                      disabled={!newLoc.name.trim()}
                      className="text-xs px-3 py-1 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium disabled:opacity-40 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingLoc(false)}
                      className="text-xs px-3 py-1 rounded-lg text-gray-500 dark:text-[#a3a3a3] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingLoc(true)}
                  className="text-2xs text-gray-400 dark:text-[#737373] hover:text-gray-700 dark:hover:text-white transition-colors mt-1"
                >
                  + Add location
                </button>
              )}
            </div>
          </section>
        )}

        <section>
          <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-2">
            Key facts
          </p>
          <div className="space-y-1 mb-2">
            {(profile?.keyFacts ?? []).map((fact, i) => (
              <div key={i} className="group flex items-start gap-2">
                <span className="text-xs text-gray-700 dark:text-[#d4d4d4] flex-1 leading-relaxed">
                  {fact}
                </span>
                <button
                  onClick={() => {
                    removeProfileFact(userId, bookId, fact);
                    bump();
                  }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all mt-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFact()}
              placeholder="Add a key fact…"
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
            />
            <button
              onClick={handleAddFact}
              disabled={!newFact.trim()}
              className="text-xs px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium disabled:opacity-40 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>
        </section>

        <section>
          <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-1">
            Writing rules
          </p>
          <p className="text-2xs text-gray-400 dark:text-[#737373] mb-2">
            Sent with every Book Mind message. E.g. "no em dashes" or "British
            spelling".
          </p>
          <div className="space-y-1 mb-2">
            {writingRules.map((rule, i) => (
              <div key={i} className="group flex items-start gap-2">
                <span className="text-xs text-gray-700 dark:text-[#d4d4d4] flex-1 leading-relaxed">
                  {rule}
                </span>
                <button
                  onClick={() => {
                    removeProfileRule(userId, bookId, rule);
                    bump();
                  }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all mt-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddRule()}
              placeholder="Add a rule…"
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#262626] border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#737373]"
            />
            <button
              onClick={handleAddRule}
              disabled={!newRule.trim()}
              className="text-xs px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium disabled:opacity-40 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>
        </section>

        {decisions.length > 0 && (
          <section>
            <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#a3a3a3] mb-1">
              Remembered
            </p>
            <p className="text-2xs text-gray-400 dark:text-[#737373] mb-2">
              Added via "Remember this" in chat.
            </p>
            <div className="space-y-1">
              {decisions
                .slice(-5)
                .reverse()
                .map((d, i) => (
                  <p
                    key={i}
                    className="text-xs text-gray-600 dark:text-[#a3a3a3] leading-relaxed"
                  >
                    {d.note}
                  </p>
                ))}
            </div>
          </section>
        )}

        {profile && !generating && (
          <div className="pt-2 border-t border-gray-100 dark:border-[#2a2a2a]">
            <button
              onClick={() => generate(true)}
              className="text-2xs text-gray-400 dark:text-[#737373] hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              Refresh from manuscript
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
