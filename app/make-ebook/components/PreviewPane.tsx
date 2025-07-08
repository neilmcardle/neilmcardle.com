import React from "react";
import type { Chapter } from "../types";

interface PreviewPaneProps {
  title: string;
  author: string;
  chapters: Chapter[];
  cover: string | null;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  title,
  author,
  chapters,
  cover,
}) => (
  <div className="my-6 border-t pt-4">
    <h2 className="font-bold text-lg">Preview</h2>
    <p>
      <strong>Title:</strong> {title || <em>(No title)</em>}<br />
      <strong>Author:</strong> {author || <em>(No author)</em>}
    </p>
    {cover && (
      <img
        src={cover}
        alt="Preview Cover"
        className="my-4 max-h-32 rounded border"
        style={{ objectFit: "contain", background: "#fff" }}
      />
    )}
    <ol>
      {chapters.map((ch, idx) => (
        <li key={idx}>
          <strong>{ch.title || `Chapter ${idx + 1}`}</strong>
        </li>
      ))}
    </ol>
  </div>
);