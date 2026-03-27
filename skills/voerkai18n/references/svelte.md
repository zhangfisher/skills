# Svelte 集成指南

VoerkaI18n 为 Svelte 提供了完整的国际化支持，包括组件和响应式翻译。

## 安装依赖

```bash
# 安装 CLI 工具（全局）
npm install -g @voerkai18n/cli

# 初始化项目
voerkai18n init

# 启用 Svelte 支持
voerkai18n apply -f svelte
```

或手动安装：

```bash
npm install @voerkai18n/svelte @voerkai18n/runtime
```

## 配置步骤

### 1. 配置构建插件

**Vite 配置 (`vite.config.ts`)：**

```typescript
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import i18nPlugin from '@voerkai18n/plugins/vite'

export default defineConfig({
  plugins: [
    i18nPlugin(),  // ⚠️ 必须在 sveltekit 插件之前
    sveltekit()
  ]
})
```

**⚠️ 重要：** i18nPlugin 必须在 sveltekit 插件之前引入。

### 2. 配置应用入口

**SvelteKit 项目的 `src/hooks.client.ts`：**

```typescript
import { i18nScope } from '$lib/languages'

export async function handle({ event, resolve }) {
  // 语言初始化逻辑
  return resolve(event)
}
```

### 3. 配置翻译组件

`languages/component.ts`（自动生成）：

```typescript
import {
  createTranslateComponent,
  SvelteTranslateComponentType
} from "@voerkai18n/svelte"

export const component = createTranslateComponent()
export type TranslateComponentType = SvelteTranslateComponentType
```

## 使用方式

### t() 函数

```svelte
<script>
  import { t } from './languages'
</script>

<div>
  <h1>{$t('用户登录')}</h1>
  <input placeholder={t('请输入用户名')} />
  <input placeholder={t('请输入密码')} />
  <button>{$t('登录')}</button>
</div>
```

### Translate 组件

```svelte
<script>
  import { Translate, t } from './languages'
</script>

<div>
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
</div>
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

### useVoerkaI18n

```svelte
<script>
  import { useVoerkaI18n } from '@voerkai18n/svelte'

  const {
    activeLanguage,
    defaultLanguage,
    languages,
    changeLanguage,
    t
  } = useVoerkaI18n()
</script>

<div class="language-switcher">
  {#each languages as lang}
    <button
      on:click={() => changeLanguage(lang.name)}
      class:active={activeLanguage === lang.name}
    >
      {lang.title}
    </button>
  {/each}
</div>
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

## 响应式翻译

在 Svelte 中，`t()` 函数本身就是响应式的，会自动监听语言变化。

```svelte
<script>
  import { t } from './languages'

  let name = '张三'
</script>

<div>
  <!-- 自动响应语言切换 -->
  <h1>{$t('欢迎，{name}！', { name })}</h1>
</div>
```

## 完整示例

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import { useVoerkaI18n } from '@voerkai18n/svelte'
  import { Translate, t } from './languages'

  const {
    activeLanguage,
    languages,
    changeLanguage
  } = useVoerkaI18n()

  let username = ''
  let password = ''

  function login() {
    console.log('登录', username, password)
  }
</script>

<div class="app">
  <!-- 语言切换器 -->
  <div class="language-switcher">
    {#each languages as lang}
      <button
        on:click={() => changeLanguage(lang.name)}
        class:active={activeLanguage === lang.name}
      >
        {lang.title}
      </button>
    {/each}
  </div>

  <!-- 登录表单 -->
  <div class="login-form">
    <h1>
      <Translate message="用户登录" />
    </h1>

    <div class="form-group">
      <label>
        <Translate message="用户名：" />
      </label>
      <input
        type="text"
        bind:value={username}
        placeholder={t('请输入用户名')}
      />
    </div>

    <div class="form-group">
      <label>
        <Translate message="密码：" />
      </label>
      <input
        type="password"
        bind:value={password}
        placeholder={t('请输入密码')}
      />
    </div>

    <button on:click={login}>
      <Translate message="登录" />
    </button>
  </div>
</div>

<style>
  .language-switcher button.active {
    font-weight: bold;
    color: #ff3e00;
  }
</style>
```

## 插值变量

```svelte
<script>
  import { Translate, t } from './languages'
</script>

<div>
  <!-- 命名变量 -->
  <p>{t('欢迎，{name}！', { name: '张三' })}</p>

  <!-- 位置变量 -->
  <p>{t('出生于{0}年', 1990)}</p>

  <!-- 使用 Translate 组件 -->
  <Translate
    message="欢迎，{name}！"
    vars={{ name: '张三' }}
  />
</div>
```

## 段落翻译

对于大段文本内容，使用 `id` 属性：

```svelte
<script>
  import { Translate } from './languages'
</script>

<Translate id="terms-of-service">
  <!-- 这里的内容会被替换为 paragraphs 中的内容 -->
</Translate>
```

内容定义在 `languages/translates/paragraphs/terms-of-service.html`。

## 自定义翻译组件

`languages/component.ts`：

```typescript
import {
  createTranslateComponent,
  SvelteTranslateComponentType
} from "@voerkai18n/svelte"
import LoadingComponent from './LoadingComponent.svelte'

export const component = createTranslateComponent({
  tagName: 'span',         // 默认标签
  class: 'translate',      // 默认类名
  loading: LoadingComponent  // 加载中组件
})

export type TranslateComponentType = SvelteTranslateComponentType
```

## 在 SvelteKit Store 中使用

```typescript
// src/stores/language.ts
import { writable } from 'svelte/store'
import { i18nScope, t } from '$lib/languages'

export const message = writable(t('欢迎'))

i18nScope.on('change', () => {
  message.set(t('欢迎'))
})
```

```svelte
<script>
  import { message } from '../stores/language'
</script>

<div>{$message}</div>
```

## 常见问题

### Q1: 为什么切换语言后界面没有更新？

确保使用响应式语法 `$t()`：

```svelte
<!-- ❌ 错误：不会自动更新 -->
<h1>{t('标题')}</h1>

<!-- ✅ 正确：会自动更新 -->
<h1>{$t('标题')}</h1>
```

### Q2: 如何在 load 函数中使用？

```typescript
// src/routes/+page.server.ts
export async function load({ cookies }) {
  const language = cookies.get('language') || 'zh-CN'
  return {
    language
  }
}
```

### Q3: Translate 组件未定义？

确保已正确导入：

```svelte
<script>
  import { Translate } from './languages'
</script>
```

## 最佳实践

1. **使用 $t() 语法** - 确保响应式更新
2. **大段文本用 Translate 组件** - 保持模板整洁
3. **利用 useVoerkaI18n** - 获取语言状态和切换方法
4. **组件属性用 t()** - placeholder、title 等
5. **插件顺序正确** - i18nPlugin 在 sveltekit 之前
