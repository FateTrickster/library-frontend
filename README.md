
# 🎨 Library System Frontend

这是 **图书/教师管理系统** 的前端部分，基于 **Vue 3** 和 **Vite** 构建。它提供了用户界面，用于教师登录、证书下载以及图书管理等功能，并通过 REST API 与 Spring Boot 后端进行交互。

## 🛠 技术栈

* **核心框架**: Vue.js 3
* **构建工具**: Vite
* **路由管理**: Vue Router 4
* **HTTP 客户端**: Axios (假设使用，用于 API 请求)
* **CSS 支持**: 原生 CSS / Scoped CSS

## 📂 目录结构说明

由于前端代码与后端代码位于同一 `src` 目录下（混合结构），以下是前端核心文件的位置说明：

```text
src/
├── main.js                 # ⚡️ 前端入口文件 (挂载 Vue 应用)
├── App.vue                 # 根组件 (Root Component)
├── style.css               # 全局样式文件
├── router/
│   └── index.js            # 🚦 路由配置文件 (定义页面跳转规则)
├── views/                  # 📄 页面组件 (Pages)
│   ├── Login.vue           # [核心] 教师登录页 (对接 /teacher/login)
│   └── BookManager.vue     # [核心] 图书/证书管理页 (对接 /teacher/downloadCertificate)
├── components/
│   └── HelloWorld.vue      # 通用组件
└── assets/                 # 静态资源
		└── school-logo.png     # 学校 Logo
```

## 🚀 快速开始
1. 环境准备
确保你的电脑已安装 Node.js (推荐 v16+)。 验证命令：

```bash
node -v
npm -v
```
2. 安装依赖
在包含 `package.json` 的目录（通常是项目根目录）打开终端，运行：

```bash
npm install
```
3. 启动开发服务器
启动前端项目，默认端口通常为 5173：

```bash
npm run dev
```
启动成功后，浏览器访问：http://localhost:5173

## 🔌 与后端联调 (Configuration)
前端需要连接运行在 8080 端口的 Spring Boot 后端。

1. 跨域配置 (Proxy)
为了避免 CORS 跨域问题，建议在根目录下的 `vite.config.js` 中配置代理（如果文件中没有，请添加）：

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [vue()],
	server: {
		proxy: {
			// 将 /teacher 开头的请求代理到后端 8080 端口
			'/teacher': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false
			}
		}
	}
})
```

## 2. 页面功能说明

🔐 登录页 (`src/views/Login.vue`)
功能: 教师输入手机号和密码进行登录。

API: `POST /teacher/login`

逻辑: 登录成功后，通常会将用户信息保存到 `localStorage` 并跳转到管理页。

📚 管理页 (`src/views/BookManager.vue`)
功能: 展示登录教师的信息，提供业务操作入口。

核心功能:

- 下载证书: 点击按钮调用 `GET /teacher/downloadCertificate`，下载生成的 PDF。
- 预览证书: 调用 `GET /teacher/previewCertificate` 展示证书预览（项目中使用 `responseType: 'blob'` 并通过 `URL.createObjectURL` 在 iframe 中展示）。

## 📦 打包部署
当项目开发完成准备上线时：

构建生产版本:

```bash
npm run build
```
这将生成一个 `dist` 目录，包含所有静态文件（HTML, CSS, JS）。

部署: 可以将 `dist` 目录下的文件复制到 Spring Boot 的 `src/main/resources/static` 目录下，或者部署到 Nginx 服务器。

## ⚠️ 开发注意事项
文件路径: 这里的 Vue 文件直接位于 `src/` 下，请注意不要与 Java 的 `src/main/java` 混淆。建议开发时只关注 `.vue`, `.js`, `.css` 文件。

API 地址: 在 Vue 组件中发起请求时，请使用相对路径（如 `/teacher/login`），配合 Vite 的 Proxy 功能，不要把 `http://localhost:8080` 写死在代码里，否则打包后无法访问。

Logo 引用: 如果在 `<img src="...">` 中引用 `src/assets/school-logo.png`，请确保使用 `import` 方式或 `@/assets` 别名（取决于 vite 配置）。


### 💡 补充建议

我看你的文件结构是把前端文件直接放在了 `src/` 下，这在 Java 项目中比较少见（通常 Java 在 `src/main/java`，前端在 `src/main/frontend` 或根目录 `frontend/`）。

**建议：** 如果可能的话，建议将所有前端相关的文件（`App.vue`, `main.js`, `views/`, `router/` 等）集中到一个单独文件夹（例如 `frontend/` 或 `src/main/frontend/`），以便与后端 Java 代码分离，便于构建与部署。

---

如果你希望，我可以：

- 帮你把 `vite.config.js` 的 proxy 配置检查并补全（若需要我可以打开并编辑该文件）；
- 或者我可以把这个 README 提交到 git（运行 `git add README.md && git commit -m "docs: add frontend README"`）。
