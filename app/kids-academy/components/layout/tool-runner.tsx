"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  CurriculumTopic,
  ChildProfile,
  ToolResult,
} from "@/app/kids-academy/types/curriculum";
import { getProgress, setProgress } from "@/app/kids-academy/lib/progress";
import { CelebrationAnimation } from "@/app/kids-academy/components/progress/celebration-animation";
import { getTool } from "@/app/kids-academy/components/interactive/registry";

type Props = {
  topic: CurriculumTopic;
  childProfile: ChildProfile;
};

export function ToolRunner({ topic, childProfile }: Props) {
  const [showCelebration, setShowCelebration] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const celebrated = useRef(false);
  const alreadyDone = useRef(false);

  const Tool = getTool(topic.id);

  useEffect(() => {
    const done = getProgress(topic.id).status === "completed";
    alreadyDone.current = done;
    celebrated.current = false;
    setProgress(topic.id, done ? {} : { status: "in_progress" });
    startedAt.current = Date.now();
  }, [topic.id]);

  function celebrate(timeSpentSeconds?: number) {
    setProgress(topic.id, {
      status: "completed",
      percentage: 100,
      timeSpentSeconds:
        timeSpentSeconds || Math.round((Date.now() - startedAt.current) / 1000),
    });
    alreadyDone.current = true;
    if (!celebrated.current) {
      celebrated.current = true;
      setShowCelebration(true);
    }
  }

  function handleProgress(p: number) {
    const next = Math.min(100, Math.max(0, Math.round(p)));
    if (next >= 100) {
      celebrate();
      return;
    }
    if (alreadyDone.current) return;
    setProgress(topic.id, { percentage: next, status: "in_progress" });
  }

  function handleComplete(result: ToolResult) {
    celebrate(result.durationSeconds);
  }

  if (!Tool) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md text-center flex flex-col gap-4">
          <h2 className="font-ka-display text-2xl font-bold text-slate-900">
            This topic is being built.
          </h2>
          <p className="font-ka-body text-sm text-slate-600">
            {topic.title} is in the curriculum, but its interactive tool hasn't
            shipped yet. Check back soon.
          </p>
          <Link
            href="/kids-academy/curriculum"
            className="inline-flex items-center justify-center gap-2 h-ka-touch px-5 mx-auto rounded-full bg-ka-brand-500 text-white font-ka-display font-semibold text-sm hover:bg-ka-brand-600 transition"
          >
            Back to curriculum
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col">
        <Tool
          childProfile={childProfile}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />
      </div>

      <CelebrationAnimation
        show={showCelebration}
        message={`${topic.title} complete!`}
        onDismiss={() => setShowCelebration(false)}
      />
    </>
  );
}
