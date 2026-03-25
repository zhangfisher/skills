# FastEvent 执行器详解

执行器控制事件监听器的执行方式和顺序。

## 基本概念

事件触发的本质是调用 `emit` 方法，该方法会调用所有注册的监听器函数。`FastEvent` 提供了灵活的执行器机制，允许开发者配置如何执行多个监听器、如何处理执行结果，以及如何优化性能。

## 内置执行器

### 并行执行 (parallel) - 默认

```typescript
import { parallel } from 'fastevent/executors';

const events = new FastEvent({ executor: parallel() });
// 或默认行为
const events = new FastEvent();
```

所有监听器并发执行，返回所有结果。

### 串行执行 (series)

```typescript
import { series } from 'fastevent/executors';

const events = new FastEvent({ executor: series() });
```

监听器按添加顺序依次执行，返回最后一个结果。某个监听器失败不会中断后续执行。

### 竞速执行 (race)

```typescript
import { race } from 'fastevent/executors';

const events = new FastEvent({ executor: race() });
```

所有监听器并发执行，返回最快完成的结果。适用于：
- 多个数据源竞速
- 缓存与网络请求竞速
- 多个策略竞速

```typescript
events.on('data/fetch', async () => {
    return await fetchFromCache();  // 快速返回
});

events.on('data/fetch', async () => {
    return await fetchFromNetwork();  // 较慢
});

// 返回最快完成的结果
const data = await events.emitAsync('data/fetch');
```

### 瀑布流执行 (waterfall)

```typescript
import { waterfall } from 'fastevent/executors';

const events = new FastEvent({ executor: waterfall() });
```

监听器依次执行，每个监听器接收前一个监听器的返回值作为参数。任何一个失败会中断后续执行。

```typescript
events.on('data/process', (data) => {
    return { ...data, step1: true };
});

events.on('data/process', (data) => {
    // data 包含 step1
    return { ...data, step2: true };
});
```

### 首个执行 (first)

```typescript
import { first } from 'fastevent/executors';

const events = new FastEvent({ executor: first() });
```

只执行第一个监听器。

### 末尾执行 (last)

```typescript
import { last } from 'fastevent/executors';

const events = new FastEvent({ executor: last() });
```

只执行最后一个监听器。

### 随机执行 (random)

```typescript
import { random } from 'fastevent/executors';

const events = new FastEvent({ executor: random() });
```

随机选择一个监听器执行。适用于：
- A/B 测试
- 负载均衡
- 随机策略选择

### 负载均衡 (balance)

```typescript
import { balance } from 'fastevent/executors';

const events = new FastEvent({ executor: balance() });
```

记录每个监听器的执行次数，优先选择执行次数较少的监听器。

## 使用执行器

### 触发事件时指定执行器

在调用 `emit` 函数触发事件时指定执行器，仅对当前事件有效：

```typescript
import { race } from 'fastevent/executors';

const emitter = new FastEvent();

emitter.emit('event', payload, {
    executor: race()
});
```

### 全局指定执行器

在创建事件发射器时指定执行器，对所有事件有效：

```typescript
import { race } from 'fastevent/executors';

const emitter = new FastEvent({
    executor: race()
});

emitter.emit('event', payload);
```

## 自定义执行器

### 基本结构

```typescript
const customExecutor = (listeners, message, args, execute) => {
    // listeners: 监听器数组，每个元素是 [listener, maxCount, executedCount] 的元组
    // message: 事件消息
    // args: 额外参数
    // execute: 执行单个监听器的函数

    // 自定义逻辑
    const selectedListeners = selectListeners(listeners);
    return selectedListeners.map(l => execute(l));
};

const emitter = new FastEvent({
    executor: customExecutor
});
```

### 执行次数管理

每个监听器在 `FastEvent` 中都以元组形式（类型为 `FastEventListenerMeta`）存储：

```typescript
type FastEventListenerMeta = [
    TypedFastEventListener<any, any>, // 监听器函数引用
    number,                            // 最大执行次数限制（0 表示无限制）
    number,                            // 已执行次数
    string,                            // 调试用标签字符串
    number                             // 额外的标识数值
];
```

默认情况下，监听器的执行次数是自动管理的。每次执行监听器后，`FastEvent` 会自动增加所有监听器的 `executedCount`。

但是在某些执行器中（如 `race` 和 `balance`），只会从监听器数组中选择一个执行，因此需要手动修正监听器的执行次数。

以 `random` 执行器为例：

```typescript
export const random = (listeners, message, args, execute) => {
    const index = Math.floor(Math.random() * listeners.length);
    // 所有监听器执行次数都会-1，以抵消后续的+1
    listeners.forEach((listener) => listener[2]--);
    // 只有被选中的监听器执行次数+1
    listeners[index][2]++;
    return [execute(listeners[index][0], message, args)];
};
```

### 为什么使用 execute 函数

创建自定义执行器时，必须使用 `execute` 函数来执行监听器函数：

```typescript
export const random = (listeners, message, args, execute) => {
    const index = Math.floor(Math.random() * listeners.length);

    // ❌ 直接执行监听器函数：无法保证监听器函数上下文 this 的准确性和错误处理
    return [listeners[index][0](message, args)];

    // ✅ 使用 execute 执行监听器函数
    return [execute(listeners[index][0], message, args)];
};
```

`execute` 函数的作用：
- 保证监听器函数的 `this` 指向正确
- 提供统一的错误处理机制
- 处理监听器选项（如 `count`、`filter` 等）
- 确保执行次数的正确管理

## 选择建议

| 场景 | 推荐执行器 |
|------|-----------|
| 默认行为 | `parallel` |
| 数据处理管道 | `waterfall` |
| 缓存竞速 | `race` |
| 顺序执行 | `series` |
| A/B 测试 | `random` |
| 负载均衡 | `balance` |
