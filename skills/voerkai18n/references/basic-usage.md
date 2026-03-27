# VoerkaI18n 基本应用详解

## 核心概念

VoerkaI18n 的核心思想是：**用 `t()` 函数包裹要翻译的文本，通过自动化工作流完成翻译**。

### 工作流程

```
源码中的文本 → extract → translate → compile → 语言包
```

### 语言目录结构

初始化后生成的 `src/languages/` 目录：

```
languages/
├── api.json              # 翻译 API 配置
├── component.ts          # 翻译组件
├── index.ts              # 入口文件
├── messages/             # 编译后的语言包
├── paragraphs/           # 编译后的段落
├── prompts/              # AI 翻译提示词
├── settings.json         # 配置文件
├── storage.ts            # 语言存储
├── loader.ts             # 语言包加载器
├── transform.ts          # 翻译变换
├── formatters.json       # 格式化器配置
└── translates/           # 待翻译内容
    ├── messages/         # 提取的文本
    │   └── default.json  # 默认语言提取的文本
    └── paragraphs/       # 提取的段落
```

## t() 翻译函数

### 基本用法

```typescript
import { t } from "./languages"

// 简单文本
t("请输入用户名")
// 输出：Please enter username (en-US)

// 带命名插值变量
t("欢迎，{name}！", { name: "张三" })
// 输出：Welcome, Zhang San! (en-US)

// 位置占位符
t("出生于{0}年，居住在{1}", [1990, "北京"])
// 输出：Born in 1990, living in Beijing (en-US)

// 混合使用
t("{name}，您有{count}条新消息", { name: "张三", count: 5 })
// 输出：Zhang San, you have 5 new messages (en-US)
```

### 插值变量语法

| 语法 | 说明 | 示例 |
|------|------|------|
| `{name}` | 命名占位符 | `t("Hello, {name}", { name: "Tom" })` |
| `{0}`, `{1}` | 位置占位符 | `t("Born in {0}", [1990])` |
| `{name}` | 带格式化 | `t("Date: {date,date}", { date: new Date() })` |

### 特殊语法

```typescript
// 复数形式
t("您有{count}条新消息", { count: 1 })
t("您有{count}条新消息", { count: 5 })

// 日期格式化
t("今天是{date,date}", { date: new Date() })
t("生日：{date,date,short}", { date: new Date() })
t("生日：{date,date,long}", { date: new Date() })

// 货币格式化
t("价格：{price,number}", { price: 99.99 })
t("价格：{price,number,currency}", { price: 99.99 })

// 数字格式化
t("总数：{count,number}", { count: 1234567 })
t("总数：{count,number,percent}", { count: 0.85 })
```

## Translate 组件

用于包裹大段文本或需要动态更新的内容。

### React

```tsx
import { Translate } from './languages'

// 基本用法
<Translate message="用户名" />

// 带 ID（从 paragraphs/ 目录加载）
<Translate id="notice">
  这是一段很长的文本内容，
  包含多行文字。
</Translate>

// 带插值变量
<Translate
  message="欢迎，{name}！"
  vars={{ name: "张三" }}
/>

// 自定义标签
<Translate
  message="登录"
  tag="button"
/>

// 自定义样式
<Translate
  message="标题"
  className="text-xl font-bold"
  style={{ color: 'red' }}
/>
```

### Vue 3

```vue
<template>
  <!-- 基本用法 -->
  <Translate message="用户名" />

  <!-- 带 ID -->
  <Translate id="notice">
    这是一段很长的文本内容
  </Translate>

  <!-- 带插值变量 -->
  <Translate
    message="欢迎，{name}！"
    :vars="{ name: '张三' }"
  />

  <!-- 自定义标签 -->
  <Translate
    message="登录"
    tag="button"
  />
</template>
```

## 切换语言

### 基本切换

```typescript
import { i18nScope } from "./languages"

// 切换到英语
await i18nScope.change("en-US")

// 切换到日语
await i18nScope.change("ja-JP")

// 获取当前语言
console.log(i18nScope.activeLanguage) // "en-US"

// 获取默认语言
console.log(i18nScope.defaultLanguage) // "zh-CN"

// 获取所有支持的语言
console.log(i18nScope.languages)
// [
//   { name: "zh-CN", title: "简体中文", default: true },
//   { name: "en-US", title: "English" }
// ]
```

### 监听语言切换

```typescript
import { i18nScope } from "./languages"

// 订阅切换事件
const subscriber = i18nScope.on("change", (newLanguage) => {
  console.log("语言切换为:", newLanguage)
  // 在此重新渲染界面
})

// 取消订阅
subscriber.off()
```

### React Hook

```tsx
import { useVoerkaI18n } from '@voerkai18n/react'

function LanguageSwitcher() {
  const { activeLanguage, languages, changeLanguage } = useVoerkaI18n()

  return (
    <div>
      {languages.map((lang) => (
        <button
          key={lang.name}
          onClick={() => changeLanguage(lang.name)}
          className={activeLanguage === lang.name ? 'active' : ''}
        >
          {lang.title}
        </button>
      ))}
    </div>
  )
}
```

### Vue 3 Composition API

```vue
<template>
  <div>
    <button
      v-for="lang in languages"
      :key="lang.name"
      @click="changeLanguage(lang.name)"
      :class="{ active: activeLanguage === lang.name }"
    >
      {{ lang.title }}
    </button>
  </div>
</template>

<script setup>
import { useVoerkaI18n } from '@voerkai18n/vue'

const { activeLanguage, languages, changeLanguage } = useVoerkaI18n()
</script>
```

## 自动导入

使用 `@voerkai18n/plugins` 实现自动导入 `t()` 函数。

### Vite 配置

```typescript
// vite.config.ts
import i18nPlugin from '@voerkai18n/plugins/vite'

export default {
  plugins: [
    i18nPlugin(),
    // 其他插件...
  ]
}
```

**⚠️ 注意：**

i18nPlugin 必须放在其他插件之前，否则无法识别代码中的 `t()` 函数。

### Webpack 配置

```javascript
// webpack.config.js
const webpackPlugin = require("@voerkai18n/plugins/webpack")

module.exports = {
  plugins: [
    webpackPlugin()
  ]
}
```

### 启用后效果

```typescript
// 无需手动导入
// import { t } from "./languages"  // ❌ 不再需要

// 直接使用 t() 函数
const message = t("请输入用户名")
```

## 语言存储

VoerkaI18n 会自动将用户选择的语言保存到浏览器存储中。

### 存储方式

修改 `languages/settings.json`：

```json
{
  "storage": "localStorage"
}
```

**支持的存储方式：**

| 存储方式 | 说明 | 持久化 |
|---------|------|--------|
| `localStorage` | 本地存储 | ✅ 永久 |
| `sessionStorage` | 会话存储 | ❌ 关闭标签页失效 |
| `memory` | 内存存储 | ❌ 刷新页面失效 |
| 自定义函数 | 自定义存储逻辑 | 自定义 |

### 自定义存储

编辑 `languages/storage.ts`：

```typescript
export default {
  get(): string | null {
    // 从自定义位置读取语言设置
    return localStorage.getItem("myapp_language")
  },
  set(language: string): void {
    // 保存到自定义位置
    localStorage.setItem("myapp_language", language)
  }
}
```

## 动态加载语言包

修改 `languages/loader.ts` 实现从服务器加载语言包：

```typescript
export default async (language: string, scope: any) => {
  try {
    // 从服务器加载
    const response = await fetch(`/languages/${scope.id}/${language}.json`)
    return await response.json()
  } catch (error) {
    console.error("加载语言包失败:", error)
    return {}
  }
}
```

**应用场景：**

- 动态语言补丁（无需重新打包）
- 按需加载语言包（减小初始包体积）
- A/B 测试不同翻译版本

## 翻译文件格式

### messages/default.json

```json
{
  "请输入用户名": {
    "en": "Please enter username",
    "ja": "ユーザー名を入力してください",
    "$files": ["src/components/Login.tsx"],
    "$id": 1
  },
  "欢迎，{name}！": {
    "en": "Welcome, {name}!",
    "ja": "ようこそ、{name}！",
    "$files": ["src/App.tsx"],
    "$id": 2
  }
}
```

**字段说明：**

| 字段 | 说明 |
|------|------|
| `en`, `ja` 等 | 语言代码对应的翻译 |
| `$files` | 该文本从哪些文件提取 |
| `$id` | 唯一标识符 |

### 编译后的 messages/zh-CN.ts

```typescript
export default {
  "请输入用户名": "请输入用户名",
  "欢迎，{name}！": "欢迎，{name}！"
}
```

## 常见问题

### Q1: 为什么切换语言后界面没有更新？

**React：** 确保使用 `useVoerkaI18n()` Hook

**Vue 3：** 使用 `t()` 函数在模板中，而非 `setup()` 中

**Vue 2：** 使用 `computed` 属性调用 `t()`

```vue
<!-- ❌ 错误：setup 中调用，不会更新 -->
<script setup>
const title = t('标题')
</script>

<!-- ✅ 正确：模板中调用，会更新 -->
<template>
  <h1>{{ t('标题') }}</h1>
</template>

<!-- ✅ 正确：使用响应式翻译变换 -->
<script setup>
import { $t } from '../languages'
const title = $t('标题')  // 返回响应式值
</script>
```

### Q2: 插值变量不生效？

确保变量名匹配：

```typescript
// ❌ 错误：变量名不匹配
t("欢迎，{username}！", { name: "张三" })

// ✅ 正确：变量名匹配
t("欢迎，{name}！", { name: "张三" })
```

### Q3: 如何处理复数形式？

```typescript
// 方式一：使用 count 变量（需要配置复数规则）
t("您有{count}条新消息", { count: 1 })
t("您有{count}条新消息", { count: 5 })

// 方式二：手动判断
const message = count === 1
  ? t("您有1条新消息")
  : t("您有{count}条新消息", { count })
```

### Q4: 如何翻译大量文本？

使用 `<Translate id="...">` 组件：

```tsx
<Translate id="terms-of-service">
  这里是很长的服务条款内容，
  可以包含多行文字、列表等。
</Translate>
```

将内容放在 `languages/translates/paragraphs/terms-of-service.html` 中。

## 最佳实践

1. **使用描述性文本** - `t("用户名")` 比 `t("username")` 更易维护
2. **统一变量命名** - 使用 `{name}` 而非 `{userName}` 和 `{user_name}` 混用
3. **避免拼接字符串** - 使用插值而非拼接：`t("欢迎，{name}", { name })`
4. **使用 Translate 组件** - 大段文本使用组件而非 `t()` 函数
5. **定期 extract** - 每次添加新文本后执行 `voerkai18n extract`
6. **版本控制翻译文件** - 将 `translates/` 纳入 Git 管理
7. **保护 API 密钥** - `api.json` 加入 `.gitignore`
