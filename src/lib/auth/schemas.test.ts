import { describe, expect, it } from 'vitest';

import { signInSchema, signUpSchema } from './schemas';

describe('signInSchema', () => {
  it('rejects invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'abc123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map((i) => i.path[0]);
      expect(msgs).toContain('password');
    }
  });

  it('accepts valid credentials', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });
});

describe('signUpSchema', () => {
  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'bad-email',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 6 characters', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'abc',
      confirmPassword: 'abc',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map((i) => i.path[0]);
      expect(msgs).toContain('password');
    }
  });

  it('rejects empty confirmPassword', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmIssue = result.error.issues.find(
        (i) => i.path[0] === 'confirmPassword'
      );
      expect(confirmIssue?.message).toBe('Passwords do not match');
    }
  });

  it('accepts matching valid passwords', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.password).toBe('secret123');
    }
  });
});
