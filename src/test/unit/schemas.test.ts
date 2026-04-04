import { describe, it, expect } from 'vitest';
import { checkoutSchema, contactSchema, batchCodeSchema } from '@/lib/schemas';

// ─── checkoutSchema ────────────────────────────────────────────────────────────

describe('checkoutSchema', () => {
  const valid = {
    name: '张伟',
    email: 'zhang@example.com',
    phone: '13800138000',
    paymentMethod: 'stripe' as const,
    isGift: false,
  };

  it('accepts a fully valid payload', () => {
    expect(() => checkoutSchema.parse(valid)).not.toThrow();
  });

  it('rejects empty name', () => {
    const result = checkoutSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).toContain('Name is required');
  });

  it('rejects malformed email', () => {
    const result = checkoutSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).toContain('email');
  });

  it('rejects phone shorter than 7 chars', () => {
    const result = checkoutSchema.safeParse({ ...valid, phone: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid paymentMethod', () => {
    const result = checkoutSchema.safeParse({ ...valid, paymentMethod: 'bitcoin' });
    expect(result.success).toBe(false);
  });

  it('accepts all three valid payment methods', () => {
    for (const method of ['stripe', 'wechat', 'alipay'] as const) {
      expect(checkoutSchema.safeParse({ ...valid, paymentMethod: method }).success).toBe(true);
    }
  });

  it('rejects giftMessage longer than 100 chars', () => {
    const result = checkoutSchema.safeParse({
      ...valid,
      isGift: true,
      giftMessage: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).toContain('100');
  });

  it('accepts giftMessage of exactly 100 chars', () => {
    const result = checkoutSchema.safeParse({
      ...valid,
      isGift: true,
      giftMessage: 'A'.repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it('optional address fields can be omitted', () => {
    const minimal = { name: '李明', email: 'li@example.com', phone: '12345678', paymentMethod: 'alipay' as const };
    expect(checkoutSchema.safeParse(minimal).success).toBe(true);
  });

  it('defaults isGift to false when omitted', () => {
    const result = checkoutSchema.parse({ name: '王芳', email: 'wang@example.com', phone: '12345678', paymentMethod: 'wechat' });
    expect(result.isGift).toBe(false);
  });
});

// ─── contactSchema ─────────────────────────────────────────────────────────────

describe('contactSchema', () => {
  const valid = {
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message with enough characters.',
  };

  it('accepts valid contact form data', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects message shorter than 10 chars', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'Hi' });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).toContain('10');
  });

  it('rejects missing name', () => {
    expect(contactSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'invalid' }).success).toBe(false);
  });

  it('allows optional phone and subject', () => {
    expect(contactSchema.safeParse({ ...valid, phone: '021123', subject: 'Order inquiry' }).success).toBe(true);
  });
});

// ─── batchCodeSchema ───────────────────────────────────────────────────────────

describe('batchCodeSchema', () => {
  it('accepts PA-2025-001', () => {
    expect(batchCodeSchema.safeParse('PA-2025-001').success).toBe(true);
  });

  it('accepts PA-2025-999', () => {
    expect(batchCodeSchema.safeParse('PA-2025-999').success).toBe(true);
  });

  it('rejects lowercase pa-2025-001', () => {
    expect(batchCodeSchema.safeParse('pa-2025-001').success).toBe(false);
  });

  it('rejects missing leading PA', () => {
    expect(batchCodeSchema.safeParse('2025-001').success).toBe(false);
  });

  it('rejects wrong digit count in batch number', () => {
    expect(batchCodeSchema.safeParse('PA-2025-01').success).toBe(false);
    expect(batchCodeSchema.safeParse('PA-2025-0001').success).toBe(false);
  });

  it('rejects empty string', () => {
    expect(batchCodeSchema.safeParse('').success).toBe(false);
  });

  it('rejects arbitrary string', () => {
    expect(batchCodeSchema.safeParse('invalid-batch').success).toBe(false);
  });
});
