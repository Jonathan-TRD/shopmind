import { Button } from './button';

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
      aria-label="Catalog pagination"
    >
      <p className="text-sm text-muted">
        Page <span className="font-medium text-shopify-white">{safePage}</span>{' '}
        of <span className="font-medium text-shopify-white">{totalPages}</span>
        <span className="ml-2 text-shade-50">· {total} products</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!canPrev}
          onClick={() => onPageChange(safePage - 1)}
          className="min-h-10 px-4 py-2 text-sm"
        >
          ← Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1
            )
            .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                acc.push('ellipsis');
              }
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-shade-50">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={item === safePage ? 'page' : undefined}
                  className={`
                    flex size-9 items-center justify-center rounded-full text-sm transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-void
                    ${
                      item === safePage
                        ? 'bg-shopify-white font-medium text-shopify-black'
                        : 'text-muted hover:bg-shopify-white/10 hover:text-shopify-white'
                    }
                  `.trim()}
                >
                  {item}
                </button>
              )
            )}
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={!canNext}
          onClick={() => onPageChange(safePage + 1)}
          className="min-h-10 px-4 py-2 text-sm"
        >
          Next →
        </Button>
      </div>
    </nav>
  );
}
