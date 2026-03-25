# FastEvent 高级模式与最佳实践

本文档介绍 FastEvent 的高级特性和最佳实践模式。

## 事件转发

将特定事件转发到另一个 FastEvent 实例：

```typescript
import { expandable } from "fastevent";

const otherEmitter = new FastEvent();
const emitter = new FastEvent({
    onAddListener: (type, listener, options) => {
        // 订阅转发：@/ 开头的事件转发到 otherEmitter
        if (type.startsWith('@/')) {
            return otherEmitter.on(type.substring(2), listener, options);
        }
    },
    onBeforeExecuteListener: (message, args) => {
        // 发布转发
        if (message.type.startsWith('@/')) {
            message.type = message.type.substring(2);
            return expandable(otherEmitter.emit(message, args));
        }
    },
});
```

## 消息转换

通过 `transform` 参数转换监听器接收的消息格式：

```typescript
import { FastEvent, TransformedEvents } from 'fastevent';

type CustomEvents = TransformedEvents<{
    'click': { x: number; y: number };
}>;

const events = new FastEvent<CustomEvents>({
    transform: (message) => {
        // 返回 payload 而非完整的 message
        return message.payload;
    },
});

// 监听器直接接收 { x, y } 而非 { type, payload, meta }
events.on('click', (coords) => {
    console.log(`点击位置: ${coords.x}, ${coords.y}`);
});
```

**详细文档**：参见 `references/transform.md` - 消息转换详解

## 元数据（Meta）

### 多层级元数据合并

```typescript
const events = new FastEvent({
    meta: { version: '1.0', environment: 'production' },
});

const userScope = events.scope('user', {
    meta: { domain: 'user' },
});

userScope.emit(
    'login',
    { userId: '123' },
    {
        meta: { timestamp: Date.now() }
    }
);

// 监听器接收合并后的 meta：
// {
//   version: '1.0',
//   environment: 'production',
//   domain: 'user',
//   timestamp: ...,
//   type: 'user/login'
// }
```

### 定义元数据类型

```typescript
interface AppMeta {
    requestId?: string;
    sessionId: string;
    userAgent?: string;
}

const emitter = new FastEvent<EventTypes, AppMeta>();

emitter.on('user/login', (message, args) => {
    message.meta; // type AppMeta
});
```

## Hooks 生命周期钩子

### 同步钩子

```typescript
const events = new FastEvent({
    onAddBeforeListener: (type, listener, options) => {
        console.log('添加监听器:', type);
        // 返回 false 阻止添加
        // 返回 FastEventSubscriber 自定义订阅
    },
    onAddAfterListener: (type, node) => {
        // node: 注册信息
    },
    onRemoveListener: (node, parts, listener) => {
        console.log('移除监听器:', parts.join('/'));
    },
    onClearListeners: () => {
        console.log('清除所有监听器');
    },
    onListenerError: (error, listener, message, args) => {
        console.error('监听器错误:', error);
    },
    onBeforeExecuteListener: (message, args) => {
        // 返回 false 阻止执行
        // 也可以返回数组作为 emit 的返回值
        if (message.type.startsWith('restricted/')) {
            return false;
        }
    },
    onAfterExecuteListener: (message, returns, listeners) => {
        // 可拦截修改返回值
    },
});
```

### 异步钩子

通过 `FastEvent.hooks` 添加异步钩子，在下一个事件循环时执行：

```typescript
const emitter = new FastEvent();

// 注册异步钩子
emitter.hooks.AddBeforeListener.push((type, listener, options) => {
    console.log('[异步] 添加监听器:', type);
});

emitter.hooks.RemoveListener.push((node, parts, listener) => {
    console.log('[异步] 移除监听器:', parts.join('/'));
});
```

## 上下文控制

### 默认上下文

默认情况下，监听器的上下文为当前 `FastEvent` 实例：

```typescript
const emitter = new FastEvent();

emitter.on('hello', function (this, message) {
    this === emitter; // true
});
```

### 指定上下文

```typescript
const context = { x: 1, y: 2 };
const emitter = new FastEvent({ context });

emitter.on('hello', function (this, message) {
    this === context; // true
});
```

### 作用域上下文

```typescript
const scopeContext = { a: 1, b: 2 };
const scope = emitter.scope('user', {
    context: scopeContext
});

scope.on('hello', function (this, message) {
    this === scopeContext; // true
});
```

**注意**：上下文会覆盖上级作用域的上下文，而非合并。

## AbortSignal 中止执行

### 基本用法

```typescript
import { FastEvent } from 'fastevent';

const emitter = new FastEvent<{ click: number }>();

emitter.on('click', (message, { abortSignal }) => {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            doSomething();
            resolve();
        });

        abortSignal.addEventListener('abort', () => {
            clearTimeout(timer);
            resolve();
        });
    });
});

// 创建 AbortController
const abortController = new AbortController();

// 传入 signal
emitter.emit('click', 1, {
    signal: abortController.signal
});

// 中止执行
abortController.abort();
```

### 处理中止信号

```typescript
emitter.on('click', (message, { abortSignal }) => {
    return new Promise((resolve, reject) => {
        abortSignal.addEventListener('abort', () => {
            reject(new AbortError());
        });
        doSomething();
        resolve();
    });
});
```

## 异步事件迭代器

### 基本用法

```typescript
const emitter = new FastEvent();

// 发送事件
emitter.emit('user/login', { userId: 123 });

// 订阅事件
for await (const message of emitter.on('user/login')) {
    console.log('用户登录:', message.payload);
}
```

### 配置缓冲区

```typescript
const messages = emitter.on('count', {
    iterator: {
        size: 20,                    // 缓冲区大小
        maxExpandSize: 100,          // 最大扩展大小
        overflow: 'slide',           // 溢出策略
        lifetime: 60000,             // 消息存活时间（毫秒）
    }
});
```

### 使用 AbortSignal 取消

```typescript
const abortController = new AbortController();

const messages = emitter.on('count', {
    iterator: {
        signal: abortController.signal
    }
});

for await (const message of messages) {
    console.log(message);
}

setTimeout(() => {
    abortController.abort(); // 取消订阅
}, 5000);
```

## 继承 FastEvent

### 基本继承

```typescript
import { FastEvent, FastEventOptions } from 'fastevent';

interface MyEventOptions extends FastEventOptions {
    count?: number;
}

class MyEvent extends FastEvent {
    constructor(options?: Partial<MyEventOptions>) {
        super(Object.assign({}, options));
    }

    get options() {
        return super.options as MyEventOptions;
    }
}

const emitter = new MyEvent();
emitter.options.count = 100;
```

### 带泛型的继承

```typescript
class MyEvent<
    E extends Record<string, any> = Record<string, any>,
    M extends Record<string, any> = Record<string, any>,
    C = never
> extends FastEvent<E, M, C> {
    constructor(options?: Partial<MyEventOptions<M, C>>) {
        super(Object.assign({}, options));
    }
}

const emitter = new MyEvent({
    context: { a: 1 }
});

emitter.on('test', function (this, message) {
    type This = typeof this; // { a: 1 }
});
```

### 继承 FastEventScope

```typescript
import { FastEventScope, FastEventScopeOptions } from 'fastevent';

interface MyScopeOptions<M, C> extends FastEventScopeOptions<M, C> {
    count?: number;
}

class MyScope<
    E extends Record<string, any> = Record<string, any>,
    M extends Record<string, any> = Record<string, any>,
    C = never
> extends FastEventScope<E, M, C> {
    constructor(options?: Partial<MyScopeOptions<M, C>>) {
        super(Object.assign({}, options));
    }

    test(value: number) {
        return 100;
    }
}

const myScope = emitter.scope('modules/my', new MyScope());
```

## 监听器选项

```typescript
events.on('event', handler, {
    count: 3,              // 最多触发 3 次
    prepend: true,         // 添加到队列开头
    filter: (msg) => msg.payload.important,  // 过滤条件
    pipes: [throttle(1000)],  // 应用管道
    iterator: { size: 20 },    // 迭代器选项
});
```

## 错误处理

`emitAsync` 使用 `Promise.allSettled`，不会因单个监听器失败而中断：

```typescript
const results = await events.emitAsync('event', data);

results.forEach((result) => {
    if (result.status === 'rejected') {
        console.error('监听器失败:', result.reason);
    }
});
```

使用 `onListenerError` 钩子统一处理错误：

```typescript
const events = new FastEvent({
    onListenerError: (error, listener, message, args) => {
        console.error(`处理事件 ${message.type} 时出错:`, error);
        // 返回 false 表示错误已处理，不再抛出
        return false;
    }
});
```

## EventBus 模式

使用 EventBus 实现跨组件通信：

```typescript
import { EventBus } from 'fastevent/eventbus';

// 创建全局事件总线
export const eventBus = new EventBus();

// 组件 A 中发送
eventBus.emit('user/updated', user);

// 组件 B 中接收
eventBus.on('user/updated', handler);
```

## 最佳实践

1. **使用层级事件**：合理设计事件层级，利用通配符简化监听
2. **选择合适的执行器**：根据场景选择 `parallel`、`series`、`race`、`waterfall` 等
3. **组合管道**：可组合多个管道实现复杂功能（如 `debounce` + `throttle` + `timeout`）
4. **利用钩子系统**：在关键节点注入自定义逻辑
5. **类型安全**：始终定义事件接口，获得完整的类型推导
6. **错误处理**：使用 `onListenerError` 统一处理错误
7. **性能优化**：对高频事件使用 `queue` 或 `throttle` 管道
8. **避免内存泄漏**：及时取消订阅，使用 `AbortSignal` 控制迭代器
