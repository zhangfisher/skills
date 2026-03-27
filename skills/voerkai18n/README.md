# VoerkaI18n 国际化框架技能包

完整的 VoerkaI18n 国际化框架使用指南，支持多框架集成。

## 📚 文档导航

### 核心文档
- **[SKILL.md](./SKILL.md)** - 主技能文档（快速开始、核心特性、命令速查）

### 安装与配置
- **[安装配置详解](./references/installation.md)** - CLI 工具安装、包管理、命令详解
- **[基本应用详解](./references/basic-usage.md)** - t() 函数、Translate 组件、语言切换、存储

### 框架集成
- **[React 集成](./references/react.md)** - React Hooks、组件、TypeScript
- **[Vue 3 集成](./references/vue.md)** - Composition API、响应式翻译、插件
- **[Vue 2 集成](./references/vue2.md)** - Options API、withI18n 混入
- **[Next.js 集成](./references/nextjs.md)** - SSR/CSR、服务端组件、hydration
- **[Svelte 集成](./references/svelte.md)** - SvelteKit、响应式、组件
- **[Lit 集成](./references/lit.md)** - Web Components、HOC、Hooks API
- **[Node.js 应用](./references/nodejs.md)** - Express/Koa/Fastify/NestJS

### 高级特性
- **[高级特性](./references/advanced.md)** - 语言补丁、翻译变换、事件系统、格式化器

## 🚀 快速开始

### 1. 安装 CLI 工具

```bash
npm install -g @voerkai18n/cli
```

### 2. 初始化项目

```bash
voerkai18n init
```

### 3. 标记翻译文本

```typescript
import { t } from "./languages"

t("请输入用户名")
t("欢迎，{name}！", { name: "张三" })
```

### 4. 提取和编译

```bash
voerkai18n extract    # 提取翻译文本
voerkai18n translate  # AI 自动翻译（可选）
voerkai18n compile    # 编译语言包
```

## 📖 CLI 工作流

```
1. voerkai18n init       → 初始化项目，创建 languages 目录
2. voerkai18n apply      → 启用框架支持 (React/Vue/Next.js 等)
3. voerkai18n extract    → 扫描代码，提取待翻译文本
4. voerkai18n translate  → AI 自动翻译 (可选)
5. voerkai18n compile    → 编译生成语言包
6. (循环) 修改代码 → extract → translate → compile
```

## 🎯 支持的框架

| 框架 | 包名 | 文档 |
|------|------|------|
| React | `@voerkai18n/react` | [React 集成](./references/react.md) |
| Vue 3 | `@voerkai18n/vue` | [Vue 3 集成](./references/vue.md) |
| Vue 2 | `@voerkai18n/vue2` | [Vue 2 集成](./references/vue2.md) |
| Next.js | `@voerkai18n/nextjs` | [Next.js 集成](./references/nextjs.md) |
| Svelte | `@voerkai18n/svelte` | [Svelte 集成](./references/svelte.md) |
| Lit | `@voerkai18n/lit` | [Lit 集成](./references/lit.md) |
| Solid | `@voerkai18n/solid` | 参考 React 文档 |
| Node.js | `@voerkai18n/runtime` | [Node.js 应用](./references/nodejs.md) |

## 💡 核心特性

- ✅ **自动化工作流** - 文本提取 → AI 翻译 → 编译语言包
- ✅ **动态语言补丁** - 无需重新打包即可更新翻译
- ✅ **类型安全** - 完整 TypeScript 支持
- ✅ **AI 翻译** - 支持 OpenAI 兼容的大模型 API
- ✅ **多框架支持** - React/Vue/Next.js/Svelte/Lit/Node.js 等
- ✅ **响应式更新** - 语言切换自动重新渲染界面
- ✅ **格式化器** - 日期、货币、数字等内置格式化

## 🔗 相关资源

- **官方网站**: [voerkai18n](https://github.com/zhangfisher/voerka-i18n)
- **文档源码**: E:\Work\Code\sources\voerka-i18n\docs\zh
- **NPM 包**: [@voerkai18n](https://www.npmjs.com/search?q=voerkai18n)

## 📝 技能包结构

```
skills/voerkai18n/
├── SKILL.md                    # 主技能文档
├── README.md                   # 本文件（索引）
└── references/                 # 参考文档目录
    ├── installation.md         # 安装配置详解
    ├── basic-usage.md          # 基本应用详解
    ├── react.md                # React 集成
    ├── vue.md                  # Vue 3 集成
    ├── vue2.md                 # Vue 2 集成
    ├── nextjs.md               # Next.js 集成
    ├── svelte.md               # Svelte 集成
    ├── lit.md                  # Lit 集成
    ├── nodejs.md               # Node.js 应用
    └── advanced.md             # 高级特性
```

## 🎓 学习路径

1. **初学者**: SKILL.md → installation.md → basic-usage.md
2. **框架集成**: SKILL.md → 选择对应框架文档（react.md/vue.md 等）
3. **高级用户**: advanced.md → 深入了解语言补丁、事件系统等
