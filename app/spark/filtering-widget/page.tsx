import { FilteringWidget } from '@/components/spark/FilteringWidget';

export const metadata = {
  title: 'React Filtering Widget — Spark',
  description: 'Interactive step-by-step demo of the React filtering cycle.',
};

export default function FilteringWidgetPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="bg-white sticky top-0 z-50" style={{boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.07), 0px 2px 3px -1px rgba(0, 0, 0, 0.06), 0px 2px 5px 0px rgba(0, 0, 0, 0.04)'}}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/spark/lessons" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            ← Back to lessons
          </a>
          <a href="/spark" className="text-sm font-medium text-gray-900 hover:text-blue-600">
            Spark home
          </a>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <header className="mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight" style={{fontFamily: 'var(--font-playfair)'}}>
              React Filtering Cycle
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Watch how React handles user input, state updates, and filtering in real time. Type to search, then click each step to see exactly what's happening inside the component.
            </p>
          </header>

          {/* Widget */}
          <FilteringWidget />

          {/* Explanation */}
          <div className="mt-16 space-y-8">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{fontFamily: 'var(--font-playfair)'}}>
                The Cycle
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Every interactive React component follows the same pattern, type by keystroke.
                </p>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>User types a character</li>
                  <li>The <code className="bg-gray-100 px-2 py-1 rounded text-sm">onChange</code> handler fires</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">setQuery()</code> updates state</li>
                  <li>React re-renders the component</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">.filter()</code> runs with new state</li>
                  <li>The display updates instantly</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{fontFamily: 'var(--font-playfair)'}}>
                Why This Matters
              </h2>
              <p className="text-gray-700">
                This cycle is the same whether you're filtering users, searching products, sorting posts, or anything else. Master it, and you understand how React thinks about interactivity.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
