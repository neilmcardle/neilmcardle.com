import Link from 'next/link';
import { getAllModules, loadModule } from '@/lib/spark/content';
import { ModuleCard } from './module-card';

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
        <div className="grid grid-cols-2 gap-8">
          {sortedModules.map((mod) => (
            <ModuleCard key={mod.slug} mod={mod} />
          ))}
        </div>
      </main>
    </div>
  );
}
