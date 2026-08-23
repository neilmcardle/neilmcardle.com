import { getCurriculum } from "@/lib/spark/content";
import { CurriculumIndex } from "@/components/spark/CurriculumIndex";

export const metadata = {
  title: "Curriculum · Spark",
  description:
    "The complete Spark curriculum. Nineteen modules from foundations to a full stack capstone.",
};

export default async function LessonsPage() {
  const modules = await getCurriculum();

  return (
    <CurriculumIndex
      modules={modules.map((mod) => ({
        slug: mod.slug,
        title: mod.title,
        module: mod.module,
        promise: mod.promise,
        phaseId: mod.phase.id,
        sectionCount: mod.sectionCount,
        minutes: mod.minutes,
      }))}
    />
  );
}
