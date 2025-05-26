# 电商平台

一个基于React和Cloudflare Pages的小型电商平台，包含用户前端和管理员后台。

## 功能特点

### 用户界面
- **浏览商品**: 查看所有商品，支持搜索和分类筛选
- **购物车**: 添加商品到购物车，调整数量，计算总价
- **订单管理**: 下单、查看订单历史、订单详情
- **用户账户**: 注册、登录、个人资料管理
- **个性化推荐**: 基于浏览和购买历史的智能商品推荐
- **会员积分系统**: 用户活动积分奖励和等级特权
- **每日签到**: 用户每日签到获取积分，连续签到额外奖励
- **智能搜索**: 支持模糊搜索、拼音搜索和相关性排序

### 管理员界面
- **仪表盘**: 显示销售、订单和产品总览数据
- **商品管理**: 查看、添加、编辑和删除商品，支持批量导入导出
- **订单管理**: 查看所有订单、更新订单状态
- **管理员权限控制**: 只有管理员可以访问后台
- **用户行为分析**: 分析用户浏览、搜索和购买行为

## 技术栈

- **前端**:
  - React 18
  - TypeScript
  - React Router v6
  - Tailwind CSS
  - Zustand (状态管理)
  - React Icons

- **后端**:
  - Cloudflare Pages (静态资源托管)
  - Cloudflare Workers (API)
  - Cloudflare KV (数据存储)

## 项目结构

```
shopping-platform/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 共享组件
│   ├── layouts/            # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── admin/          # 管理员页面
│   │   ├── auth/           # 认证页面
│   │   └── user/           # 用户页面
│   ├── services/           # API服务
│   │   ├── productService.ts       # 商品服务
│   │   ├── recommendationService.ts # 推荐系统服务
│   │   ├── searchService.ts        # 智能搜索服务
│   │   ├── userActivityService.ts  # 用户活动和积分服务
│   │   └── analyticsService.ts     # 用户行为分析服务
│   ├── stores/             # 状态管理
│   └── utils/              # 工具函数
└── workers-site/           # Cloudflare Workers配置与代码
```

## 开发指南

### 环境要求

- Node.js 18+
- npm 或 yarn

### 本地开发

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/shopping-platform.git
   cd shopping-platform
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm run dev
   ```

4. 打开浏览器访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 部署到Cloudflare Pages

1. Fork 本仓库到自己的GitHub账号

2. 登录 Cloudflare Dashboard，进入Pages页面

3. 点击"创建应用程序"，选择"连接到Git"

4. 选择你的GitHub仓库，设置以下构建配置:
   - 构建命令: `npm run build`
   - 构建输出目录: `dist`
   - 环境变量:
     - `NODE_VERSION`: `18`

5. 点击"保存并部署"

6. 设置自定义域名(可选)

### 配置Cloudflare Workers和KV

1. 安装Wrangler CLI
   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. 登录到Cloudflare账户
   ```bash
   wrangler login
   ```

3. 创建KV命名空间
   ```bash
   wrangler kv:namespace create PRODUCTS
   wrangler kv:namespace create ORDERS
   wrangler kv:namespace create USERS
   ```

4. 更新wrangler.toml文件中的kv_namespaces配置

5. 部署Workers
   ```bash
   cd workers-site
   wrangler publish
   ```

## 初始数据

完成部署后，可以使用管理员账户登录并添加初始商品数据。

默认管理员账户:
- 邮箱: admin@example.com
- 密码: admin123

## 用户粘性功能

### 个性化推荐系统
- **协同过滤算法**: 基于用户行为和商品相似度的推荐
- **浏览历史追踪**: 记录用户浏览商品的历史，用于推荐相似商品
- **购买行为分析**: 分析用户购买历史，提供更精准的推荐
- **热门商品推荐**: 基于所有用户行为的热门商品展示

### 会员积分与奖励系统
- **积分获取**: 登录、购买、评价、分享等行为获取积分
- **会员等级**: 铜牌、银牌、金牌、钻石会员等级制度
- **等级特权**: 不同等级享受不同折扣和特权
- **每日签到**: 每日签到获取积分，连续签到额外奖励

### 智能搜索
- **模糊搜索**: 容错搜索，支持拼写错误
- **拼音搜索**: 支持中文拼音首字母搜索
- **相关性排序**: 根据相关性对搜索结果进行排序
- **搜索建议**: 实时提供搜索建议，提升用户体验

### 用户行为分析
- **行为追踪**: 记录用户浏览、搜索、购买等行为
- **会话分析**: 分析用户单次访问的行为模式
- **参与度评分**: 计算用户参与度分数，识别活跃用户
- **兴趣分析**: 分析用户感兴趣的商品分类

## 项目进度

### 已完成功能
- ✅ 用户前台界面设计与实现
- ✅ 管理员后台基础框架
- ✅ 商品管理功能（查看、添加、编辑、删除）
- ✅ 商品批量导入/导出功能
- ✅ 管理员入口与权限控制
- ✅ 响应式布局设计
- ✅ 模拟数据服务
- ✅ 个性化推荐系统
- ✅ 会员积分与奖励系统
- ✅ 智能搜索功能
- ✅ 用户行为分析

### 待完成功能
- ⬜ Cloudflare Workers API实现
- ⬜ Cloudflare KV数据存储集成
- ⬜ 用户认证与授权系统完善
- ⬜ 图片上传功能（目前仅支持URL）
- ⬜ 支付系统集成
- ⬜ 订单处理工作流优化
- ⬜ 性能优化与代码分割
- ⬜ 单元测试与端到端测试

## 许可证

MIT 