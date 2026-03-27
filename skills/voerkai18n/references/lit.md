# Lit 集成指南

VoerkaI18n 为 Lit 和 Web Components 提供了完整的国际化支持，包括 HOC（高阶组件）和 Hooks API 两种方式。

感谢 [CoderMonkie](https://github.com/CoderMonkie) 的贡献。

## 安装依赖

```bash
# 安装 CLI 工具（全局）
npm install -g @voerkai18n/cli

# 初始化项目
voerkai18n init

# 手动安装 Lit 适配器
npm install @voerkai18n/lit @voerkai18n/runtime
```

## 使用方式

VoerkaI18n 在 Lit 中提供了两种集成方式：

### 方式一：高阶组件 (HOC)

```typescript
import { withI18n } from '@voerkai18n/lit'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { i18nScope } from './languages'

@customElement('my-component')
class MyComponent extends withI18n(LitElement, i18nScope) {
  render() {
    return html`
      <div>
        <h1>${this.t('Hello World')}</h1>
      </div>
    `
  }
}
```

### 方式二：Hooks API

```typescript
import { useI18n } from '@voerkai18n/lit'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { i18nScope } from './languages'

@customElement('my-component')
class MyComponent extends LitElement {
  private i18n = useI18n(this, i18nScope)

  render() {
    return html`
      <div>
        <h1>${this.i18n.t('Hello World')}</h1>
      </div>
    `
  }
}
```

## 完整示例

```typescript
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { withI18n, useI18n } from '@voerkai18n/lit'
import { i18nScope } from './languages'

// 使用高阶组件方式
@customElement('i18n-demo')
class I18nDemo extends withI18n(LitElement, i18nScope) {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .language-switcher {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    button {
      padding: 8px 16px;
      cursor: pointer;
    }
    button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `

  render() {
    return html`
      <div class="language-switcher">
        <h2>${this.t('语言切换')}</h2>
        ${this.languages.map(
          (lang) => html`
            <button
              @click=${() => this.setLanguage(lang.name)}
              ?disabled=${this.lang === lang.name}
            >
              ${lang.label || lang.name}
            </button>
          `
        )}
      </div>

      <div class="current-language">
        ${this.t('当前语言')}: ${this.lang}
      </div>

      <div class="translation-demo">
        <h3>${this.t('基本翻译')}</h3>
        <p>${this.t('这是一个使用 Lit 和 voerka-i18n 的示例')}</p>
        <p>${this.t('你可以切换语言来查看翻译效果')}</p>
      </div>

      <div class="translation-demo">
        <h3>${this.t('带参数的翻译')}</h3>
        <p>${this.t('你好，{name}', { name: 'Lit' })}</p>
      </div>

      <lit-translate
        message="这是使用组件的翻译示例"
      ></lit-translate>
    `
  }
}

// 使用 hooks 方式
@customElement('i18n-hooks-demo')
class I18nHooksDemo extends LitElement {
  private i18n = useI18n(this, i18nScope)

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
  `

  render() {
    return html`
      <h3>${this.i18n.t('使用 Hooks API')}</h3>
      <p>${this.i18n.t('当前语言')}: ${this.i18n.activeLanguage}</p>
      <p>${this.i18n.t('这是使用 hooks API 的示例')}</p>
    `
  }
}
```

## API 参考

### withI18n (HOC)

使用 `withI18n` 高阶组件包装 LitElement，会自动添加以下属性和方法：

#### 添加的属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `lang` | `string` | 当前激活的语言 |
| `languages` | `array` | 所有支持的语言列表 |
| `t` | `(message: string, vars?: object) => string` | 翻译函数 |

#### 添加的方法

| 方法 | 说明 |
|------|------|
| `setLanguage(language: string)` | 切换语言 |

#### 事件

| 事件 | 说明 |
|------|------|
| `language-changed` | 语言切换时触发 |

### useI18n (Hooks)

使用 `useI18n` 钩子获取 i18n 实例：

#### 返回值

```typescript
interface I18nInstance {
  t: (message: string, vars?: object) => string
  lang: string
  activeLanguage: string
  defaultLanguage: string
  languages: array
  setLanguage: (language: string) => Promise<void>
  scope: VoerkaI18nScope
}
```

## 组件翻译

VoerkaI18n 提供了 `<lit-translate>` 自定义元素：

```html
<lit-translate
  message="要翻译的文本"
></lit-translate>

<!-- 带插值变量 -->
<lit-translate
  message="欢迎，{name}"
  .vars="${{ name: 'Lit' }}"
></lit-translate>

<!-- 指定段落 ID -->
<lit-translate id="paragraph-id">
  默认内容
</lit-translate>
```

## 插值变量

```typescript
class MyComponent extends withI18n(LitElement, i18nScope) {
  render() {
    const name = 'Lit'
    const count = 5

    return html`
      <!-- 命名变量 -->
      <p>${this.t('欢迎，{name}', { name })}</p>

      <!-- 位置变量 -->
      <p>${this.t('出生于{0}年', [1990])}</p>

      <!-- 多个变量 -->
      <p>${this.t('有{count}条新消息', { count })}</p>
    `
  }
}
```

## 监听语言切换

```typescript
class MyComponent extends withI18n(LitElement, i18nScope) {
  connectedCallback() {
    super.connectedCallback()

    // 监听语言切换
    this.addEventListener('language-changed', (event) => {
      console.log('语言已切换:', event.detail.language)
    })
  }

  disconnectedCallback() {
    this.removeEventListener('language-changed', this._handleLanguageChange)
    super.disconnectedCallback()
  }

  private _handleLanguageChange = (event: CustomEvent) => {
    console.log('语言已切换:', event.detail.language)
  }
}
```

## 响应式更新

Lit 的响应式系统会自动处理语言切换：

```typescript
import { state } from 'lit/decorators.js'

class MyComponent extends withI18n(LitElement, i18nScope) {
  @state()
  private username = ''

  render() {
    return html`
      <!-- t() 函数会自动响应语言变化 -->
      <h1>${this.t('用户登录')}</h1>

      <!-- 使用状态变量 -->
      <input
        placeholder="${this.t('请输入用户名')}"
        .value="${this.username}"
        @input="${(e: InputEvent) => {
          this.username = (e.target as HTMLInputElement).value
        }}"
      />
    `
  }
}
```

## 自定义翻译组件

```typescript
import { createTranslateComponent } from '@voerkai18n/lit'
import { i18nScope } from './languages'

// 创建自定义翻译组件
const customTranslate = createTranslateComponent(i18nScope, {
  tagName: 'span',
  class: 'translate'
})

// 注册自定义元素
customElements.define('custom-translate', customTranslate)
```

## TypeScript 支持

VoerkaI18n 提供完整的 TypeScript 类型定义：

```typescript
import { withI18n, LitI18nMixin } from '@voerkai18n/lit'
import { i18nScope } from './languages'

interface MyComponentProps {
  username: string
}

@customElement('my-component')
class MyComponent extends withI18n(LitElement, i18nScope) implements MyComponentProps {
  @property()
  username = ''

  // t() 函数有完整的类型提示
  render() {
    return html`
      <p>${this.t('用户名：{username}', { username: this.username })}</p>
    `
  }
}
```

## 常见问题

### Q1: 为什么切换语言后组件没有更新？

确保使用了 `withI18n` 或 `useI18n`，并且在 `render()` 中调用 `this.t()`：

```typescript
// ✅ 正确：在 render 中调用
class MyComponent extends withI18n(LitElement, i18nScope) {
  render() {
    return html`<h1>${this.t('标题')}</h1>`
  }
}

// ❌ 错误：在构造函数中调用
class MyComponent extends withI18n(LitElement, i18nScope) {
  private title = this.t('标题')  // 不会更新

  render() {
    return html`<h1>${this.title}</h1>`
  }
}
```

### Q2: 如何在多个组件间共享语言状态？

使用全局 `i18nScope`：

```typescript
// languages/index.ts
import { VoerkaI18nScope } from '@voerkai18n/runtime'

export const i18nScope = new VoerkaI18nScope({
  // 配置...
})

// 在所有组件中使用相同的 i18nScope
class Component1 extends withI18n(LitElement, i18nScope) { ... }
class Component2 extends withI18n(LitElement, i18nScope) { ... }
```

### Q3: 如何异步加载语言包？

修改 `languages/loader.ts`：

```typescript
export default async (language: string, scope: any) => {
  try {
    const response = await fetch(`/languages/${scope.id}/${language}.json`)
    return await response.json()
  } catch (error) {
    console.error("加载语言包失败:", error)
    return {}
  }
}
```

## 最佳实践

1. **选择合适的方式** - 简单组件用 HOC，复杂组件用 Hooks
2. **在 render 中调用 t()** - 确保响应式更新
3. **共享 i18nScope** - 使用全局作用域
4. **利用 lit-translate 组件** - 大段文本使用组件
5. **TypeScript 类型安全** - 定义清晰的接口
