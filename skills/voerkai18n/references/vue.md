# Vue 3 集成指南

VoerkaI18n 为 Vue 3 提供了完整的国际化支持，包括 Composition API、自定义指令和响应式翻译。

## 安装依赖

```bash
# 安装 CLI 工具（全局）
npm install -g @voerkai18n/cli

# 初始化项目
voerkai18n init

# 启用 Vue 3 支持
voerkai18n apply -f vue
```

或手动安装：

```bash
npm install @voerkai18n/vue @voerkai18n/runtime
```

## 配置步骤

### 1. 配置构建插件

**Vite 配置 (`vite.config.ts`)：**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import i18nPlugin from '@voerkai18n/plugins/vite'

export default defineConfig({
  plugins: [
    i18nPlugin(),  // ⚠️ 必须在 vue 插件之前
    vue(),
  ],
})
```

**⚠️ 重要：** i18nPlugin 必须在 vue 插件之前引入。

### 2. 注册插件

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { i18nPlugin } from '@voerkai18n/vue'
import { i18nScope } from "./languages"

i18nScope.ready(() => {
  const app = createApp(App)

  app.use(i18nPlugin, { i18nScope })

  app.mount('#app')
})
```

### 3. 配置翻译组件

`languages/component.ts`（自动生成）：

```typescript
import {
  createTranslateComponent,
  VueTranslateComponentType
} from "@voerkai18n/vue"

export const component = createTranslateComponent()
export type TranslateComponentType = VueTranslateComponentType
```

### 4. 配置翻译变换

`languages/transform.ts`（自动生成）：

```typescript
import {
  createTranslateTransform,
  VueTransformResultType
} from "@voerkai18n/vue"

export const transform = createTranslateTransform()
export type TransformResultType = VueTransformResultType
```

## 使用方式

### t() 函数

注册插件后，`t()` 函数会自动注入到所有组件中，无需手动导入。

```vue
<template>
  <div>
    <h1>{{ t('用户登录') }}</h1>
    <input :placeholder="t('请输入用户名')" />
    <input :placeholder="t('请输入密码')" />
    <button>{{ t('登录') }}</button>
  </div>
</template>

<script setup lang="ts">
// t() 函数已自动注入，无需导入
</script>
```

### Translate 组件

```vue
<template>
  <div>
    <h1>
      <Translate message="用户登录" />
    </h1>
    <div>
      <Translate message="用户名：" />
      <input :placeholder="t('请输入用户名')" />
    </div>
    <div>
      <Translate message="密码：" />
      <input type="password" :placeholder="t('请输入密码')" />
    </div>
    <button>
      <Translate message="登录" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Translate } from './languages'
</script>
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

### useVoerkaI18n Composition API

```vue
<template>
  <div class="language-switcher">
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

<script setup lang="ts">
import { useVoerkaI18n } from '@voerkai18n/vue'

const {
  activeLanguage,
  defaultLanguage,
  languages,
  changeLanguage,
  t
} = useVoerkaI18n()
</script>
```

**返回值说明：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `activeLanguage` | `Ref<string>` | 当前激活的语言（响应式） |
| `defaultLanguage` | `string` | 默认语言 |
| `languages` | `array` | 所有支持的语言列表 |
| `changeLanguage` | `(lang: string) => Promise<void>` | 切换语言方法 |
| `t` | `(message: string, vars?: object) => string` | 翻译函数 |
| `scope` | `VoerkaI18nScope` | 语言作用域 |
| `manager` | `VoerkaI18nManager` | 语言管理器 |

## 响应式翻译

### 问题：切换语言后界面不更新

```vue
<template>
  <div>
    <!-- ❌ 错误：不会自动更新 -->
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { t } from './languages'

const title = t('标题')  // setup 中只执行一次
</script>
```

**原因：** `setup()` 只在组件初始化时执行一次，`t()` 函数的返回值已经固定。

### 解决方案一：在模板中调用 t()

```vue
<template>
  <!-- ✅ 正确：会自动更新 -->
  <h1>{{ t('标题') }}</h1>
</template>
```

### 解决方案二：使用 $t 翻译变换

```vue
<template>
  <div>
    <!-- ✅ 正确：会自动更新 -->
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { $t } from './languages'

const title = $t('标题')  // 返回响应式值
</script>
```

`$t()` 函数会将翻译结果转换为 Vue 的 `ref` 对象，实现响应式更新。

### 解决方案三：手动监听语言切换

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { t, i18nScope } from './languages'

const title = ref(t('标题'))

let subscriber
onMounted(() => {
  subscriber = i18nScope.on('change', () => {
    title.value = t('标题')
  })
})

onUnmounted(() => {
  subscriber?.off()
})
</script>
```

**推荐使用方案一或方案二**，更简洁高效。

## 完整示例

```vue
<!-- src/App.vue -->
<template>
  <div class="app">
    <!-- 语言切换器 -->
    <div class="language-switcher">
      <button
        v-for="lang in languages"
        :key="lang.name"
        @click="changeLanguage(lang.name)"
        :class="{ active: activeLanguage === lang.name }"
      >
        {{ lang.title }}
      </button>
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
          v-model="username"
          type="text"
          :placeholder="t('请输入用户名')"
        />
      </div>

      <div class="form-group">
        <label>
          <Translate message="密码：" />
        </label>
        <input
          v-model="password"
          type="password"
          :placeholder="t('请输入密码')"
        />
      </div>

      <button @click="login">
        <Translate message="登录" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useVoerkaI18n } from '@voerkai18n/vue'
import { Translate } from './languages'

const { activeLanguage, languages, changeLanguage, t } = useVoerkaI18n()

const username = ref('')
const password = ref('')

const login = () => {
  console.log('登录', username.value, password.value)
}
</script>

<style scoped>
.language-switcher button.active {
  font-weight: bold;
  color: #42b883;
}
</style>
```

## 插值变量

```vue
<template>
  <div>
    <!-- 命名变量 -->
    <p>{{ t('欢迎，{name}！', { name: '张三' }) }}</p>

    <!-- 位置变量 -->
    <p>{{ t('出生于{0}年', 1990) }}</p>

    <!-- 使用 Translate 组件 -->
    <Translate
      message="欢迎，{name}！"
      :vars="{ name: '张三' }"
    />
  </div>
</template>
```

## 段落翻译

对于大段文本内容，使用 `id` 属性：

```vue
<template>
  <Translate id="terms-of-service">
    <!-- 这里的内容会被替换为 paragraphs 中的内容 -->
  </Translate>
</template>
```

内容定义在 `languages/translates/paragraphs/terms-of-service.html`。

## 监听语言切换

```vue
<template>
  <div>{{ message }}</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { i18nScope, t } from './languages'

const message = ref(t('欢迎'))

onMounted(() => {
  const subscriber = i18nScope.on('change', (newLanguage) => {
    console.log('语言切换为:', newLanguage)
    message.value = t('欢迎')
  })

  onUnmounted(() => {
    subscriber.off()
  })
})
</script>
```

## 自定义翻译组件

`languages/component.ts`：

```typescript
import {
  createTranslateComponent,
  VueTranslateComponentType
} from "@voerkai18n/vue"
import LoadingComponent from './LoadingComponent.vue'

export const component = createTranslateComponent({
  tagName: 'span',         // 默认标签
  class: 'translate',      // 默认类名
  loading: LoadingComponent,  // 加载中组件
})

export type TranslateComponentType = VueTranslateComponentType
```

## 常见问题

### Q1: 为什么 t() 函数未定义？

确保已注册 `i18nPlugin`：

```typescript
import { i18nPlugin } from '@voerkai18n/vue'

app.use(i18nPlugin, { i18nScope })
```

### Q2: 为什么切换语言后界面不更新？

**原因：** 在 `setup()` 中调用 `t()` 并存储结果。

**解决：** 在模板中调用 `t()` 或使用 `$t()`。

```vue
<!-- ❌ 错误 -->
<script setup>
const title = t('标题')
</script>

<!-- ✅ 正确 -->
<template>
  <h1>{{ t('标题') }}</h1>
</template>

<!-- ✅ 正确 -->
<script setup>
const title = $t('标题')
</script>
```

### Q3: 如何在 Pinia store 中使用？

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { t, i18nScope } from '../languages'

export const useUserStore = defineStore('user', () => {
  const message = ref(t('欢迎'))

  function onLanguageChange() {
    message.value = t('欢迎')
  }

  i18nScope.on('change', onLanguageChange)

  return { message }
})
```

## 最佳实践

1. **优先在模板中调用 t()** - 自动响应语言切换
2. **使用 $t 处理 setup 中的翻译** - 返回响应式值
3. **大段文本用 Translate 组件** - 保持模板整洁
4. **利用 useVoerkaI18n Hook** - 获取语言状态和切换方法
5. **组件属性用 t()** - placeholder、title 等
