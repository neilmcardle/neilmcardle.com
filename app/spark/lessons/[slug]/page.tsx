import { MDXRemote } from 'next-mdx-remote/rsc';
import { loadModule } from '@/lib/spark/content';
import { Section } from '@/components/spark/Section';
import { Check } from '@/components/spark/Check';
import { CodeBlock } from '@/components/spark/CodeBlock';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  try {
    const module = await loadModule(params.slug);
    return {
      title: `${module.frontmatter.title} — Spark`,
      description: module.frontmatter.promise,
    };
  } catch {
    return { title: 'Lesson not found — Spark' };
  }
}

export default async function LessonPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;

  try {
    const module = await loadModule(slug);

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/spark/lessons" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              ← Back to curriculum
            </a>
            <a href="/spark" className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-500">
              Spark home
            </a>
          </div>
        </nav>

        <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Module {module.frontmatter.module} • {module.frontmatter.phase}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {module.frontmatter.title}
            </h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-16 lg:py-20 prose prose-invert dark:prose-invert max-w-none">
          <MDXRemote
            source={module.mdxSource}
            components={{
              Section,
              Check,
              CodeBlock,
            }}
          />
        </main>

        <nav className="max-w-2xl mx-auto px-6 py-8">
          <a
            href="/spark/lessons"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Back to lessons
          </a>
        </nav>
      </div>
    );
  } catch (error) {
    console.error('Lesson load error:', error);
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Error loading lesson</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Failed to load "{slug}"
          </p>
          <a
            href="/spark/lessons"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Back to lessons
          </a>
        </div>
      </div>
    );
  }
}
