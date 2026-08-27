"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BoardDetailClient } from "./board-detail-client";

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = params.id as string;

  return (
    <div className="w-full">
      <div className="border-b bg-card">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/coverly/boards"
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-muted"
            aria-label="Back to boards"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <h1 className="text-lg font-semibold">Board</h1>
        </div>
      </div>
      <BoardDetailClient boardId={boardId} />
    </div>
  );
}
