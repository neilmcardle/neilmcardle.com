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

const phaseOrder: Record<string, number> = {
  '0 — Foundations': 0,
  '1 JS & React': 1,
  '2 DE core': 2,
  '3 Full-stack': 3,
  '4': 4,
};

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

  const modulesByPhase = modules.reduce(
    (acc, mod) => {
      if (!acc[mod.phase]) acc[mod.phase] = [];
      acc[mod.phase].push(mod);
      return acc;
    },
    {} as Record<string, ModuleWithMeta[]>
  );

  const sortedPhases = Object.keys(modulesByPhase).sort(
    (a, b) => (phaseOrder[a] ?? 999) - (phaseOrder[b] ?? 999)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Spark</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            From design foundations to full-stack engineering. Learn by reading real code and building real things.
          </p>
        </div>
      </header>

      {/* Modules by phase */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {sortedPhases.map((phase) => (
          <section key={phase} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 uppercase text-sm tracking-wide">
              {phase}
            </h2>

            <div className="space-y-3">
              {modulesByPhase[phase].map((mod) => (
                <Link
                  key={mod.slug}
                  href={`/spark/lessons/${mod.slug}`}
                  className="block p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      M{mod.module}: {mod.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {mod.promise}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
