# 鬼点子 · 原创小说投稿与阅读平台

一个开放的原创小说投稿与阅读平台：作者自由投稿，管理员审核后上架，读者在线阅读。

## 功能

- 读者：注册登录、浏览书库（按分类筛选）、在线阅读
- 作者：发布作品、逐章更新、查看审核状态
- 管理员：审核后台（通过 / 驳回，可填写驳回原因）、查看已通过/已驳回列表
- 作品：分类、封面、简介、阅读数统计

## 技术栈

- [Next.js 15](https://nextjs.org)（App Router）+ React 19 + TypeScript
- [Supabase](https://supabase.com)（Postgres 数据库 + 认证 + 行级安全 RLS）
- [Tailwind CSS](https://tailwindcss.com)
- 部署：[Vercel](https://vercel.com) 免费层

## 成本（每年）

| 项目 | 费用 |
|---|---|
| 域名 | 约 80 元（可换成十几元的 .xyz/.top） |
| Vercel 托管 | 0 元 |
| Supabase 数据库 | 0 元 |

## 快速开始

1. 创建 Supabase 项目，在 SQL Editor 中执行 `supabase/schema.sql`（建表 + 权限 + 触发器）
2. 复制 `.env.example` 为 `.env.local`，填入 Supabase 的 Project URL 和 anon key
3. `npm install` → `npm run dev` 本地开发
4. 部署到 Vercel：配置同名环境变量后 Deploy

**完整零基础部署教程见《小说平台部署教程.md》**（项目同级目录）。

## 目录结构

```
app/                  # 页面（App Router）
  page.tsx            # 首页
  works/              # 书库 + 作品详情
  read/               # 阅读页
  login/ signup/      # 认证
  dashboard/          # 作者中心（投稿/编辑/章节）
  admin/              # 审核后台
components/           # 公共组件
lib/supabase/         # Supabase 客户端与查询
supabase/schema.sql   # 数据库脚本（必看）
```

## 上线后注意

- 投稿内容需先审核后展示（先审后发）
- 公开运营需遵守内容安全与网络出版相关法规
- 免费层 Supabase 项目闲置一周会暂停，活跃使用即可
