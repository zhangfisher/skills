# React 集成指南

VoerkaI18n 提供了完整的 React 支持，包括 Hooks、组件和 TypeScript 类型定义。

## 安装依赖

```bash
# 安装 CLI 工具（全局）
npm install -g @voerkai18n/cli

# 初始化项目
voerkai18n init

# 启用 React 支持
voerkai18n apply -f react
```

或手动安装：

```bash
npm install @voerkai18n/react @voerkai18n/runtime
```

## 配置步骤

### 1. 配置构建插件

**Vite 配置 (`vite.config.ts`)：**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import i18nPlugin from '@voerkai18n/plugins/vite'

export default defineConfig({
  plugins: [
    i18nPlugin(),  // ⚠️ 必须在 react 插件之前
    react(),
  ],
})
```

**⚠️ 重要：** i18nPlugin 必须在 react 插件之前引入，因为 react 插件会编译 JSX，导致正则无法识别 `t()` 函数。

### 2. 配置应用入口

**方式一：使用 VoerkaI18nProvider**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { VoerkaI18nProvider } from "./languages"
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VoerkaI18nProvider fallback={<div>Loading...</div>}>
      <App />
    </VoerkaI18nProvider>
  </StrictMode>,
)
```

**方式二：使用 i18nScope.ready()**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { i18nScope } from "./languages"
import App from './App.tsx'
import './index.css'

i18nScope.ready(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

### 3. 配置翻译组件

`languages/component.tsx`（自动生成）：

```typescript
import {
  createTranslateComponent,
  ReactTranslateComponentType
} from "@voerkai18n/react"

export const component = createTranslateComponent()
export type TranslateComponentType = ReactTranslateComponentType
```

## 使用方式

### t() 函数

```tsx
import { t } from './languages'

function LoginForm() {
  return (
    <div>
      <h1>{t('用户登录')}</h1>
      <input placeholder={t('请输入用户名')} />
      <input placeholder={t('请输入密码')} />
      <button>{t('登录')}</button>
    </div>
  )
}
```

### Translate 组件

```tsx
import { Translate } from './languages'

function Header() {
  return (
    <header>
      <h1>
        <Translate message="用户登录" />
      </h1>
      <div>
        <Translate message="用户名：" />
        <input placeholder={t('请输入用户名')} />
      </div>
      <div>
        <Translate message="密码：" />
        <input type="password" placeholder={t('请输入密码')} />
      </div>
      <button>
        <Translate message="登录" />
      </button>
    </header>
  )
}
```

**Translate 组件属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 段落 ID（从 paragraphs 加载） |
| `message` | `string` | 要翻译的文本 |
| `vars` | `object` | 插值变量 |
| `default` | `any` | 默认文本 |
| `tag` | `string` | HTML 标签名称 |
| `className` | `string` | CSS 类名 |
| `style` | `object` | CSS 样式 |

**示例：**

```tsx
// 带插值变量
<Translate
  message="欢迎，{name}！"
  vars={{ name: '张三' }}
/>

// 自定义标签和样式
<Translate
  message="登录"
  tag="button"
  className="btn btn-primary"
  style={{ padding: '10px 20px' }}
/>

// 大段文本（使用 ID）
<Translate id="terms-of-service">
  {/* 这里的内容会被替换为 paragraphs 中的内容 */}
</Translate>
```

### useVoerkaI18n Hook

```tsx
import { useVoerkaI18n } from '@voerkai18n/react'

function LanguageSwitcher() {
  const {
    activeLanguage,
    defaultLanguage,
    languages,
    changeLanguage,
    t,
    scope,
    manager
  } = useVoerkaI18n()

  return (
    <div className="language-bar">
      {languages.map((lang) => (
        <button
          key={lang.name}
          onClick={() => changeLanguage(lang.name)}
          className={activeLanguage === lang.name ? 'active' : ''}
        >
          {lang.title}
        </button>
      ))}
      <p>当前语言：{activeLanguage}</p>
    </div>
  )
}
```

**返回值说明：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `activeLanguage` | `string` | 当前激活的语言 |
| `defaultLanguage` | `string` | 默认语言 |
| `languages` | `array` | 所有支持的语言列表 |
| `changeLanguage` | `(lang: string) => Promise<void>` | 切换语言方法 |
| `t` | `(message: string, vars?: object) => string` | 翻译函数 |
| `scope` | `VoerkaI18nScope` | 语言作用域 |
| `manager` | `VoerkaI18nManager` | 语言管理器 |

## 语言切换

### 基本切换

```tsx
import { useVoerkaI18n } from '@voerkai18n/react'

function LanguageSelector() {
  const { activeLanguage, languages, changeLanguage } = useVoerkaI18n()

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang)
    // 语言切换后会自动重新渲染组件
  }

  return (
    <select value={activeLanguage} onChange={(e) => handleLanguageChange(e.target.value)}>
      {languages.map((lang) => (
        <option key={lang.name} value={lang.name}>
          {lang.title}
        </option>
      ))}
    </select>
  )
}
```

### 监听语言切换

```tsx
import { useEffect } from 'react'
import { i18nScope } from './languages'

function App() {
  useEffect(() => {
    const subscriber = i18nScope.on('change', (newLanguage) => {
      console.log('语言切换为:', newLanguage)
      // 可以在这里执行额外操作
    })

    return () => {
      subscriber.off()
    }
  }, [])

  return <div>...</div>
}
```

## 完整示例

```tsx
// src/App.tsx
import { useState } from 'react'
import { useVoerkaI18n } from '@voerkai18n/react'
import { Translate, t } from './languages'

function App() {
  const [username, setUsername] = useState('')
  const { activeLanguage, languages, changeLanguage } = useVoerkaI18n()

  return (
    <div className="app">
      {/* 语言切换器 */}
      <div className="language-switcher">
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

      {/* 登录表单 */}
      <div className="login-form">
        <h1>
          <Translate message="用户登录" />
        </h1>

        <div className="form-group">
          <label>
            <Translate message="用户名：" />
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('请输入用户名')}
          />
        </div>

        <div className="form-group">
          <label>
            <Translate message="密码：" />
          </label>
          <input
            type="password"
            placeholder={t('请输入密码')}
          />
        </div>

        <button>
          <Translate message="登录" />
        </button>
      </div>
    </div>
  )
}

export default App
```

## TypeScript 支持

VoerkaI18n 提供完整的 TypeScript 类型定义。

### 定义事件类型

```typescript
// src/languages/index.ts
import { VoerkaI18nScope } from '@voerkai18n/runtime'
import component from './component'

interface Events {
  'user/login': { username: string }
  'data/update': { value: string }
}

export const i18nScope = new VoerkaI18nScope<typeof component, Events>({
  // ...
})

export type TranslateProps = {
  id?: string
  message?: string
  vars?: Record<string, any>
  default?: any
  tag?: string
  className?: string
  style?: React.CSSProperties
}
```

## 常见问题

### Q1: 为什么语言切换后组件没有更新？

确保使用 `useVoerkaI18n()` Hook 而不是直接导入 `t` 函数：

```tsx
// ❌ 错误：不会自动更新
import { t } from './languages'
const title = t('标题')

// ✅ 正确：会自动更新
import { useVoerkaI18n } from '@voerkai18n/react'
const { t } = useVoerkaI18n()
const title = t('标题')
```

### Q2: Hydration 错误如何解决？

确保服务端和客户端渲染的语言一致：

```tsx
import { VoerkaI18nProvider } from './languages'

<VoerkaI18nProvider fallback={<div>Loading...</div>}>
  <App />
</VoerkaI18nProvider>
```

### Q3: 如何在 React Router 中使用？

```tsx
import { useVoerkaI18n } from '@voerkai18n/react'

function NavBar() {
  const { t } = useVoerkaI18n()

  return (
    <nav>
      <Link to="/">{t('首页')}</Link>
      <Link to="/about">{t('关于')}</Link>
    </nav>
  )
}
```

## 最佳实践

1. **使用 Translate 组件包裹 JSX** - 大段文本用组件
2. **使用 t() 函数处理属性值** - placeholder、title 等
3. **利用 useVoerkaI18n Hook** - 获取语言信息和切换方法
4. **类型安全** - 为事件定义 TypeScript 接口
5. **懒加载语言包** - 使用动态 import 减小初始包体积
