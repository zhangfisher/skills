# Vue 2 集成指南

VoerkaI18n 完全支持 Vue 2.x，提供插件、组件和混入（mixin）功能。

## 安装依赖

```bash
# 安装 CLI 工具（全局）
npm install -g @voerkai18n/cli

# 初始化项目
voerkai18n init

# 启用 Vue 2 支持
voerkai18n apply -f vue2
```

或手动安装：

```bash
npm install @voerkai18n/vue2 @voerkai18n/runtime
```

## 配置步骤

### 1. 配置构建插件

**Vue CLI 配置 (`vue.config.js`)：**

```javascript
const webpackPlugin = require("@voerkai18n/plugins/webpack")

module.exports = {
  configureWebpack: {
    plugins: [
      webpackPlugin()
    ]
  }
}
```

### 2. 注册插件

```javascript
// src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { i18nPlugin } from '@voerkai18n/vue2'
import { i18nScope } from "./languages"

Vue.use(i18nPlugin, {
  i18nScope
})

i18nScope.ready(() => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})
```

### 3. 配置翻译组件

`languages/component.js`（自动生成）：

```javascript
import {
  createTranslateComponent,
  VueTranslateComponentType
} from "@voerkai18n/vue2"

export const component = createTranslateComponent()
export const componentType = VueTranslateComponentType
```

## 使用方式

### t() 函数

注册插件后，`t()` 函数会自动注入到所有组件实例中。

```vue
<template>
  <div>
    <h1>{{ t('用户登录') }}</h1>
    <input :placeholder="t('请输入用户名')" />
    <input :placeholder="t('请输入密码')" />
    <button>{{ t('登录') }}</button>
  </div>
</template>

<script>
export default {
  // t() 函数已自动注入，无需导入
}
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
    <button>
      <Translate message="登录" />
    </button>
  </div>
</template>

<script>
import { Translate } from './languages'

export default {
  components: {
    Translate
  }
}
</script>
```

### withI18n 混入

使用 `withI18n` 为组件添加语言切换能力：

```vue
<template>
  <div class="language-bar">
    <button
      v-for="lang in languages"
      :key="lang.name"
      @click="changeLanguage(lang.name)"
      :class="{ active: activeLanguage === lang.name }"
    >
      {{ lang.title }}
    </button>
    <p>当前：{{ activeLanguage }}</p>
  </div>
</template>

<script>
import { withI18n } from '@voerkai18n/vue2'

export default withI18n({
  // 组件选项
}, i18nScope)
</script>
```

**withI18n 提供的属性和方法：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `activeLanguage` | `string` | 当前激活的语言 |
| `defaultLanguage` | `string` | 默认语言 |
| `languages` | `array` | 所有支持的语言列表 |
| `changeLanguage` | `(lang: string) => Promise<void>` | 切换语言方法 |

## 响应式翻译

### 问题：切换语言后 data 中的数据不更新

```vue
<template>
  <div>
    <!-- ❌ 错误：不会自动更新 -->
    <h1>{{ title }}</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: this.t('标题')  // data() 只执行一次
    }
  }
}
</script>
```

**原因：** `data()` 函数只在组件初始化时执行一次。

### 解决方案：使用 computed

```vue
<template>
  <!-- ✅ 正确：会自动更新 -->
  <h1>{{ title }}</h1>
</template>

<script>
export default {
  computed: {
    title() {
      return this.t('标题')
    }
  }
}
</script>
```

`computed` 属性会在响应式数据变化时重新计算，包括语言切换。

### 解决方案二：直接在模板中调用

```vue
<template>
  <!-- ✅ 正确：会自动更新 -->
  <h1>{{ t('标题') }}</h1>
</template>
```

## 完整示例

```vue
<!-- src/App.vue -->
<template>
  <div class="app">
    <!-- 语言切换器 -->
    <div class="language-bar">
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

<script>
import { withI18n } from '@voerkai18n/vue2'
import { Translate } from './languages'

export default withI18n({
  components: {
    Translate
  },
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login() {
      console.log('登录', this.username, this.password)
    }
  }
}, i18nScope)
</script>

<style scoped>
.language-bar button.active {
  font-weight: bold;
  color: #42b883;
}
</style>
```

## 在 Vuex 中使用

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import { i18nScope, t } from '../languages'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    message: t('欢迎')
  },
  mutations: {
    UPDATE_MESSAGE(state) {
      state.message = t('欢迎')
    }
  }
})

// 监听语言切换
i18nScope.on('change', () => {
  store.commit('UPDATE_MESSAGE')
})
```

## 自定义翻译组件

`languages/component.js`：

```javascript
import {
  createTranslateComponent,
  VueTranslateComponentType
} from "@voerkai18n/vue2"
import LoadingComponent from './LoadingComponent.vue'

export const component = createTranslateComponent({
  tagName: 'span',         // 默认标签
  class: 'translate',      // 默认类名
  loading: LoadingComponent  // 加载中组件
})

export const componentType = VueTranslateComponentType
```

## 常见问题

### Q1: t() 函数未定义？

确保已注册 `i18nPlugin`：

```javascript
import { i18nPlugin } from '@voerkai18n/vue2'

Vue.use(i18nPlugin, { i18nScope })
```

### Q2: 为什么切换语言后界面不更新？

**原因：** 在 `data()` 中调用 `this.t()` 并存储结果。

**解决：** 使用 `computed` 属性或在模板中直接调用 `t()`。

```vue
<!-- ❌ 错误 -->
<script>
export default {
  data() {
    return {
      title: this.t('标题')
    }
  }
}
</script>

<!-- ✅ 正确 -->
<script>
export default {
  computed: {
    title() {
      return this.t('标题')
    }
  }
}
</script>

<!-- ✅ 正确 -->
<template>
  <h1>{{ t('标题') }}</h1>
</template>
```

### Q3: 如何在路由守卫中使用？

```javascript
// router/index.js
import { i18nScope } from '../languages'

router.beforeEach((to, from, next) => {
  const language = i18nScope.activeLanguage
  console.log('当前语言:', language)
  next()
})
```

## 最佳实践

1. **使用 computed 处理 data 中的翻译** - 确保响应式更新
2. **优先在模板中调用 t()** - 简单直接
3. **大段文本用 Translate 组件** - 保持模板整洁
4. **利用 withI18n 混入** - 快速添加语言切换功能
5. **组件属性用 t()** - placeholder、title 等
