#!/bin/bash
# 构建前端
npm run build

# 安装Workers依赖
cd workers-site
npm install
cd ..

# 部署
npx wrangler deploy
