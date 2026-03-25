# FastEvent 管道详解

管道包装监听器函数，提供额外功能。

## 基本概念

监听管道（Pipe）是 `FastEvent` 提供的一种强大机制，用于控制和修改事件监听器函数的执行行为。通过 `pipe`，你可以为监听器函数的执行添加超时控制、节流、防抖、重试等功能，使事件处理更加灵活和可控。

### 使用方式

在注册事件监听器时，可以通过 `options.pipes` 参数来使用一个或多个 `pipe`：

```typescript
emitter.on('eventName', listener, {
    pipes: [pipe1(), pipe2(), ...]
});
```

多个 `pipe` 会按照数组顺序依次处理，形成处理链。等效于 `pipe3(pipe2(pipe1(listener)))`。

## 内置管道

### 队列管道 (queue)

```typescript
import { queue } from 'fastevent/pipes';

events.on('data/update', handler, {
    pipes: [queue({ size: 10 })]
});
```

将事件放入队列处理，支持：
- `size`: 队列大小，默认 10
- `priority`: 优先级队列
- `timeout`: 超时时间

适用于高频事件，避免处理不过来。

### 节流管道 (throttle)

```typescript
import { throttle } from 'fastevent/pipes';

events.on('scroll', handler, {
    pipes: [throttle(100)]  // 100ms 最多执行一次
});
```

在指定时间间隔内最多执行一次。

### 防抖管道 (debounce)

```typescript
import { debounce } from 'fastevent/pipes';

events.on('search', handler, {
    pipes: [debounce(300)]  // 停止触发 300ms 后执行
});
```

等待触发停止一段时间后才执行。

### 超时管道 (timeout)

```typescript
import { timeout } from 'fastevent/pipes';

events.on('data/fetch', asyncHandler, {
    pipes: [timeout(5000)]  // 5 秒超时
});
```

监听器执行超时后自动取消。

### 重试管道 (retry)

```typescript
import { retry } from 'fastevent/pipes';

events.on('api/request', asyncHandler, {
    pipes: [retry({
        times: 3,           // 最多重试 3 次
        delay: 1000,        // 延迟 1 秒
        backoff: 2          // 指数退避
    })]
});
```

监听器失败后自动重试。

### 缓存管道 (memorize)

```typescript
import { memorize } from 'fastevent/pipes';

events.on('expensive/compute', handler, {
    pipes: [memorize({
        ttl: 60000,         // 缓存 60 秒
        key: (msg) => msg.payload.id  // 自定义缓存键
    })]
});
```

缓存监听器执行结果，相同参数直接返回缓存。

## 组合管道

可以组合多个管道实现复杂功能：

```typescript
import { throttle, debounce, timeout, retry } from 'fastevent/pipes';

// 搜索输入：防抖 + 节流
events.on('search/input', handler, {
    pipes: [debounce(300), throttle(1000)]
});

// API 请求：防抖 + 超时 + 重试
events.on('api/search', handler, {
    pipes: [
        debounce(300),
        timeout(5000),
        retry({ times: 3, delay: 1000 })
    ]
});
```

管道按顺序执行，每个包装下一个。等效于：

```typescript
timeout(retry(debounce(handler)))
```

## 自定义管道

### 基本结构

```typescript
function myPipe(options: any) {
    return (listener: FastEventListener, message: FastEventMessage) => {
        // 包装前
        console.log('Before:', message);

        const wrapped = async (...args: any[]) => {
            // 执行前
            const result = await listener(...args);
            // 执行后
            return result;
        };

        // 包装后
        return wrapped;
    };
}

events.on('event', handler, {
    pipes: [myPipe({ option: 'value' })]
});
```

### 实用示例

#### 日志管道

```typescript
function logPipe(prefix: string) {
    return (listener) => {
        return async (message, ...args) => {
            console.log(`[${prefix}] Before:`, message.type);
            const result = await listener(message, ...args);
            console.log(`[${prefix}] After:`, result);
            return result;
        };
    };
}

events.on('api/request', handler, {
    pipes: [logPipe('API')]
});
```

#### 性能监控管道

```typescript
function timingPipe() {
    return (listener) => {
        return async (message, ...args) => {
            const start = Date.now();
            const result = await listener(message, ...args);
            const duration = Date.now() - start;
            console.log(`${message.type} took ${duration}ms`);
            return result;
        };
    };
}

events.on('data/process', handler, {
    pipes: [timingPipe()]
});
```

## 管道应用场景

| 场景 | 推荐管道 | 说明 |
|------|---------|------|
| 搜索输入 | `debounce` + `throttle` | 等待停止触发，同时限制频率 |
| API 请求 | `timeout` + `retry` | 超时保护，失败重试 |
| 高频事件 | `queue` | 排队处理，避免丢失 |
| 昂贵计算 | `memorize` | 缓存结果，避免重复计算 |
| 表单提交 | `debounce` + `timeout` | 等待完成，超时保护 |
| 滚动事件 | `throttle` | 限制执行频率 |
| WebSocket 消息 | `queue` + `timeout` | 排队处理，超时丢弃 |
