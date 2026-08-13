import { loadModule, getAllModules } from '@/lib/spark/content';
import { parseContentIntoSections } from '@/lib/spark/contentParser';
import { CodeBlockParser } from '@/components/spark/CodeBlockParser';

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

    const parsedSections = parseContentIntoSections(module.mdxSource);

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/spark/lessons" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              ← Back to curriculum
            </a>
            <a href="/spark" className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-500">
              Spark home
            </a>
          </div>
        </nav>

        <div className="flex flex-1">
          {/* Left Sidebar */}
          <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-6 text-sm">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-3 uppercase text-xs tracking-wide">Modules</p>
                <div className="space-y-1">
                  {Array.from({ length: 19 }).map((_, i) => (
                    <a key={i} href={`/spark/lessons/m${i}-module`} className={`block px-3 py-2 rounded text-xs ${module.frontmatter.module === i ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
                      M{i}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Center Content */}
          <main className="flex-1 px-6 py-12 lg:py-16">
            <div className="max-w-3xl mx-auto">
              <header className="mb-12">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Module {module.frontmatter.module} • {module.frontmatter.phase}
                </p>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                  {module.frontmatter.title}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  {module.frontmatter.promise}
                </p>
              </header>

              <div className="space-y-20">
                {parsedSections.map((section, i) => (
                  <section
                    key={i}
                    className="pb-16 border-b border-slate-200 dark:border-slate-700 last:border-b-0 last:pb-0"
                    id={`section-${i}`}
                  >
                    <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-slate-900 dark:text-white leading-tight">
                      {section.title}
                    </h2>
                    <CodeBlockParser>
                      {section.content}
                    </CodeBlockParser>
                  </section>
                ))}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:flex w-64 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-8 text-sm">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wide">On this page</p>
                <div className="space-y-2">
                  {parsedSections.map((section, i) => (
                    <a
                      key={i}
                      href={`#section-${i}`}
                      className="block px-3 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>

              {module.frontmatter.module < 18 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-slate-900 dark:text-white mb-3 uppercase text-xs tracking-wide">Next module</p>
                  <a href={`/spark/lessons/m${module.frontmatter.module + 1}-next`} className="block px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-center font-medium text-xs">
                    M{module.frontmatter.module + 1}
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
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
