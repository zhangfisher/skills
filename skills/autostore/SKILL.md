---
name: autostore
description: AutoStore 响应式状态管理库使用指南。功能强大、类型安全的状态管理方案，支持就地计算属性、异步计算、表单双向绑定、信号组件、状态同步等高级特性。
---

# AutoStore 技能

设计精巧而优雅的现代化响应式状态管理库，提供一站式状态管理解决方案。

## 快速开始

### 核心库 (Core)

```typescript
import { AutoStore } from "autostore";

const store = new AutoStore({
  count: 0,
  // 就地计算属性
  double: (scope) => scope.count * 2,
});

// 访问状态
console.log(store.state.double); // 0

// 修改状态
store.state.count = 5;
console.log(store.state.double); // 10
```

### React 集成

```typescript
import { createStore, useReactive } from "@autostorejs/react";

const store = createStore({
  user: { name: "Alice" },
  greeting: (scope) => `Hello, ${scope.user.name}`,
});

function App() {
  const state = useReactive(store);
  return <h1>{state.greeting}</h1>;
}
```

## 核心概念

### 就地计算属性

AutoStore 独有特性，计算结果直接写入状态树：

```typescript
const store = new AutoStore({
  price: 100,
  count: 2,
  total: (scope) => scope.price * scope.count,
});

// total 值直接在 store.state.total 中
```

**依赖自动追踪**：同步计算自动收集依赖，仅依赖变化时重新计算。

### 异步计算

支持 `loading`、`error`、`timeout`、`retry`、`cancel`、`progress` 等高级功能：

```typescript
import { computed } from "autostore";

const store = new AutoStore({
  userId: 1,
  // 异步计算属性
  userInfo: computed(
    async (scope) => {
      const res = await fetch(`/api/user/${scope.userId}`);
      return res.json();
    },
    ["userId"], // 依赖路径
    { async: true, initial: null }
  ),
});

// 访问异步状态
store.state.userInfo.loading; // boolean
store.state.userInfo.value; // 用户数据
store.state.userInfo.error; // Error | null
```

### 状态监听 (Watch)

```typescript
const store = new AutoStore({
  count: 0,
  $watch: (scope) => {
    console.log("count changed:", scope.count);
  },
});
```

### 表单双向绑定

```typescript
import { useForm } from "@autostorejs/react";

function MyForm() {
  const { state, Field } = useForm({
    email: "",
    password: "",
  });

  return (
    <form>
      <Field name="email" type="email" />
      <Field name="password" type="password" />
    </form>
  );
}
```

## 技术模块

### Core (`autostore`)

核心状态管理库，适用于所有框架。

**安装**：`npm install autostore`

**功能**：

- 响应式状态代理
- 就地计算属性
- 异步计算控制
- 状态监听
- Redux DevTools 集成

详细参考：[references/core.md](references/core.md)

### Syncer (`@autostorejs/syncer`)

状态同步库，支持跨标签页、WebWorker、SharedWorker 同步。

**安装**：`npm install @autostorejs/syncer`

**同步场景**：

- 同一进程内：`store.sync()`
- 跨标签页：`BroadcastChannelTransport`
- 主线程与 Worker：`WorkerTransport`
- 一主多从：`AutoStoreBroadcastSyncer`

详细参考：[references/syncer.md](references/syncer.md)

### React (`@autostorejs/react`)

React 集成库，提供 Hooks 和组件。

**安装**：`npm install @autostorejs/react`

**Hooks**：

- `useStore()` - 创建 Store
- `useReactive()` - 响应式状态访问
- `useForm()` - 表单双向绑定
- `useWatch()` - 状态监听

**组件**：

- `<Signal>` - 信号组件，细粒度更新
- `<Field>` - 表单字段组件

详细参考：[references/react.md](references/react.md)

## 类型安全

完整 TypeScript 支持：

```typescript
interface UserStore {
  user: { name: string; age: number };
  adult: (scope: UserStore) => boolean;
}

const store = new AutoStore<UserStore>({
  user: { name: "Alice", age: 25 },
  adult: (scope) => scope.user.age >= 18,
});

// 完整类型推断
store.state.user.name; // string
store.state.adult; // boolean
```

## 高级特性

### 信号组件

细粒度更新控制：

```typescript
import { Signal } from "@autostorejs/react";

function UserCard() {
  return (
    <div>
      <Signal $="user.name">
        {() => <span>{store.state.user.name}</span>}
      </Signal>
      <Signal $="user.age">{() => <span>{store.state.user.age}</span>}</Signal>
    </div>
  );
}
```

### 批量更新

```typescript
store.batch(() => {
  store.state.count = 1;
  store.state.price = 100;
  // 只触发一次更新
});
```

### 影子模式 (Shadow)

基于现有 Store 创建影子 Store，计算属性基于原 Store：

```typescript
const shadowStore = store.shadow({
  orderTotal: (scope) => scope.order.price * scope.order.count
});
// 原Store变化时，shadowStore自动更新
```

### 配置系统 (Configurable)

集中管理应用配置项：

```typescript
import { configurable } from 'autostore';

const store = new AutoStore({
  discount: configurable(0.9, {
    label: '折扣',
    validate: (v) => v >= 0 && v <= 1
  })
}, { id: 'shop' });
// 自动注册到全局ConfigManager
```

### 调试工具

```typescript
import '@autostorejs/devtools';

const store = createStore({...}, {
  debug: true,
  id: 'my-store'
});
```

## 开发提示

- **计算属性优先**：优先使用计算属性而非监听器
- **watch 动态依赖**：使用 watch 处理动态依赖场景，computed 处理静态依赖
- **配置系统**：使用 configurable 声明可配置项，自动注册到 ConfigManager
- **影子 Store**：需要基于原 Store 计算时使用 shadow 创建影子 Store
- **表单验证**：支持 HTML5 标准验证和自定义验证函数
- **依赖声明**：异步计算必须显式声明依赖路径
- **路径语法**：支持 `*` 单级匹配和 `**` 多级匹配
- **嵌套状态**：支持任意深度嵌套，Proxy 自动代理
- **表单验证**：`useForm` 支持复杂的表单验证规则

## 参考资源

- **核心库**：[references/core.md](references/core.md)
- **同步器**：[references/syncer.md](references/syncer.md)
- **React 集成**：[references/react.md](references/react.md)
- **源代码**：
  - Core: `https://github.com/zhangfisher/autostore/tree/master/packages/core`
  - Syncer: `https://github.com/zhangfisher/autostore/tree/master/packages/syncer`
  - React: `https://github.com/zhangfisher/autostore/tree/master/packages/react`
- **官方文档**：`https://zhangfisher.github.io/autostore/`
