# VibeFlow Frontend

基于 Next.js、Tailwind CSS 和 shadcn/ui 构建的前端应用。

## 技术栈

- **Next.js 16** - React 框架，使用 App Router
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 实用优先的 CSS 框架
- **shadcn/ui** - 高质量、可定制的组件库

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 项目结构

```
frontend/
├── app/                    # Next.js App Router 目录
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式（包含 Tailwind 和 shadcn/ui 主题）
├── components/            # React 组件
│   └── ui/               # shadcn/ui 组件
│       └── button.tsx    # Button 组件示例
├── lib/                  # 工具函数
│   └── utils.ts          # 通用工具函数（cn 函数等）
├── components.json       # shadcn/ui 配置文件
└── tailwind.config.ts    # Tailwind CSS 配置
```

## 添加 shadcn/ui 组件

使用 shadcn/ui CLI 添加组件：

```bash
npx shadcn@latest add [component-name]
```

例如：

```bash
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
```

## 主题定制

主题变量定义在 `app/globals.css` 中。你可以修改 CSS 变量来定制主题：

- `--background` - 背景色
- `--foreground` - 前景色
- `--primary` - 主色调
- `--secondary` - 次要色调
- 等等...

支持明暗主题切换，通过 `dark` 类名控制。

## 开发指南

### 使用组件

```tsx
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  return (
    <div>
      <Button>点击我</Button>
      <Button variant="secondary">次要按钮</Button>
    </div>
  );
}
```

### 样式工具函数

使用 `cn` 函数合并类名：

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />
```

## 更多资源

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
