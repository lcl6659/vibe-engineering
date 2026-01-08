# 前端开发规范文档

本文档定义了前端项目的设计系统、代码规范和最佳实践，确保团队开发的一致性和代码质量。

> **🎨 设计风格**: 项目采用 **Base.org 风格** - 蓝色主色调、超大圆角、无边框大阴影设计。

## 📋 目录

- [设计系统](#设计系统)
- [颜色规范](#颜色规范)
- [Base.org 视觉规范](#baseorg-视觉规范)
- [字体规范](#字体规范)
- [组件规范](#组件规范)
- [代码风格](#代码风格)
- [自定义工具类](#自定义工具类)
- [主题配置](#主题配置)

---

## 🎨 设计系统

### UI 框架

- **组件库**: shadcn/ui (New York 风格)
- **基础颜色**: Neutral
- **CSS 变量**: 启用
- **图标库**: Lucide React

### 技术栈

- **框架**: Next.js 16+
- **样式**: Tailwind CSS v4
- **主题**: next-themes (支持浅色/深色切换)
- **字体**: Space Grotesk (主字体)

---

## 🎨 颜色规范

### 主色调 - Base.org 风格

项目采用 **Base.org 风格**，使用白色背景和 **蓝色主色调 (blue-600)**。

#### 浅色主题颜色（默认）

```css
/* 背景色 */
--background: 0 0% 100%      /* 纯白背景 */
--card: 0 0% 100%            /* 白色卡片背景 */
--popover: 0 0% 100%         /* 白色弹出层背景 */

/* 前景色 */
--foreground: 0 0% 3.9%      /* 深色主要文本 */
--muted-foreground: 0 0% 45.1% /* 灰色次要文本 */

/* 主色 - Base 蓝色 */
--primary: 221 83% 53%       /* Base 蓝色 (blue-600) */
--primary-foreground: 0 0% 100% /* 白色主色文本 */

/* 次要色 */
--secondary: 0 0% 96.1%      /* 浅灰色 */
--secondary-foreground: 0 0% 9%

/* 强调色 - 浅蓝 */
--accent: 221 83% 96%        /* 浅蓝色 */
--accent-foreground: 221 83% 53%

/* 静音色 */
--muted: 0 0% 96.1%         /* 浅灰色 */
--muted-foreground: 0 0% 45.1%

/* 危险色 */
--destructive: 0 84.2% 60.2% /* 红色 */
--destructive-foreground: 0 0% 98%

/* 边框和输入 */
--border: 0 0% 91%           /* 更浅的边框 */
--input: 0 0% 91%            /* 更浅的输入框 */
--ring: 221 83% 53%          /* 蓝色焦点环 */
```

#### 深色主题颜色（可选）

```css
/* 背景色 */
--background: 0 0% 0%        /* 纯黑背景 */
--card: 0 0% 5%              /* 深灰卡片背景 */
--popover: 0 0% 5%           /* 深灰弹出层背景 */

/* 前景色 */
--foreground: 0 0% 98%       /* 浅色主要文本 */
--muted-foreground: 0 0% 57% /* 灰色次要文本 */

/* 主色 - Base 蓝色 */
--primary: 221 83% 53%       /* Base 蓝色 */
--primary-foreground: 0 0% 100%

/* 次要色 */
--secondary: 0 0% 10%        /* 深灰色 */
--secondary-foreground: 0 0% 98%

/* 强调色 - 深蓝 */
--accent: 221 83% 15%        /* 深蓝色 */
--accent-foreground: 221 83% 70%

/* 静音色 */
--muted: 0 0% 15%           /* 深灰色 */
--muted-foreground: 0 0% 57%

/* 危险色 */
--destructive: 0 84% 60%     /* 红色 */
--destructive-foreground: 0 0% 98%

/* 边框和输入 */
--border: 0 0% 12%          /* 深灰色边框 */
--input: 0 0% 10%           /* 深灰色输入框 */
--ring: 221 83% 53%         /* 蓝色焦点环 */
```

#### 业务颜色

```tsx
// 盈利/收益颜色
profit: "#86EFAC"  // 绿色

// 亏损/损失颜色
loss: "#F87171"    // 红色
```

### 使用示例

```tsx
// ✅ 正确：使用语义化颜色类
<div className="bg-background text-foreground">
  <Card className="bg-card text-card-foreground">
    <Button className="bg-primary text-primary-foreground">提交</Button>
  </Card>
</div>

// ✅ 正确：使用业务颜色
<span className="text-profit">+$100</span>
<span className="text-loss">-$50</span>

// ❌ 错误：硬编码颜色值
<div className="bg-black text-white">...</div>

// ❌ 错误：使用绿色或紫色作为主色
<div className="bg-green-500">...</div>
```

---

## 🎯 Base.org 视觉规范

### 圆角规范

项目使用**超大圆角**设计：

```tsx
// ✅ 正确：卡片使用超大圆角
<Card className="rounded-[2rem]">...</Card>
<Card className="rounded-3xl">...</Card>

// ✅ 正确：按钮使用圆角胶囊
<Button className="rounded-full">...</Button>

// ✅ 正确：输入框使用圆角胶囊
<Input className="rounded-full h-16">...</Input>

// ❌ 错误：使用小圆角
<Card className="rounded-lg">...</Card>
```

### 阴影规范

项目使用**无边框 + 大阴影**设计：

```tsx
// ✅ 正确：卡片无边框大阴影
<Card className="border-0 shadow-xl">...</Card>

// ✅ 正确：悬停加强阴影
<Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">...</Card>

// ✅ 正确：输入框大阴影
<Input className="border-0 shadow-xl">...</Input>

// ❌ 错误：使用边框
<Card className="border border-gray-200">...</Card>
```

### 间距规范

项目使用**宽松布局**：

```tsx
// ✅ 正确：页面大间距
<div className="py-16 md:py-24">...</div>

// ✅ 正确：元素间大间距
<div className="gap-6 md:gap-8">...</div>

// ✅ 正确：容器宽度
<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">...</div>
```

### 标题规范

项目使用**超大标题 + 紧凑字距**：

```tsx
// ✅ 正确：大标题
<h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
  VIBE <span className="text-primary">SUMMARIZER.</span>
</h1>

// ✅ 正确：紧凑字距
<h2 className="text-4xl font-bold tracking-tight">...</h2>
```

### 状态标签规范

```tsx
// ✅ 正确：无边框背景色
<div className="rounded-full bg-primary/10 text-primary px-4 py-1.5">
  状态标签
</div>

// ❌ 错误：使用边框
<div className="rounded-full border px-4 py-1.5">...</div>
```

### 空状态规范

```tsx
// ✅ 正确：柔和背景 + 内阴影
<div className="rounded-[2rem] bg-muted/30 shadow-inner py-24">
  <p className="text-muted-foreground">暂无内容</p>
</div>

// ❌ 错误：虚线边框
<div className="border-2 border-dashed">...</div>
```

### 交互效果规范

```tsx
// ✅ 正确：平滑过渡
<Card className="transition-all duration-300 hover:shadow-2xl">...</Card>

// ✅ 正确：图片悬停缩放
<img className="transition-transform duration-300 group-hover:scale-105" />

// ✅ 正确：按钮悬停
<Button className="hover:bg-primary/90 transition-all duration-300">...</Button>
```

---

## 🔤 字体规范

### 主字体

- **字体名称**: Space Grotesk
- **字重**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **使用场景**: 所有 UI 文本

### 等宽字体

- **字体名称**: Geist Mono
- **使用场景**: 代码、数字、等宽文本

### 字体特性

```css
font-feature-settings: "rlig" 1, "calt" 1;
```

启用连字和上下文替代，提升文本可读性。

### 使用示例

```tsx
// ✅ 正确：使用默认字体（Space Grotesk）
<p className="text-base">常规文本</p>
<p className="font-medium">中等字重</p>
<p className="font-semibold">半粗体</p>
<p className="font-bold">粗体</p>

// ✅ 正确：代码使用等宽字体
<code className="font-mono">const x = 1;</code>
```

---

## 🧩 组件规范

### shadcn/ui 组件

项目使用 **New York** 风格的 shadcn/ui 组件。

#### 组件安装

```bash
npx shadcn@latest add [component-name]
```

#### 组件导入

```tsx
// ✅ 正确：从 @/components/ui 导入
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ❌ 错误：直接使用 Radix UI
import * as Button from "@radix-ui/react-button";
```

#### 组件使用规范

1. **保持组件原样**: 不要修改 `components/ui` 目录下的组件
2. **扩展组件**: 在 `components` 目录下创建包装组件
3. **类型安全**: 使用 TypeScript 类型定义

```tsx
// ✅ 正确：创建包装组件
// components/custom-button.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CustomButton({ className, ...props }) {
  return (
    <Button
      className={cn("custom-styles", className)}
      {...props}
    />
  );
}

// ✅ 正确：使用组件
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

<Button variant="default" size="lg" className={cn("additional-classes")}>
  按钮文本
</Button>
```

---

## 💻 代码风格

### TypeScript 规范

1. **严格模式**: 启用 TypeScript 严格模式
2. **类型定义**: 所有函数和组件必须有类型定义
3. **接口优先**: 优先使用 `interface` 而非 `type`

```tsx
// ✅ 正确：完整的类型定义
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function CustomButton({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ 错误：缺少类型定义
export function CustomButton({ label, onClick, disabled }) {
  // ...
}
```

### React 组件规范

1. **函数组件**: 优先使用函数组件和 Hooks
2. **组件命名**: 使用 PascalCase
3. **文件命名**: 使用 kebab-case (如 `custom-button.tsx`)

```tsx
// ✅ 正确：函数组件
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // 获取用户数据
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// ✅ 正确：使用 Server Components (Next.js)
export async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);
  return <div>{user.name}</div>;
}
```

### 样式规范

1. **Tailwind 优先**: 优先使用 Tailwind 工具类
2. **条件样式**: 使用 `cn()` 工具函数合并类名
3. **响应式**: 使用 Tailwind 响应式前缀

```tsx
import { cn } from "@/lib/utils";

// ✅ 正确：使用 cn() 合并类名
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>

// ✅ 正确：响应式设计
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* 内容 */}
</div>

// ❌ 错误：内联样式
<div style={{ width: "100%" }}>...</div>
```

---

## 🛠️ 自定义工具类

### 滚动条隐藏

```tsx
// 隐藏滚动条但保持滚动功能
<div className="no-scrollbar overflow-auto">
  {/* 可滚动内容 */}
</div>
```

### 业务颜色类

```tsx
// 盈利/收益文本
<span className="text-profit">+$100</span>

// 亏损/损失文本
<span className="text-loss">-$50</span>
```

### 卡片样式类

```tsx
// 深色卡片背景
<div className="bg-card-dark">
  {/* 内容 */}
</div>

// 卡片悬停背景
<div className="bg-card-hover hover:bg-card-hover">
  {/* 内容 */}
</div>

// 卡片边框
<div className="border border-card">
  {/* 内容 */}
</div>
```

---

## 🌓 主题配置

### 主题系统

项目使用 `next-themes` 支持浅色/深色主题切换。

### 默认主题

项目默认使用浅色主题，同时支持深色主题切换：

```tsx
// app/layout.tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"  // 跟随系统设置
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

### 主题切换

```tsx
"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      切换主题
    </Button>
  );
}
```

### CSS 变量

所有颜色都通过 CSS 变量定义，确保主题切换时颜色正确更新：

```css
/* 使用 CSS 变量 */
background-color: hsl(var(--background));
color: hsl(var(--foreground));
```

---

## 📁 目录结构规范

```
frontend/
├── app/                    # Next.js App Router 页面
│   ├── (auth)/            # 路由组
│   ├── (dashboard)/       # 路由组
│   └── globals.css        # 全局样式
├── components/            # 组件目录
│   ├── ui/               # shadcn/ui 组件（不要修改）
│   ├── layout/           # 布局组件
│   └── [feature]/        # 功能组件
├── lib/                  # 工具库
│   ├── utils.ts          # 工具函数
│   └── api/              # API 客户端
├── hooks/                # 自定义 Hooks
├── types/                # TypeScript 类型定义
└── public/               # 静态资源
```

---

## ✅ 检查清单

开发新功能时，请确保符合 **Base.org 风格**：

### 视觉风格检查
- [ ] 主色是蓝色（使用 `primary` token，不是绿色）
- [ ] 卡片使用超大圆角 `rounded-[2rem]` 或 `rounded-3xl`
- [ ] 卡片使用无边框大阴影 `border-0 shadow-xl`
- [ ] 按钮使用圆角胶囊 `rounded-full`
- [ ] 输入框使用大尺寸 `h-16 rounded-full border-0 shadow-xl`
- [ ] 悬停效果使用 `duration-300` 平滑过渡
- [ ] 标题使用超大字号 + `tracking-tighter`

### 代码规范检查
- [ ] 使用语义化的 Tailwind 颜色类（如 `bg-background`）
- [ ] 业务颜色使用 `text-profit` 或 `text-loss`
- [ ] 组件从 `@/components/ui` 导入
- [ ] 所有函数和组件有完整的 TypeScript 类型
- [ ] 使用 `cn()` 合并类名
- [ ] 响应式设计使用 Tailwind 响应式前缀
- [ ] 遵循目录结构规范
- [ ] 代码通过 ESLint 检查

---

## 📚 参考资源

- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Next.js 文档](https://nextjs.org)
- [Lucide Icons](https://lucide.dev)

---

## 🔄 更新日志

- **2026-01-08**: 更新为 Base.org 风格 - 蓝色主色调、超大圆角、无边框大阴影

---

**注意**: 本文档会随着项目发展持续更新，请定期查看最新版本。

