import { useState } from "react";

export function useTags(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");

  function handleAddTag() {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  return {
    tags,
    setTags,
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
  };
}