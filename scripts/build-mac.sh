#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "╔══════════════════════════════════════════════╗"
echo "║       Typing Garden macOS 打包工具           ║"
echo "╚══════════════════════════════════════════════╝"

cd "$PROJECT_ROOT"

echo ""
echo "Step 1: 运行测试"
npm test

echo ""
echo "Step 2: 构建前端"
npm run build

echo ""
echo "Step 3: 打包 Electron 应用"
if [ "$(uname -s)" != "Darwin" ]; then
  echo "当前平台不是 macOS，无法构建 macOS App。"
  exit 1
fi

CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac

echo ""
echo "构建完成，产物在 release/ 目录："
ls -lh "$PROJECT_ROOT/release" || true
