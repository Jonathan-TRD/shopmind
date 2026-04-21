import { describe, expect, it } from 'vitest';

import { mapSupabaseAuthMessage } from './map-auth-message';

describe('mapSupabaseAuthMessage', () => {
  it('maps invalid login credentials', () => {
    expect(mapSupabaseAuthMessage('Invalid login credentials')).toBe(
      'Invalid email or password.'
    );
    expect(mapSupabaseAuthMessage('invalid login credentials')).toBe(
      'Invalid email or password.'
    );
  });

  it('maps email not confirmed', () => {
    expect(mapSupabaseAuthMessage('Email not confirmed')).toBe(
      'Please confirm your email before signing in.'
    );
  });

  it('maps user already registered', () => {
    expect(mapSupabaseAuthMessage('User already registered')).toBe(
      'An account with this email already exists.'
    );
  });

  it('returns generic message for unknown errors', () => {
    expect(mapSupabaseAuthMessage('Some unexpected error from Supabase')).toBe(
      'Something went wrong. Please try again.'
    );
    expect(mapSupabaseAuthMessage('')).toBe(
      'Something went wrong. Please try again.'
    );
  });
});
