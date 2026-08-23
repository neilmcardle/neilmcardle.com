import { notFound } from "next/navigation";
import { getAllModules, loadModule } from "@/lib/spark/content";
import { phaseLabel } from "@/lib/spark/curriculum";
import { LessonShell } from "@/components/spark/LessonShell";
import { LessonContent } from "@/components/spark/LessonContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllModules();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps) {
  const { slug } = await props.params;
  try {
    const { meta } = await loadModule(slug);
    return {
      title: `${meta.title} · Spark`,
      description: meta.promise,
    };
  } catch {
    return { title: "Lesson not found · Spark" };
  }
}

export default async function LessonPage(props: PageProps) {
  const { slug } = await props.params;

  let lesson;
  try {
    lesson = await loadModule(slug);
  } catch {
    notFound();
  }

  const { meta, sections } = lesson;
  const slugs = await getAllModules();

  const nextSlug = slugs.find((candidate) => {
    const number = parseInt(candidate.match(/^m(\d+)/)?.[1] ?? "-1", 10) + 1;
    return number === meta.module + 1;
  });

  let next: { slug: string; title: string } | null = null;
  if (nextSlug) {
    try {
      const nextModule = await loadModule(nextSlug);
      next = { slug: nextSlug, title: nextModule.meta.title };
    } catch (error) {
      console.error(`Failed to load next module ${nextSlug}:`, error);
    }
  }

  return (
    <LessonShell
      title={meta.title}
      moduleNumber={meta.module}
      phaseLabel={phaseLabel(meta.phase)}
      promise={meta.promise}
      minutes={meta.minutes}
      next={next}
      sections={sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: (
          <LessonContent key={section.id}>{section.content}</LessonContent>
        ),
      }))}
    />
  );
}
