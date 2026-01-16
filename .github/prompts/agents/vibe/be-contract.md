基于以下 UI Spec，推导最小 API 契约。

{{#if user_instructions}}
用户要求: {{user_instructions}}
{{/if}}

## 需求

{{requirement}}

## 输出格式

返回 JSON 数组:

```json
[
  {
    "endpoint": "/api/xxx",
    "method": "POST",
    "description": "描述",
    "request": {},
    "response": {}
  }
]
```

只返回 JSON。
