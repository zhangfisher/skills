# FastEvent 消息转换详解

FastEvent 支持通过 `transform` 参数对监听器接收到的事件消息进行转换，让监听器接收到自定义格式的消息。

## 默认消息格式

默认情况下，监听器接收到的消息格式为 `FastEventMessage`：

```typescript
{
    type: string;      // 事件类型
    payload: any;      // 事件有效负载
    meta?: any;        // 事件额外的元数据
}
```

### 默认消息示例

```typescript
import { FastEvent } from 'fastevent';

const emitter = new FastEvent();

emitter.on('click', (message) => {
    message.type;    // 'click'
    message.payload; // { x: 100, y: 200 }
    message.meta;    // { timestamp: 1234567890 }
});
```

## 基本转换

使用 `transform` 参数可以转换监听器接收到的消息格式：

```typescript
import { FastEvent } from 'fastevent';

const emitter = new FastEvent({
    transform: (message) => {
        // 对特定事件返回 payload 而非完整的 message
        if (['div/click', 'div/mousemove'].includes(message.type)) {
            return message.payload;
        }
        return message;
    },
});

// 监听器接收到的是 payload 而非完整的 message
emitter.on('div/click', (data) => {
    // data 是 { x: 100, y: 200 }，而非 { type, payload, meta }
});
```

## 类型推断

### 使用 NotPayload

为了让 TypeScript 正确推断转换后的类型，需要使用 `NotPayload` 标识：

```typescript
import { FastEvent, NotPayload } from 'fastevent';

type CustomEvents = {
    'click': NotPayload<{ x: number; y: number }>;
    'div/mousemove': boolean;
    'div/scroll': number;
    'div/focus': string;
};

const emitter = new FastEvent<CustomEvents>({
    transform: (message) => {
        if (['div/click', 'div/mousemove'].includes(message.type)) {
            return message.payload;
        }
        return message;
    },
});

// 类型正确推断为 { x: number; y: number }
emitter.on('click', (message) => {
    // typeof message === { x: number; y: number }
});
```

### 使用 TransformedEvents

`TransformedEvents` 是一个便捷的类型工具，自动将所有事件标记为转换后的类型：

```typescript
import { FastEvent, TransformedEvents } from 'fastevent';

type CustomEvents = TransformedEvents<{
    'click': { x: number; y: number };
    'div/mousemove': boolean;
    'div/scroll': number;
    'div/focus': string;
}>;

const emitter = new FastEvent<CustomEvents>({
    transform: (message) => {
        return message.payload;
    },
});

// 所有监听器都接收到 payload 类型
emitter.on('div/focus', (message) => {
    // typeof message === string
});

emitter.on('click', (message) => {
    // typeof message === { x: number; y: number }
});
```

## 作用域转换

### 基本用法

为每个作用域单独指定 `transform`：

```typescript
import { FastEvent, FastEventScope, TransformedEvents } from 'fastevent';

type CustomEvents = TransformedEvents<{
    'client/connect': number;
    'client/disconnect': number;
}>;

const emitter = new FastEvent();

const scope = emitter.scope('div', {
    transform: (message) => {
        return message.payload;
    },
});

scope.on('client/connect', (message) => {
    // typeof message === number
});

scope.emit('client/connect', 100);
```

### 使用自定义 Scope 类

```typescript
import { FastEvent, FastEventScope, TransformedEvents } from 'fastevent';

type CustomEvents = TransformedEvents<{
    'client/connect': number;
    'client/disconnect': number;
}>;

class MyScope extends FastEventScope<CustomEvents> {
    constructor() {
        super({
            transform: (message) => {
                return message.payload;
            },
        });
    }
}

const scope = emitter.scope('div', new MyScope());
```

## 通配符支持

消息转换时的类型推断支持通配符：

```typescript
import { FastEvent, TransformedEvents } from 'fastevent';

type CustomEvents = TransformedEvents<{
    'div/*/click': { id: string };
    'div/*/mousemove': { x: number; y: number };
}>;

const emitter = new FastEvent<CustomEvents>({
    transform: (message) => {
        return message.payload;
    },
});

const scope = emitter.scope('div');

scope.on('x/click', (message) => {
    // typeof message === { id: string }
});

scope.on('y/mousemove', (message) => {
    // typeof message === { x: number; y: number }
});
```

## 应用场景

### 1. DOM 事件简化

将 DOM 事件简化为只包含坐标的对象：

```typescript
import { FastEvent, TransformedEvents } from 'fastevent';

type MouseEvents = TransformedEvents<{
    'click': { x: number; y: number };
    'mousemove': { x: number; y: number };
}>;

const mouseEvents = new FastEvent<MouseEvents>({
    transform: (message) => {
        // 提取坐标信息
        const { clientX, clientY } = message.payload as MouseEvent;
        return { x: clientX, y: clientY };
    },
});

// 监听器直接接收简化后的坐标对象
mouseEvents.on('click', (coords) => {
    console.log(`点击位置: ${coords.x}, ${coords.y}`);
});
```

### 2. API 响应标准化

统一不同 API 的响应格式：

```typescript
import { FastEvent, TransformedEvents } from 'fastevent';

type ApiEvents = TransformedEvents<{
    'api/user/get': { id: number; name: string };
    'api/order/list': { orders: Array<{ id: number }> };
}>;

const apiEvents = new FastEvent<ApiEvents>({
    transform: (message) => {
        // 标准化 API 响应
        const response = message.payload as any;
        return response.data || response;
    },
});
```

### 3. 事件过滤和转换

在转换时过滤和修改消息：

```typescript
const events = new FastEvent({
    transform: (message) => {
        // 只处理特定类型的事件
        if (message.type.startsWith('user/')) {
            return {
                ...message.payload,
                timestamp: Date.now(),
                source: 'user-module',
            };
        }
        return message;
    },
});
```

## 类型工具说明

### NotPayload<T>

标记事件类型不是标准的 payload 类型，而是转换后的类型：

```typescript
type MyEvents = {
    'event': NotPayload<string>; // 监听器接收 string 而非 { type, payload, meta }
};
```

### TransformedEvents<T>

批量将事件类型标记为转换后的类型：

```typescript
type MyEvents = TransformedEvents<{
    'event1': string;      // 监听器接收 string
    'event2': number;      // 监听器接收 number
    'event3': { x: number }; // 监听器接收 { x: number }
}>;
```

## 注意事项

1. **类型声明**：`transform` 用于转换消息，`NotPayload` 和 `TransformedEvents` 用于类型声明
2. **作用域独立**：每个作用域可以有独立的 `transform` 函数
3. **通配符支持**：类型推断支持通配符模式
4. **性能考虑**：`transform` 函数会在每次事件触发时调用，避免过于复杂的转换逻辑

## 最佳实践

1. **保持简单**：转换函数应该简单直接，避免复杂逻辑
2. **类型优先**：始终使用 `NotPayload` 或 `TransformedEvents` 确保类型安全
3. **统一格式**：在应用中统一事件消息格式，减少转换开销
4. **文档说明**：为自定义转换添加清晰的文档说明
