import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-8 px-4 py-16 md:px-16">
      <h1 className="font-display text-4xl font-light text-shopify-white md:text-5xl">
        Checkout
      </h1>
      <p className="max-w-xl text-lg text-muted">
        Checkout placeholder. This route is protected — you are signed in.
      </p>
      <Link
        href="/confirmation/demo"
        className="inline-flex min-h-12 w-fit items-center justify-center rounded-full border-2 border-transparent bg-shopify-white py-3 pl-4 pr-[26px] text-base text-shopify-black transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        Place order (demo)
      </Link>
    </div>
  );
}
