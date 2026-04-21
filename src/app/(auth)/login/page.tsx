import { LoginForm } from './login-form';
import { safeResolveNextUrl } from '@/lib/auth/safe-redirect';

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next: nextRaw } = await searchParams;
  const nextPath = safeResolveNextUrl(nextRaw ?? null, '/catalog');

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
