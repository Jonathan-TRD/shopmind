import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-8 px-4 py-16 md:px-16">
      <h1 className="font-display text-4xl font-light text-shopify-white md:text-5xl">
        Order confirmed
      </h1>
      <p className="max-w-xl text-lg text-muted">
        Confirmation placeholder. Thank you — your order flow will continue
        here.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-12 w-fit items-center justify-center rounded-full border-2 border-shopify-white bg-transparent py-3 pl-4 pr-[26px] text-base text-shopify-white transition-all hover:bg-shopify-white hover:text-shopify-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        Back to catalog
      </Link>
    </div>
  );
}
