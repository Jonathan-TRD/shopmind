import { CheckoutForm } from './checkout-form';

export default function CheckoutPage() {
  return (
    <div className="mx-auto min-h-full max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="font-display text-4xl font-light tracking-tight text-shopify-white md:text-5xl">
          Checkout
        </h1>
      </header>
      <CheckoutForm />
    </div>
  );
}
