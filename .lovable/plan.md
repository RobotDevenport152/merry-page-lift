## 实施计划（按指南优先级排序）

### 已完成

**Phase 1 — 核心电商基础**
1. ✅ 用户注册页 `/register` + 登录页 `/login`（真实 Supabase Auth）
2. ✅ 我的订单页 `/my-orders`（从数据库读取真实订单）
3. ✅ 忘记密码页 `/forgot-password`（真实密码重置）

**Phase 2 — 数据库基础**
4. ✅ 创建核心数据库表：products, orders, order_items, user_roles, profiles, fiber_batches, contact_enquiries, wholesale_enquiries
5. ✅ 配置 RLS 安全策略 + RBAC 角色系统
6. ✅ 种子产品数据和溯源批次数据

**Phase 3 — 支付集成**
7. ✅ Stripe 集成启用
8. ✅ create-checkout Edge Function（创建 Stripe Checkout Session + 写入订单数据库）
9. ✅ Checkout 页面对接真实 Stripe 支付

**Phase 4 — 前端对接数据库**
10. ✅ Shop 页从 Supabase 读取产品（useProducts hook）
11. ✅ Contact 表单写入 contact_enquiries 表
12. ✅ Wholesale 表单写入 wholesale_enquiries 表
13. ✅ SEO 组件、i18n、懒加载

### 待完成
- **邮件通知**：需配置邮件域名后启用
- **微信支付/支付宝**：需要对应的 API 集成
- **Admin 管理面板**：对接真实数据库 CRUD
- **产品图片**：替换占位图为真实产品图
