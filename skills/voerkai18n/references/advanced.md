# VoerkaI18n 高级特性

VoerkaI18n 提供了许多高级特性，包括语言补丁、翻译变换、事件系统、格式化器等。

## 动态语言补丁

VoerkaI18n 支持在不重新打包应用的情况下更新语言包和添加新语言。

### 配置加载器

修改 `languages/loader.ts`：

```typescript
export default async (language: string, scope: any) => {
  try {
    // 从服务器加载语言包补丁
    const response = await fetch(`/languages/${scope.id}/${language}.json`)
    if (response.ok) {
      const patch = await response.json()
      // 补丁会自动合并到现有语言包
      return patch
    }
    return {}
  } catch (error) {
    console.error("加载语言补丁失败:", error)
    return {}
  }
}
```

### 补丁文件格式

服务器上的补丁文件 `/languages/myapp/en-US.json`：

```json
{
  "新增的翻译": "New translation",
  "修正的翻译": "Corrected translation"
}
```

### 应用场景

1. **在线修正翻译** - 发现翻译错误后直接更新补丁
2. **临时添加语言** - 支持临时语言而无需重新打包
3. **A/B 测试** - 测试不同版本的翻译
4. **区域化定制** - 为不同地区提供定制翻译

### 自动合并

VoerkaI18n 会自动合并补丁，优先级如下：

```
内置翻译 < 补丁翻译
```

## 翻译变换

翻译变换（Transform）用于将翻译结果转换为框架特定的响应式值。

### Vue 3 翻译变换

`languages/transform.ts`：

```typescript
import { createTranslateTransform, VueTransformResultType } from "@voerkai18n/vue"

export const transform = createTranslateTransform()
export type TransformResultType = VueTransformResultType
```

使用 `$t()` 代替 `t()`：

```vue
<script setup>
import { $t } from './languages'

const title = $t('标题')  // 返回响应式值
</script>

<template>
  <h1>{{ title }}</h1>  <!-- 自动更新 -->
</template>
```

### React 翻译变换

React 中翻译结果自动响应，无需额外配置。

### 自定义翻译变换

```typescript
// languages/transform.ts
import type { I18nTransform } from '@voerkai18n/runtime'

const customTransform: I18nTransform = (result) => {
  // 自定义变换逻辑
  return result.toUpperCase()
}

export default customTransform
```

## 事件系统

VoerkaI18n 提供完整的事件系统，可以监听各种语言相关事件。

### 事件类型

| 事件 | 说明 | 参数 |
|------|------|------|
| `change` | 语言切换 | `(newLanguage: string)` |
| `load` | 语言包加载 | `(language: string, messages: object)` |
| `error` | 错误发生 | `(error: Error)` |

### 监听事件

```typescript
import { i18nScope } from './languages'

// 监听语言切换
const subscriber = i18nScope.on('change', (newLanguage) => {
  console.log('语言切换为:', newLanguage)
  // 重新渲染界面
})

// 取消监听
subscriber.off()

// 监听语言包加载
i18nScope.on('load', (language, messages) => {
  console.log('语言包已加载:', language, messages)
})

// 监听错误
i18nScope.on('error', (error) => {
  console.error('发生错误:', error)
})
```

### 一次性监听

```typescript
i18nScope.once('change', (newLanguage) => {
  console.log('只执行一次')
})
```

### 移除所有监听

```typescript
i18nScope.off('change')
```

## 格式化器

VoerkaI18n 支持自定义格式化器，用于处理日期、货币、数字等。

### 内置格式化器

安装格式化器插件：

```bash
npm install @voerkai18n/formatters
```

`languages/formatters.json`：

```json
{
  "date": {
    "type": "date",
    "options": {
      "short": {
        "year": "numeric",
        "month": "2-digit",
        "day": "2-digit"
      },
      "long": {
        "year": "numeric",
        "month": "long",
        "day": "numeric",
        "weekday": "long"
      }
    }
  },
  "number": {
    "type": "number",
    "options": {
      "currency": {
        "style": "currency",
        "currency": "CNY"
      },
      "percent": {
        "style": "percent"
      }
    }
  }
}
```

### 使用格式化器

```typescript
import { t } from './languages'

// 日期格式化
t('今天是{date,date}')
t('生日：{date,date,short}')
t('生日：{date,date,long}')

// 数字格式化
t('价格：{price,number}')
t('价格：{price,number,currency}')
t('完成度：{progress,number,percent}')
```

### 自定义格式化器

```typescript
// languages/formatters.ts
import type { I18nFormatter } from '@voerkai18n/runtime'

const uppercaseFormatter: I18nFormatter = (value, language, options) => {
  return String(value).toUpperCase()
}

export default {
  uppercase: uppercaseFormatter
}
```

使用：

```typescript
t('用户名：{name,uppercase}', { name: 'admin' })
// 输出：用户名：ADMIN
```

## 命名空间

使用命名空间组织翻译内容。

### 启用命名空间

`languages/settings.json`：

```json
{
  "namespaces": true
}
```

### 使用命名空间

```typescript
import { t } from './languages'

// 使用命名空间
t('user:profile.title')
t('user:login.username')
t('common:buttons.submit')
```

### 文件组织

```
languages/
├── messages/
│   ├── user/
│   │   ├── profile.ts
│   │   └── login.ts
│   └── common/
│       └── buttons.ts
```

## 复数处理

VoerkaI18n 支持复数形式的翻译。

### 基本用法

```typescript
import { t } from './languages'

// 复数形式
t('您有{count}条新消息', { count: 0 })  // "您有0条新消息"
t('您有{count}条新消息', { count: 1 })  // "您有1条新消息"
t('您有{count}条新消息', { count: 5 })  // "您有5条新消息"
```

### 配置复数规则

`languages/settings.json`：

```json
{
  "pluralRules": {
    "zh-CN": {
      "one": "n === 1",
      "other": "true"
    },
    "en-US": {
      "one": "n === 1",
      "other": "true"
    }
  }
}
```

## 段落翻译

对于大段文本，使用段落翻译功能。

### 提取段落

```bash
voerkai18n extract
```

会将段落提取到 `languages/translates/paragraphs/` 目录。

### 段落文件格式

`languages/translates/paragraphs/notice.html`：

```html
<div class="notice">
  <h1>欢迎使用 VoerkaI18n</h1>
  <p>这是一段很长的文本内容，可以包含 HTML 标签。</p>
  <ul>
    <li>列表项 1</li>
    <li>列表项 2</li>
  </ul>
</div>
```

### 使用段落

```tsx
<Translate id="notice">
  {/* 默认内容，会被替换 */}
</Translate>
```

## 自动导入

使用 `@voerkai18n/plugins` 自动导入 `t()` 函数。

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

### 效果

```typescript
// 无需手动导入
// import { t } from "./languages"  // ❌ 不再需要

// 直接使用
const message = t('请输入用户名')  // ✅ 自动导入
```

## 性能优化

### 懒加载语言包

```typescript
// languages/index.ts
const messages = {
  'zh-CN': () => import('./messages/zh-CN'),
  'en-US': () => import('./messages/en-US'),
  'ja-JP': () => import('./messages/ja-JP'),
}
```

### 缓存翻译结果

```typescript
const cache = new Map()

function cachedTranslate(key: string, vars?: object) {
  const cacheKey = `${key}_${JSON.stringify(vars)}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const result = t(key, vars)
  cache.set(cacheKey, result)
  return result
}
```

### 预加载语言包

```typescript
import { i18nScope } from './languages'

// 预加载常用语言
Promise.all([
  i18nScope.load('en-US'),
  i18nScope.load('ja-JP')
])
```

## TypeScript 类型安全

### 定义事件类型

```typescript
// src/languages/index.ts
import { VoerkaI18nScope } from '@voerkai18n/runtime'
import component from './component'

interface MyEvents {
  'user/login': { username: string }
  'data/update': { value: string }
}

export const i18nScope = new VoerkaI18nScope<typeof component, MyEvents>({
  // 配置...
})
```

### 类型安全的翻译

```typescript
interface Translations {
  'user/login': 'string'
  'common/welcome': 'string'
  'common/greeting': 'name: string'
}

function t<K extends keyof Translations>(
  key: K,
  vars?: string extends Translations[K] ? never : Record<string, any>
): string {
  // 实现...
}

// 使用
t('user/login')  // ✅ 正确
t('user/unknown')  // ❌ 类型错误
```

## 调试模式

启用调试模式查看详细日志：

`languages/settings.json`：

```json
{
  "debug": true
}
```

或在代码中：

```typescript
import { i18nScope } from './languages'

i18nScope.debug = true
```

## 最佳实践

1. **使用动态补丁** - 无需重新打包即可更新翻译
2. **利用翻译变换** - 实现框架特定的响应式更新
3. **监听事件** - 响应语言变化并执行相应操作
4. **使用格式化器** - 统一处理日期、货币等格式
5. **命名空间组织** - 大型项目使用命名空间
6. **性能优化** - 懒加载和缓存提升性能
7. **类型安全** - 利用 TypeScript 提升开发体验
