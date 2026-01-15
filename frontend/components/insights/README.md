# 滑词交互功能组件

实现了完整的文本选中、高亮标注、提问和翻译功能。

## 组件说明

### 核心组件

1. **SelectionToolbar** - 悬浮工具栏
   - 在文本选中时显示
   - 提供高亮、提问、翻译三个操作
   - 支持键盘快捷键 (H/A/T)
   - 自动定位在选中文本上方

2. **HighlightPopover** - 高亮颜色选择弹窗
   - 5 种颜色选择（黄/绿/蓝/紫/红）
   - 支持添加备注
   - 遵循 Base.org 设计规范

3. **HighlightedText** - 高亮文本渲染
   - 渲染带高亮标记的文本
   - 处理重叠高亮
   - 点击高亮可查看备注和删除

4. **TranscriptViewWithHighlights** - 增强的转录文本视图
   - 集成所有滑词交互功能
   - 支持时间戳导航
   - 支持中英对照模式

### Hooks

1. **useTextSelection** - 文本选中检测
   ```tsx
   const { selection, clearSelection } = useTextSelection(containerRef);
   ```

2. **useHighlights** - 高亮数据管理
   ```tsx
   const {
     highlights,
     loading,
     error,
     createHighlight,
     deleteHighlight,
     refetch,
   } = useHighlights(insightId);
   ```

## 使用示例

### 基础使用

```tsx
import { TranscriptViewWithHighlights } from "@/components/insights/TranscriptViewWithHighlights";

function MyComponent() {
  const [displayMode, setDisplayMode] = useState<"zh" | "en" | "bilingual">("zh");

  return (
    <TranscriptViewWithHighlights
      insightId={1}
      transcripts={transcripts}
      displayMode={displayMode}
      onDisplayModeChange={setDisplayMode}
      onTimestampClick={(seconds) => {
        // 跳转到视频时间点
        console.log("Jump to", seconds);
      }}
    />
  );
}
```

### 自定义使用

如果需要自定义集成，可以单独使用各个组件：

```tsx
import { useRef, useState } from "react";
import { useTextSelection, useHighlights } from "@/hooks";
import { SelectionToolbar } from "@/components/insights/SelectionToolbar";
import { HighlightPopover } from "@/components/insights/HighlightPopover";
import { HighlightedText } from "@/components/insights/HighlightedText";

function CustomComponent({ insightId, content }) {
  const containerRef = useRef(null);
  const { selection, clearSelection } = useTextSelection(containerRef);
  const { highlights, createHighlight, deleteHighlight } = useHighlights(insightId);

  const [showPopover, setShowPopover] = useState(false);

  const handleHighlight = () => {
    setShowPopover(true);
  };

  const handleConfirm = async (color, note) => {
    if (!selection) return;
    await createHighlight({
      text: selection.text,
      start_offset: selection.startOffset,
      end_offset: selection.endOffset,
      color,
      note,
    });
    clearSelection();
  };

  return (
    <div ref={containerRef}>
      <HighlightedText
        content={content}
        highlights={highlights}
        onHighlightDelete={deleteHighlight}
      />

      {selection && (
        <SelectionToolbar
          selection={selection}
          onHighlight={handleHighlight}
          onAsk={() => console.log("Ask")}
          onTranslate={() => console.log("Translate")}
          onClose={clearSelection}
        />
      )}

      <HighlightPopover
        open={showPopover}
        onOpenChange={setShowPopover}
        onConfirm={handleConfirm}
        selectedText={selection?.text || ""}
      />
    </div>
  );
}
```

## API 端点

组件使用以下 API 端点（已在 `lib/api/endpoints.ts` 中定义）：

- `GET /api/v1/insights/:id/highlights` - 获取高亮列表
- `POST /api/v1/insights/:id/highlights` - 创建高亮
- `DELETE /api/v1/insights/:id/highlights/:highlightId` - 删除高亮

## 设计规范

所有组件严格遵循 Base.org 设计系统：

- ✅ 无边框设计（按钮、输入框、卡片均无边框）
- ✅ 使用 Base Blue (#0000ff) 作为主色
- ✅ 圆角使用 12-24px（rounded-xl 到 rounded-2xl）
- ✅ 使用背景色差异创建视觉层次
- ✅ 极简动画（200ms 过渡）
- ✅ 高亮颜色使用 Base.org 调色板

## 键盘快捷键

选中文本后可使用以下快捷键：

- `H` - 高亮
- `A` - 提问（开发中）
- `T` - 翻译（开发中）
- `Esc` - 关闭工具栏

## 注意事项

1. **文本偏移计算**：使用 TreeWalker API 遍历 DOM 节点计算准确的文本偏移
2. **重叠高亮处理**：按 start_offset 排序，优先渲染先创建的高亮
3. **自动关闭**：点击容器外部自动关闭工具栏和弹窗
4. **错误处理**：使用 sonner toast 显示操作结果和错误信息

## 待实现功能

- [ ] 提问功能 - 打开右侧 Chat 面板
- [ ] 翻译功能 - 显示翻译 Tooltip
- [ ] 高亮编辑功能 - 修改颜色和备注
- [ ] 导出高亮 - 支持导出所有高亮到 Markdown
