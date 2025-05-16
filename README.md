<<<<<<< HEAD
# 电商平台

一个基于React和Cloudflare Pages的小型电商平台，包含用户前端和管理员后台。

## 功能特点

### 用户界面
- **浏览商品**: 查看所有商品，支持搜索和分类筛选
- **购物车**: 添加商品到购物车，调整数量，计算总价
- **订单管理**: 下单、查看订单历史、订单详情
- **用户账户**: 注册、登录、个人资料管理

### 管理员界面
- **仪表盘**: 显示销售、订单和产品总览数据
- **商品管理**: 查看、添加、编辑和删除商品
- **订单管理**: 查看所有订单、更新订单状态
- **管理员权限控制**: 只有管理员可以访问后台

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

## 许可证

=======
# 电商平台

一个基于React和Cloudflare Pages的小型电商平台，包含用户前端和管理员后台。

## 功能特点

### 用户界面
- **浏览商品**: 查看所有商品，支持搜索和分类筛选
- **购物车**: 添加商品到购物车，调整数量，计算总价
- **订单管理**: 下单、查看订单历史、订单详情
- **用户账户**: 注册、登录、个人资料管理

### 管理员界面
- **仪表盘**: 显示销售、订单和产品总览数据
- **商品管理**: 查看、添加、编辑和删除商品
- **订单管理**: 查看所有订单、更新订单状态
- **管理员权限控制**: 只有管理员可以访问后台

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

## 许可证

>>>>>>> master
MIT 