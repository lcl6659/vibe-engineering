# Next.js 模块加载错误修复指南

## 错误信息

```
Could not find the module "[project]/node_modules/next/dist/client/components/builtin/global-error.js#default" 
in the React Client Manifest. This is probably a bug in the React Server Components bundler.
```

## 原因

这是 Next.js 开发服务器的缓存问题，通常由以下原因导致：

1. `.next` 缓存目录损坏
2. 热重载（HMR）状态不一致
3. node_modules 缓存问题
4. React Server Components 打包器状态异常

## 解决方案

### 方案 1：使用修复脚本（推荐）

在 `frontend` 目录下运行：

```bash
cd frontend
./fix-nextjs.sh
```

然后重新启动开发服务器：

```bash
npm run dev
```

### 方案 2：手动清理

#### Step 1：停止开发服务器

如果开发服务器正在运行，先停止它：
- 在终端按 `Ctrl+C`
- 或在另一个终端运行：`pkill -f "next dev"`

#### Step 2：清理缓存

```bash
cd frontend

# 清理 .next 缓存
rm -rf .next

# 清理 node_modules 缓存
rm -rf node_modules/.cache
```

#### Step 3：重启开发服务器

```bash
npm run dev
```

### 方案 3：完全重置（问题持续时使用）

如果上述方法无效，执行完全重置：

```bash
cd frontend

# 停止开发服务器
pkill -f "next dev"

# 清理所有缓存和依赖
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
rm -rf node_modules/.cache

# 重新安装依赖
npm install

# 重启开发服务器
npm run dev
```

## Windows 用户

如果使用 Windows，请在 PowerShell 或 Git Bash 中运行以下命令：

```powershell
# PowerShell
cd frontend
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache
npm run dev
```

## 预防措施

### 1. 使用稳定的 Next.js 版本

检查 `package.json` 中的 Next.js 版本，建议使用稳定版本：

```json
{
  "dependencies": {
    "next": "14.2.0"  // 或其他稳定版本
  }
}
```

### 2. 定期清理缓存

在开发过程中，如果频繁修改文件结构或遇到奇怪的错误，定期清理缓存：

```bash
npm run clean  # 如果有配置清理脚本
# 或
rm -rf .next && npm run dev
```

### 3. 添加清理脚本到 package.json

在 `frontend/package.json` 中添加清理脚本：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "clean": "rm -rf .next node_modules/.cache",
    "reset": "npm run clean && npm install"
  }
}
```

然后可以使用：

```bash
npm run clean && npm run dev
```

## 故障排除

### 问题：清理后仍然报错

**解决方案：**
1. 检查是否有多个 Next.js 开发服务器在运行
2. 重启终端/命令行工具
3. 重启 IDE（如 VS Code、Cursor）
4. 检查 Node.js 版本（推荐 18.x 或 20.x）

```bash
node --version  # 应该是 v18.x 或 v20.x
```

### 问题：npm install 失败

**解决方案：**
```bash
# 清理 npm 缓存
npm cache clean --force

# 使用 legacy peer deps
npm install --legacy-peer-deps
```

### 问题：端口被占用

**解决方案：**
```bash
# 查找占用 3000 端口的进程
lsof -i :3000

# 结束进程（替换 <PID> 为实际进程 ID）
kill -9 <PID>

# 或者使用不同端口
PORT=3001 npm run dev
```

## 相关错误

这个修复方案也适用于以下类似错误：

- `Could not find the module "[project]/app/xxx/page.tsx#default"`
- `Module not found: Can't resolve 'xxx'`
- `Error: Cannot find module 'xxx'`
- `The requested module 'xxx' does not provide an export named 'default'`

## 开发最佳实践

1. **定期重启开发服务器**：每工作 1-2 小时重启一次
2. **文件结构变更后重启**：添加/删除/移动文件后重启服务器
3. **安装新依赖后重启**：运行 `npm install` 后重启服务器
4. **使用 Git**：在清理前提交代码，以防出现问题

## 快速参考

```bash
# 快速修复（一行命令）
cd frontend && rm -rf .next node_modules/.cache && npm run dev

# 完全重置（一行命令）
cd frontend && rm -rf .next node_modules package-lock.json && npm install && npm run dev
```

## 需要帮助？

如果问题仍然存在：

1. 检查 Next.js 版本是否兼容
2. 查看 Next.js 官方文档和 GitHub Issues
3. 尝试使用 `npm` 的 `--verbose` 标志查看详细错误
4. 考虑降级或升级 Next.js 版本
