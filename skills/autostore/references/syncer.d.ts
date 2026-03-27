import { StateOperate, AutoStore, Dict, StateOperateType, GetTypeByPath, AutoStoreOptions } from 'autostore';
import * as mitt from 'mitt';

/**
 * 小型事件发射器
 * 基于 mitt 实现，提供类型安全的事件系统
 *
 * @example
 * ```ts
 * type Events = {
 *   'user:login': { id: string; name: string }
 *   'user:logout': void
 * }
 *
 * const emitter = new SmallEventEmitter<Events>()
 *
 * // 监听事件并获取取消订阅函数
 * const subscription = emitter.on('user:login', (data) => {
 *   console.log(data.id, data.name)
 * })
 *
 * // 只监听一次事件
 * emitter.once('user:logout', () => {
 *   console.log('只执行一次')
 * })
 *
 * // 触发事件
 * emitter.emit('user:login', { id: '1', name: 'zhang' })
 *
 * // 取消订阅
 * subscription.off()
 * ```
 */
type EventSubscriber = {
    off: () => void;
};
type EventListener<Payload> = (payload: Payload) => void;
type EventAnyListener<Events> = (type: keyof Events, payload: any) => void;
declare class EventEmitter<Events extends Record<string, any> = Record<string, any>> {
    #private;
    constructor();
    /**
     * 监听事件
     * @param type - 事件名称
     * @param listener - 事件处理函数
     * @returns 取消订阅的函数
     */
    on<K extends keyof Events>(type: K, listener: EventListener<Events[K]>): EventSubscriber;
    /**
     * 监听事件（只执行一次）
     * @param type - 事件名称
     * @param listener - 事件处理函数
     * @returns 取消订阅的函数
     */
    once<K extends keyof Events>(type: K, listener: EventListener<Events[K]>): EventSubscriber;
    /**
     * 移除事件监听
     * @param type - 事件名称
     * @param listener - 事件处理函数
     */
    off<K extends keyof Events>(type: K, listener: EventListener<Events[K]>): void;
    /**
     * 触发事件或清除保留消息
     * @param type - 事件名称
     * @param payload - 事件数据（不传时清除该事件的保留消息）
     * @param retain - 是否保留消息，true 时会将消息保存，后续 on/once 可立即收到
     */
    emit<K extends keyof Events>(type: K, payload: Events[K], retain?: boolean): void;
    emit<K extends keyof Events>(type: K): void;
    /**
     * 异步等待事件触发
     * @param type - 事件名称
     * @param timeout - 超时时间（毫秒），大于 0 时启用超时控制
     * @returns Promise，解析为事件数据
     * @throws 超时时抛出错误
     *
     * @example
     * ```ts
     * // 等待事件（无超时）
     * const data = await emitter.wait('user:login')
     *
     * // 等待事件（带超时）
     * try {
     *   const data = await emitter.wait('user:login', 5000)
     * } catch (error) {
     *   console.error('等待超时')
     * }
     * ```
     */
    wait<K extends keyof Events>(type: K, timeout?: number): Promise<Events[K]>;
    /**
     * 监听所有事件
     * @param listener - 事件处理函数
     * @returns 取消订阅的函数
     */
    onAny(listener: EventAnyListener<Events>): EventSubscriber;
    /**
     * 移除所有事件监听
     */
    clear(): void;
    /**
     * 清理指定类型的保留消息
     * @param type - 事件名称
     */
    clearRetained<K extends keyof Events>(type: K): void;
    /**
     * 获取指定类型的保留消息
     * @param type - 事件名称
     * @returns 保留的消息，如果不存在则返回 undefined
     */
    getRetained<K extends keyof Events>(type: K): Events[K] | undefined;
    /**
     * 获取所有事件监听器（用于调试）
     */
    get listeners(): mitt.EventHandlerMap<Events>;
}

/**
 * AutoStoreSyncerBase - 所有 Syncer 的基类
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 职责
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 1. 提供统一的事件系统（基于 EventEmitter）
 * 2. 管理序列号生成（static seq）
 * 3. 管理同步状态（syncing）
 * 4. 定义生命周期接口（start/stop）
 * 5. 提供标准错误处理
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 使用示例
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ```typescript
 * class MySyncer extends AutoStoreSyncerBase {
 *     private _watcher?: Watcher;
 *
 *     constructor() {
 *         super();
 *     }
 *
 *     start() {
 *         if (this.syncing) return;
 *
 *         try {
 *             this.syncing = true;
 *             // 启动逻辑
 *             this._watcher = this.store.watch(...);
 *         } catch (error) {
 *             this.syncing = false;
 *             this._emitError(error as Error);
 *             throw error;
 *         } finally {
 *             if (this.syncing) {
 *                 this.emit("start", undefined, true);
 *             }
 *         }
 *     }
 *
 *     stop() {
 *         if (!this.syncing) return;
 *
 *         try {
 *             if (this._watcher) {
 *                 this._watcher.off();
 *                 this._watcher = undefined;
 *             }
 *         } finally {
 *             this.emit("stop", undefined, true);
 *             this.syncing = false;
 *         }
 *     }
 * }
 * ```
 */

/**
 * AutoStoreSyncerBase - 所有 Syncer 的基类
 *
 * 【核心特性】
 * - 事件系统：继承 EventEmitter<AutoStoreSyncerEvents>
 * - 序列号：static seq = 99，用于生成唯一实例标识
 * - 同步状态：syncing 标记同步器是否正在运行
 * - 生命周期：定义 start() 和 stop() 方法接口
 * - 错误处理：提供统一的错误触发机制
 */
declare abstract class AutoStoreSyncerBase extends EventEmitter<AutoStoreSyncerEvents> {
    /**
     * 序列号计数器
     * 用于为每个 syncer 实例生成唯一标识
     */
    static seq: number;
    protected _syncing: boolean;
    /**
     * 同步状态
     * - true: 正在同步
     * - false: 已停止
     */
    get syncing(): boolean;
    /**
     * 启动同步器
     *
     * 【实现要求】
     * 1. 检查 this.syncing，如果已启动则直接返回
     * 2. 设置 this.syncing = true
     * 3. 使用 try-catch-finally 处理错误
     * 4. 在 finally 中：
     *    - 如果无错误：this.emit("start", undefined, true)
     *    - 如果有错误：this.syncing = false，this._emitError(error)
     *
     * 【错误处理示例】
     * ```typescript
     * start() {
     *     if (this.syncing) return;
     *     let hasError: any;
     *     try {
     *         this.syncing = true;
     *         // 启动逻辑
     *     } catch (e) {
     *         hasError = e;
     *         this._emitError(e as Error);
     *         throw e;
     *     } finally {
     *         if (!hasError) {
     *             this.emit("start", undefined, true);
     *         }
     *     }
     * }
     * ```
     */
    abstract start(): void;
    /**
     * 停止同步器
     *
     * 【实现要求】
     * 1. 检查 !this.syncing，如果已停止则直接返回
     * 2. 使用 try-finally 确保状态更新
     * 3. 在 finally 中：
     *    - this.emit("stop", undefined, true)
     *    - this.syncing = false
     *
     * 【实现示例】
     * ```typescript
     * stop() {
     *     if (!this.syncing) return;
     *     try {
     *         // 清理逻辑
     *     } finally {
     *         this.emit("stop", undefined, true);
     *         this.syncing = false;
     *     }
     * }
     * ```
     */
    abstract stop(): void;
    /**
     * 触发错误事件
     *
     * @param error 错误对象
     */
    protected _emitError(error: Error): void;
    /**
     * 向远程端推送本地状态
     *
     * 【默认行为】
     * 默认抛出错误，表示该 syncer 不支持 push 操作。
     * 子类可以重写此方法以实现具体的推送逻辑。
     *
     * 【子类实现示例】
     * ```typescript
     * push(options?: { initial?: boolean }): void {
     *     if (!this.syncing) {
     *         throw new Error('Syncer is not started');
     *     }
     *
     *     const { initial = false } = options || {};
     *
     *     // 发送 $push 消息到远程
     *     this.transport.send({
     *         id: this.id,
     *         type: '$push',
     *         path: this.options.remote,
     *         value: this._getLocalSnap(),
     *         flags: initial ? SYNC_INIT_FLAG : 0
     *     });
     * }
     * ```
     *
     * @param options 推送选项
     * @param options.initial 是否是首次推送（flags 将设置为 SYNC_INIT_FLAG）
     */
    push(_options?: {
        initial?: boolean;
    }): void;
    /**
     * 从远程端拉取状态
     *
     * 【默认行为】
     * 默认抛出错误，表示该 syncer 不支持 pull 操作。
     * 子类可以重写此方法以实现具体的拉取逻辑。
     *
     * 【子类实现示例】
     * ```typescript
     * pull(): void {
     *     if (!this.syncing) {
     *         throw new Error('Syncer is not started');
     *     }
     *
     *     // 发送 $pull 消息到远程
     *     this.transport.send({
     *         id: this.id,
     *         type: '$pull',
     *         path: this.options.remote,
     *         value: undefined,
     *         flags: 0
     *     });
     * }
     * ```
     */
    pull(): void;
    /**
     * 获取字符串表示
     *
     * 子类应该重写此方法以提供更有意义的描述
     *
     * @returns 字符串表示
     */
    abstract toString(): string;
}
type AutoStoreSyncerEvents = {
    /**
     * 当同步器启动时
     */
    start: void;
    /**
     * 当同步器停止时
     */
    stop: void;
    /** 发生错误时触发 */
    error: Error;
    /**
     * 当从远程接收到操作时触发，用于调试
     * 仅debug=true时生效
     */
    remoteOperate: StateRemoteOperate;
    /**
     * 当从本地store接收到操作时触发，用于调试
     * 仅debug=true时生效
     */
    localOperate: StateOperate;
    /**
     * 当接收到对方的
     *  - $update
     *  - $push
     * 时触发此操作，代表两方已完成首次同步
     */
    syncing: string;
};

declare const SYNC_INIT_FLAG = -1;

declare class AutoStoreSyncer extends AutoStoreSyncerBase {
    store: AutoStore<any>;
    private seq;
    private _options;
    peer?: AutoStoreSyncer;
    private _operateCache;
    private _subscribers;
    constructor(store: AutoStore<any>, options?: AutoStoreSyncerOptions);
    get id(): string;
    get options(): Required<Omit<AutoStoreSyncerOptions, "local" | "remote"> & {
        local: string[];
        remote: string[];
    }>;
    get transport(): AutoStoreSyncTransportBase<Record<string, any>>;
    get localEntry(): string[];
    get remoteEntry(): string[];
    /**
     * 连接成功后
     */
    private _onConnect;
    private createRemoteOperate;
    /**
     * 判断是否应该处理来自指定 peer 的 operate
     * @param operate 远程操作
     * @returns true 表示应该处理，false 表示应该忽略
     */
    private isPeer;
    start(): void;
    /**
     * 停止同步
     * @returns
     */
    stop(): void;
    private _onWatchStore;
    private _isPass;
    private _sendToRemote;
    private _onReceiveFromRemote;
    private _applyOperate;
    /**
     *
     * 将本地操作缓存发送到远程
     *
     * 当Transport没有准备好时，如果有本地操作，则会缓存到本地操作缓存中，直到Transport准备好
     * 然后应该调用此方法，将本地操作缓存发送到远程
     *
     */
    flush(): void;
    private _assertConnected;
    private _sendOperate;
    private _getLocalSnap;
    /**
     * 将本地store推送到远程
     *
     * @param initial 是否是第一次同步
     *
     */
    push(): void;
    private _pushStore;
    /**
     * 向远程发送整个store
     */
    private _sendStore;
    /**
     * 响应$push时调用此方法
     * @param operate
     */
    private _updateStore;
    private _pullStore;
    /**
     * 从远程store拉取数据
     */
    pull(): void;
    private _mapPath;
    toString(): string;
}

/**
 * 心跳检测事件类型
 */
type HeartbeatEvents = {
    /** 心跳超时，连接已断开 */
    timeout: void;
};
/**
 * 心跳检测配置选项
 */
interface HeartbeatOptions {
    /**
     * 心跳间隔（毫秒）
     */
    interval: number;
    /**
     * 最大 pong 丢失次数，超过此值则认为连接已断开
     * @default 3
     */
    maxMissCount?: number;
}
/**
 * 心跳检测器
 *
 * 用于检测连接是否存活，通过定期发送 ping 消息并等待 pong 响应来实现。
 * 如果连续多次未收到 pong 响应，则认为连接已断开。
 *
 * 自动监听 transport 的生命周期：
 * - 连接建立时自动启动心跳
 * - 连接断开或出错时自动停止心跳
 *
 * 继承 EventEmitter，在检测到心跳超时时触发 'timeout' 事件
 */
declare class Heartbeat extends EventEmitter<HeartbeatEvents> {
    private transport;
    private options;
    private _timer?;
    private _pingCounter;
    private _pongMissCount;
    private _maxMissCount;
    private _pendingPingValue?;
    private _subscribers;
    private _destroyed;
    constructor(transport: AutoStoreSyncTransportBase, options: HeartbeatOptions);
    /**
     * 设置事件监听器
     */
    private _setupEventListeners;
    onOperate(operate: StateRemoteOperate): boolean;
    /**
     * 启动心跳检测（内部方法）
     */
    private _start;
    /**
     * 停止心跳检测（内部方法）
     */
    private _stop;
    /**
     * 销毁心跳检测器，移除所有事件监听
     */
    destroy(): void;
    /**
     * 处理收到的 pong 响应
     * @param value pong 值（应该与之前发送的 ping 值匹配）
     */
    onPong(operate: StateRemoteOperate): void;
    onPing(operate: StateRemoteOperate): void;
    /**
     * 发送心跳 ping
     */
    private _sendPing;
}

/**
 * 传输层事件类型
 */
type TransportEvents = {
    /** 连接建立时触发 */
    connect: void;
    /** 连接断开时触发 */
    disconnect: void;
    /** 接收到远程操作时触发 */
    operate: StateRemoteOperate;
    /** 发生错误时触发 */
    error: Error;
    /** 心跳检测超时，连接可能已断开 */
    timeout: void;
};
type AutoStoreSyncTransportReceiver = (operate: StateRemoteOperate) => void;
type AutoStoreSyncTransportOptions = {
    debug?: boolean;
    autoConnect?: boolean;
    heartbeat?: number;
};
/**
 * AutoStore 同步传输基类
 * 支持注册多个 receiver 来接收远程操作
 * 继承 EventEmitter 提供完整的事件系统
 */
declare class AutoStoreSyncTransportBase<Options extends Record<string, any> = Record<string, any>> extends EventEmitter<TransportEvents> {
    protected receivers: Map<string, AutoStoreSyncTransportReceiver>;
    protected stopCallbacks: Map<string, () => void>;
    connected: boolean;
    options: AutoStoreSyncTransportOptions & Options;
    static seq: number;
    readonly id: number;
    heartbeat?: Heartbeat;
    constructor(options?: AutoStoreSyncTransportOptions & Options);
    /**
     * 添加 receiver
     * @param id 接收器唯一标识
     * @param callback 接收远程操作的回调函数
     */
    addReceiver(id: string | number, callback: AutoStoreSyncTransportReceiver): EventSubscriber;
    /**
     * 移除 receiver
     * @param id 接收器的唯一标识
     */
    removeReceiver(id: string | number): void;
    /**
     * 供子类继承
     */
    protected _send(_operate: StateRemoteOperate): void;
    /**
     * 建立连接
     * 触发 connect 事件（使用 retain 保留消息，确保晚注册的监听器也能收到）
     */
    connect(): Promise<void> | undefined;
    /**
     * 本方法供子类重载用于创建连接
     */
    protected onConnect(): boolean | Promise<boolean>;
    /**
     * 本方法供子类重载用于销毁连接
     */
    protected onDisconnect(): void;
    /**
     * 启动心跳检测器
     * 当 heartbeat > 0 时创建 Heartbeat 实例并监听超时事件
     *
     */
    startHeartbeat(): void;
    /**
     * 停止心跳检测器
     * 销毁 Heartbeat 实例并清理资源
     */
    stopHeartbeat(): void;
    private _handlePing;
    /**
     * 本方法用于监听消息事件
     */
    protected onSendOperate(_operate: StateRemoteOperate): void;
    /**
     * 本方法用于监听消息事件
     */
    protected onReceiveOperate(operate: StateRemoteOperate): boolean;
    send(operate: StateRemoteOperate): void;
    /**
     * 断开连接
     * 触发 disconnect 事件（使用 retain 保留消息，并清除 connect 的保留消息）
     */
    disconnect(): void;
}

type AutoStoreSyncerOptions = {
    /**
     * 决定了当初始化时执行何种操作
     *
     * - psuh: 双向均向对方执行push操作,这样如果两个store初始状态均不一样会导致状态合并
     * - none: 不执行任意操作
     */
    mode?: "push" | "pull" | "none" | "both";
    id?: string;
    local?: string[] | string;
    remote?: string[] | string;
    transport?: AutoStoreSyncTransportBase;
    autostart?: boolean;
    onSend?: (operate: StateRemoteOperate) => boolean | undefined;
    onReceive?: (operate: StateRemoteOperate) => boolean | undefined;
    immediate?: boolean;
    maxCacheSize?: number;
    direction?: "both" | "forward" | "backward";
    filter?: (path: string[], value: any) => boolean;
    /**
     * 将远程操作映射到本地
     * 比如将['order','price']映射成['order.price']等
     * pathMap.toLocal在接收到更新时调用
     * pathMap.toRemote在发送到远程时调用
     *
     * 注意：
     *  如果是双向同步，则需要同时指定from,to才可以正常工作
     */
    pathMap?: {
        toLocal?: (path: string[], value: any) => string[] | undefined;
        toRemote?: (path: string[], value: any) => string[] | undefined;
    };
    /**
     * 要与之同步的远程 store 的 id 列表
     * 当从 transport 接收到 operate 时，会检查 operate.id 是否在 peers 中
     * '*' 表示接受所有来源的 operate
     * @default ['*']
     */
    peers?: string[];
    debug?: boolean;
};
type StateRemoteOperate<Value = any> = {
    id: string;
    type: StateOperateType | "$stop" | "$push" | "$pull" | "$update" | "$error" | "$ping" | "$pong";
    path: string[];
    value: Value;
    indexs?: number[];
    parentPath?: string[];
    reply?: boolean;
    flags: number;
};
type AutoStoreCloneOptions<State extends Dict, Entry extends string> = AutoStoreOptions<State> & {
    entry?: Entry;
    sync?: "none" | AutoStoreSyncerOptions["direction"];
};
/**
 * AutoStoreBroadcaster 配置选项
 */
type AutoStoreBroadcasterOptions = {
    /**
     * 是否自动广播
     * 当主 store 发生变化时，是否自动广播到所有连接的客户端
     * @default true
     */
    autostart?: boolean;
    heartbeat?: number;
};
declare module "autostore" {
    interface AutoStore<State extends Dict> {
        sync(toStore: AutoStore<any>, options?: AutoStoreSyncerOptions): AutoStoreSyncer;
        clone<Entry extends string, CloneState extends Record<string, any> = GetTypeByPath<State, Entry>>(options?: AutoStoreCloneOptions<State, Entry>): AutoStore<CloneState>;
    }
}

declare class AutoStoreSyncError extends Error {
    operate?: StateOperate | StateRemoteOperate;
}

/**
 *
 * 为store提供一个AutoStore的sync同步方法
 *
 *
 *
 *
 * @returns
 */
declare function installSyncerPlugin(): void;

/**
 * Worker 接口定义
 * 兼容浏览器和 Node.js 的 Worker API
 */
interface IWorker {
    /**
     * 发送消息到 Worker
     */
    postMessage(message: any, transfer?: any[]): void;
    /**
     * 添加消息事件监听器
     */
    addEventListener(type: string, listener: (event: MessageEvent) => void, options?: AddEventListenerOptions | boolean): void;
    /**
     * 移除消息事件监听器
     */
    removeEventListener(type: string, listener: (event: MessageEvent) => void, options?: EventListenerOptions | boolean): void;
    /**
     * 终止 Worker（可选）
     */
    terminate?: () => void;
    /**
     * SharedWorker 的 port 属性（可选）
     */
    port?: {
        start?: () => void;
        postMessage(message: any, transfer?: any[]): void;
        addEventListener(type: string, listener: (event: MessageEvent) => void, options?: AddEventListenerOptions | boolean): void;
        removeEventListener(type: string, listener: (event: MessageEvent) => void, options?: EventListenerOptions | boolean): void;
    };
}
/**
 * WorkerTransport 配置选项
 */
type WorkerTransportOptions = {
    /**
     * 传输器唯一标识
     */
    id?: string;
    /**
     * Worker 实例（可选）
     * 如果提供，transport 会使用该 worker 发送消息
     * 调用 connect() 后会自动监听 worker 的 message 事件
     */
    worker?: IWorker;
    /**
     * 是否自动建立连接，默认为 false 以保持向后兼容
     */
    autoConnect?: boolean;
    /**
     * 启用调试模式
     */
    debug?: boolean;
};
/**
 * 基于 Web Worker 的同步传输器
 *
 * 特性：
 * - 兼容浏览器和 Node.js 的 Worker API
 * - 通过 postMessage 进行跨线程通信
 * - 自动处理消息序列化和反序列化
 * - 支持结构化克隆算法
 * - 继承 AutoStoreSyncTransportBase，支持完整的连接生命周期管理
 * - 支持 connect/disconnect 生命周期管理
 * - 支持自动监听和手动监听两种模式
 *
 * @example 主线程代码（自动监听模式 - 推荐）
 * ```typescript
 * import { WorkerTransport } from '@autostorejs/syncer';
 * import { AutoStoreSyncer } from '@autostorejs/syncer';
 * import { AutoStore } from 'autostore';
 *
 * // 创建 Worker
 * const worker = new Worker('./worker.js');
 *
 * // 创建 transport
 * const transport = new WorkerTransport({
 *     worker: worker,
 *     id: 'main-thread'
 * });
 *
 * // 连接 transport，会自动监听 worker 的 message 事件
 * await transport.connect();
 *
 * // 创建 store 并同步
 * const store = new AutoStore({
 *     count: 0,
 *     user: { name: 'Alice' }
 * });
 *
 * const syncer = new AutoStoreSyncer(store, { transport });
 *
 * // 断开连接时
 * syncer.stop();
 * transport.disconnect();
 * ```
 *
 * @example 主线程代码（手动监听模式）
 * ```typescript
 * import { WorkerTransport } from '@autostorejs/syncer';
 * import { AutoStoreSyncer } from '@autostorejs/syncer';
 * import { AutoStore } from 'autostore';
 *
 * const worker = new Worker('./worker.js');
 *
 * const transport = new WorkerTransport({
 *     worker: worker,
 *     id: 'main-thread'
 * });
 *
 * // 手动监听消息，可以和其他消息类型共存
 * worker.addEventListener('message', (event: MessageEvent) => {
 *     if (transport.handleRemoteOperate(event)) {
 *         return; // 是状态操作消息，已被处理
 *     }
 *     // 处理其他类型的消息
 *     console.log('收到其他消息:', event.data);
 * });
 *
 * const store = new AutoStore({
 *     count: 0,
 *     user: { name: 'Alice' }
 * });
 *
 * new AutoStoreSyncer(store, { transport });
 * ```
 *
 * @example Worker 线程代码 (worker.js)
 * ```typescript
 * import { AutoStore } from 'autostore';
 * import { AutoStoreSyncer } from '@autostorejs/syncer';
 * import { WorkerTransport } from '@autostorejs/syncer';
 *
 * // 创建 transport（self 就是 Worker 全局对象）
 * const transport = new WorkerTransport({
 *     worker: self as any,
 *     id: 'worker-thread'
 * });
 *
 * // 连接并自动监听
 * await transport.connect();
 *
 * // 创建 store 并同步
 * const store = new AutoStore({
 *     count: 0,
 *     user: { name: 'Alice' }
 * });
 *
 * new AutoStoreSyncer(store, { transport });
 * ```
 */
declare class WorkerTransport extends AutoStoreSyncTransportBase<WorkerTransportOptions> {
    private messageHandler?;
    /**
     * 创建连接
     * 绑定 Worker 的 message 事件监听器
     */
    protected onConnect(): boolean;
    /**
     * 销毁连接
     * 移除 Worker 的 message 事件监听器
     */
    protected onDisconnect(): void;
    /**
     * 发送操作到 Worker
     * 直接从 options.worker 读取，避免字段初始化顺序问题
     */
    protected onSendOperate(operate: StateRemoteOperate): void;
    /**
     * 处理远程操作事件
     * 判断消息是否是 StateRemoteOperate，如果是则处理并返回 true
     * 如果不是则返回 false，让外部代码处理其他类型的消息
     *
     * 注意：如果已经通过 connect() 建立了连接，则会自动处理消息
     * 如果未建立连接，则需要手动调用此方法
     *
     * @param event MessageEvent 事件对象
     * @returns 如果是 StateRemoteOperate 返回 true，否则返回 false
     *
     * @example
     * ```typescript
     * // 方式1：使用 connect 自动监听（推荐）
     * transport.connect();
     *
     * // 方式2：手动监听并处理
     * worker.addEventListener('message', (event: MessageEvent) => {
     *     if (transport.handleRemoteOperate(event)) {
     *         return; // 是状态操作消息，已被处理
     *     }
     *     // 处理其他类型的消息
     *     console.log('收到其他消息:', event.data);
     * });
     * ```
     */
    receiveRemoteOperate(event: MessageEvent): boolean;
}

/**
 * SharedWorker 接口定义
 */
interface ISharedWorker {
    port: IWorker & {
        start?: () => void;
    };
}
/**
 * AutoStoreWorkerSyncer 配置选项
 *
 * 继承 AutoStoreSyncerOptions，但不需要指定 transport
 * 因为 transport 会自动从 worker 创建
 */
type AutoStoreWorkerSyncerOptions = Omit<AutoStoreSyncerOptions, "transport">;
/**
 * 基于 Worker 的 AutoStore 同步器
 *
 * 简化了 WorkerTransport + AutoStoreSyncer 的使用
 * 自动处理 transport 创建和 worker.port.start()
 *
 * 【重要：关于 peers 和 id 的处理】
 * 当指定 peers 选项时，如果没有明确指定 id，
 * 会自动使用 peers[0] 作为 syncer 的 id。
 * 这样发送消息时，operate.id 就是目标 store 的 id，而不是本地 store 的 id。
 *
 * 这对于使用 AutoStoreSwitchSyncer 的场景特别重要，
 * 因为 SwitchSyncer 需要根据 operate.id 路由消息到正确的 store。
 *
 * @example 使用 SharedWorker
 * ```typescript
 * const worker = new SharedWorker(new URL('./worker.ts', import.meta.url), {
 *     type: 'module',
 *     name: 'my-worker',
 * });
 *
 * const syncer = new AutoStoreWorkerSyncer(store, worker, {
 *     mode: 'pull',
 *     immediate: true,
 *     direction: 'both',
 *     peers: ['remote-store-id'], // 会自动使用 'remote-store-id' 作为 id
 *     remote: 'shared',
 * });
 * ```
 *
 * @example 使用普通 Worker
 * ```typescript
 * const worker = new Worker(new URL('./worker.ts', import.meta.url), {
 *     type: 'module',
 * });
 *
 * const syncer = new AutoStoreWorkerSyncer(store, worker, {
 *     mode: 'pull',
 *     immediate: true,
 * });
 * ```
 */
declare class AutoStoreWorkerSyncer extends AutoStoreSyncer {
    /**
     * Worker 实例
     * 对于 SharedWorker，这是 SharedWorker 实例
     * 对于普通 Worker，这是 Worker 实例
     */
    readonly worker: IWorker | ISharedWorker;
    /**
     * 创建 Worker 同步器
     *
     * @param store AutoStore 实例
     * @param worker Worker 或 SharedWorker 实例
     * @param options 同步配置选项
     */
    constructor(store: AutoStore<any>, worker: IWorker | ISharedWorker, options?: AutoStoreWorkerSyncerOptions);
    /**
     * 获取实际的 worker（用于通信的 worker）
     * 对于 SharedWorker 返回 port，对于普通 Worker 返回自身
     */
    get actualWorker(): IWorker;
    /**
     * 重写 pull 方法
     * 当使用 peers 时，发送的 $pull 消息的 id 应该是目标 store 的 id（peers[0]）
     * 而不是本地 store 的 id，这样 SwitchSyncer 才能正确路由消息
     */
    pull(): void;
}

/**
 * BroadcastChannelTransport 配置选项
 */
type BroadcastChannelTransportOptions = {
    /**
     * 频道名称
     */
    channelName: string;
    /**
     * 是否自动建立连接，默认为 false 以保持向后兼容
     */
    autoConnect?: boolean;
};
/**
 * 基于 BroadcastChannel API 的同步传输器
 *
 * 特性：
 * - 使用浏览器的 BroadcastChannel API 进行跨页面/标签页通信
 * - 同源的不同浏览上下文之间（如多个标签页、iframe、窗口）可以实现通信
 * - 自动处理消息序列化和反序列化
 * - 继承 AutoStoreSyncTransportBase，支持完整的连接生命周期管理
 * - 支持 connect/disconnect 生命周期管理
 *
 * @example 基本使用
 * ```typescript
 * import { BroadcastChannelTransport } from '@autostorejs/syncer';
 * import { AutoStoreSyncer } from '@autostorejs/syncer';
 * import { AutoStore } from 'autostore';
 *
 * // 创建 transport
 * const transport = new BroadcastChannelTransport({
 *     channelName: 'my-store-channel',
 * });
 *
 * // 连接 transport
 * await transport.connect();
 *
 * // 创建 store 并同步
 * const store = new AutoStore({
 *     count: 0,
 *     user: { name: 'Alice' }
 * });
 *
 * const syncer = new AutoStoreSyncer(store, { transport });
 *
 * // 断开连接时
 * syncer.stop();
 * transport.disconnect();
 * ```
 *
 * @example 多个页面同步
 * ```typescript
 * // 页面 A
 * const transportA = new BroadcastChannelTransport({
 *     channelName: 'shared-store',
 * });
 * await transportA.connect();
 * const storeA = new AutoStore({ count: 0 });
 * const syncerA = new AutoStoreSyncer(storeA, { transport: transportA });
 *
 * // 页面 B
 * const transportB = new BroadcastChannelTransport({
 *     channelName: 'shared-store',
 * });
 * await transportB.connect();
 * const storeB = new AutoStore({ count: 0 });
 * const syncerB = new AutoStoreSyncer(storeB, { transport: transportB });
 *
 * // 现在两个页面的状态会自动同步
 * ```
 */
declare class BroadcastChannelTransport extends AutoStoreSyncTransportBase<BroadcastChannelTransportOptions> {
    private channel?;
    private messageHandler?;
    /**
     * 创建 BroadcastChannel 传输器
     * @param options 配置选项
     */
    constructor(options?: BroadcastChannelTransportOptions);
    /**
     * 创建连接
     * 创建 BroadcastChannel 并绑定 message 事件监听器
     */
    protected onConnect(): boolean;
    /**
     * 销毁连接
     * 关闭 BroadcastChannel 并移除事件监听器
     */
    protected onDisconnect(): void;
    /**
     * 发送操作到 BroadcastChannel
     * 所有同频道的页面都会收到消息
     */
    protected onSendOperate(operate: StateRemoteOperate): void;
}

/**
 * AutoStoreBroadcastChannelSyncer 配置选项
 *
 * 继承 AutoStoreSyncerOptions，但不需要指定 transport
 * 因为 transport 会自动从 channelName 创建
 */
type AutoStoreBroadcastChannelSyncerOptions = Omit<AutoStoreSyncerOptions, "transport">;
/**
 * 基于 BroadcastChannel 的 AutoStore 同步器
 *
 * 简化了 BroadcastChannelTransport + AutoStoreSyncer 的使用
 * 自动处理 transport 创建，用于跨页面/标签页状态同步
 *
 * BroadcastChannel 是点对点通信，所有页面都是平等的，没有中心服务器。
 * 因此默认使用 `pull` 模式：
 * - 新打开的页面从已有页面拉取最新状态
 * - 避免状态覆盖问题（push 模式会导致后启动的页面覆盖已有状态）
 * - 后续的状态变更会自动同步到所有页面
 *
 * @example 基本使用
 * ```typescript
 * import { AutoStoreBroadcastChannelSyncer } from '@autostorejs/syncer';
 * import { AutoStore } from 'autostore';
 *
 * const store = new AutoStore({
 *     count: 0,
 *     user: { name: 'Alice' }
 * });
 *
 * const syncer = new AutoStoreBroadcastChannelSyncer(store, 'my-store-channel');
 *
 * // 状态会自动在所有打开的页面之间同步
 * store.state.count++;  // 会同步到其他页面
 * ```
 *
 * @example 使用配置选项
 * ```typescript
 * const syncer = new AutoStoreBroadcastChannelSyncer(store, 'my-store-channel', {
 *     mode: 'pull',              // 默认: pull，从已有页面拉取状态
 *     immediate: true,           // 默认: true，连接后立即拉取
 *     direction: 'both',         // 默认: both，双向同步
 *     peers: ['remote-store-id'], // 指定接受的 peer
 * });
 * ```
 *
 * @example 指定本地和远程路径
 * ```typescript
 * const syncer = new AutoStoreBroadcastChannelSyncer(
 *     store,
 *     'my-store-channel',
 *     {
 *         local: 'shared',      // 本地路径前缀
 *         remote: 'data',       // 远程路径前缀
 *     }
 * );
 * ```
 */
declare class AutoStoreBroadcastChannelSyncer extends AutoStoreSyncer {
    /**
     * BroadcastChannel 传输器实例
     */
    get transport(): BroadcastChannelTransport;
    /**
     * 创建 BroadcastChannel 同步器
     *
     * @param store AutoStore 实例
     * @param channelName 频道名称，同一频道的页面会互相通信
     * @param options 同步配置选项
     */
    constructor(store: AutoStore<any>, channelName: string, options?: AutoStoreBroadcastChannelSyncerOptions);
}

/**
 * AutoStoreBroadcaster - 用于管理一个 AutoStore 与多个客户端 Store 之间的同步
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 工作原理
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 【架构图】
 *
 *     Store1 ──→ Transport1 ═════ Transport11 ─┐
 *     Store2 ──→ Transport2 ═════ Transport22 ─┼─→ AutoStoreBroadcaster ─→ MainStore
 *     Store3 ──→ Transport3 ═════ Transport33 ─┘
 *
 * 【核心机制：flags 标记防止循环更新】
 *
 * 系统使用 operate.flags 字段（负数 transport.id）标记操作来源，在广播时排除源端，
 * 从而避免"Store变化 → 更新MainStore → 触发广播 → 回到Store"的循环。
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 【场景1】客户端 Store 触发更新（避免循环）
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ① Store1 变化 → 通过 Transport1 发送到 Transport11
 * ② Transport11 更新 MainStore 时设置 operate.flags = -Transport11.id
 * ③ MainStore 触发 StateOperate 事件（包含 flags = -Transport11.id）
 * ④ AutoStoreBroadcaster 识别 flags，排除 Transport11，将操作转发给：
 *    - Transport22 → Store2
 *    - Transport33 → Store3
 *
 * ✓ 结果：Store1 的变化同步到其他 Store，但不会回传给自己
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 【场景2】MainStore 本地变化（广播到所有客户端）
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ① MainStore 直接修改（不经过任何 Transport）
 * ② 触发的 StateOperate 中 operate.flags 不等于任何 -transport.id
 * ③ AutoStoreBroadcaster 将变化广播给所有 Transport：
 *    - Transport11 → Store1
 *    - Transport22 → Store2
 *    - Transport33 → Store3
 *
 * ✓ 结果：MainStore 的本地变化同步到所有客户端 Store
 *
 */

/**
 * AutoStore 广播器 - 管理主站与多个客户端之间的状态同步
 *
 * 【架构角色】
 * - MainStore：主站状态存储（_store）
 * - Transport：主站侧的传输端点（对应原理图中的 Transport11/22/33）
 * - 每个客户端都有一个对应的 Transport 连接到此广播器
 *
 * 【核心机制】
 * 使用 operate.flags（负数 transport.id）标记操作来源，广播时排除源端以防止循环更新。
 */
declare class AutoStoreBroadcastSyncer extends AutoStoreSyncerBase {
    /**
     * 主站 Store（对应原理图中的 MainStore）
     * 所有客户端的状态最终同步到此 Store
     */
    private _store;
    /** 广播器配置选项 */
    private _options;
    /**
     * Transport 注册表
     * Key: transport.id（唯一标识符）
     * Value: Transport 实例（对应原理图中的 Transport11/22/33）
     *
     * 每个 Transport 代表一个客户端到主站的连接点
     */
    transports: Map<number, AutoStoreSyncTransportBase>;
    /**
     * Transport 事件监听器清理函数映射
     * 用于在 Transport 断开连接时清理其事件监听器
     */
    private _transportCleanup;
    /**
     * MainStore 的 watch 监听器
     * 用于监听主站状态变化并广播到所有客户端（对应原理场景2）
     */
    private _watcher?;
    constructor(store: AutoStore<any>, options?: AutoStoreBroadcasterOptions);
    get store(): AutoStore<any>;
    get options(): Required<AutoStoreBroadcasterOptions>;
    /**
     * 连接一个新的客户端
     * 直接监听 transport 的消息，不创建 AutoStoreSyncer
     *
     * @param transport 传输层对象
     * @returns 客户端 ID
     */
    addTransport(transport: AutoStoreSyncTransportBase): void;
    /**
     * 断开指定客户端的连接
     *
     * @param id 客户端 ID
     */
    removeTransport(id: number): void;
    /**
     * 广播操作到所有客户端（排除源端以防止循环更新）
     *
     * 【对应原理场景】
     * - 场景1：客户端触发更新时，flags = -transport.id，此时排除源端
     * - 场景2：MainStore 本地变化时，flags = 0，此时广播到所有客户端
     *
     * 【核心逻辑】
     * 1. 从 operate.flags 提取源 transport ID（值为负数时表示来自某个 Transport）
     * 2. 遍历所有 Transport，排除源端后发送操作
     * 3. 这样可以避免：Store → Transport → MainStore → broadcast → 回到 Store 的循环
     *
     * @param operate 要广播的操作（包含 flags 字段用于识别来源）
     */
    broadcast(operate: StateOperate): void;
    /**
     * 向指定客户端发送操作
     *
     * @param clientId 客户端 ID
     * @param operate 要发送的操作
     */
    sendTo(clientId: number, operate: StateRemoteOperate): void;
    /**
     * 处理从 transport 接收到的远程操作
     * 直接更新 store，不通过 syncer
     *
     * @param operate 远程操作
     */
    private _onReceiveFromTransport;
    /**
     * 应用远程操作到 MainStore（设置 flags 标记来源）
     *
     * 【核心机制：flags 标记】
     * 使用负数 transport.id 作为 flags，标记此操作来自哪个 Transport。
     * 这样在 MainStore 触发 StateOperate 事件时，broadcast() 方法可以：
     * 1. 识别操作来源（flags < 0）
     * 2. 排除源 Transport，避免循环更新
     *
     * 【对应原理场景1】
     * Store1 → Transport1 → Transport11 → MainStore（设置 flags = -Transport11.id）
     * → MainStore 触发事件 → broadcast() 识别并排除 Transport11
     *
     * @param operate 远程操作
     * @param transport 发送此操作的 Transport
     */
    private _applyOperate;
    /**
     * 应用完整的状态更新
     *
     * @param operate 远程操作
     */
    private _applyStoreUpdate;
    /**
     * 发送完整 store 状态给客户端
     *
     * @param operate 远程操作
     */
    private _sendStoreToTransport;
    /**
     * 启动自动广播监听（对应原理场景2）
     *
     * 【监听目标】
     * 监听 MainStore 的状态变化，自动广播到所有客户端 Transport。
     *
     * 【对应原理场景2：MainStore 本地变化】
     * 1. MainStore 直接修改（不经过任何 Transport）
     * 2. 触发 StateOperate 事件，flags = 0（无来源标记）
     * 3. broadcast() 识别 flags = 0，广播到所有 Transport
     *
     * 【为什么监听 "write" 操作】
     * - 只监听写操作（set/update/delete/insert）
     * - 不监听读操作（get），避免不必要的广播
     */
    start(): void;
    /**
     * 停止自动广播
     */
    stop(): void;
    /**
     * 销毁管理器，清理所有资源
     */
    destroy(): void;
    toString(): string;
}

/**
 * AutoStoreSwitchSyncer - 用于在 SharedWorker 中管理多个 AutoStore 之间的 N-N 同步
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 工作原理
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 【架构图】
 *
 *     SharedWorker 端（使用 AutoStoreSwitchSyncer）
 *     ┌─────────────────────────────────────────────────────────────┐
 *     │  AutoStoreSwitchSyncer                                      │
 *     │  ┌─────────────────────────────────────────────────────┐    │
 *     │  │ Store1 (id: 'store1')                               │    │
 *     │  │   - watch 监听变化 → 广播到订阅了 'store1' 的 transports  │    │
 *     │  └─────────────────────────────────────────────────────┘    │
 *     │  ┌─────────────────────────────────────────────────────┐    │
 *     │  │ Store2 (id: 'store2')                               │    │
 *     │  │   - watch 监听变化 → 广播到订阅了 'store2' 的 transports  │    │
 *     │  └─────────────────────────────────────────────────────┘    │
 *     │  ┌─────────────────────────────────────────────────────┐    │
 *     │  │ Store3 (id: 'store3')                               │    │
 *     │  │   - watch 监听变化 → 广播到订阅了 'store3' 的 transports  │    │
 *     │  └─────────────────────────────────────────────────────┘    │
 *     │                                                             │
 *     │  Transport 映射:                                           │
 *     │  Transport1 → 订阅 ['store1', 'store2', 'store3']           │
 *     │  Transport2 → 订阅 ['store1', 'store2']                   │
 *     │  Transport3 → 订阅 ['store1']                             │
 *     └─────────────────────────────────────────────────────────────┘
 *                              ↕ (消息路由)
 *     浏览器页签端（使用 AutoStoreWorkerSyncer）
 *     ┌─────────────────────────────────────────────────────────────┐
 *     │  页签1                                                      │
 *     │  ├→ syncer1: peers=['store1'] ──→ SharedWorker的Store1     │
 *     │  ├→ syncer2: peers=['store2'] ──→ SharedWorker的Store2     │
 *     │  └→ syncer3: peers=['store3'] ──→ SharedWorker的Store3     │
 *     └─────────────────────────────────────────────────────────────┘
 *
 * 【核心机制：直接管理 Store 和 Transport 映射】
 *
 * 1. 不再使用 AutoStoreBroadcastSyncer，直接管理 stores 和 transports
 * 2. 维护 transport -> store.ids 的映射关系
 * 3. 维护 store.id -> transports 的反向映射，用于广播
 * 4. 使用 flags 标识操作来源（flags = transport.id），防止循环更新
 * 5. 当操作应用到 store 后，watch 触发，根据 flags 排除源端，广播到其他 transports
 *
 * 【使用场景】
 *
 * 适用于需要在 SharedWorker 中管理多个独立状态树的场景：
 * - 多租户应用（每个租户有独立的状态）
 * - 多标签页协同工作（每个标签页可以同步不同的状态）
 * - 复杂应用的状态分区（不同功能模块使用不同的 store）
 *
 * @example 在 SharedWorker 中使用
 * ```typescript
 * import { AutoStoreSwitchSyncer } from '@autostorejs/syncer';
 * import { WorkerTransport } from '@autostorejs/syncer';
 *
 * // 创建多个 store
 * const store1 = new AutoStore({ user: { name: 'Alice' } }, { id: 'store1' });
 * const store2 = new AutoStore({ products: [] }, { id: 'store2' });
 * const store3 = new AutoStore({ cart: [] }, { id: 'store3' });
 *
 * // 创建 switch syncer
 * const switchSyncer = new AutoStoreSwitchSyncer([store1, store2, store3]);
 *
 * // 动态添加新的 store
 * const store4 = new AutoStore({ orders: [] }, { id: 'store4' });
 * switchSyncer.add(store4);
 *
 * // 监听来自页签的连接
 * self.addEventListener('connect', (event) => {
 *     const port = event.ports[0];
 *     port.start();
 *
 *     const transport = new WorkerTransport({
 *         worker: port,
 *         autoConnect: true,
 *     });
 *
 *     // 添加传输器，switch 会自动路由消息到对应的 store
 *     switchSyncer.addTransport(transport);
 * });
 * ```
 *
 * @example 在浏览器页签中使用
 * ```typescript
 * import { AutoStoreWorkerSyncer } from '@autostorejs/syncer';
 * import { AutoStore } from 'autostore';
 *
 * const worker = new SharedWorker('./worker.js', { type: 'module' });
 *
 * // 创建本地 store
 * const storeA = new AutoStore({ user: { name: 'Bob' } }, { id: 'local-store-a' });
 * const storeB = new AutoStore({ products: [] }, { id: 'local-store-b' });
 *
 * // 创建 syncer1，与 SharedWorker 中的 store1 同步
 * const syncer1 = new AutoStoreWorkerSyncer(storeA, worker, {
 *     peers: ['store1'], // 指定要与 SharedWorker 中的 store1 同步
 * });
 *
 * // 创建 syncer2，与 SharedWorker 中的 store2 同步
 * const syncer2 = new AutoStoreWorkerSyncer(storeB, worker, {
 *     peers: ['store2'], // 指定要与 SharedWorker 中的 store2 同步
 * });
 * ```
 */

/**
 * AutoStoreSwitchSyncer 配置选项
 */
type AutoStoreSwitchSyncerOptions = {
    /**
     * 是否自动启动所有 store 的 watch
     * @default true
     */
    autostart?: boolean;
    debug?: boolean;
};
/**
 * AutoStoreSwitchSyncer - 管理多个 AutoStore 的 N-N 同步
 *
 * 【核心职责】
 * 1. 直接管理多个 store，不通过 AutoStoreBroadcastSyncer
 * 2. 维护 transport <-> store.id 的双向映射
 * 3. 监听 transport 的消息，根据 operate.id 路由到对应的 store
 * 4. 使用 flags 机制防止循环更新
 */
declare class AutoStoreSwitchSyncer extends AutoStoreSyncerBase {
    /**
     * Store 集合（用于快速访问）
     * Key: store.id
     * Value: AutoStore 实例
     */
    stores: Map<string, AutoStore<any>>;
    /**
     * Transport 到 Store IDs 的映射
     * Key: transport
     * Value: Set of store ids that this transport subscribes to
     *
     * 例如：Transport1 订阅了 ['store1', 'store2', 'store3']
     */
    private _transportStoreIds;
    /**
     * Store ID 到 Transports 的反向映射（用于广播）
     * Key: store.id
     * Value: Set of transports that subscribe to this store
     *
     * 例如：'store1' -> [Transport1, Transport2, Transport3]
     */
    private _storeTransports;
    /**
     * Store 的 Watcher 映射
     * Key: store.id
     * Value: Watcher 实例
     */
    private _watchers;
    /**
     * 配置选项
     */
    private _options;
    /**
     * Transport 事件监听器清理函数映射
     * 用于在 Transport 断开连接或销毁时清理其事件监听器
     */
    private _transportCleanup;
    /**
     * 创建 SwitchSyncer
     *
     * @param stores 要管理的 store 列表
     * @param options 配置选项
     */
    constructor(stores?: AutoStore<any>[], options?: AutoStoreSwitchSyncerOptions);
    /**
     * 添加一个新的 store
     *
     * @param store 要添加的 store
     */
    add(store: AutoStore<any>): void;
    /**
     * 移除一个 store
     *
     * @param storeId store 的唯一标识符
     */
    remove(storeId: string): void;
    /**
     * 启动 store 的 watch
     *
     * @param store AutoStore 实例
     */
    private _startWatch;
    /**
     * 添加传输器
     *
     * 传输器会订阅所有的 stores，这样可以：
     * 1. 接收来自任何 store 的更新（用于广播）
     * 2. 根据 operate.id 将操作路由到正确的 store
     *
     * @param transport 传输层对象
     */
    addTransport(transport: AutoStoreSyncTransportBase): void;
    /**
     * 处理 $pull 请求
     *
     * @param operate 远程操作
     * @param transport 发送操作的 transport
     * @param store 目标 store
     */
    private _handlePull;
    /**
     * 处理 $update 消息
     *
     * @param operate 远程操作
     * @param transport 发送操作的 transport
     * @param store 目标 store
     */
    private _handleUpdate;
    /**
     * 处理常规操作（set/update/delete/insert/remove）
     *
     * @param operate 远程操作
     * @param transport 发送操作的 transport
     * @param store 目标 store
     */
    private _handleOperate;
    /**
     * 移除传输器
     *
     * @param transportId 传输器 ID
     */
    removeTransport(transportId: number): void;
    /**
     * 获取指定 store
     *
     * @param storeId store 的唯一标识符
     * @returns AutoStore 实例，如果不存在则返回 undefined
     */
    getStore(storeId: string): AutoStore<any> | undefined;
    /**
     * 获取所有管理的 stores
     *
     * @returns store id 列表
     */
    getStoreIds(): string[];
    /**
     * 启动同步器
     *
     * 为所有已添加的 stores 启动 watch 监听
     */
    start(): void;
    /**
     * 停止同步器
     *
     * 停止所有 stores 的 watch 监听，但保留 stores 和 transports
     */
    stop(): void;
    /**
     * 销毁管理器，清理所有资源
     */
    destroy(): void;
    toString(): string;
}

/**
 * EventEmitter 接口定义
 * 用于事件监听和触发的基本接口
 */
interface IEventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
}
/**
 * 基于 EventEmitter 的同步传输器
 *
 * 特性：
 * - 支持任意实现了 IEventEmitter 接口的事件发射器
 * - 所有 transport 共享同一个 emitter，通过不同的事件名称区分
 * - 支持自定义接收和发送事件名称
 * - 自动处理 $stop 操作
 *
 * @example
 * ```typescript
 * import { EventEmitter } from 'events';
 *
 * const emitter = new EventEmitter();
 *
 * // Store1 的 transport
 * const transport1 = new EventEmitterTransport({
 *     emitter: emitter,
 *     eventName: 'store2-channel',  // 监听 store2 的消息
 *     sendEventName: 'store1-channel'  // 发送到 store1-channel
 * });
 *
 * // Store2 的 transport
 * const transport2 = new EventEmitterTransport({
 *     emitter: emitter,
 *     eventName: 'store1-channel',  // 监听 store1 的消息
 *     sendEventName: 'store2-channel'  // 发送到 store2-channel
 * });
 * ```
 */
type EventEmitterTransportOptions = {
    emitter: IEventEmitter;
    /**
     * 用于接收的本地订阅事件名称
     */
    localEventName?: string;
    /**
     * 远程发送事件名称
     */
    remoteEventName?: string;
    /**
     * 是否自动建立连接
     */
    autoConnect?: boolean;
};
declare class EventEmitterTransport extends AutoStoreSyncTransportBase<EventEmitterTransportOptions> {
    private handleReceive;
    constructor(options?: EventEmitterTransportOptions & {
        id?: string;
        debug?: boolean;
    });
    /**
     * 当调用connect时会调用onConnect，此时应创建连接
     * 连接成功应返回true
     */
    onConnect(): boolean;
    onDisconnect(): void;
    onSendOperate(operate: StateRemoteOperate): void;
}

/**
 * 本地同步传输器
 *
 * 特性：
 * - 继承 AutoStoreSyncTransportBase，支持完整的事件系统
 * - 通过 peer 函数获取对端 transport，实现直接通信
 * - 适用于同一进程内的多个 store 之间同步
 * - 支持 connect/disconnect 生命周期管理
 *
 * @example
 * ```typescript
 * // 创建两个 LocalTransport 实例，互相引用
 * let transport1: LocalTransport;
 * let transport2: LocalTransport;
 *
 * transport1 = new LocalTransport(() => transport2);
 * transport2 = new LocalTransport(() => transport1);
 *
 * // 或者启用 debug 模式
 * transport1 = new LocalTransport(() => transport2, { debug: true });
 * transport2 = new LocalTransport(() => transport1, { debug: true });
 *
 * // 分别连接
 * await transport1.connect();
 * await transport2.connect();
 * ```
 */
declare class LocalTransport extends AutoStoreSyncTransportBase {
    private getPeer;
    private _peer?;
    /**
     * 构造函数
     * @param peer 获取对端 transport 的函数
     * @param options 可选配置项
     */
    constructor(peer: () => LocalTransport, options?: AutoStoreSyncTransportOptions);
    get peer(): LocalTransport;
    /**
     * 创建连接
     * 获取对端 transport
     */
    onConnect(): boolean;
    /**
     * 销毁连接
     */
    onDisconnect(): void;
    /**
     * 发送操作到对端
     * 调用对端的 receiveMessage 方法
     */
    onSendOperate(operate: StateRemoteOperate): void;
}

export { AutoStoreBroadcastChannelSyncer, type AutoStoreBroadcastChannelSyncerOptions, AutoStoreBroadcastSyncer, type AutoStoreBroadcasterOptions, type AutoStoreCloneOptions, AutoStoreSwitchSyncer, type AutoStoreSwitchSyncerOptions, AutoStoreSyncError, AutoStoreSyncTransportBase, type AutoStoreSyncTransportOptions, type AutoStoreSyncTransportReceiver, AutoStoreSyncer, AutoStoreSyncerBase, type AutoStoreSyncerEvents, type AutoStoreSyncerOptions, AutoStoreWorkerSyncer, type AutoStoreWorkerSyncerOptions, BroadcastChannelTransport, type BroadcastChannelTransportOptions, EventEmitterTransport, type EventEmitterTransportOptions, type IEventEmitter, type IWorker, LocalTransport, SYNC_INIT_FLAG, type StateRemoteOperate, type TransportEvents, WorkerTransport, type WorkerTransportOptions, installSyncerPlugin };
