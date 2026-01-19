# 布局组件使用指南

## 可用组件

### ✅ SimplePage (推荐)

通用页面布局，不包含侧边栏或全局导航。适用于大部分功能页面。

```tsx
import { SimplePage } from "@/components/layout/simple-page";

export default function MyPage() {
  return (
    <SimplePage
      title="页面标题"
      description="页面描述（可选）"
      maxWidth="lg" // sm | md | lg | xl | 2xl | full，默认 lg
    >
      <YourContent />
    </SimplePage>
  );
}
```

### ✅ MainLayout

灵活的主布局组件，可选择性添加 header、footer、sidebar。

```tsx
import { MainLayout } from "@/components/layout/main-layout";

export default function MyPage() {
  return (
    <MainLayout>
      <YourContent />
    </MainLayout>
  );
}
```

### ⚠️ DashboardLayout (已废弃)

**不要使用！** 此组件包含全局导航侧边栏。

项目要求：不在功能页面中添加侧边栏。请使用 `SimplePage` 或 `MainLayout` 代替。

## 项目规范

- ❌ 不要在新功能页面中添加全局导航侧边栏
- ✅ 使用 `SimplePage` 作为标准页面布局
- ✅ 只在特定功能需要时才添加页面专用的侧边栏组件（如 `/insights` 的 MemoryRail）

## 示例

### 示例 1：简单功能页面

```tsx
// app/settings/page.tsx
import { SimplePage } from "@/components/layout/simple-page";

export default function SettingsPage() {
  return (
    <SimplePage title="设置" description="管理你的账户设置">
      <SettingsForm />
    </SimplePage>
  );
}
```

### 示例 2：自定义布局的页面

如果页面需要完全自定义的布局（如 `/insights` 的三栏布局），可以不使用布局组件，直接实现：

```tsx
// app/insights/page.tsx
export default function InsightsPage() {
  return (
    <div className="h-screen flex bg-background">
      <aside className="w-80">...</aside>
      <main className="flex-1">...</main>
      <aside className="w-96">...</aside>
    </div>
  );
}
```
