import { Suspense } from 'react';
import { CatalogView } from './catalog-view';

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16 text-muted md:px-8">
          Loading catalog…
        </div>
      }
    >
      <CatalogView />
    </Suspense>
  );
}
