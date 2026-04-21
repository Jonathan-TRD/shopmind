'use client';

import { useEffect, useRef, useState } from 'react';

import { signOut } from '@/lib/auth/actions';

type UserMenuProps = {
  initials: string;
  email: string;
};

export function UserMenu({ initials, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
        className="flex size-9 items-center justify-center rounded-full bg-shopify-white text-xs font-semibold tracking-wide text-shopify-black transition-all duration-200 hover:opacity-85 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
      >
        {initials}
      </button>

      {open && (
        <div className="shadow-dropdown absolute right-0 top-full z-50 mt-2.5 min-w-52 overflow-hidden rounded-xl border border-border-card bg-dark-forest">
          {/* User info */}
          <div className="border-b border-border-card bg-forest/40 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.72px] text-shade-50">
              Signed in as
            </p>
            <p className="mt-0.5 truncate text-sm text-shopify-white">
              {email}
            </p>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors duration-150 hover:bg-shopify-white/8 hover:text-shopify-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-4 flex-shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.04a.75.75 0 1 0-1.004-1.118l-2.5 2.5a.75.75 0 0 0 0 1.118l2.5 2.5a.75.75 0 1 0 1.004-1.118L8.704 10.75H18.25A.75.75 0 0 0 19 10Z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
