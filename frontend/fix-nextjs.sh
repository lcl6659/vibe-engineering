#!/bin/bash

# Next.js 开发服务器修复脚本
# 用于修复模块加载错误和缓存问题

echo "🔧 正在修复 Next.js 开发服务器..."
echo ""

# 停止可能正在运行的开发服务器
echo "1️⃣ 停止开发服务器..."
pkill -f "next dev" || true
sleep 2

# 清理 .next 缓存
echo ""
echo "2️⃣ 清理 .next 缓存..."
rm -rf .next
echo "   ✅ .next 缓存已清理"

# 清理 node_modules/.cache
echo ""
echo "3️⃣ 清理 node_modules 缓存..."
rm -rf node_modules/.cache
echo "   ✅ node_modules 缓存已清理"

# 可选：重新安装依赖（如果问题持续）
# echo ""
# echo "4️⃣ 重新安装依赖..."
# rm -rf node_modules package-lock.json
# npm install

echo ""
echo "✅ 清理完成！"
echo ""
echo "📝 下一步："
echo "   运行以下命令启动开发服务器："
echo "   npm run dev"
echo ""
