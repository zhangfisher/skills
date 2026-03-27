---
name: voerkai18n
description: VoerkaI18n 国际化框架完整指南，支持 React/Vue/Next.js/Svelte/Lit/Node.js 等多框架，提供文本提取、自动翻译、语言补丁等企业级 i18n 解决方案
type: skill
tags: [i18n, internationalization, translation, 多语言, 国际化, 翻译]
---

# VoerkaI18n 国际化框架

VoerkaI18n 是一款功能强大的 JavaScript/TypeScript 国际化解决方案，支持多框架、自动化翻译、动态语言补丁等企业级特性。

## 核心特性

- **多框架支持**：React、Vue 2/3、Next.js、Svelte、Lit、Solid、Astro、Node.js
- **自动化工作流**：文本提取 → 在线翻译 → 编译语言包
- **动态补丁**：无需重新打包即可更新翻译和添加语言
- **类型安全**：完整 TypeScript 支持，自动推导翻译函数类型
- **AI 翻译**：支持 OpenAI 兼容的大模型 API 进行自动翻译

## 核心工具：@voerkai18n/cli

**@voerkai18n/cli** 是 VoerkaI18n 的核心命令行工具，提供完整的国际化工作流自动化。

### 为什么选择 CLI 工具？

- ✅ **零配置自动提取** - 扫描代码自动识别待翻译文本
- ✅ **AI 智能翻译** - 支持 OpenAI 兼容的大模型 API
- ✅ **安全可重复** - 反复执行不会丢失已翻译内容
- ✅ **框架自动集成** - 一键启用 React/Vue/Next.js 支持
- ✅ **热更新补丁** - 无需重新打包即可更新翻译

### CLI 工作流

```
1. voerkai18n init       → 初始化项目，创建 languages 目录
2. voerkai18n apply      → 启用框架支持 (React/Vue/Next.js 等)
3. voerkai18n extract    → 扫描代码，提取待翻译文本
4. voerkai18n translate  → AI 自动翻译 (可选)
5. voerkai18n compile    → 编译生成语言包
6. (循环) 修改代码 → extract → translate → compile
```

### 安装 CLI 工具

```bash
# 推荐：全局安装
npm install -g @voerkai18n/cli

# 验证安装
voerkai18n --help
```

### 3. 标记翻译文本

在源码中使用 `t()` 函数包裹要翻译的文本：

```typescript
import { t } from "./languages"

// 简单翻译
t("请输入用户名")

// 带插值变量
t("欢迎，{name}！", { name: "张三" })

// 位置占位符
t("出生于{0}年", 1990)
```

### 4. 提取文本

```bash
voerkai18n extract
```

自动扫描代码，提取 `t()` 中的文本到 `languages/translates/messages/default.json`

### 5. 翻译内容

**方式一：手动翻译**

编辑 `translates/messages/default.json`：

```json
{
  "请输入用户名": {
    "en": "Please enter username",
    "ja": "ユーザー名を入力してください"
  }
}
```

**方式二：AI 翻译**

```bash
# OpenAI 兼容 API
voerkai18n translate --api-key YOUR_KEY --api-url https://api.openai.com/v1 --api-model gpt-4

# 百度翻译
voerkai18n translate --api-key YOUR_KEY --api-id YOUR_ID --provider baidu
```

### 6. 编译语言包

```bash
voerkai18n compile
```

生成 `messages/` 目录下的语言包文件（zh-CN.js、en-US.js 等）

## 框架集成

### React

```bash
voerkai18n apply  # 选择 React
```

```tsx
import { VoerkaI18nProvider } from './languages'

VoerkaI18nProvider(<App />)

// 组件中使用
import { Translate, useVoerkaI18n } from './languages'
const { activeLanguage, changeLanguage, languages } = useVoerkaI18n()
```

### Vue 3

```bash
voerkai18n apply  # 选择 Vue 3
```

```ts
import { i18nPlugin } from '@voerkai18n/vue'

app.use(i18nPlugin, { i18nScope })
```

```vue
<template>
  <Translate message="用户名" />
  <input :placeholder="t('请输入用户名')" />
</template>

<script setup>
import { useVoerkaI18n } from '@voerkai18n/vue'
const { activeLanguage, changeLanguage } = useVoerkaI18n()
</script>
```

### Vue 2

```bash
voerkai18n apply  # 选择 Vue 2
```

```ts
import { i18nPlugin } from '@voerkai18n/vue2'

Vue.use(i18nPlugin, { i18nScope })
```

### Next.js

```bash
voerkai18n apply  # 选择 Next.js
```

```tsx
// app/layout.tsx
import { VoerkaI18nNextjsProvider } from "@/languages/client"

export default function RootLayout({ children }) {
  return (
    <VoerkaI18nNextjsProvider fallback={<div>loading...</div>}>
      {children}
    </VoerkaI18nNextjsProvider>
  )
}
```

### Svelte

```bash
voerkai18n apply  # 选择 Svelte
```

### Lit

```ts
import { withI18n } from '@voerkai18n/lit'

class MyComponent extends withI18n(LitElement, i18nScope) {
  render() {
    return html`<div>${this.t('Hello')}</div>`
  }
}
```

### Node.js

直接使用 `t()` 函数和 `i18nScope`，无需额外配置。

## 切换语言

```typescript
import { i18nScope } from "./languages"

// 切换语言
await i18nScope.change("en")

// 监听切换事件
i18nScope.on("change", (newLang) => {
  console.log("语言切换为:", newLang)
})
```

## 高级特性

### 动态语言补丁

修改 `languages/loader.ts` 从服务器加载语言包：

```typescript
export default async (language, scope) => {
  return await (await fetch(`/languages/${scope.id}/${language}.json`)).json()
}
```

将补丁文件放在服务器 `/languages/<应用名>/<语言>.json` 即可实现热更新。

### 自动导入

使用 `@voerkai18n/plugins` 自动导入 `t()` 函数：

```ts
// vite.config.ts
import i18nPlugin from '@voerkai18n/plugins/vite'

export default {
  plugins: [i18nPlugin(), react()]
}
```

## 命令速查

| 命令 | 说明 |
|------|------|
| `voerkai18n init` | 初始化项目 |
| `voerkai18n apply` | 启用框架支持 |
| `voerkai18n extract` | 提取翻译文本 |
| `voerkai18n translate` | AI 自动翻译 |
| `voerkai18n compile` | 编译语言包 |
| `voerkai18n watch` | 监听文件变化自动编译 |

## 框架适配器包

| 包名 | 用途 |
|------|------|
| `@voerkai18n/runtime` | 核心运行时 |
| `@voerkai18n/react` | React 支持 |
| `@voerkai18n/vue` | Vue 3 支持 |
| `@voerkai18n/vue2` | Vue 2 支持 |
| `@voerkai18n/nextjs` | Next.js 支持 |
| `@voerkai18n/svelte` | Svelte 支持 |
| `@voerkai18n/lit` | Lit 支持 |
| `@voerkai18n/solid` | Solid 支持 |
| `@voerkai18n/plugins` | 构建工具插件 |

## 优势对比

| 特性 | VoerkaI18n | i18next | vue-i18n |
|------|-----------|---------|----------|
| 框架支持 | 10+ | 主流 | 仅 Vue |
| 动态补丁 | ✅ | ❌ | ❌ |
| AI 翻译 | ✅ | 需插件 | ❌ |
| TypeScript | ✅ 完整 | ⚠️ 部分 | ✅ |
| 零配置自动提取 | ✅ | ❌ | ❌ |
| 语言包编译优化 | ✅ | ❌ | ❌ |

## 参考文档

详细指南请查看 `references/` 目录：

- [安装配置详解](references/installation.md) - 深入了解安装选项和配置
- [基本应用详解](references/basic-usage.md) - 翻译函数、插值、复数、日期格式化
- [React 集成](references/react.md) - React 完整集成指南
- [Vue 3 集成](references/vue.md) - Vue 3 完整集成指南
- [Vue 2 集成](references/vue2.md) - Vue 2 完整集成指南
- [Next.js 集成](references/nextjs.md) - Next.js SSR/CSR 集成
- [Svelte 集成](references/svelte.md) - Svelte 集成指南
- [Lit 集成](references/lit.md) - Lit/Web Components 集成
- [Node.js 应用](references/nodejs.md) - Node.js 后端应用
- [高级特性](references/advanced.md) - 语言补丁、翻译变换、事件系统
