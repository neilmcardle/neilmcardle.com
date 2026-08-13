import Link from 'next/link';
import { getAllModules, loadModule } from '@/lib/spark/content';

export const metadata = {
  title: 'Lessons — Spark',
  description: 'The complete Spark curriculum. From foundations to capstone.',
};

interface ModuleWithMeta {
  slug: string;
  title: string;
  module: number;
  phase: string;
  promise: string;
}

export default async function LessonsPage() {
  const slugs = await getAllModules();

  const modules: ModuleWithMeta[] = [];

  for (const slug of slugs) {
    try {
      const module = await loadModule(slug);
      modules.push({
        slug,
        title: module.frontmatter.title,
        module: module.frontmatter.module,
        phase: module.frontmatter.phase,
        promise: module.frontmatter.promise,
      });
    } catch (error) {
      console.error(`Failed to load module ${slug}:`, error);
    }
  }

  const sortedModules = modules.sort((a, b) => a.module - b.module);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-3" style={{fontFamily: 'var(--font-playfair)'}}>
            Spark
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            From design foundations to full-stack engineering. Learn by reading real code and building real things.
          </p>
        </div>
      </header>

      {/* All modules in grid */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sortedModules.map((mod) => (
            <Link
              key={mod.slug}
              href={`/spark/lessons/${mod.slug}`}
              className="group relative block"
            >
              {/* Background number */}
              <div className="absolute -top-8 -left-4 text-8xl font-bold text-gray-100 -z-10 leading-none select-none pointer-events-none">
                {String(mod.module).padStart(2, '0')}
              </div>

              {/* Card */}
              <div className="relative p-8 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition-all hover:shadow-md">
                <div className="mb-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Module {mod.module}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight" style={{fontFamily: 'var(--font-playfair)'}}>
                  {mod.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {mod.promise}
                </p>

                <div className="pt-4 border-t border-gray-200">
                  <span className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Read module →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
