/**
 * Maps raw Supabase auth error messages to safe, user-visible strings.
 * Keep patterns in sync with your Supabase project's email/password settings.
 */
export function mapSupabaseAuthMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return 'Invalid email or password.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Please confirm your email before signing in.';
  }
  if (/user already registered/i.test(message)) {
    return 'An account with this email already exists.';
  }
  return 'Something went wrong. Please try again.';
}
