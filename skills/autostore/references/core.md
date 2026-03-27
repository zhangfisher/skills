# AutoStore 核心库参考

核心状态管理库，提供响应式状态管理能力。

## 安装

```bash
npm install autostore
```

## 创建 Store

### 基本用法

```typescript
import { AutoStore } from "autostore";

const store = new AutoStore({
  price: 100,
  count: 2,
  // 同步计算属性
  total: (scope) => scope.price * scope.count,
});

// 访问状态
console.log(store.state.price); // 100
console.log(store.state.total); // 200

// 修改状态
store.state.price = 200;
console.log(store.state.total); // 400
```

### 配置选项

```typescript
const store = new AutoStore(
  {
    /* 状态 */
  },
  {
    lazy: false, // 延迟创建嵌套对象
    shadow: false, // 启用影子模式
  }
);
```

## 计算属性

### 同步计算

自动收集依赖，依赖变化时自动重新计算：

```typescript
const store = new AutoStore({
  firstName: "zhang",
  lastName: "san",
  fullName: (scope) => scope.firstName + " " + scope.lastName,
});
```

使用 `computed` 显式声明：

```typescript
import { computed } from "autostore";

const store = new AutoStore({
  price: 100,
  count: 2,
  total: computed((scope) => scope.price * scope.count),
});
```

### 异步计算

#### 基础异步计算

```typescript
import { computed } from "autostore";

const store = new AutoStore({
  userId: 1,
  user: computed(
    async (scope) => {
      const res = await fetch(`/api/user/${scope.userId}`);
      return res.json();
    },
    ["userId"], // 显式声明依赖
    {
      initial: null, // 初始值
      timeout: 5000, // 超时时间
    }
  ),
});
```

#### 增强异步计算 (asyncComputed)

提供完整的异步控制能力：

```typescript
import { asyncComputed } from "autostore";

const store = new AutoStore({
  userId: 1,
  user: asyncComputed(
    async (scope) => {
      const res = await fetch(`/api/user/${scope.userId}`);
      return res.json();
    },
    ["userId"],
    {
      initial: null,
      timeout: 5000, // 超时控制
      retry: 3, // 重试次数
      retryDelay: 1000, // 重试延迟
    }
  ),
});

// 访问异步状态
store.state.user.value; // 计算结果
store.state.user.loading; // 加载状态
store.state.user.error; // 错误信息
store.state.user.timeout; // 超时倒计时
store.state.user.retry; // 重试倒计时
store.state.user.progress; // 进度值 0-100
store.state.user.run(); // 手动执行
store.state.user.cancel(); // 取消执行
```

### 计算属性选项

| 选项         | 类型      | 说明         |
| ------------ | --------- | ------------ |
| `initial`    | `any`     | 初始值       |
| `timeout`    | `number`  | 超时时间(ms) |
| `retry`      | `number`  | 重试次数     |
| `retryDelay` | `number`  | 重试延迟(ms) |
| `async`      | `boolean` | 是否异步     |

## 状态监听 (Watch)

### store.watch()

监听状态变化：

```typescript
store.watch("count", ({ value, oldValue, path }) => {
  console.log(`count 从 ${oldValue} 变为 ${value}`);
});
```

### 路径匹配

支持通配符匹配：

```typescript
// 监听所有 user 对象的属性
store.watch("user.*", handler);

// 监听多级路径
store.watch("user.**", handler);

// 监听数组元素
store.watch("items.*.price", handler);
```

### 状态内声明 watch

可以在状态内部使用 `watch()` 函数声明监听器：

```typescript
import { watch } from "autostore";

const store = new AutoStore({
  price: 100,
  count: 2,
  // watch 函数 - 返回值写入声明位置
  total: watch(
    ({ path, value }, watchObj) => {
      // 返回计算结果
      return store.state.price * store.state.count;
    },
    (path) => path[0] === "price" || path[0] === "count", // 过滤器
    { initial: 200 }
  ),
});
```

**watch 函数签名**：

```typescript
function watch<Value, DependValue>(
  getter: (
    scope: { path: string[]; value: DependValue },
    watchObj: WatchObject
  ) => Value,
  filter?: (path: string[]) => boolean,
  options?: { initial?: Value; id?: string }
): WatchDescriptorBuilder<Value>;
```

**与 computed 的区别**：

- `computed` - 依赖是静态的，适合确定的依赖关系
- `watch` - 依赖可以是动态的，适合需要动态侦听的场景

**动态依赖示例**：

```typescript
const store = new AutoStore({
  a: { validate: true },
  b: { validate: true },
  c: { c1: { validate: true } },
  // 监听所有 validate 字段，计算总体有效性
  valid: watch<boolean, boolean>(
    ({ path, value }, watchObj) => {
      // 缓存管理
      const srcKey = path.join(".");
      if (value) {
        delete watchObj.cache[srcKey];
      } else {
        watchObj.cache[srcKey] = value;
      }
      // 如果 cache 为空，说明所有 validate 都为 true
      return Object.keys(watchObj.cache).length === 0;
    },
    (path) => path[path.length - 1] === "validate", // 只监听 validate 字段
    { initial: true }
  ),
});
```

## 状态操作

### 批量更新

```typescript
store.batch(() => {
  store.state.count = 1;
  store.state.price = 100;
  // 只触发一次更新
});
```

## 高级特性

### 影子模式 (Shadow)

基于现有 AutoStore 实例创建影子 Store，其 computed 和 watch 基于原 Store 计算：

```typescript
const store = new AutoStore({
  order: {
    price: 10,
    count: 3,
    total: (scope) => scope.price * scope.count,
  },
});

// 创建影子 Store
const shadowStore = store.shadow({
  user: "fisher",
  orderTotal: (scope) => {
    // 基于 store.state 计算
    return scope.order.price * scope.order.count;
  },
});

console.log(shadowStore.state.orderTotal); // 30

// 修改原 Store
store.state.order.count = 4;

// 影子 Store 自动更新
console.log(shadowStore.state.orderTotal); // 40
```

**特点**：

- 影子 Store 的计算属性基于原 Store 的状态
- 原 Store 变化时，影子 Store 自动更新
- 影子 Store 是独立的 AutoStore 实例

### 配置系统 (Configurable)

AutoStore 提供强大的配置管理能力，支持集中化管理可配置项：

```typescript
import { ConfigManager, configurable } from "autostore";

// 创建全局配置管理器
const configManager = new ConfigManager({
  load: async () => {
    // 从存储加载配置
    return {
      "shop.discount": 0.9,
      "user.age": 18,
    };
  },
  save: async (values) => {
    // 保存配置到存储
    Object.entries(values).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  },
});

// 创建 Store 并声明可配置项
const shopStore = new AutoStore(
  {
    order: {
      price: 100,
      count: 10,
      discount: configurable(0.4, {
        label: "折扣",
        validate: (value) => value >= 0 && value <= 1,
        errorMessage: "{label}必须在0-1之间",
      }),
    },
  },
  { id: "shop" }
);
```

**配置系统特性**：

- **集中化管理** - 所有可配置项自动注册到 ConfigManager
- **响应式元数据** - 配置元数据支持计算属性
- **双向同步** - 配置变更自动同步到业务模块
- **完整校验** - 内置校验函数和错误处理

**配置项元数据**：

```typescript
price: configurable(100, {
  label: "价格", // 显示标签
  widget: "number", // 渲染组件类型
  min: 0, // 最小值
  max: 1000, // 最大值
  validate: (v) => v > 0, // 校验函数
  errorMessage: "{label}必须大于0", // 错误模板
  enable: (scope) => scope.discount > 0.5, // 是否启用
  required: true, // 是否必填
  visible: true, // 是否可见
});
```

**访问配置管理器**：

```typescript
// 配置管理器本身是一个 AutoStore
Object.entries(AutoStoreConfigManager.state).forEach(([key, schema]) => {
  console.log(key, schema.label, schema.value);
});

// 订阅配置变化
AutoStoreConfigManager.watch("shop.discount", ({ value }) => {
  console.log("折扣变更为:", value);
});
```

**重置配置**：

```typescript
// 重置所有配置为默认值
configManager.reset();
```

### RefStore - 跨 Store 状态引用

RefStore 提供一种机制，让计算属性可以依赖其他 AutoStore 实例的状态：

```typescript
import { AutoStore, computed } from "autostore";

// 创建引用的 Store
const refStore = new AutoStore(
  {
    user: {
      name: "Alice",
      age: 25,
    },
  },
  { id: "refStore" }
);

// 创建主 Store，并配置 refStore
const mainStore = new AutoStore(
  {
    // 在计算属性中使用 ref 函数访问 refStore
    userName: computed((scope, { ref }) => {
      const name = ref("user.name");
      return `User: ${name}`;
    }),
    userAge: computed((scope, { ref }) => {
      return ref("user.age");
    }),
  },
  {
    // 配置引用的 Store
    refStore: refStore,
    id: "main",
  }
);

console.log(mainStore.state.userName); // "User: Alice"

// 修改 refStore
refStore.state.user.name = "Bob";

// mainStore 的计算属性自动更新
console.log(mainStore.state.userName); // "User: Bob"
```

**配置方式**：

1. **全局 RefStore** - 在创建 AutoStore 时配置

```typescript
const mainStore = new AutoStore(
  {
    userName: computed((scope, { ref }) => {
      return ref("user.name");
    }),
  },
  {
    refStore: refStore, // 全局配置
  }
);
```

2. **局部 RefStore** - 在创建计算属性时配置（优先级更高）

```typescript
const mainStore = new AutoStore(
  {
    userName: computed(
      (scope, { ref }) => {
        return ref("user.name");
      },
      {
        refStore: refStore2, // 局部配置，优先于全局配置
      }
    ),
  },
  {
    refStore: refStore1, // 全局配置
  }
);
```

**ref 函数签名**：

```typescript
function ref<Value = any>(
  path?: string | string[], // 引用 refStore 的路径
  options?: {
    reactive?: boolean; // 状态变化时是否自动重新计算
    runArgs?: Record<string, any>; // 传递给 run 方法的参数
  }
);
```

**使用场景**：

- 配置元数据引用所在 Store 的状态值
- 多 Store 之间的状态依赖
- 跨 Store 的计算属性联动

**与配置系统配合使用**：

```typescript
import { configurable, computed } from "autostore";

const mainStore = new AutoStore(
  {
    hasAddress: false,
    address: configurable("", {
      label: "地址",
      // 配置元数据中引用 mainStore 的状态
      required: computed((_scope, { ref }) => {
        return ref("hasAddress") === true;
      }),
    }),
    city: configurable("", {
      label: "城市",
      required: computed((_scope, { ref }) => {
        const hasAddress = ref("hasAddress");
        const city = ref("city");
        // 有地址且已填写城市时才必填
        return hasAddress && city !== "";
      }),
    }),
  },
  {
    // 配置系统需要引用自己时，不需要配置 refStore
    id: "form",
  }
);
```

**支持范围**：

- ✅ `computed` - 同步计算属性
- ✅ `asyncComputed` - 异步计算属性
- ✅ `watch` - 状态内监视

## Store 方法

### watch()

```typescript
store.watch(
  'path',                    // 监听路径
  (change) => {},            // 监听器
  options?                   // 选项
);

// change 对象
interface Change {
  path: string;              // 变化路径
  value: any;                // 新值
  oldValue: any;             // 旧值
  type: 'set' | 'delete';    // 操作类型
}
```

### 取消监听

`store.watch()` 返回 `FastEventSubscriber`，使用 `off()` 方法取消监听：

```typescript
const subscriber = store.watch("count", ({ value, oldValue }) => {
  console.log(`count 从 ${oldValue} 变为 ${value}`);
});

// 取消监听
subscriber.off();
```

**通配符监听取消**：

```typescript
const subscriber = store.watch("user.*", handler);

// 取消所有匹配的监听
subscriber.off();
```

### batch()

批量更新：

```typescript
store.batch(() => {
  // 批量修改
});
```

### sync()

需要安装`@autostorejs/syncer`包支持才有 `sync`方法

同步到其他 Store：

```typescript
const otherStore = new AutoStore({ ... });
store.sync(otherStore, {
  paths: ['user', 'config']  // 同步路径
});
```

## 类型定义

### 泛型支持

```typescript
interface UserStore {
  user: {
    name: string;
    age: number;
  };
  adult: (scope: UserStore) => boolean;
}

const store = new AutoStore<UserStore>({
  user: { name: "Alice", age: 25 },
  adult: (scope) => scope.user.age >= 18,
});

// 完整类型推断
store.state.user.name; // string
```

## 调试

### Redux DevTools

```typescript
import '@autostorejs/devtools';

const store = new AutoStore({...}, {
  debug: true,
  id: 'my-store'
});
```

### 循环依赖检测

AutoStore 自动检测循环依赖：

```typescript
const store = new AutoStore({
  a: computed((scope) => scope.b), // 依赖 b
  b: computed((scope) => scope.a), // 依赖 a - 循环依赖！
});
// 警告：检测到循环依赖
```

## 最佳实践

### 1. 计算属性优先

优先使用计算属性而非监听器：

```typescript
// ✅ 推荐
const store = new AutoStore({
  count: 0,
  double: (scope) => scope.count * 2,
});

// ❌ 不推荐
const store = new AutoStore({
  count: 0,
  $watch: (scope) => {
    store.state.double = scope.count * 2;
  },
});
```

### 2. 显式依赖声明

异步计算必须显式声明依赖：

```typescript
// ✅ 正确
user: computed(
  async (scope) => fetchUser(scope.userId),
  ["userId"] // 显式声明依赖
);

// ❌ 错误 - 自动收集可能失败
user: computed(async (scope) => fetchUser(scope.userId));
```

### 3. 使用 initial 避免 undefined

```typescript
// ✅ 推荐
user: computed(fetchUser, ["userId"], { initial: null });

// ❌ 可能导致问题
user: computed(fetchUser, ["userId"]);
```

## 参考资源

- **源代码**：
  - Core: `https://github.com/zhangfisher/autostore/tree/master/packages/core`
- **官方文档**：`https://zhangfisher.github.io/autostore/`
- **类型声明**: `./autostore.d.ts`
