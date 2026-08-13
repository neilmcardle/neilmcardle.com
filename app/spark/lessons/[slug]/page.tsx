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
    const allModuleSlugs = await getAllModules();

    const parsedSections = parseContentIntoSections(module.mdxSource);

    let nextModuleTitle = null;
    let nextModuleSlug = null;

    if (module.frontmatter.module < 18) {
      nextModuleSlug = allModuleSlugs.find(s => parseInt(s.match(/^m(\d+)/)?.[1] || '0') === module.frontmatter.module + 1);
      if (nextModuleSlug) {
        try {
          const nextModule = await loadModule(nextModuleSlug);
          nextModuleTitle = nextModule.frontmatter.title;
        } catch (error) {
          console.error(`Failed to load next module ${nextModuleSlug}:`, error);
        }
      }
    }

    return (
      <div className="min-h-screen bg-white flex flex-col overflow-hidden">
        <nav className="bg-white sticky top-0 z-50" style={{boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.07), 0px 2px 3px -1px rgba(0, 0, 0, 0.06), 0px 2px 5px 0px rgba(0, 0, 0, 0.04)'}}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/spark/lessons" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              ← Back to curriculum
            </a>
            <a href="/spark" className="text-sm font-medium text-gray-900 hover:text-blue-600">
              Spark home
            </a>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          {/* Center Content */}
          <main className="flex-1 px-6 py-12 lg:py-16 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <header className="mb-12">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight" style={{fontFamily: 'var(--font-playfair)'}}>
                  {module.frontmatter.title}
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {module.frontmatter.promise}
                </p>
              </header>

              <div className="space-y-16">
                {parsedSections.map((section, i) => (
                  <section
                    key={i}
                    className="pb-12 last:pb-0"
                    style={{
                      borderBottom: i < parsedSections.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none'
                    }}
                    id={`section-${i}`}
                  >
                    <h2 className="text-3xl font-bold mb-6 text-gray-900 leading-tight" style={{fontFamily: 'var(--font-playfair)'}}>
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
          <aside className="hidden xl:block fixed right-6 top-16 w-52 p-6 flex-col overflow-y-auto border-l border-gray-100 h-[calc(100vh-4rem)]">
            <div className="space-y-8 text-sm">
              <div>
                <p className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-widest">On this page</p>
                <div className="space-y-2">
                  {parsedSections.map((section, i) => (
                    <a
                      key={i}
                      href={`#section-${i}`}
                      className="block px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors text-xs"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>

              {nextModuleSlug && nextModuleTitle && (
                <div className="pt-4">
                  <p className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-widest">Up Next</p>
                  <a href={`/spark/lessons/${nextModuleSlug}`} className="block px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-center font-medium text-sm transition-colors">
                    {nextModuleTitle}
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
