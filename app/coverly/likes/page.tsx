import { Heart } from "lucide-react";
import { LikedCoversClient } from "./liked-covers-client";

export default function LikesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Heart className="h-5 w-5 fill-red-500 text-red-500" strokeWidth={2} />
        <h1 className="text-2xl font-semibold">Liked covers</h1>
      </div>
      <LikedCoversClient />
    </div>
  );
}
