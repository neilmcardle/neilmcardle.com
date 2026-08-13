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

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/spark/lessons" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              ← Back to curriculum
            </a>
            <a href="/spark" className="text-sm font-medium text-gray-900 hover:text-blue-600">
              Spark home
            </a>
          </div>
        </nav>

        <div className="flex flex-1">
          {/* Left Sidebar */}
          <aside className="hidden lg:flex w-56 border-r border-gray-200 bg-gray-50 p-6 flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-widest">Modules</p>
                <div className="space-y-1">
                  {allModuleSlugs.map((moduleSlug) => {
                    const moduleNum = parseInt(moduleSlug.match(/^m(\d+)/)?.[1] || '0');
                    const isActive = module.frontmatter.module === moduleNum;
                    return (
                      <a
                        key={moduleSlug}
                        href={`/spark/lessons/${moduleSlug}`}
                        className={`block px-3 py-2 rounded text-xs transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-900 font-semibold'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        M{moduleNum}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Center Content */}
          <main className="flex-1 px-6 py-12 lg:py-16">
            <div className="max-w-3xl mx-auto">
              <header className="mb-12">
                <p className="text-sm text-gray-500 mb-3 uppercase tracking-wide">
                  Module {module.frontmatter.module}
                </p>
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
                    className="pb-12 border-b border-gray-200 last:border-b-0 last:pb-0"
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
          <aside className="hidden xl:flex w-56 border-l border-gray-200 bg-gray-50 p-6 flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-8 text-sm">
              <div>
                <p className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-widest">On this page</p>
                <div className="space-y-2">
                  {parsedSections.map((section, i) => (
                    <a
                      key={i}
                      href={`#section-${i}`}
                      className="block px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors text-xs"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>

              {module.frontmatter.module < 18 && (() => {
                const nextModuleSlug = allModuleSlugs.find(s => parseInt(s.match(/^m(\d+)/)?.[1] || '0') === module.frontmatter.module + 1);
                return nextModuleSlug ? (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-widest">Next</p>
                    <a href={`/spark/lessons/${nextModuleSlug}`} className="block px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-center font-medium text-sm transition-colors">
                      M{module.frontmatter.module + 1}
                    </a>
                  </div>
                ) : null;
              })()}
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
