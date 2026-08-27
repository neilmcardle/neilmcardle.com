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

async function neighbour(
  slug: string | undefined,
): Promise<{ slug: string; title: string } | null> {
  if (!slug) return null;
  try {
    const { meta } = await loadModule(slug);
    return { slug, title: meta.title };
  } catch (error) {
    console.error(`Failed to load neighbouring module ${slug}:`, error);
    return null;
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

  const at = slugs.indexOf(slug);
  const [prev, next] = await Promise.all([
    neighbour(at > 0 ? slugs[at - 1] : undefined),
    neighbour(at >= 0 ? slugs[at + 1] : undefined),
  ]);

  return (
    <LessonShell
      title={meta.title}
      moduleNumber={meta.module}
      phaseLabel={phaseLabel(meta.phase)}
      promise={meta.promise}
      minutes={meta.minutes}
      prev={prev}
      next={next}
      sections={sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: (
          <LessonContent key={section.id} moduleNumber={meta.module}>
            {section.content}
          </LessonContent>
        ),
      }))}
    />
  );
}
