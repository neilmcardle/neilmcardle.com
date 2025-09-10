import { useState } from "react";

type LockedSections = {
  bookInfo: boolean;
  publishing: boolean;
  tags: boolean;
  cover: boolean;
};

const defaultLocked: LockedSections = {
  bookInfo: false,
  publishing: false,
  tags: false,
  cover: false,
};

export function useLockedSections(initial: LockedSections = defaultLocked) {
  const [lockedSections, setLockedSections] = useState(initial);

  function toggleSection(name: keyof LockedSections) {
    setLockedSections(ls => ({
      ...ls,
      [name]: !ls[name],
    }));
  }

  return {
    lockedSections,
    setLockedSections,
    toggleSection,
  };
}