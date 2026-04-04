import { z } from 'zod';

export const checkoutSchema = z.object({
  name: z.string().min(1, '姓名不能为空 / Name is required'),
  email: z.string().email('邮箱格式不正确 / Invalid email'),
  phone: z.string().min(7, '请输入有效电话 / Valid phone required'),
  province: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  paymentMethod: z.enum(['stripe', 'wechat', 'alipay']),
  isGift: z.boolean().default(false),
  giftMessage: z.string().max(100, '留言不超过100字 / Max 100 characters').optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, '消息至少10个字符 / Message must be at least 10 characters'),
});

export const batchCodeSchema = z.string()
  .regex(/^PA-\d{4}-\d{3}$/, '批次码格式不正确，示例：PA-2025-001 / Invalid format, e.g. PA-2025-001');

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
