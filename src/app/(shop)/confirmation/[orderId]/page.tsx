import Link from 'next/link';

type ConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { orderId } = await params;

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-start gap-8 px-4 py-16 md:px-8">
      <div className="flex size-16 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8 text-accent"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl font-light tracking-tight text-shopify-white md:text-5xl">
          Order confirmed
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted">
          Thank you for your purchase. Your order has been placed and is being
          processed.
        </p>
      </div>

      <div className="w-full rounded-xl border border-border-card bg-dark-forest p-6">
        <p className="mb-1 text-xs uppercase tracking-[0.72px] text-shade-50">
          Order ID
        </p>
        <p className="font-mono text-sm text-shopify-white break-all">
          {orderId}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/catalog"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-transparent bg-shopify-white py-3 pl-4 pr-[26px] text-base font-normal text-shopify-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        >
          Continue shopping
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-shopify-white bg-transparent py-3 pl-4 pr-[26px] text-base text-shopify-white transition-colors hover:bg-shopify-white hover:text-shopify-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
