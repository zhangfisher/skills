# AutoStore Syncer 参考文档

状态同步库，支持多种同步场景和通信方式。

## 安装

```bash
npm install @autostorejs/syncer
```

## 快速开始

### 同一进程内同步

#### 方式 1: store.sync() - 最简单

```typescript
import { AutoStore } from "autostore";

const store1 = new AutoStore({ count: 0 });
const store2 = new AutoStore({ count: 0 });

// 建立双向同步
const syncer = store1.sync(store2);

// 任一 store 变化，另一个自动同步
store1.state.count = 100;
console.log(store2.state.count); // 100
```

#### 方式 2: store.clone() - 克隆同步

```typescript
const store1 = new AutoStore({
  count: 0,
  items: ["A", "B"],
  user: { name: "张三", age: 30 },
});

// 克隆 store 并自动同步
const store2 = store1.clone();

// store2 的变化会同步到 store1
store2.state.count = 100;
console.log(store1.state.count); // 100
```

#### 方式 3: LocalTransport - 自定义传输

```typescript
import { AutoStoreSyncer, LocalTransport } from "@autostorejs/syncer";

let t1, t2;
t1 = new LocalTransport(() => t2);
t2 = new LocalTransport(() => t1);

const store1 = new AutoStore({ count: 0 });
const store2 = new AutoStore({ count: 0 });

// Store1: push 模式，自动启动
const syncer1 = new AutoStoreSyncer(store1, {
  transport: t1,
  autostart: true,
});

// Store2: pull 模式，自动启动
const syncer2 = new AutoStoreSyncer(store2, {
  transport: t2,
  mode: "pull",
  autostart: true,
});
```

### 跨标签页同步

使用 `AutoStoreBroadcastChannelSyncer` 简化跨标签页同步：

```typescript
import { AutoStore } from "autostore";
import { AutoStoreBroadcastChannelSyncer } from "@autostorejs/syncer";

const store = new AutoStore({
  count: 0,
  messages: [] as string[],
  todos: [] as Array<{ id: number; text: string; completed: boolean }>,
  user: {
    name: "张三",
    age: 30,
    email: "zhangsan@example.com",
  },
});

// 使用简化的 BroadcastChannelSyncer
const syncer = new AutoStoreBroadcastChannelSyncer(
  store,
  "my-app-channel" // channel name
);

// 新页面自动从已有页面拉取最新状态
```

**特点**：

- 自动管理 BroadcastChannel 连接
- 默认使用 `pull` 模式，新页面自动同步已有页面的状态
- 支持任意数据类型（对象、数组、嵌套结构）
- 无需 SharedWorker 或 Worker，纯前端实现

### 与 WebWorker 同步

**主线程代码**：

```typescript
import { AutoStore } from "autostore";
import { AutoStoreWorkerSyncer } from "@autostorejs/syncer";

const store = new AutoStore({
  count: 0,
  messages: [] as string[],
  todos: [] as Array<{ id: number; text: string; completed: boolean }>,
  user: {
    name: "张三",
    age: 30,
    email: "zhangsan@example.com",
  },
});

const worker = new SharedWorker(
  new URL("./shared-worker.ts", import.meta.url),
  {
    type: "module",
    name: "my-worker",
  }
);

// 使用 AutoStoreWorkerSyncer 简化 WorkerTransport + AutoStoreSyncer
const syncer = new AutoStoreWorkerSyncer(store, worker, {
  // 指定 SharedWorker 中的 store 的 id
  peers: ["shared-worker-store"],
});

// 监听状态变化
store.watch(({ path, value }) => {
  console.log(`[更新] ${path.join(".")} = ${value}`);
});
```

**Worker 代码 (shared-worker.ts)**：

```typescript
import { AutoStore } from "autostore";
import { AutoStoreBroadcastSyncer } from "@autostorejs/syncer";

// 创建共享的 store
const store = new AutoStore(
  {
    count: 0,
    messages: [] as string[],
    todos: [] as Array<{ id: number; text: string; completed: boolean }>,
    user: {
      name: "张三",
      age: 30,
      email: "zhangsan@example.com",
    },
  },
  { id: "shared-worker-store" }
);

// 创建广播器，管理多个客户端连接
const broadcaster = new AutoStoreBroadcastSyncer(store, {
  autostart: true,
  heartbeat: 3000,
});

// 监听客户端连接
self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  port.start();

  broadcaster.addTransport({
    send: (data) => port.postMessage(data),
    onMessage: (callback) => {
      port.addEventListener("message", (e) => callback(e.data));
    },
    connect: () => port.start(),
    disconnect: () => port.close(),
  });
});
```

## 同步模式

### mode 选项

控制初始同步行为：

| 模式   | 说明                       |
| ------ | -------------------------- |
| `push` | 推送本地状态到远程（默认） |
| `pull` | 从远程拉取状态             |
| `both` | 双向同步                   |
| `none` | 不执行初始同步             |

```typescript
const syncer = store1.sync(store2, {
  mode: "push", // 启动时推送本地状态
});
```

### direction 选项

控制后续同步方向：

| 方向       | 说明               |
| ---------- | ------------------ |
| `both`     | 双向同步（默认）   |
| `forward`  | 仅从本地同步到远程 |
| `backward` | 仅从远程同步到本地 |

```typescript
const syncer = store1.sync(store2, {
  direction: "forward", // 只发送本地更新
});
```

### mode 与 direction 的区别

- `mode`：控制初始同步时的行为
- `direction`：控制后续同步的方向

```typescript
const syncer = store1.sync(store2, {
  mode: "push", // 启动时推送本地状态
  direction: "backward", // 后续只接收远程更新
});
```

## 高级特性

### 局部同步

指定同步路径：

```typescript
const store1 = new AutoStore({
  order: { price: 100, count: 2 },
  user: { name: "Alice" },
});

const store2 = new AutoStore({
  myorder: {},
});

// 只同步 order 到 myorder
store1.sync(store2, {
  local: "order", // 本地路径
  remote: "myorder", // 远程路径
});
```

### 过滤同步

使用 `filter` 控制同步内容：

```typescript
store1.sync(store2, {
  filter: (path, value) => {
    // 只同步 a 和 c
    return path[1] === "a" || path[1] === "c";
  },
});
```

### 路径映射

转换路径结构：

```typescript
fromStore.sync(toStore, {
  remote: "myorder",
  pathMap: {
    toLocal: (path, value) => {
      // ['order.a'] -> ['order', 'a']
      if (typeof value !== "object") {
        return path[0].split(".");
      }
    },
    toRemote: (path, value) => {
      // ['order', 'a'] -> ['order.a']
      if (typeof value !== "object") {
        return [path.join(".")];
      }
    },
  },
});
```

### 心跳检测

```typescript
const syncer = new AutoStoreBroadcastSyncer(store, {
  autostart: true,
  heartbeat: 3000, // 3秒心跳
});
```

### 操作缓存

传输层不可用时缓存操作：

```typescript
const syncer = store1.sync(store2, {
  maxCacheSize: 100, // 最大缓存数量
});

// 手动刷新缓存
syncer.flush();
```

### peers 参数 - 指定同步源

使用 `peers` 参数指定要与哪些 Store 同步：

```typescript
// 主线程
const worker = new SharedWorker("./shared-worker.ts", {
  type: "module",
  name: "multi-store",
});

// SharedWorker 中有多个独立的 store
// - 'shared-counter-store'
// - 'shared-todo-store'
// - 'shared-user-store'

const counterStore = new AutoStore(
  {
    count: 0,
    doubleCount: (scope) => scope.count * 2,
  },
  { id: "local-counter-store" }
);

const counterSyncer = new AutoStoreWorkerSyncer(counterStore, worker, {
  // 只同步 counter-store
  peers: ["shared-counter-store"],
});

const todoStore = new AutoStore(
  {
    todos: [] as Array<{ id: number; text: string }>,
  },
  { id: "local-todo-store" }
);

const todoSyncer = new AutoStoreWorkerSyncer(todoStore, worker, {
  // 只同步 todo-store
  peers: ["shared-todo-store"],
});
```

**使用场景**：

- 多租户应用：每个租户有独立的状态
- 复杂应用的状态分区：不同功能模块使用不同的 store
- 多标签页协同工作：每个标签页可以同步不同的状态

### remote 参数 - 路径映射

使用 `remote` 参数指定要同步的远程路径：

```typescript
// 主线程
const store = new AutoStore({
  counter: 0,
  message: "等待同步...",
  todos: [] as Array<{ id: number; text: string }>,
  user: { name: "张三", age: 30 },
});

const worker = new SharedWorker("./shared-worker.ts", {
  type: "module",
  name: "path-sync",
});

// SharedWorker 中的 store 结构：
// {
//   shared: {
//     counter: 0,
//     message: 'Hello',
//     todos: [...],
//     user: {...}
//   }
// }

// 使用 remote 参数将远程的 shared 路径同步到本地根级别
// 远程 shared.counter -> 本地 counter
// 远程 shared.message -> 本地 message
// 远程 shared.todos -> 本地 todos
// 远程 shared.user -> 本地 user
const syncer = new AutoStoreWorkerSyncer(store, worker, {
  peers: ["path-sync-store"],
  remote: "shared", // 指定只同步远程的 shared 路径
});
```

**路径映射规则**：

- `remote: 'shared'` - 将远程的 `shared.*` 同步到本地根级别
- `local: 'local'` - 将本地根级别同步到远程的 `local.*`
- 可以同时指定 `local` 和 `remote` 实现复杂的路径映射

## 同步器类型

### AutoStoreSyncer

基础同步器，实现 1-1 同步：

```typescript
import { AutoStoreSyncer, LocalTransport } from "@autostorejs/syncer";

const transport = new LocalTransport(() => remoteTransport);
const syncer = new AutoStoreSyncer(store, { transport });
```

### AutoStoreWorkerSyncer

与 WebWorker/SharedWorker 同步：

```typescript
import { AutoStoreWorkerSyncer } from "@autostorejs/syncer";

const worker = new SharedWorker("./shared-worker.ts", {
  type: "module",
  name: "my-worker",
});

const syncer = new AutoStoreWorkerSyncer(store, worker, {
  peers: ["shared-worker-store"], // 指定要同步的 store
  mode: "both",
  immediate: true,
});
```

### AutoStoreBroadcastSyncer

1-N 广播同步，用于一个主 Store 与多个客户端同步：

```typescript
import { AutoStoreBroadcastSyncer } from "@autostorejs/syncer";

const store = new AutoStore(
  {
    count: 0,
    messages: [] as string[],
  },
  { id: "server-store" }
);

// 创建广播器
const broadcaster = new AutoStoreBroadcastSyncer(store, {
  autostart: true,
  heartbeat: 3000, // 3秒心跳检测
});

// 监听客户端连接（在 SharedWorker 中）
self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  port.start();

  // 添加传输层
  broadcaster.addTransport({
    send: (data) => port.postMessage(data),
    onMessage: (callback) => {
      port.addEventListener("message", (e) => callback(e.data));
    },
    connect: () => port.start(),
    disconnect: () => port.close(),
  });
});
```

### AutoStoreSwitchSyncer

N-N 多 Store 同步，在 SharedWorker 中管理多个独立的 Store：

```typescript
import { AutoStoreSwitchSyncer } from "@autostorejs/syncer";

// 创建多个独立的 store
const counterStore = new AutoStore(
  {
    count: 0,
    doubleCount: (scope) => scope.count * 2,
  },
  { id: "shared-counter-store" }
);

const todoStore = new AutoStore(
  {
    todos: [] as Array<{ id: number; text: string }>,
  },
  { id: "shared-todo-store" }
);

const userStore = new AutoStore(
  {
    user: { name: "张三", age: 30 },
  },
  { id: "shared-user-store" }
);

// 创建 SwitchSyncer 管理多个 store
const switchSyncer = new AutoStoreSwitchSyncer([
  counterStore,
  todoStore,
  userStore,
]);

// 监听客户端连接
self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  port.start();

  // 添加传输层
  switchSyncer.addTransport({
    send: (data) => port.postMessage(data),
    onMessage: (callback) => {
      port.addEventListener("message", (e) => callback(e.data));
    },
    connect: () => port.start(),
    disconnect: () => port.close(),
  });
});
```

**客户端代码**：

```typescript
// 客户端只同步 counter-store
const counterStore = new AutoStore(
  {
    count: 0,
  },
  { id: "local-counter-store" }
);

const counterSyncer = new AutoStoreWorkerSyncer(counterStore, worker, {
  peers: ["shared-counter-store"], // 只同步这个 store
});
```

## 传输层 (Transport)

### LocalTransport

同一进程内传输：

```typescript
import { LocalTransport } from "@autostorejs/syncer";

let transport1, transport2;
transport1 = new LocalTransport(() => transport2);
transport2 = new LocalTransport(() => transport1);
```

### BroadcastChannelTransport

跨标签页传输：

```typescript
import { BroadcastChannelTransport } from "@autostorejs/syncer";

const transport = new BroadcastChannelTransport({
  channelName: "my-channel",
});
```

### WorkerTransport

WebWorker/SharedWorker 传输：

```typescript
import { WorkerTransport } from "@autostorejs/syncer";

const transport = new WorkerTransport({
  worker: port, // MessagePort
  autoConnect: true,
});
```

## 同步器选项

| 选项           | 类型                      | 默认值  | 说明         |
| -------------- | ------------------------- | ------- | ------------ |
| `mode`         | `push\|pull\|both\|none`  | `push`  | 初始同步模式 |
| `direction`    | `both\|forward\|backward` | `both`  | 同步方向     |
| `local`        | `string\|string[]`        | `[]`    | 本地路径     |
| `remote`       | `string\|string[]`        | `[]`    | 远程路径     |
| `transport`    | `Transport`               | -       | 传输层对象   |
| `autostart`    | `boolean`                 | `true`  | 自动启动     |
| `immediate`    | `boolean`                 | `false` | 立即全同步   |
| `filter`       | `Function`                | -       | 过滤函数     |
| `pathMap`      | `Object`                  | -       | 路径映射     |
| `peers`        | `string[]`                | `['*']` | 接受的同步源 |
| `maxCacheSize` | `number`                  | `100`   | 最大缓存数量 |
| `heartbeat`    | `number`                  | -       | 心跳间隔(ms) |
| `onSend`       | `Function`                | -       | 发送前钩子   |
| `onReceive`    | `Function`                | -       | 接收后钩子   |

## API 方法

### syncer.start()

启动同步：

```typescript
syncer.start();
```

### syncer.stop()

停止同步：

```typescript
syncer.stop();
```

### syncer.push()

推送本地状态：

```typescript
syncer.push();
```

### syncer.pull()

拉取远程状态：

```typescript
syncer.pull();
```

### syncer.flush()

刷新缓存：

```typescript
syncer.flush();
```

## 使用场景

| 场景            | 推荐方案                    |
| --------------- | --------------------------- |
| 同一进程内      | `store.sync()`              |
| 跨标签页        | `BroadcastChannelTransport` |
| 主线程与 Worker | `AutoStoreWorkerSyncer`     |
| 一主多从        | `AutoStoreBroadcastSyncer`  |
| 多 Store 同步   | `AutoStoreSwitchSyncer`     |

## 最佳实践

### 1. 选择合适的同步方向

```typescript
// 只读客户端 - 只接收更新
const syncer = clientStore.sync(serverStore, {
  mode: "pull",
  direction: "backward",
});

// 数据收集器 - 只发送数据
const syncer = clientStore.sync(serverStore, {
  mode: "push",
  direction: "forward",
});
```

### 2. 使用过滤减少同步量

```typescript
syncer = store1.sync(store2, {
  filter: (path, value) => {
    // 只同步必要的数据
    return !path.includes("temp");
  },
});
```

### 3. 设置心跳检测

```typescript
const syncer = new AutoStoreBroadcastSyncer(store, {
  heartbeat: 3000, // 3秒检测连接
});
```

## 参考资源

- **源代码**：
  - Syncer: `https://github.com/zhangfisher/autostore/tree/master/packages/syncer`
- **官方文档**：`https://zhangfisher.github.io/autostore/`
- **类型声明**: `./syncer.d.ts`
