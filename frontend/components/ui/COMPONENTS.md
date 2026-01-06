# shadcn/ui 组件列表

本文档列出了项目中已安装的所有 shadcn/ui 组件。

## 已安装组件（共 53 个）

### 布局组件
- **accordion** - 手风琴组件
- **aspect-ratio** - 宽高比组件
- **card** - 卡片组件
- **collapsible** - 可折叠组件
- **resizable** - 可调整大小组件
- **scroll-area** - 滚动区域组件
- **separator** - 分隔符组件
- **sheet** - 侧边栏抽屉组件
- **sidebar** - 侧边栏组件

### 表单组件
- **button** - 按钮组件
- **button-group** - 按钮组组件
- **checkbox** - 复选框组件
- **field** - 字段组件
- **form** - 表单组件
- **input** - 输入框组件
- **input-group** - 输入组组件
- **input-otp** - OTP 输入组件
- **label** - 标签组件
- **radio-group** - 单选按钮组组件
- **select** - 选择器组件
- **slider** - 滑块组件
- **switch** - 开关组件
- **textarea** - 文本域组件
- **toggle** - 切换按钮组件
- **toggle-group** - 切换按钮组组件

### 反馈组件
- **alert** - 警告提示组件
- **alert-dialog** - 警告对话框组件
- **dialog** - 对话框组件
- **drawer** - 抽屉组件
- **empty** - 空状态组件
- **progress** - 进度条组件
- **skeleton** - 骨架屏组件
- **sonner** - Toast 通知组件
- **spinner** - 加载动画组件
- **tooltip** - 工具提示组件

### 导航组件
- **breadcrumb** - 面包屑组件
- **command** - 命令面板组件
- **context-menu** - 右键菜单组件
- **dropdown-menu** - 下拉菜单组件
- **menubar** - 菜单栏组件
- **navigation-menu** - 导航菜单组件
- **pagination** - 分页组件
- **tabs** - 标签页组件

### 数据展示组件
- **avatar** - 头像组件
- **badge** - 徽章组件
- **calendar** - 日历组件
- **carousel** - 轮播图组件
- **chart** - 图表组件
- **hover-card** - 悬停卡片组件
- **item** - 列表项组件
- **kbd** - 键盘按键组件
- **popover** - 弹出框组件
- **table** - 表格组件

## Hooks

- **use-mobile** - 检测移动设备的 Hook

## 使用方法

### 导入组件

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### 使用示例

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>标题</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>点击我</Button>
      </CardContent>
    </Card>
  );
}
```

## 相关文档

- [shadcn/ui 官方文档](https://ui.shadcn.com)
- [组件文档](https://ui.shadcn.com/docs/components)

## 安装日期

所有组件已于 2024 年安装完成。

