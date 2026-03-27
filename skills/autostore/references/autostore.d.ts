import * as fastevent from 'fastevent';
import { TransformedEvents, FastEventSubscriber, FastEvent, FastEventOptions } from 'fastevent';

declare const SKIP_PROXY_FLAG = "__AS_SKIP_PROXY__";
declare const OBSERVER_DESCRIPTOR_BUILDER_FLAG = "__AS_OBSERVER_DESCRIPTOR_BUILDER__";
declare const OBSERVER_DESCRIPTOR_FLAG = "__AS_OBSERVER_DESCRIPTOR__";
declare const PATH_DELIMITER = ".";
declare const BATCH_UPDATE_EVENT = "__batch_update__";
declare const ASYNC_COMPUTED_VALUE = "__AS_ASYNC_COMPUTED_VALUE__";
declare const EMPTY = "__AS_EMPTY__";
declare const VALUE_SCHEMA_BUILDER_FLAG = "__AS_VALUE_SCHEMA__";
declare const DELETE_FLAG = "__AS_DELETE_FLAG__";
declare const GLOBAL_CONFIG_MANAGER = "AutoStoreConfigManager";

type RefStateOptions = {
    /** 当状态值变化时是否自动重新运行计算函数，默认true */
    reactive?: boolean;
    /**
     * 传递给计算对象的run方法的参数
     */
    runArgs?: Record<string, any>;
};
type RefState = <Value = any>(path: string | string[], options?: RefStateOptions) => Value | undefined;
type RefStateContext = {
    off: () => void;
    ref: RefState;
};

declare class ObserverObject<Value = any, Options extends ObserverOptions<Value> = ObserverOptions<Value>> {
    descriptor: ObserverDescriptor<any, any, any>;
    context?: ComputedContext<Value> | undefined;
    private _path;
    private _id;
    private _initial;
    private _value;
    private _associated;
    private _attached;
    private _getter;
    private _depends;
    private _options;
    private _subscribers;
    private _strPath?;
    private _error?;
    store: AutoStore<any>;
    _shadowStore: AutoStore<any>;
    _refStateCtx?: RefStateContext;
    /**
     *  构造函数。
     *
     * @param {AutoStore<any>} store
     * @param {ComputedContext} context - 动态值上下文，指该动态值所有的路径、值、父路径和父对象引用。
     * @param {ComputedDescriptor<Options>} descriptor - 动态值描述符，包含了动态值的元数据。
     */
    constructor(store: AutoStore<any>, descriptor: ObserverDescriptor<any, any, any>, context?: ComputedContext<Value> | undefined);
    get type(): any;
    get options(): Required<Options>;
    get id(): string;
    get associated(): boolean;
    get async(): Options["async"];
    get enable(): boolean;
    set enable(value: boolean);
    set group(value: string);
    get group(): string;
    get initial(): Value | undefined;
    set initial(value: Value | undefined);
    get path(): string[];
    get attached(): boolean;
    get depends(): string[][];
    set depends(value: string[][]);
    get getter(): any;
    set getter(value: any);
    get strPath(): string;
    get error(): Error | undefined;
    set error(value: Error | undefined);
    toString(): string;
    get value(): Value;
    set value(value: Value);
    private _onObserverCreated;
    private _onInitial;
    private _createRefStateCtx;
    /**
     * 供子类继承进行初始化
     */
    protected onInitial(): void;
    /**
     * 供子类对选项进行初始化处理
     *
     * @description
     * 一些ObserverObject的子类的选择允许被Store的选择覆盖
     *
     * 比如ComputedObject的enable属性，可以通过Store的enableComputed属性来覆盖
     *
     */
    protected onInitOptions(_options: Required<Options>): void;
    /**
     * 更新计算对象的结果值
     *
     * @description
     *
     * - 标量值
     *  update(1)
     * - 对象值
     *  update({value:1})
     *
     */
    update(value: Value, options?: UpdateOptions): void;
    /**
     * 更新计算属性的值，并且不会触发依赖的变化事件
     *
     *
     *
     * @param value
     * @param {boolean} silent - 是否静默更新，即不会触发依赖变化事件
     */
    silentUpdate(value: Value): void;
    /**
     * 订阅当前计算对象值变化的事件
     * @description
     *
     * 当计算结果值发生变化时触发
     *
     
     *
     *
     * @example
     *
     * const computedObj = store.computedObject.get("xxx")
     * computedObj.watch((value)=>{
     *
     * })
     *
     *
     *
     * @param options
     * @param  {boolean}  options.expand - 是否扩展侦听范围到子对象，当value是一个object时使用
     *
     * 当Observer对象的值是一个对象时，如异步计算对象value={value,loading,timeout,....}
     * 则.watch((val)=>{....})这里正常返回的应该是value.value
     * 如果需要侦听value对象的所有属性变化，则需要设置expand=true,此时侦听的就是`path.*`的变化
     * 由于changesets支持通配符，所以就可以侦听到所成员属性的变化
     *
     * @returns
     */
    watch(listener: (operate: StateOperate) => void, options?: WatchListenerOptions): fastevent.FastEventSubscriber;
    /**
     * 供子类重写，用来获取当前对象值的依赖路径
     * @returns
     */
    protected getValueWatchPath(): string | (string | string[])[];
    protected emitStoreEvent(event: keyof AutoStoreEvents, args: any): void;
    /**
     * 获取当前对象的依赖路径
     *
     * 本方法供子类重写，用来对依赖进行规范
     *
     * @returns
     */
    protected getDepends(): string[][];
    /**
     * 当依赖变化时调用
     * @param _
     */
    protected onDependsChange(_: StateOperate): void;
    /**
     *
     */
    attach(): void;
    detach(): void;
    get shadowStore(): AutoStore<any, unknown>;
    /**
     * 供子类重写
     *
     */ run(..._args: any[]): any;
    protected getGetterArgs(): void;
}

/**
 *
 *
 *
 */

declare class ComputedObject<Value = any, ExtraOptions extends unknown = unknown> extends ObserverObject<Value, ComputedOptions<Value> & ExtraOptions> {
    descriptor: ComputedDescriptor;
    context?: ComputedContext<Value> | undefined;
    /**
     *  构造函数。
     *
     * @param {AutoStore<any>} store
     * @param {ComputedContext} context - 动态值上下文，指该动态值所有的路径、值、父路径和父对象引用。
     * @param {ComputedDescriptor<Options>} descriptor - 动态值描述符，包含了动态值的元数据。
     */
    constructor(store: AutoStore<any>, descriptor: ComputedDescriptor, context?: ComputedContext<Value> | undefined);
    toString(): string;
    /**
     * 返回计算属性的值,如果是异步计算属性，则返回value.value
     */
    get val(): Value;
    /**
     * 报告计算状态
     * @param name
     * @param value
     */
    protected _reportComputedStatus(name: "loading" | "error", value: any): void;
    /**
     * 检查计算函数是否被禁用
     *
     * @param value
     * @returns {boolean}
     */
    protected isDisable(value: boolean | undefined): boolean;
    /**
     *  手动触发计算属性getter函数的重新执行，重新计算计算属性的值
     *
     * @description
     *
     */ run(_?: RuntimeComputedOptions): void;
}

/**
 * 用于保存所有配置项的类型
 * key： 配置项名称路径，如user.order.price
 * value: AutoStoreFieldSchema & { value:<从原始Store中读取，写入时也会写入到原始Store的对应项>}
 */
interface AutoStoreConfigures {
}
interface AutoStoreWidgets {
}
interface AutoStoreAction {
    id?: string;
    label?: string;
    icon?: string;
    disabled?: boolean;
    visible?: boolean;
    default?: boolean;
    checked?: boolean;
    tooltip?: string;
    value?: any;
    onClick?: (action: AutoStoreAction) => void;
}
/**
 * 从 AutoStoreWidgets 提取 widget 键类型
 * 当 AutoStoreWidgets 为空接口时，回退到 string 类型
 */
type WidgetKeys<T> = keyof T extends never ? string : keyof T;
type AutoStoreWidgetTypes = WidgetKeys<AutoStoreWidgets>;
/**
 * 从 AutoStoreWidgets 中提取指定 widget 的配置类型
 */
type WidgetConfig<W extends keyof AutoStoreWidgets> = AutoStoreWidgets[W];
/**
 * AutoStateSchema 基础接口（不包含 widget 特定配置）
 */
interface AutoStateSchemaBase<Value = any> {
    value: Value;
    /**
     * 配置项控件类型
     * 即渲染渲染表单字段控件
     */
    widget?: AutoStoreWidgetTypes;
    /**
     * 配置键名称
     * 即在ConfigManager.state配置对象中存储key路径
     * 如果没有指定，则等于配置项所在的路径,如path=["order","price"],则key=order.price
     */
    key?: string;
    /**
     * 配置项名称
     * 一般是英文名称，用于渲染表单名称
     * 如果没有指定，默认等于路径的最后一个节点，如path=["order","price"],则name=price
     */
    name?: string;
    /**
     * 配置项标题
     * 一般是中文名称，用于渲染表单标题
     * 默认值等于name
     */
    label?: string;
    /**
     * 配置项帮助信息
     */
    help?: string;
    /**
     * 配置项提示信息
     */
    tooltip?: string;
    /**
     * 默认值
     */
    default?: Value;
    /**
     * 当校验出错时的无效提示信息
     *
     * 支持插值变量
     * - 当前所有配置项的值，例如: invalidTips="{label}数据格式错误"
     * - error: 错误信息，即错误对象的message属性
     * - errorStack: 错误堆栈信息,即错误对象的stack属性
     * - value: 错误值
     * - path: 路径
     *
     */
    errorMessage?: string;
    datatype?: string;
    /**
     * 是否启用
     */
    enable?: boolean;
    /**
     * 配置项图标
     */
    icon?: string;
    /**
     * 是否必填
     */
    required?: boolean;
    /**
     * 是否可见
     */
    visible?: boolean;
    description?: string;
    placeholder?: string;
    /**
     * 分组名称
     */
    group?: string;
    /**
     * 是否是高级选项
     */
    advanced?: boolean;
    /**
     * 是否显示分割线
     */
    divider?: boolean;
    /**
     * 排序号
     */
    order?: number;
    width?: number | string;
    height?: number | string;
    styles?: Record<string, any>;
    classs?: Record<string, any>;
    /**
     *
     * 校验失败时的默认行为
     *
     * - throw: 默认，触发ValidateError错误
     * - throw-pass： 继续写入,然后再触发ValidateError错误
     * - pass: 继续写入,不抛出错误
     * - ignore: 静默忽略，即不触发错误，也不写入
     *
     * 错误信息均会写入到errors中
     *
     * 当校验函数返回 false 或抛出错误时，使用此选项决定如何处理
     * 可被校验函数抛出的 ValidateError.behavior 覆盖
     *
     */
    onInvalid?: "pass" | "throw" | "ignore" | "throw-pass";
    /**
     * 校验函数
     * 允许通过throw new Error()来提供错误信息
     * @param value
     * @returns
     */
    validate?: (value: Value, oldValue: Value, path: string[]) => boolean;
    /**
     * 在视图模式下的渲染函数
     */
    toView?: (value: Value) => any;
    /**
     * 写入到状态时的转换函数
     */
    toState?: (value: any) => any;
    /**
     * 将状态转换为输入值的函数
     */
    toInput?: (value: any) => any;
    /**
     * 用于自定义渲染表单字段
     */
    toRender?: (value: any) => any;
    /**
     * 动作
     */
    actions?: AutoStoreAction[];
}
/**
 * 提取类型的可选键
 */
type OptionalKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
/**
 * 提取类型的必需键
 */
type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
/**
 * 创建精确的 Widget 配置类型：
 * - 必需属性保持必需
 * - 可选属性保持可选
 */
type WidgetConfigPrecise<W extends keyof AutoStoreWidgets> = Pick<AutoStoreWidgets[W], RequiredKeys<AutoStoreWidgets[W]>> & Partial<Pick<AutoStoreWidgets[W], OptionalKeys<AutoStoreWidgets[W]>>>;
/**
 * 完整的 AutoStateSchema 类型，根据 widget 参数自动合并对应 widget 配置
 * 使用泛型参数 Widget 来实现类型安全的 widget 配置推断
 */
type AutoStoreStateSchema<Value = any, Widget extends keyof AutoStoreWidgets = never> = keyof AutoStoreWidgets extends never ? AutoStateSchemaBase<Value> : [Widget] extends [never] ? AutoStateSchemaBase<Value> : AutoStateSchemaBase<Value> & (Widget extends keyof AutoStoreWidgets ? WidgetConfigPrecise<Widget> : {});
type Computedable<Obj extends Record<string, any>, Value = any> = {
    [Key in keyof Obj]: Key extends "validate" ? (value: Value, oldValue: Value, path: string[]) => boolean : Key extends "name" | "id" | "key" | "value" | "path" | "datatype" ? Obj[Key] : Key extends `${"on" | "to" | "render"}${string}` ? Obj[Key] extends (...args: any[]) => any ? Obj[Key] : Obj[Key] | ComputedBuilder<Obj[Key], any> : Obj[Key] | ComputedBuilder<Obj[Key], any>;
};
type ComputedableStateSchema<Value = any, Widget extends keyof AutoStoreWidgets = never> = Computedable<AutoStoreStateSchema<Value, Widget>, Value>;
type SchemaDescriptor<Value = any, Widget extends keyof AutoStoreWidgets = never> = {
    path?: string[];
    value: Value;
    schema: AutoStoreStateSchema<Value, Widget>;
};
interface SchemaDescriptorBuilder<Value = any, Widget extends keyof AutoStoreWidgets = never> {
    [VALUE_SCHEMA_BUILDER_FLAG]: true;
    (): SchemaDescriptor<Value, Widget>;
}
/**
 * 从 SchemaDescriptorBuilder 中提取 Widget 类型
 * 用于在 ConfigurableState 中恢复 widget 特定配置的类型信息
 */
type ExtractWidgetFromBuilder<T> = T extends SchemaDescriptorBuilder<any, infer W> ? W : never;
type SchemaBuilder<Value = any> = <T = Value, W extends keyof AutoStoreWidgets = never>(value: T, schema?: ComputedableStateSchema<Value, W>) => SchemaDescriptorBuilder<T, W>;
type ConfigurableKeyPaths<State> = Exclude<keyof {
    [K in StatePath<State> as GetTypeByPath<State, K> extends {
        [VALUE_SCHEMA_BUILDER_FLAG]: true;
    } ? K : GetTypeByPath<State, K> extends Array<infer Item> ? Item extends {
        [VALUE_SCHEMA_BUILDER_FLAG]: true;
    } ? `${K}.${number}` : never : never]: any;
}, number | symbol>;
type ConfigurableState<Store extends AutoStore<any>, Prefix extends string = ""> = {
    [Key in ConfigurableKeyPaths<StoreRawStateType<Store>> as Prefix extends "" ? Key : `${Prefix}.${Key}`]: AutoStoreStateSchema<GetTypeByPath<ComputedState<StoreRawStateType<Store>>, Key>, ExtractWidgetFromBuilder<GetTypeByPath<StoreRawStateType<Store>, Key>>>;
};

/**
 *
 * 配置管理器
 *
 *  {
 *     '<Sotre.options.configKey>.<配置项所在路径>':StateSchema
 *     'order.price':StateSchema
 *     'user.name':StateSchema
 * }
 * const config = new ConfigManager({
 *      load(path:string[]){
 *          return {}
 *      }
 *      save(path:string[],value:any){
 *      }
 * })
 * - 加载所有配置
 * await config.load()
 *
 *
 */
interface ConfigSource {
    load: () => Record<string, any> | Promise<Record<string, any>>;
    /**
     * 每一个配置项变更时均会调用
     * @param values
     * @returns
     */
    save?: (values: Record<string, any>) => void | Promise<void>;
    /**
     * 重载配置时调用
     * 可以在此将外部存储中的配置恢复
     * @returns
     */
    reset?: () => void;
}
type ConfigManagerOptions<State extends Dict> = AutoStoreOptions<State> & {
    global?: string | boolean;
    autoload?: boolean;
    autosave?: boolean;
};
declare class ConfigManager extends AutoStore<AutoStoreConfigures, ConfigManagerOptions<AutoStoreConfigures>> {
    source: ConfigSource;
    dirtyValues: Record<string, any>;
    private _reseting;
    constructor(source: ConfigSource, options?: ConfigManagerOptions<AutoStoreConfigures>);
    get fields(): {};
    get size(): number;
    /**
     * 加载数据到当前实例
     * @param {Record<string, any>} data - 要加载的数据对象，键值对形式
     */
    load(): Promise<void>;
    /**
     * 手工调用保存配置数据到数据源
     * @param all 保存所有配置数据,false=只保存变更的数据
     */
    save(all?: boolean): Promise<void>;
    private _getValues;
    /**
     * 恢复默认值
     */
    reset(): void;
    /**
     * 此方法由Store实例在更新状态值时调用
     * @param store
     * @param path
     * @param value
     */
    onUpdate(_store: AutoStore<any>, configKey: string, value: any): void;
    add(store: AutoStore<any>, path: string | string[], schema: SchemaDescriptorBuilder | SchemaDescriptor): any;
    private _handleRefState;
    private _installValidator;
    private _createValueProxy;
    getConfigValue(path: string[]): any;
}
declare global {
    var AutoStoreConfigManager: ConfigManager;
}

declare class WatchObject<Value = any> extends ObserverObject<Value, WatchOptions<Value>> {
    store: AutoStore<any>;
    context?: ComputedContext<any> | undefined;
    private _cache?;
    constructor(store: AutoStore<any>, descriptor: WatchDescriptor, context?: ComputedContext<any> | undefined);
    get filter(): WatchDependFilter<Value>;
    get cache(): Record<string, any>;
    toString(): string;
    protected onInitial(): void;
    /**
     * 侦听到值变化时调用本函数来判断是否匹配
     *
     * 如果是则执行监听函数
     *
     * @param dependPath
     * @param dependValue
     * @returns
     */
    isMatched(dependPath: string[], dependValue: any): boolean;
    reset(): void;
    /**
     * 运行侦听函数
     * @param watchPath
     * @returns
     */
    run(watchPath: string[], watchValue: any): void;
}

/**
 * 创建沙箱的选项
 */
interface CreateSandboxOptions {
    /**
     * 错误处理回调
     * @param error - 捕获的错误对象
     * @param code - 出错的代码字符串
     * @returns 如果返回值，将代替函数的返回值；如果不返回，则继续抛出错误
     */
    onError?: (error: Error, code: string) => any;
    /**
     * 禁用的全局变量列表
     *
     * 这些变量将以 `undefined` 值传递给沙箱函数，防止 code 中访问它们
     *
     * @example
     * ```ts
     * const sandbox = createSandbox(
     *   { x: 1 },
     *   { disabledGlobals: ['window', 'document', 'fetch'] }
     * )
     * sandbox('window') // undefined
     * sandbox('fetch("/api")') // TypeError: fetch is not a function
     * ```
     */
    disabledGlobals?: string[];
}

type BatchChangeEvent = "__batch_update__";
type StateChangeEvents = TransformedEvents<Record<string, StateOperate>>;
interface StateValidatorFunction<State extends Dict> {
    (this: AutoStore<State>, newValue: any, oldValue: any, path: string[]): boolean;
    getErrorMessage?: (error: Error) => string;
    onInvalid?: ValidationBehavior;
}
type StateValidator<State extends Dict> = StateValidatorFunction<State>;
type ValidationBehavior = "pass" | "ignore" | "throw" | "throw-pass";
type StateOperateType = "get" | "set" | "delete" | "insert" | "update" | "remove" | "batch";
interface StateOperate<Value = any, Parent = any> {
    type: StateOperateType;
    path: string[];
    value: Value;
    indexs?: number[];
    oldValue?: Value;
    parentPath?: string[];
    parent?: Parent;
    /**
     * 是否是批量操作时的回放事件
     */
    reply?: boolean;
    flags?: number;
    /**
     * 该操作是否来自shadow转发
     */
    shadow?: boolean;
}
interface AutoStoreOptions<State extends Dict> {
    /**
     * 提供一个id，用于标识当前store
     */
    id?: string;
    /**
     * 是否启用调试模式
     * @description
     *
     * 调试模式下会在控制台输出一些日志信息
     *
     */
    debug?: boolean;
    /**
     * 声明是否shadow,默认false
     */
    shadow?: boolean;
    /**
     *  是否马上创建动态对象
     *
     *
     * @description
     *
     * 默认情况下，计算函数仅在第一次读取时执行,
     * 如果lazy=true时，则延迟创建计算对象
     *
     * - false: 在创建时马上进行第一次计算，马上就可以收集到依赖
     * - true:  计算函数仅在第一次读取时执行
     * - auto:  默认值，计算对象会马上创建
     *          同步计算会马上读取以收集依赖
     *          主要差别在于异步计算如果指定了initial初始化值，则在初始化时不会执行
     *
     * @default 'auto'
     *
     */
    lazy?: boolean;
    /**
     * 是否启用计算
     *
     * @description
     *
     * 当enableComputed=false时，会创建计算属性，但不会执行计算函数
     * 可以通过enableComputed方法启用
     *
     * 相当于全局计算总开关
     *
     *
     *
     */
    enableComputed?: boolean;
    /**
     * 路径分隔符,默认是`.`
     */
    delimiter?: string;
    /**
     * 获取计算函数的根scope
     *
     * @description
     *
     * 计算函数在获取scope时调用，允许修改其根scope
     *
     * 默认指向的是当前根对象，此处可以修改其指向
     *
     * 比如,return  state.fields，代表计算函数的根指向state.fields
     * 这样在指定依赖时，如depends="count"，则会自动转换为state.fields.count
     *
     */
    getRootScope?: (state: State, options: {
        observerType: ObserverType;
        valuePath: string[] | undefined;
    }) => any;
    /**
     *
     * 为所有动态值对象提供默认的scope参数
     *
     * @description
     * 默认情况下，所有computedObject,watchObject的scope参数均为CURRENT
     * 可以通过此参数来为所有的computedObject,watchObject提供默认的scope参数
     * 比如让所有的computedObject,watchObject的默认scope参数均为ROOT
     *
     */
    scope?: ComputedScope;
    /**
     * 当启用debug=true时用来输出日志信息
     *
     * @param message
     * @param level
     * @returns
     */
    log?: (message: any, level?: "info" | "error" | "warn") => void;
    /**
     * 启用重置功能
     *
     * @description
     *
     * 当启用resetable=true时，会记录数据的首次变化，然后在store.reset()方法调用时，将数据恢复到初始状态
     *
     */
    resetable?: boolean;
    /**
     * 计算函数是否允许重入
     */
    reentry?: boolean;
    /**
     *
     * 当创建计算属性时调用
     *
     * @description
     *
     * 允许在此对计算对象进行一些处理，比如重新封装getter函数，或者直接修改ComputedOptions
     *
     * @example
     *
     * createStore({...},{
     *  onCreateComputed(computedObject){
     *      const oldGetter = computedObject.getter
     *      computedObject.getter = function(){
     *          do something
     *          return oldGetter.call(this,...arguments)
     *      }
     *  }
     * })
     * @param this
     * @param computedObject
     * @returns
     */
    onComputedCreated?: (this: AutoStore<State>, computedObject: ComputedObject) => void;
    /**
     * 当每一次计算完成后调用
     * @param this
     * @param computedObject
     * @returns
     */
    onComputedDone?: (this: AutoStore<State>, args: {
        id: string;
        path: string[];
        value: any;
        computedObject: ComputedObject;
    }) => void;
    /**
     * 当计算出错时调用
     * @param this
     * @param error
     * @param computedObject
     * @returns
     */
    onComputedError?: (this: AutoStore<State>, args: {
        id: string;
        path: string[];
        error: Error;
        computedObject: ComputedObject;
    }) => void;
    /**
     * 当每一次计算对象被取消时调用
     * 仅在异步计算时有效
     * @param this
     * @param computedObject
     * @returns
     */
    onComputedCancel?: (this: AutoStore<State>, args: {
        id: string;
        path: string[];
        reason: "timeout" | "abort" | "reentry" | "error";
        computedObject: ComputedObject<any>;
    }) => void;
    onObserverBeforeCreate?: (this: AutoStore<State>, descriptor: ObserverDescriptor<any, any, any>) => void;
    /**
     *
     * 当创建观察对象实例化时调用
     *
     * 一般可以在此对ObserverObject进行一些处理
     * 比如重新封装run函数等
     *
     */
    onObserverCreated?: (this: AutoStore<State>, observerObject: ObserverObject<any, any>) => void;
    /**
     *
     *
     *
     * 当状态值是一个函数时，创建对应的可观察对象前调用
     *
     * 即第一次读取时调用，
     *
     * 返回false则不创建对应的可观察对象，将函数标志为raw
     *
     */
    onObserverInitial?: (this: AutoStore<State>, path: string[], value: any, parent: any) => boolean | undefined;
    /**
     *
     * 获取影子store
     * 为所有observer对象提供store对象
     *
     */
    getShadowStore?: () => AutoStore<any>;
    /**
     * 默认的値模式
     */
    defaultSchema?: Partial<AutoStoreStateSchema<any>>;
    /**
     *
     * 校验失败时的默认行为
     *
     * - throw: 默认，触发ValidateError错误
     * - throw-pass： 继续写入,然后再触发ValidateError错误
     * - pass: 继续写入,不抛出错误
     * - ignore: 静默忽略，即不触发错误，也不写入
     *
     * 错误信息均会写入到errors中
     *
     * 当校验函数返回 false 或抛出错误时，使用此选项决定如何处理
     * 可被校验函数抛出的 ValidateError.behavior 覆盖
     *
     */
    onInvalid?: "pass" | "throw" | "ignore" | "throw-pass";
    /**
     * 当写入时状态时执行此校验函数
     *
     * 允许throw new ValidateError('错误信息')来提供错误信息
     *
     */
    validate?: (this: AutoStore<State>, newValue: any, oldValue: any, path: string[]) => boolean;
    /**
     * 为指定的路径的状态值单独指定一个校验函数
     * 优先于onValidate
     *
     * 如:
     *
     * validators:{
     *     'order.price':(newValue,oldValue)=>{
     *         return newValue>0
     *     }
     *     // 允许使用通配符来匹配多个路径
     *     'order.*.price':(newValue,oldValue)=>{
     *         return newValue>0
     *     }
     * }
     *
     */
    validators?: Record<string, StateValidator<State>>;
    /**
     * 提供一个配置管理器对象
     */
    configManager?: ConfigManager | ConfigSource | boolean;
    /**
     * 为当前Store的所有配置项均指定一个统一的前缀
     */
    configKey?: string;
    /**
     *
     * 当启用时，如果值是一个字符串，并且以```xxx```形式，代表这是一个表达式
     * 则会创建一个代码执行沙箱运行并返回值
     *
     * 注意：
     *    仅在lazy=false时在实例化时才会对字符串表达式进行解释执行
     * 后续读取时不会执行此操作
     *
     * @example
     *
     *
     */
    enableValueExpr?: boolean;
    /**
     * 沙箱配置选项
     *
     * @description
     *
     * 当 enableValueExpr=true 时，用于配置代码执行沙箱的行为
     */
    sandbox?: {
        /**
         * 用于创建一个代码执行沙箱
         *
         * 可选的，如果没有提供时，会提供一个简单的基于new Function的沙箱
         *
         * @returns
         */
        create?: (context: Record<string, any>, options?: CreateSandboxOptions) => (code: string) => any;
        /**
         * 为代码执行沙箱中的代码提供额外的上下文
         */
        context?: Record<string, any>;
    };
    /**
     * 提供额外的引用store，可以在computed或watch中使用ref引用其他store状态值
     * 并且在引用状态值变化时自动重新执行observerObject.run
     */
    refStore?: AutoStore<any>;
}
type UpdateOptions = {
    /**
     * 执行批量更新操作，期间不会触发事件，等更新函数执行后再触发batch事件
     *  =false 不执行批量更新操作
     *  =true  执行批量更新操作，批量更新事件名称为__batch_update__
     *  <string> 执行批量更新操作，批量更新事件名称为指定的字符串
     */
    batch?: boolean | string;
    /**
     * 执行更新操作时，静默，不会触发任何事件
     *
     */
    silent?: boolean;
    /**
     *
     * 更新时执行校验的模式
     * - none    不进行校验，即不执行校验函数
     * - pass    校验失败时放行，即进行更新
     * - ignore  校验失败时忽略更新操作，不进行更新
     * - throw   校验失败时抛出异常 (默认)
     *
     * 更新时的校验行为
     * 用于在调用store.update时强制校验行为
     * 比如
     *
     *  store.update(state=>{
     *     state.count=1
     *  },{
     *     validate:'none'
     * })
     *
     * 以上当写入count时不会执行任意校验行为
     *
     */
    onInvalid?: "none" | "pass" | "throw" | "ignore" | "throw-pass";
    /**
     * 执行读取操作时，不会触发GET事件
     * 即偷听
     */
    peep?: boolean;
    /**
     * 在批量更新结束后，会自动回放update(()=>{...})之间的所有操作事件
     * 然后再触发一个__batch_update__事件
     *
     * @description
     *
     * =true 默认会回放所有操作事件
     * =false 不会回放操作事件,仅会触发__batch_update__事件
     */
    reply?: boolean;
    /**
     * 额外的更新标识
     * 用在执行更新操作时传递额外的标识
     *
     * store.update(()=>{...},{flags:8})
     *
     * 在update期间触发的事件operate中会包含此值，可以通过operate.flags获取到此值
     *
     */
    flags?: number;
};
type StateTracker = {
    stop: () => void;
    start(isStop?: (operate: StateOperate) => boolean): Promise<StateOperate[]>;
};
type StoreSyncer = {
    on: () => void;
    off: () => void;
};
type StoreSyncOptions = {
    from?: string;
    to?: string;
    filter?: (this: AutoStore<any>, operate: StateOperate) => boolean;
    immediate?: boolean;
    direction?: "both" | "forward" | "backward";
    pathMap?: {
        from: (path: string[], value: any) => string[] | undefined;
        to: (path: string[], value: any) => string[] | undefined;
    };
};
type AutoStoreEvents = TransformedEvents<{
    load: AutoStore<any>;
    unload: AutoStore<any>;
    reset: string | undefined;
    "computed:created": ComputedObject;
    "computed:done": {
        id: string;
        path: string[];
        value: any;
        computedObject: ComputedObject;
    };
    "computed:error": {
        id: string;
        path: string[];
        error: any;
        computedObject: ComputedObject;
    };
    "computed:cancel": {
        id: string;
        path: string[];
        reason: "timeout" | "abort" | "reentry" | "error";
        computedObject: ComputedObject;
    };
    "watch:created": WatchObject;
    "watch:done": {
        value: any;
        watchObject: WatchObject;
    };
    "watch:error": {
        error: any;
        watchObject: WatchObject;
    };
    "observer:beforeCreate": ComputedDescriptor;
    "observer:created": ObserverObject<any, any>;
    "observer:done": ObserverDescriptor<any, any, any>;
    validate: {
        path: string[];
        newValue: any;
        oldValue: any;
        error: string | undefined;
    };
}>;
type EventDefines = {
    [key: string]: any;
};
type StoreRawStateType<Store extends AutoStore<any>> = Store["types"]["rawState"];

type WatchListener<Value = any, Parent = any> = (operate: StateOperate<Value, Parent>) => void;
type WatchListenerOptions = {
    once?: boolean;
    operates?: "*" | "read" | "write" | StateOperateType[];
    filter?: (args: StateOperate) => boolean;
};
type Watcher = FastEventSubscriber;
type WatchDependFilter<Value = any> = (path: string[], value: Value) => boolean;
interface WatchOptions<Value = any> extends ObserverOptions<Value> {
    async?: false;
    filter: WatchDependFilter<Value>;
    raw?: boolean;
}
type WatchScope<Value = any> = {
    path: string[];
    value: Value;
};
type WatchGetter<Value = any, DependValue = any> = (scope: {
    path: string[];
    value: DependValue;
}, options: {
    self: WatchObject<Value>;
    ref: RefState;
}) => Exclude<Value, Promise<any>>;
type WatchDescriptor<Value = any, DependValue = any> = ObserverDescriptor<"watch", Value, WatchScope<DependValue>, WatchGetter<Value, DependValue>, WatchOptions<Value>>;
/**
 * @template Value  监听函数的返回值类型
 * @template Scope 监听函数的第一个参数的类型
 */
type WatchDescriptorBuilder<Value = any, DependValue = any> = ObserverDescriptorBuilder<"watch", Value, WatchScope<DependValue>, WatchDescriptor<Value, DependValue>>;

type ObserverType = "watch" | "computed" | "schema";
declare enum ObserverScopeRef {
    Root = "ROOT",
    Current = "CURRENT",
    Parent = "PARENT",
    Depends = "DEPENDS",// 指向依赖数组
    Self = "SELF"
}
type ObserverDependMatcher<Value = any> = (path: string[], value: Value) => boolean;
type ObserverDepends = (string | string[])[];
type ObserverScope = string | string[] | "SELF" | "CURRENT" | "ROOT" | "PARENT";
type ObserverDescriptorGetter<Value, Scope> = ((scope: Scope, args: any) => Value) | ((scope: Scope, args: any) => Promise<Value>);
interface ObserverDescriptor<T extends string, Value, Scope, Getter = ObserverDescriptorGetter<Value, Scope>, Options extends ObserverOptions<Value> = ObserverOptions<Value>> {
    type: T;
    getter: Getter;
    options: Options;
}
type AnyObserverDescriptor = ObserverDescriptor<any, any, any, any, any>;
interface ObserverDescriptorBuilder<Type extends string = string, Value = any, Scope = any, descriptor extends ObserverDescriptor<Type, Value, Scope> = ObserverDescriptor<Type, Value, Scope>> {
    (): descriptor;
    [OBSERVER_DESCRIPTOR_BUILDER_FLAG]: true;
}
type ObserverOptions<Value = any, Schema extends Dict = Dict> = {
    /**
     * 计算函数的唯一标识，如果未指定，则自动生成一个唯一标识
     */
    id?: string;
    /**
     * 计算属性的初始化值
     */
    initial?: Value;
    /**
     * 计算属性的作用域
     *
     * @description
     *
     * 用来指定计算函数的第一个参数，即计算函数的作用范围
     *
     * 默认值：current，指向的是计算属性所在对象
     *
     */
    scope?: ObserverScope;
    /**
     * 计算开关
     * 当=false时不会执行计算，也就是不会执行计算函数
     *
     */
    enable?: boolean;
    /**
     *
     * 是否是异步计算函数
     *
     * 默认情况下，通过typeof(fn)=="async function"来判断是否是异步计算函数
     * 但是在返回Promise或者Babel转码等情况下，判断会失效时，需要手动指定async=true
     */
    async?: boolean;
    /**
     * 指定该计算属性的依赖路径
     *
     * @description
     *
     * 支持绝对路径和相对路径
     *
     * - 绝对路径：
     *
     *   以/开头，代表绝对路径,
     *    /字符是可选的，如果省略/字符，则默认为绝对路径
     *
     *   如：/a.b.c 表示根对象的a.b.c属性
     *   如：/a 表示根对象的a属性     *
     *   如  a.b.c 等效于 /a.b.c
     *
     * - 相对路径：
     *   以./或者../开头，代表相对路径
     *  ./指的相对当前对象，../指的是父对象
     * ../a.b.c表示父对象的a.b.c属性
     * ../../a 表示父对象的父对象的a属性
     *
     *
     *
     * 注意：在异步计算属性时需要手工指定依赖，因为无法自动分析依赖
     * 同步计算时不需要指定依赖，因为可以自动分析依赖
     
     *
    */
    depends?: ObserverDepends;
    /**
     * 为该计算函数指定一个分组名
     *
     * @description
     *
     * 此属性用来将计算函数分组，比如一个store中具有相同group的计算函数
     * 然后就可以启用/关闭/运行指定分组的计算函数
     * 在表单中通过为所有validate指定统一的分组名称，这样就可以统一控制表单的验证是否计算
     *
     * store.computedObjects.get(["a","b"]).run() // 重新启动
     * 马上重新运行指定组的计算函数
     * store.computedObjects.getGroup("a"]).run() // 运行组
     * store.computedObjects.enableGroup("b"])
     *
     */
    group?: string;
    /**
     *
     * 是否保存创建的computedObject对象
     *
     * @description
     * 默认情况下，每一个计算属性均会创建一个computedObject对象实便并且保存到store.computedObjects中
     *
     * 默认=true,=false则不会保存
     *
     */
    objectify?: boolean;
    /**
     * 当执行计算函数时，如果出错时，是否抛出错误，
     * 默认为true，即抛出错误
     * =false，则不会抛出错误，但是可以通过.error属性获取错误信息
     */
    throwError?: boolean;
    /**
     * 提供额外的元数据用于标识该属性
     * 比如配置元数据等
     */
    schema?: Schema;
    /**
     * 提供额外的引用store，可以在computed或watch中使用ref引用其他store状态值
     * 并且在引用状态值变化时自动重新执行observerObject.run
     */
    refStore?: AutoStore<any>;
};
type ObserverBuilder<Value = any, Scope = any> = ComputedDescriptorBuilder<Value, Scope> | ComputedGetter<Value, Scope> | AsyncComputedGetter<Value, Scope> | WatchDescriptorBuilder<Value>;

/**
 *
 * 在signal的基础上提供计算属性功能
 *
 * const signal = createSignal({
 *      name:'zhangsan',
 *      price: 13,
 *      count: 2,
 *      total: (data){
 *          return data.price * data.count
 *      }
 * })
 *
 *
 *
 *
 */

/**
 * 同步计算属性配置参数
 */
interface ComputedGetterArgs {
    /**
     * @description
     * 第一次运行为true
     */
    first?: boolean;
    /**
     * 发生变化的依赖信息
     *
     */
    operate?: StateOperate;
    ref: RefState;
}
type ComputedGetter<Value, Scope = any> = (scope: Scope, args: Required<ComputedGetterArgs>) => Exclude<Value, Promise<any>>;
interface ComputedProgressbar {
    value: (num: number) => void;
    end: () => void;
}
interface AsyncComputedGetterArgs {
    /**
     *  获取一个进度条，用来显示异步计算的进度
     * @param opts
     * @returns
     */
    getProgressbar?: (opts?: {
        max?: number;
        min?: number;
        value?: number;
    }) => ComputedProgressbar;
    /**
     * 当计算函数启用超时时，可以指定一个cb，在超时后会调用此函数
     * @param cb
     * @returns
     */
    onTimeout?: (cb: () => void) => void;
    /**
     *
     * 提供一个函数用来获取当前Scope的快照
     * 传入的scope是一个经过Proxy处理的响应式对象，此方法可以对scope进行转换为普通对象
     */
    getSnap?: <T = Dict>(scope: any) => T;
    /**
     * 在执行计算函数时，如果传入AbortController.signal可以用来传递给异步计算函数，用来取消异步计算
     * 例如：fetch(url,{signal:signal})
     */
    abortSignal: AbortSignal;
    /**
     * 用来取消操作正在执行的异步计算函数
     * 异步函数可以通过此方法来取消异步计算
     *
     * @returns
     */
    cancel: () => void;
    /**
     * 额外的参数，用来传递给计算函数
     */
    extras?: any;
    /**
     * 触发计算的操作
     */
    operate?: StateOperate;
    /**
     * 是否是第一次运行
     */
    first?: boolean;
    /**
     * 引用关联Store状态值，并在状态值变更重新执行计算函数
     * 仅在confiturable中生效
     */
    ref: RefState;
}
type AsyncComputedGetter<Value, Scope = any> = (scope: Scope, args: Required<AsyncComputedGetterArgs>) => Promise<Value>;
type RequiredComputedOptions<Value = any> = Required<ComputedOptions<Value>>;
/**
 *
 * 运行时计算属性配置参数，用来传递给计算对象的run方法的参数
 *
 * 当调用计算属性对象的run方法时，可以传入此参数用来覆盖默认的配置参数
 *
 */
type RuntimeComputedOptions = ComputedOptions & {
    first?: boolean;
    operate?: StateOperate;
};
type SyncRuntimeComputedOptions = SyncComputedOptions & {
    first?: boolean;
    operate?: StateOperate;
};
type Computed<T> = (...args: any) => Exclude<T, Promise<any>>;
type AsyncComputed<T = any> = (...args: any) => Promise<T>;
/**
 * 指定Store中计算函数的上下文,如果是字符串代表是当前对象的指定键，如果是string[]，则代表是当前Store对象的完整路径
 * 当ComputedContext是一个字符串并且以@开头时，有个特殊含义，即是一个路径指向：
 * 如：{fields:{ user:"address",address:"user" }}，如果scope=@user，代表的当前scope对象指向的user属性的值所指向的对象，在这里实质传入的是address
 */
type ComputedScope = ObserverScopeRef | string | string[] | ((computedObject: ComputedObject) => string | string[] | ObserverScopeRef);
/**
 * 计算属性的依赖路径
 *
 * 规则如下：
 *
 * - 以/开头，代表绝对路径,/字符是可选的，如果省略/字符，也表示绝对路径
 * - 以./开头，代表相对路径,相对的是当前路径
 * - 以../开头，代表相对路径,相对的是父路径
 * - ROOT: 代表根路径
 * - CURRENT: 代表当前路径
 * - PARENT: 代表父路径
 * - SELF: 代表自身
 * - 不以/,./,../开头的任意字符串，代表绝对路径
 * - 路径使用.作为分割符
 *
 * 特别注意:
 *
 * 当相对路径时，指的相对的是当前路径所在的对象的路径，而不是当前路径
 *
 * 比如
 *
 * curPath=['a','b','c','d']
 *
 * 则 ./ 代表的是 a.b.c，而不是 a.b.c.d,也就是说，相对路径是不包含自身的
 * 因此./x 代表的是 a.b.c.x，而不是 a.b.c.d.x
 *
 *
 */
type ComputedDepend = "CURRENT" | "ROOT" | "PARENT" | `/${string}` | `./${string}` | `../${string}` | string | string[];
type ComputedDepends = ComputedDepend[];
interface ComputedOptions<Value = any, Scope = any, Schema extends Dict = Dict> extends ObserverOptions<Value, Schema> {
    /**
     *
     * 计算函数的执行超时时间
     *
     * @description
     * 指定超时时间，当计算函数执行超过指定时间后，会自动设置loading为false
     * 如果timeout是一个数组，则第一个值表示超时时间，第二个值表示超时期的倒计时间隔
     * 例如：[1000,10]表示1000ms代表1s后超时并置loading=false
     * 10代表setInterval(1000/100), 每次执行时-1，直到为0时停止
     * 这样就可以通过绑定timeout值来实现倒计时的效果
     * 如果要实现60秒倒计时，可以这样写：[60*1000,60],这样value.timeout就会从60开始递减
     */
    timeout?: number | [number, number];
    /**
     *
     * 针对异步计算属性是否马上执行一次计算
     *
     * @description
     * true: 在创建异步计算时马上执行一次
     * false: 在创建异步计算时不马上执行一次，后续仅在依赖变化时执行
     * auto: 当initial==undefined时会马上执行一次，initial!=undefined不会马上执行一次，因为该计算属性已经有初始化了
     *
     * 同步计算没有此问题
     *
     *
     */
    immediate?: "auto" | boolean;
    /**
     * 计算函数是否允许重入执行
     *
     * 默认为true，即允许重入执行
     *
     */
    reentry?: boolean;
    /**
     * 提供一个异步信号，用来传递给异步计算函数以便可以取消异步计算
     *
     * @description
     *
     * 仅在异步计算函数中有效
     *
     */
    abortController?: () => AbortController | undefined;
    /**
     * 当计算函数执行出错时的重试次数
     *
     * @description
     *
     * retry:3  表示最多重试3次,重试间隔为0，加上第1次执行，总共执行4次
     * retry:[3,1000] 表示最多重试3次，重试间隔为1000ms，加上第1次执行，总共执行4次
     *
     * 重试数据可以通过AsyncComputedObject.retry获取
     * 当首次执行失败时触发重试，此时AsyncComputedObject.retry=3，然后每次重试-1，直到为0时停止重试
     * 可以在UI中通过AsyncComputedObject.retry来实时显示重试次数
     *
     */
    retry?: number | [number, number];
    /**
     * 额外的参数
     */
    extras?: any;
    /**
     * 当执行计算getter函数出错时的回调，如果返回值==undefined，则返回值会作为出错时的计算结果
     *
     * @description
     *
     * 比如，有一个validate计算属性，其类型是true/false
     * 当计算出错时抛出异常，此时就可以返回false, 这样就可以实现当计算出错时，validate返回false
     *
     */
    onError?: (e: Error) => any;
    /**
     * 当计算完成后的回调函数
     */
    onDone?(args: {
        id: string;
        error: Error | undefined;
        timeout: boolean;
        abort: boolean;
        path: string[] | undefined;
        scope: Scope;
        value: any;
    }): void;
    /**
     * 在计算前后向指定路径的状态写入额外值
     *
     */
    reports?: {
        /**
         * 在计算前后向loading指定状态写入true/false用于反馈
         *
         * 如loading=["./loading"]，则在开始计算前往当前计算属性所在的对象的loading=true
         *  计算完成后置loading=false
         *
         */
        loading?: string | string[];
        /**
         * 在计算出错时向指定路径写入错误信息
         */
        error?: string | string[];
    };
    /**
     * 默认情况下，计算结果也会进行响应式处理
     * 通过显式指定raw=true，可以标识为非响应式
     *
     * 例:
     *
     * const store = new AutoStore({
     *    book:computed(()=>{
     *        return {
     *           name:"AutoStore",
     *           price:100
     *        }
     *    })
     * })
     *
     * book是一个响应式对象，即通过Proxy代理，允许通过store.watch("book.name")来监听变化
     *
     * 如果，指定raw=true，则会使用markRaw包裹book，book将不再Proxy，也就无法store.watch("book.name")来监听变化
     *
     * 此参数在计算结果是一个大型对象，且无需代理整个对象时能提高性能。
     *
     *  book:computed(()=>{
     *        return {
     *           name:"AutoStore",
     *           price:100
     *        }
     *    },{ raw:true})
     *
     * 等效于 markRaw(store.state.book)
     *
     */
    raw?: boolean;
}
type LiteComputedOptions<Value = any, Scope = any, Schema extends Dict = Dict> = ObserverOptions<Value, Schema> & Pick<ComputedOptions<Value, Scope, Schema>, "reports" | "onDone" | "onError" | "extras" | "immediate" | "reentry">;
type AsyncComputedValue<Value = any> = {
    loading: boolean;
    progress: number;
    timeout: number;
    error: any;
    retry: number;
    value: Value;
    run: (options?: RuntimeComputedOptions) => void;
    cancel: () => void;
};
type SyncComputedOptions<Value = any, Scope = any> = Pick<ComputedOptions<Value, Scope>, "id" | "enable" | "onError" | "onDone" | "depends" | "initial" | "objectify" | "group" | "scope" | "extras" | "refStore">;
/**
 * 计算属性所在的位置
 */
type ComputedContext<Value = any> = {
    path: string[];
    value: Value;
    parentPath: string[];
    parent: any;
};
type ComputedSyncReturns<T = any> = (...args: any) => Exclude<T, Promise<any>>;
/**
 * 返回函数的返回值类型
 * 支持返回()=>Promise<R>中的R类型
 */
type AsyncReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer R> ? R : T extends (...args: any) => infer R ? R : any;
type SyncComputedDescriptor<Value = any, Scope = any> = ObserverDescriptor<"computed", Value, Scope, ComputedGetter<Value, Scope>, ComputedOptions<Value, Scope>>;
type SyncComputedDescriptorBuilder<Value = any, Scope = any> = ObserverDescriptorBuilder<"computed", Value, Scope, SyncComputedDescriptor<Value, Scope>>;
interface AsyncLiteComputedGetterArgs {
    /**
     * 提供一个函数用来获取当前Scope的快照
     * 传入的scope是一个经过Proxy处理的响应式对象，此方法可以对scope进行转换为普通对象
     */
    getSnap?: <T = Dict>(scope: any) => T;
    /**
     * 额外的参数，用来传递给计算函数
     */
    extras?: any;
    /**
     * 触发计算的操作
     */
    operate?: StateOperate;
    /**
     * 是否是第一次运行
     */
    first?: boolean;
    /**
     * 引用关联Store状态值，并在状态值变更重新执行计算函数
     * 仅在confiturable中生效
     */
    ref: RefState;
}
type AsyncLiteComputedGetter<Value, Scope = any> = (scope: Scope, args: Required<AsyncLiteComputedGetterArgs>) => Promise<Value>;
type AsyncLiteComputedDescriptor<Value = any, Scope = any> = ObserverDescriptor<"computed", Value, Scope, AsyncLiteComputedGetter<Value, Scope>, ComputedOptions<Value, Scope>> & {
    liteAsync: boolean;
};
type AsyncLiteComputedDescriptorBuilder<Value = any, Scope = any> = ObserverDescriptorBuilder<"computed", Value, Scope, AsyncLiteComputedDescriptor<Value, Scope>>;
type AsyncComputedDescriptor<Value = any, Scope = any> = ObserverDescriptor<"computed", Value, Scope, AsyncComputedGetter<Value, Scope>, ComputedOptions<Value, Scope>>;
type AsyncComputedDescriptorBuilder<Value = any, Scope = any> = ObserverDescriptorBuilder<"computed", Value, Scope, AsyncComputedDescriptor<Value, Scope>>;
type ComputedDescriptor<Value = any, Scope = any> = SyncComputedDescriptor<Value, Scope> | AsyncLiteComputedDescriptor<Value, Scope> | AsyncComputedDescriptor<Value, Scope>;
type ComputedDescriptorBuilder<Value = any, Scope = any> = SyncComputedDescriptorBuilder<Value, Scope> | AsyncLiteComputedDescriptorBuilder<Value, Scope> | AsyncComputedDescriptorBuilder<Value, Scope>;
type ComputedDescriptorParameter<Value = any, Scope = any> = ComputedDescriptorBuilder<Value, Scope> | ComputedGetter<Value, Scope> | AsyncComputedGetter<Value, Scope> | AsyncLiteComputedGetter<Value, Scope>;
type ComputedBuilder<Value, Scope> = ComputedDescriptorBuilder<Value, Scope> | AsyncComputedGetter<Value, Scope> | AsyncLiteComputedGetter<Value, Scope> | ComputedGetter<Value, Scope>;

/**
 * 用来封装状态的计算函数，使用计算函数的传入的是当前对象
 *
 *
 * @param getter
 * @param depends
 * @param options
 * @returns
 *
 */
declare function computed<Value = any, Scope = any>(getter: AsyncComputedGetter<Value, Scope>, depends: ComputedDepends, options?: ComputedOptions<Value, Scope>): AsyncLiteComputedDescriptorBuilder<Value, Scope>;
declare function computed<Value = any, Scope = any>(getter: ComputedGetter<Value, Scope>, options?: SyncComputedOptions<Value, Scope>): SyncComputedDescriptorBuilder<Value, Scope>;

/**
 * 同步计算
 */

/**
 *
 * 同步计算属性对象
 *
 */
declare class SyncComputedObject<Value = any, Scope = any> extends ComputedObject<Value> {
    get async(): boolean;
    /**
     * 同步计算属性对象在初始化时，会通过运行来自动收集依赖
     */
    onInitial(): void;
    /**
     *
     * 当计算属性的依赖发生变化时，重新计算计算属性的值
     *
     * @param args  可以覆盖默认的配置参数
     * @returns
     */
    run(options?: SyncRuntimeComputedOptions): void;
    private onDone;
    /**
     * 自动收集同步依赖
     *
     * 如果计算函数是一个同步函数，则可以通过运行函数来收集依赖
     *
     * 收集依赖时的注意事项：
     *
     
     * (scope)=>{
     *    scope.user.firstName+scope.user.lastName
     * }
     * 以上会产生对user对象的读取,得到的依赖是['user.firstName','user.lastName','user']
     *
     *
     */
    private collectDependencies;
    /**
     * 当依赖发生变化时调用
     * @param event
     */
    protected onDependsChange(event: StateOperate): void;
}

declare class AsyncComputedObject<Value = any, Scope = any> extends ComputedObject<AsyncComputedValue<Value>> {
    private _isRunning;
    private _defaultAbortController;
    private _userAbortController?;
    private _firstRun;
    /**
     * 用于标识这是一个简单计算对象
     *
     * 不同于全功能异步计算对象
     *
     */
    lite: boolean;
    get async(): boolean;
    get value(): AsyncComputedValue<Value>;
    set value(value: AsyncComputedValue<Value>);
    get running(): boolean;
    /**
     * 本方法用来处理配置参数
     * 主要
     * @param options
     */
    protected onInitOptions(options: Required<RuntimeComputedOptions>): void;
    protected onInitial(): void;
    private createAsyncComputedValue;
    /**
     *
     * 局部更新计算属性的值
     *
     */
    private updateComputedValue;
    /**
     *
     * 运行计算函数
     *
     */
    run(options?: RuntimeComputedOptions): Promise<void>;
    /**
     * computed(async (scope,{getProgressbar})=>{
     *    const pbar = getProgressbar({max:100,min:0}) // 初始值
     *    pbar.value(12)      // 修改进度值
     *    pbar.end()          // 结束进度条
     * })
     *
     * @param init
     * @returns
     */
    private createComputeProgressbar;
    /**
     *
     * AbortController是一个用于控制一个或多个请求的AbortSignal对象的生命周期的对象
     *
     *
     * - 整个异步对象只有一个默认的AbortController对象，仅当用户调用cancel方法时才会使用
     *
     * ，当用户指定了abortController选项时，会使用用户指定的AbortController对象
     *
     *
     *
     * @param options
     * @returns
     */
    private getAbortController;
    /**
     * 处理超时
     * @param timeoutCallback
     * @param options
     * @returns
     */
    private setTimeoutControl;
    /**
     * 执行计算函数
     *
     */
    private executeGetter;
    /**
     * 当计算属性操作完成时的回调函数
     *
     * 此函数负责在计算属性操作完成后，根据操作的执行状态调用用户定义的回调函数
     * 它会传递操作的结果、错误状态、是否中止以及是否超时等信息给回调函数
     *
     * @param options - 计算属性的运行时选项，被强制转换为Required类型，确保所有选项都是必需的
     * @param error - 如果操作过程中发生错误，该错误对象将被传递
     * @param abort - 一个布尔值，表示操作是否被中止
     * @param timeout - 一个布尔值，表示操作是否因超时而结束
     * @param scope - 操作执行的上下文或范围
     * @param value - 操作的结果，如果操作成功完成
     */
    private onDoneCallback;
    protected onDependsChange(params: StateOperate): void;
    /**
     *
     * 由于异步计算是一个对象，所以我们需要侦听的是对象的变化，而不仅是对象的值
     *
     */
    protected getValueWatchPath(): string[];
    /**
     * 由于所有异步计算属性均会被转换为一个AsyncComputedValue<{value,timeout,....}>的形式
     * 这样，当我们在指定一个依赖是异步属性时，就需要指定为xxxx.value才可以个侦听到变化
     *
     * @example
     * const store = new AutoStore({
     *            a0: 1,
     *            a1: computed(async (scope:any)=>{
     *              return scope.a0 + 1
     *            },["a0"],{initial:2}),
     *            a2: computed(async (scope:any)=>{
     *              return scope.a1.value + 1
     *            },["a1.value"],{initial:3})
     *        });
     *
     *  以上a2依赖于a1，由于a1是一个异步对象，所以在写依赖时就必须写上["a1.value"]
     *  这就有点反直觉了。
     *
     * 本函数在异步计算对象订阅变更事件时调用，用来返回字符串形式的依赖数组
     *
     * 本函数的功能就是对所有依赖进行判断如果其是一个异步计算依赖，则自动添加.value，这样就可以如下方式来写依赖了
     *
     * 	const store = new AutoStore({
     *            a0: 1,
     *            a1: computed(async (scope:any)=>{
     *              return scope.a0 + 1
     *            },["a0"],{initial:2}),
     *            a2: computed(async (scope:any)=>{
     *              return scope.a1.value + 1
     *            },["a1"],{initial:3})
     *        });
     *
     */
    protected getDepends(): string[][];
}

/**
 * 用来封装状态的计算函数，使用计算函数的传入的是当前对象
 *
 *
 * @param getter
 * @param depends
 * @param options
 * @returns
 *
 */
declare function asyncComputed<Value = any, Scope = any>(getter: AsyncComputedGetter<Value, Scope>, depends: ComputedDepends, options?: ComputedOptions<Value, Scope>): AsyncComputedDescriptorBuilder<Value, Scope>;

declare class AsyncLiteComputedObject<Value = any, Scope = any> extends ComputedObject<Value, ComputedOptions> {
    private _isRunning;
    private _firstRun;
    lite: boolean;
    get async(): boolean;
    get running(): boolean;
    protected onInitial(): void;
    /**
     *
     * 运行计算函数
     *
     */
    run(options?: RuntimeComputedOptions): Promise<void>;
    /**
     * 执行计算函数
     *
     */
    private executeGetter;
    /**
     * 当计算属性操作完成时的回调函数
     *
     * 此函数负责在计算属性操作完成后，根据操作的执行状态调用用户定义的回调函数
     * 它会传递操作的结果、错误状态、是否中止以及是否超时等信息给回调函数
     *
     * @param options - 计算属性的运行时选项，被强制转换为Required类型，确保所有选项都是必需的
     * @param error - 如果操作过程中发生错误，该错误对象将被传递
     * @param abort - 一个布尔值，表示操作是否被中止
     * @param timeout - 一个布尔值，表示操作是否因超时而结束
     * @param scope - 操作执行的上下文或范围
     * @param value - 操作的结果，如果操作成功完成
     */
    private onDoneCallback;
    protected onDependsChange(params: StateOperate): void;
    /**
     *
     * 由于异步计算是一个对象，所以我们需要侦听的是对象的变化，而不仅是对象的值
     *
     */
    protected getValueWatchPath(): string[];
}

/**
 * import { v } from "autostore"
 *
 * const store = new AutoStore({
 *    price: v.number(100,(val)=>val>0 && val<100,{
 *        title:'价格',
 *        tips:'价格必须大于0小于100',
 *        errorTips:'价格必须大于0小于100',
 *
 *    })
 *    count: v.number(100,(val)=>val>0,'价格')
 *
 *    })
 * })
 *
 * store.validators
 *
 * const priceValidator = store.validators.add("order.price",)
 *
 * priceValidator.title
 *
 *
 *
 * (store.state.price)
 *
 */

declare function schema<Value>(initial: Value): SchemaDescriptorBuilder<Value>;
declare function schema<Value, W extends keyof AutoStoreWidgets>(initial: Value, schema: Omit<AutoStateSchemaBase<Value>, "value"> & {
    widget: W;
} & WidgetConfigPrecise<W>): SchemaDescriptorBuilder<Value, W>;
declare function schema<Value>(initial: Value, schema: Omit<AutoStateSchemaBase<Value>, "value" | "widget"> & {
    widget?: never;
}): SchemaDescriptorBuilder<Value>;
declare const configurable: typeof schema;
declare function createTypeSchemaBuilder<Value = any>(isValid: (val: any) => boolean, defaultTips: string): SchemaBuilder<Value>;
declare const schemas: {
    number: SchemaBuilder<number>;
    string: SchemaBuilder<string>;
    boolean: SchemaBuilder<boolean>;
    date: SchemaBuilder<Date>;
    bigint: SchemaBuilder<bigint>;
    array: SchemaBuilder<any[]>;
    object: SchemaBuilder<object>;
};
declare const s: {
    number: SchemaBuilder<number>;
    string: SchemaBuilder<string>;
    boolean: SchemaBuilder<boolean>;
    date: SchemaBuilder<Date>;
    bigint: SchemaBuilder<bigint>;
    array: SchemaBuilder<any[]>;
    object: SchemaBuilder<object>;
};

/**
 * 标记一个对象为非响应式，不创建响应式代理
 *
 * @param obj
 * @returns
 */
declare function isRaw(obj: any): boolean;

/**
 *  判定两个值是否相等
 *
 *  如果两个值都是对象，则判断两个对象是否相等
 * 如果两个值都是数组，则判断两个数组的值是否相等
 *
 */
declare function isEq(a: any, b: any): boolean;

declare function isMap(mayMap: any): mayMap is Map<any, any>;

/**
 *  判断是否是绝对依赖
 *
 *
 */

declare function isAbsolutePath(depends: ComputedDepends | undefined): boolean;

/**
 * 获取绝对路径
 *
 * @description
 * 当输入 path 是绝对路径时直接返回
 * 当是相对路径时，则与 basePath 为基准进行计算得出绝对路径
 * 如果没有提供 basePath，相对路径会转换为单元素数组
 * 如果相对路径回溯超出根目录，返回 undefined
 *
 * @param path - 路径，可以是绝对路径数组或相对路径字符串
 * @param basePath - 基准路径，用于计算相对路径
 * @returns 绝对路径数组，超出根目录时返回 undefined
 *
 * @example
 * ```typescript
 * // 绝对路径（数组形式）直接返回
 * getAbsolutePath(['a', 'b', 'c']) // ['a', 'b', 'c']
 *
 * // 绝对路径（字符串形式）直接分割
 * getAbsolutePath('a.b.c') // ['a', 'b', 'c']
 *
 * // 相对路径 './' (同级/父级)
 * getAbsolutePath('./x', ['a', 'b', 'c']) // ['a', 'b', 'x']
 *
 * // 相对路径 '../' (父级，移除最后两个元素)
 * getAbsolutePath('../x', ['a', 'b', 'c']) // ['a', 'x']
 * getAbsolutePath('../x', ['data', 'title']) // ['x']
 *
 * // 多级 '../'
 * getAbsolutePath('../../x', ['a', 'b', 'c', 'd', 'e']) // ['a', 'x']
 *
 * // 超出根目录
 * getAbsolutePath('../../../../x', ['a', 'b', 'c']) // undefined
 *
 * // 特殊关键字
 * getAbsolutePath('CURRENT', ['a', 'b', 'c']) // ['a', 'b']
 * getAbsolutePath('SELF', ['a', 'b', 'c']) // ['a', 'b', 'c']
 * getAbsolutePath('PARENT', ['a', 'b', 'c']) // ['a', 'b']
 *
 * // 数组第一个元素是相对路径
 * getAbsolutePath(['./a', 'b', 'c'], ["x", "y"]) // ["x", "a", "b", "c"]
 * getAbsolutePath(['../a', 'b', 'c'], ["x", "y"]) // ["x", "a", "b", "c"]
 * ```
 */
declare function getAbsolutePath(path: string[] | string, basePath?: string[]): string[] | undefined;

/**
 *  判定两个值是否相等
 *
 *  如果两个值都是对象，则判断两个对象是否相等
 * 如果两个值都是数组，则判断两个数组的值是否相等
 *
 */
declare function isPathEq(a: string[] | undefined, b: string[] | undefined): boolean;

/**
 *  判定两个路径是否匹配
 *
 *  @description
 *
 *  - 判定两个路径是否匹配，即两个路径是否相等
 *  - 支持通配置符比较，*代表任意字符
 *     如 isPathMatched(['a','b','c'],['a','*','c']) = true
 *
 *  - 支持通配置符比较，**代表任意字符,但**只能出现在最后
 *     如 isPathMatched(['a','b','c'],['a','**']) = true
 *        isPathMatched(['a','b','x','y','z'],['a','**']) = true
 *      isPathMatched(['m','b','x','y','z'],['a','**']) = false
 *
 *
 *  @example
 *
 * isPathMatched(['a','b','c','d','e','f'],['a','b','c','d','e','f']) = true
 * isPathMatched(['a','b','c','d','e','f'],['a','b','c','d','e','f']) = true
 *
 *
 */
declare function isPathMatched(path: string | string[], pattern: string | string[]): boolean;

declare function isPlainObject(obj: any): obj is object;

declare function isAsyncComputedValue(value: any): value is AsyncComputedValue;

declare function isPromise(value: any): boolean;

/** biome-ignore-all lint/suspicious/noPrototypeBuiltins: <noPrototypeBuiltins> */

declare function isObserverDescriptor(obj: any): obj is ObserverDescriptor<any, any, any>;

declare function isObserverDescriptorBuilder(value: any): value is ObserverDescriptorBuilder;

/**
 * 返回一个对象是否是代理对象
 *
 * @example
 * const obj = {}
 * const pobj = new Proxy(obj,{...})
 *
 * isProxy(obj) // => false
 * isProxy(pobj) // => true
 *
 * @param obj
 */
declare function isProxy(obj: any): boolean;

declare function getVal(obj: any, keyPath: string | string[] | undefined, defaultValue?: any): any;

/**
 * string 获取不到，尝试转为 number 获取
 */
declare function getMapVal(map: Map<any, any>, key: string): any;

type RawObject<T> = T & {
    [SKIP_PROXY_FLAG]: true;
};
/**
 * 标记一个对象为非响应式，不创建响应式代理
 *
 * @param obj
 * @returns
 */
declare function markRaw<T = any>(obj: T): RawObject<T>;

/**
 * 设置对象中指定路径的值。
 *
 * toAsyncValue的作用是
 * 当keyPath指向的是一个AsyncComputedValue时，
 *  将val更新.value属性上
 *
 *
 * @param {any} obj - 要设置值的对象。
 * @param {string[]} path - 表示路径的键数组。
 * @param {any} value - 要设置的值。
 * @param {boolean} toAsyncValue - 当keyPath是AsyncComputedValue时，是否更新到.value值。
 */
declare function setVal(obj: any, path: string[], value: any, toAsyncValue?: boolean): any;

/**
 * 将路径数组合并成字符串，使用_作为连接符
 *
 * @param paths
 * @returns
 */
declare function joinValuePath(paths?: (string | string[])[]): string;

/**
 *
 * 规范化依赖参数
 * 用来将依赖参数转换为数组
 *
 * - 如果是数组，则直接返回
 * - 如果是字符串则使用OBJECT_PATH_DELIMITER分割 *
 * - 相对路径则直接返回
 *
 *
 * @param arg 返回 [[],[],[],"./ddd","../../xxxxx",[]]
 */
declare function normalizeDeps(arg: ComputedDepends | undefined): (string | string[])[];

declare function getId(): string;

/**
 *
 * 返回相对curPath的依赖的绝对路径
 *
 * 如果当前路径是以#开头，则说明是动态创建的响应式对象、
 * 即attached=false，此时无法计算相关路径
 *
 */
declare function calcDependPaths(curPath: string[] | undefined, deps: ObserverDepends | undefined): string[][];

/**
 * 生成计算属性的id
 * @param valuePath
 * @param idArg ()=>string
 * @returns
 */
declare function getComputedId(valuePath: string[], computedOptions: ComputedOptions): string;

/**
 *
 * 用于更新对象的值
 * 采用Object.assign()的方式更新对象的值
 *
 *
 * @param obj
 * @param keyPath
 * @param val
 */
declare function updateObjectVal(obj: any, keyPath: string[], val: object): void;

/**
 * 深度遍历对象
 *
 * 对遍历对象的每一个属性值调用fn，如果是对象和数组，则会进行递归遍历
 *
 *
 *
 * @param obj
 * @param fn  ({value:any,key:string[],parent:object})=>void
 */

type ForEachObjectCallback<T extends Dict> = (params: {
    key: string;
    value: any;
    path: string[];
    parent: T;
}) => void;
declare function forEachObject<T extends Dict>(obj: T, callback?: ForEachObjectCallback<T>): void;

declare function getSnap<T = any>(state: any): any;

declare function delay(time?: number): Promise<void>;

/**
 *
 *  去除数组重复项，返回新数组
 *
 *  @example
 *
 *  noRepeat([["a"],["a"],["a"],["b"]]) == [["a"],["b"]]
 *
 *
 */
declare function noRepeat(items: string[][]): string[][];

/**
 *  判断一个路径destPath是否包含另一个路径basePath判断
 * @param basePath
 * @param destPath
 */
declare function pathStartsWith(basePath: string[], destPath: string[]): boolean;

type ExtendAsyncOptions = "none" | "value" | "all";
/**
 * 获取依赖项列表
 *
 * @description
 *
 * 如果是函数，则执行函数并收集依赖
 *
 *
 * extendAsync参数决定当目标路径指向的是一个异步计算属性时，如何处理:
 *
 * none: 默认值，不处理
 * value: 自动添加.value，即指向该异步计算属性的值的依赖
 * all: 自动添加.*, 即指向该异步计算属性的所有依赖，如.loading，.error等
 *
 * @param selector - 选择器，可以是字符串、字符串数组或函数
 * @param store - AutoStore 实例
 * @param extendAsync - 是否扩展异步计算属性，默认为 true
 * @returns 依赖项列表
 */
declare function getDepends<State extends Dict>(selector: string | string[] | ((...args: any[]) => any), store: AutoStore<State>, extendAsync?: ExtendAsyncOptions): string[][];

/**
 * 返回指定路径是否存在
 */
declare function pathIsExists(obj: any, keyPath: string[] | undefined): any;

/**
 * 获取当前状态的快照
 *
 * state是一个经过proxy代码对象，嵌套对象也同样是proxy对象
 *
 * @example
 *
 * const store = new AutoStore({
 *      order:{
 *          price:2,
 *          count:3,
 *          total:(scope:any)=>scope.price * scope.count
 *      }
 * })
 *
 * getSnapshot(store.state)  === {order:{price:2,count:3,total:6}}
 *
 *
 * @example
 *
 * const store = new AutoStore({
 *      order:{
 *          price:2,
 *          count:3,
 *          total:async (scope:any)=>scope.price * scope.count
 *      }
 * })
 *
 * getSnapshot(store.state)  === {order:{price:2,count:3,total:
 *                              {value:6,loading,timeout,.......}
 *                         }}
 *
 * getSnapshot(store.state,false)  === {order:{price:2,count:3,total:6}}
 *
 *
 * @param state
 * @param reserveAsync - 是否保留异步对象。异步对象的值是一个AsyncComputedValue对象。=true时会保留。=false时会只返回value值
 * @param includeFunc - 是否将函数转换为字符串"$$F<函数代码>F$$"
 * 默认不会
 */
declare function getSnapshot(state: object, options?: {
    reserveAsync?: boolean;
    includeFunc?: boolean;
}): any;

/**
 * 检查是否是原子类型
 */
declare function isPrimitive(value: any): value is string | number | boolean | undefined | null;

/**
 *
 *  为AutoStore添加扩展功能
 *
 *
 *  export default defineExtend((store)=>{
 *
 *
 *  }
 *
 *
 */

type AutoStoreExtend<State extends Dict> = (store: AutoStore<State>) => void;
declare function defineExtend<State extends Dict>(extend: AutoStoreExtend<State>): void;

declare function isFunction(value: any): value is Function;

declare function createObserverObject<State extends Dict, Value = any, Scope = any>(store: AutoStore<State>, builder: ObserverBuilder<State>, options?: Dict): AsyncComputedObject<Value, Scope> | SyncComputedObject<Value, Scope> | WatchObject<Value> | undefined;

declare function isComputedDescriptorParameter(val: any): val is ComputedDescriptorParameter;

/**
 *
 * 获取对象中指定路径的值,统一处理为异步计算值
 *
 */
declare function getAsyncVal<Value>(obj: any, keyPath: string | string[] | undefined, defaultValue?: any): AsyncComputedValue<Value>;

/**
 * 创建一个异步计算值。如果传入的值已经是 AsyncComputedValue 类型，则直接返回该值；
 * 否则，创建一个新的 AsyncComputedValue 对象，并使用传入的值和其他可选参数进行初始化。
 * @param value - 要包装或初始化的值。
 * @param other - 可选参数，用于覆盖默认的 AsyncComputedValue 属性。
 * @returns 返回一个 AsyncComputedValue 对象。
 */
declare function createAsyncComptuedValue<T = any>(value: T, other?: Omit<Partial<AsyncComputedValue>, "value">): AsyncComputedValue<T>;

/**
 *  判定一个路径是否是相对路径
 *
 * 当path满足以下条件时代表是相对路径
 *
 * - 以./开头
 * - 以../开头
 * - ==CURRENT,或==PARENT 或SELF或
 *
 */

declare function isRelPath(path: ObserverScope): boolean;

declare function isSchemaBuilder(value: any): value is SchemaDescriptorBuilder;

type ValueSchema = {
    onInvalid?: "none" | "pass" | "throw" | "ignore" | "throw-pass";
    slient?: boolean;
};
declare const WITH_SCHEMA_VALUE = "__WITH_SCHEMA_VALUE__";
declare function withSchema<T = any>(value: T, options?: ValueSchema): T;
declare function isWithSchemaValue(value: any): boolean;
declare function getSchemaValue(value: any): [any, Required<ValueSchema> | undefined];

/**
Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

@category Type
*/
type Primitive$1 =
	| null
	| undefined
	| string
	| number
	| boolean
	| symbol
	| bigint;

/**
Matches any digit as a string ('0'-'9').

@example
```
import type {DigitCharacter} from 'type-fest';

const a: DigitCharacter = '0'; // Valid
// @ts-expect-error
const b: DigitCharacter = 0; // Invalid
```

@category Type
*/
type DigitCharacter = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/**
Convert a union type to an intersection type using [distributive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).

Inspired by [this Stack Overflow answer](https://stackoverflow.com/a/50375286/2172153).

@example
```
import type {UnionToIntersection} from 'type-fest';

type Union = {the(): void} | {great(arg: string): void} | {escape: boolean};

type Intersection = UnionToIntersection<Union>;
//=> {the(): void} & {great(arg: string): void} & {escape: boolean}
```

@category Type
*/
type UnionToIntersection<Union> = (
	// `extends unknown` is always going to be the case and is used to convert the
	// `Union` into a [distributive conditional
	// type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
	Union extends unknown
		// The union type is used as the only argument to a function since the union
		// of function arguments is an intersection.
		? (distributedUnion: Union) => void
		// This won't happen.
		: never
		// Infer the `Intersection` type since TypeScript represents the positional
		// arguments of unions of functions as an intersection of the union.
) extends ((mergedIntersection: infer Intersection) => void)
	// The `& Union` is to ensure result of `UnionToIntersection<A | B>` is always assignable to `A | B`
	? Intersection & Union
	: never;

/**
Returns a boolean for whether the given type is `any`.

@link https://stackoverflow.com/a/49928360/1490091

Useful in type utilities, such as disallowing `any`s to be passed to a function.

@example
```
import type {IsAny} from 'type-fest';

const typedObject = {a: 1, b: 2} as const;
const anyObject: any = {a: 1, b: 2};

function get<O extends (IsAny<O> extends true ? {} : Record<string, number>), K extends keyof O = keyof O>(object: O, key: K) {
	return object[key];
}

const typedA = get(typedObject, 'a');
//=> 1

const anyA = get(anyObject, 'a');
//=> any
```

@category Type Guard
@category Utilities
*/
type IsAny<T> = 0 extends 1 & NoInfer<T> ? true : false;

/**
Returns a boolean for whether the given key is an optional key of type.

This is useful when writing utility types or schema validators that need to differentiate `optional` keys.

@example
```
import type {IsOptionalKeyOf} from 'type-fest';

type User = {
	name: string;
	surname: string;

	luckyNumber?: number;
};

type Admin = {
	name: string;
	surname?: string;
};

type T1 = IsOptionalKeyOf<User, 'luckyNumber'>;
//=> true

type T2 = IsOptionalKeyOf<User, 'name'>;
//=> false

type T3 = IsOptionalKeyOf<User, 'name' | 'luckyNumber'>;
//=> boolean

type T4 = IsOptionalKeyOf<User | Admin, 'name'>;
//=> false

type T5 = IsOptionalKeyOf<User | Admin, 'surname'>;
//=> boolean
```

@category Type Guard
@category Utilities
*/
type IsOptionalKeyOf<Type extends object, Key extends keyof Type> =
	IsAny<Type | Key> extends true ? never
		: Key extends keyof Type
			? Type extends Record<Key, Type[Key]>
				? false
				: true
			: false;

/**
Extract all optional keys from the given type.

This is useful when you want to create a new type that contains different type values for the optional keys only.

@example
```
import type {OptionalKeysOf, Except} from 'type-fest';

type User = {
	name: string;
	surname: string;

	luckyNumber?: number;
};

const REMOVE_FIELD = Symbol('remove field symbol');
type UpdateOperation<Entity extends object> = Except<Partial<Entity>, OptionalKeysOf<Entity>> & {
	[Key in OptionalKeysOf<Entity>]?: Entity[Key] | typeof REMOVE_FIELD;
};

const update1: UpdateOperation<User> = {
	name: 'Alice',
};

const update2: UpdateOperation<User> = {
	name: 'Bob',
	luckyNumber: REMOVE_FIELD,
};
```

@category Utilities
*/
type OptionalKeysOf<Type extends object> =
	Type extends unknown // For distributing `Type`
		? (keyof {[Key in keyof Type as
			IsOptionalKeyOf<Type, Key> extends false
				? never
				: Key
			]: never
		}) & keyof Type // Intersect with `keyof Type` to ensure result of `OptionalKeysOf<Type>` is always assignable to `keyof Type`
		: never; // Should never happen

/**
Extract all required keys from the given type.

This is useful when you want to create a new type that contains different type values for the required keys only or use the list of keys for validation purposes, etc...

@example
```
import type {RequiredKeysOf} from 'type-fest';

declare function createValidation<
	Entity extends object,
	Key extends RequiredKeysOf<Entity> = RequiredKeysOf<Entity>,
>(field: Key, validator: (value: Entity[Key]) => boolean): (entity: Entity) => boolean;

type User = {
	name: string;
	surname: string;
	luckyNumber?: number;
};

const validator1 = createValidation<User>('name', value => value.length < 25);
const validator2 = createValidation<User>('surname', value => value.length < 25);

// @ts-expect-error
const validator3 = createValidation<User>('luckyNumber', value => value > 0);
// Error: Argument of type '"luckyNumber"' is not assignable to parameter of type '"name" | "surname"'.
```

@category Utilities
*/
type RequiredKeysOf<Type extends object> =
	Type extends unknown // For distributing `Type`
		? Exclude<keyof Type, OptionalKeysOf<Type>>
		: never; // Should never happen

/**
Returns a boolean for whether the given type is `never`.

@link https://github.com/microsoft/TypeScript/issues/31751#issuecomment-498526919
@link https://stackoverflow.com/a/53984913/10292952
@link https://www.zhenghao.io/posts/ts-never

Useful in type utilities, such as checking if something does not occur.

@example
```
import type {IsNever, And} from 'type-fest';

type A = IsNever<never>;
//=> true

type B = IsNever<any>;
//=> false

type C = IsNever<unknown>;
//=> false

type D = IsNever<never[]>;
//=> false

type E = IsNever<object>;
//=> false

type F = IsNever<string>;
//=> false
```

@example
```
import type {IsNever} from 'type-fest';

type IsTrue<T> = T extends true ? true : false;

// When a distributive conditional is instantiated with `never`, the entire conditional results in `never`.
type A = IsTrue<never>;
//=> never

// If you don't want that behaviour, you can explicitly add an `IsNever` check before the distributive conditional.
type IsTrueFixed<T> =
	IsNever<T> extends true ? false : T extends true ? true : false;

type B = IsTrueFixed<never>;
//=> false
```

@category Type Guard
@category Utilities
*/
type IsNever<T> = [T] extends [never] ? true : false;

/**
An if-else-like type that resolves depending on whether the given `boolean` type is `true` or `false`.

Use-cases:
- You can use this in combination with `Is*` types to create an if-else-like experience. For example, `If<IsAny<any>, 'is any', 'not any'>`.

Note:
- Returns a union of if branch and else branch if the given type is `boolean` or `any`. For example, `If<boolean, 'Y', 'N'>` will return `'Y' | 'N'`.
- Returns the else branch if the given type is `never`. For example, `If<never, 'Y', 'N'>` will return `'N'`.

@example
```
import type {If} from 'type-fest';

type A = If<true, 'yes', 'no'>;
//=> 'yes'

type B = If<false, 'yes', 'no'>;
//=> 'no'

type C = If<boolean, 'yes', 'no'>;
//=> 'yes' | 'no'

type D = If<any, 'yes', 'no'>;
//=> 'yes' | 'no'

type E = If<never, 'yes', 'no'>;
//=> 'no'
```

@example
```
import type {If, IsAny, IsNever} from 'type-fest';

type A = If<IsAny<unknown>, 'is any', 'not any'>;
//=> 'not any'

type B = If<IsNever<never>, 'is never', 'not never'>;
//=> 'is never'
```

@example
```
import type {If, IsEqual} from 'type-fest';

type IfEqual<T, U, IfBranch, ElseBranch> = If<IsEqual<T, U>, IfBranch, ElseBranch>;

type A = IfEqual<string, string, 'equal', 'not equal'>;
//=> 'equal'

type B = IfEqual<string, number, 'equal', 'not equal'>;
//=> 'not equal'
```

Note: Sometimes using the `If` type can make an implementation non–tail-recursive, which can impact performance. In such cases, it’s better to use a conditional directly. Refer to the following example:

@example
```
import type {If, IsEqual, StringRepeat} from 'type-fest';

type HundredZeroes = StringRepeat<'0', 100>;

// The following implementation is not tail recursive
type Includes<S extends string, Char extends string> =
	S extends `${infer First}${infer Rest}`
		? If<IsEqual<First, Char>,
			'found',
			Includes<Rest, Char>>
		: 'not found';

// Hence, instantiations with long strings will fail
// @ts-expect-error
type Fails = Includes<HundredZeroes, '1'>;
//           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Error: Type instantiation is excessively deep and possibly infinite.

// However, if we use a simple conditional instead of `If`, the implementation becomes tail-recursive
type IncludesWithoutIf<S extends string, Char extends string> =
	S extends `${infer First}${infer Rest}`
		? IsEqual<First, Char> extends true
			? 'found'
			: IncludesWithoutIf<Rest, Char>
		: 'not found';

// Now, instantiations with long strings will work
type Works = IncludesWithoutIf<HundredZeroes, '1'>;
//=> 'not found'
```

@category Type Guard
@category Utilities
*/
type If<Type extends boolean, IfBranch, ElseBranch> =
	IsNever<Type> extends true
		? ElseBranch
		: Type extends true
			? IfBranch
			: ElseBranch;

/**
Represents an array with `unknown` value.

Use case: You want a type that all arrays can be assigned to, but you don't care about the value.

@example
```
import type {UnknownArray} from 'type-fest';

type IsArray<T> = T extends UnknownArray ? true : false;

type A = IsArray<['foo']>;
//=> true

type B = IsArray<readonly number[]>;
//=> true

type C = IsArray<string>;
//=> false
```

@category Type
@category Array
*/
type UnknownArray = readonly unknown[];

/**
Matches any primitive, `void`, `Date`, or `RegExp` value.
*/
type BuiltIns = Primitive$1 | void | Date | RegExp;

/**
Matches non-recursive types.
*/
type NonRecursiveType = BuiltIns | Function | (new (...arguments_: any[]) => unknown) | Promise<unknown>;

/**
Matches maps, sets, or arrays.
*/
type MapsSetsOrArrays = ReadonlyMap<unknown, unknown> | WeakMap<WeakKey, unknown> | ReadonlySet<unknown> | WeakSet<WeakKey> | UnknownArray;

/**
Returns a boolean for whether A is false.

@example
```
type A = Not<true>;
//=> false

type B = Not<false>;
//=> true
```
*/
type Not<A extends boolean> = A extends true
	? false
	: A extends false
		? true
		: never;

/**
An if-else-like type that resolves depending on whether the given type is `any` or `never`.

@example
```
// When `T` is a NOT `any` or `never` (like `string`) => Returns `IfNotAnyOrNever` branch
type A = IfNotAnyOrNever<string, 'VALID', 'IS_ANY', 'IS_NEVER'>;
//=> 'VALID'

// When `T` is `any` => Returns `IfAny` branch
type B = IfNotAnyOrNever<any, 'VALID', 'IS_ANY', 'IS_NEVER'>;
//=> 'IS_ANY'

// When `T` is `never` => Returns `IfNever` branch
type C = IfNotAnyOrNever<never, 'VALID', 'IS_ANY', 'IS_NEVER'>;
//=> 'IS_NEVER'
```

Note: Wrapping a tail-recursive type with `IfNotAnyOrNever` makes the implementation non-tail-recursive. To fix this, move the recursion into a helper type. Refer to the following example:

@example
```ts
import type {StringRepeat} from 'type-fest';

type NineHundredNinetyNineSpaces = StringRepeat<' ', 999>;

// The following implementation is not tail recursive
type TrimLeft<S extends string> = IfNotAnyOrNever<S, S extends ` ${infer R}` ? TrimLeft<R> : S>;

// Hence, instantiations with long strings will fail
// @ts-expect-error
type T1 = TrimLeft<NineHundredNinetyNineSpaces>;
//        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Error: Type instantiation is excessively deep and possibly infinite.

// To fix this, move the recursion into a helper type
type TrimLeftOptimised<S extends string> = IfNotAnyOrNever<S, _TrimLeftOptimised<S>>;

type _TrimLeftOptimised<S extends string> = S extends ` ${infer R}` ? _TrimLeftOptimised<R> : S;

type T2 = TrimLeftOptimised<NineHundredNinetyNineSpaces>;
//=> ''
```
*/
type IfNotAnyOrNever<T, IfNotAnyOrNever, IfAny = any, IfNever = never> =
	If<IsAny<T>, IfAny, If<IsNever<T>, IfNever, IfNotAnyOrNever>>;

/**
Indicates the value of `exactOptionalPropertyTypes` compiler option.
*/
type IsExactOptionalPropertyTypesEnabled = [(string | undefined)?] extends [string?]
	? false
	: true;

/**
Transforms a tuple type by replacing it's rest element with a single element that has the same type as the rest element, while keeping all the non-rest elements intact.

@example
```
type A = CollapseRestElement<[string, string, ...number[]]>;
//=> [string, string, number]

type B = CollapseRestElement<[...string[], number, number]>;
//=> [string, number, number]

type C = CollapseRestElement<[string, string, ...Array<number | bigint>]>;
//=> [string, string, number | bigint]

type D = CollapseRestElement<[string, number]>;
//=> [string, number]
```

Note: Optional modifiers (`?`) are removed from elements unless the `exactOptionalPropertyTypes` compiler option is disabled. When disabled, there's an additional `| undefined` for optional elements.

@example
```
// `exactOptionalPropertyTypes` enabled
type A = CollapseRestElement<[string?, string?, ...number[]]>;
//=> [string, string, number]

// `exactOptionalPropertyTypes` disabled
type B = CollapseRestElement<[string?, string?, ...number[]]>;
//=> [string | undefined, string | undefined, number]
```
*/
type CollapseRestElement<TArray extends UnknownArray> = IfNotAnyOrNever<TArray, _CollapseRestElement<TArray>>;

type _CollapseRestElement<
	TArray extends UnknownArray,
	ForwardAccumulator extends UnknownArray = [],
	BackwardAccumulator extends UnknownArray = [],
> =
	TArray extends UnknownArray // For distributing `TArray`
		? keyof TArray & `${number}` extends never
			// Enters this branch, if `TArray` is empty (e.g., []),
			// or `TArray` contains no non-rest elements preceding the rest element (e.g., `[...string[]]` or `[...string[], string]`).
			? TArray extends readonly [...infer Rest, infer Last]
				? _CollapseRestElement<Rest, ForwardAccumulator, [Last, ...BackwardAccumulator]> // Accumulate elements that are present after the rest element.
				: TArray extends readonly []
					? [...ForwardAccumulator, ...BackwardAccumulator]
					: [...ForwardAccumulator, TArray[number], ...BackwardAccumulator] // Add the rest element between the accumulated elements.
			: TArray extends readonly [(infer First)?, ...infer Rest]
				? _CollapseRestElement<
					Rest,
					[
						...ForwardAccumulator,
						'0' extends OptionalKeysOf<TArray>
							? If<IsExactOptionalPropertyTypesEnabled, First, First | undefined> // Add `| undefined` for optional elements, if `exactOptionalPropertyTypes` is disabled.
							: First,
					],
					BackwardAccumulator
				>
				: never // Should never happen, since `[(infer First)?, ...infer Rest]` is a top-type for arrays.
		: never; // Should never happen

type _Numeric = number | bigint;

type Zero = 0 | 0n;

/**
Matches the hidden `Infinity` type.

Please upvote [this issue](https://github.com/microsoft/TypeScript/issues/32277) if you want to have this type as a built-in in TypeScript.

@see {@link NegativeInfinity}

@category Numeric
*/
// See https://github.com/microsoft/TypeScript/issues/31752
// eslint-disable-next-line no-loss-of-precision
type PositiveInfinity = 1e999;

/**
Matches the hidden `-Infinity` type.

Please upvote [this issue](https://github.com/microsoft/TypeScript/issues/32277) if you want to have this type as a built-in in TypeScript.

@see {@link PositiveInfinity}

@category Numeric
*/
// See https://github.com/microsoft/TypeScript/issues/31752
// eslint-disable-next-line no-loss-of-precision
type NegativeInfinity = -1e999;

/**
A negative `number`/`bigint` (`-∞ < x < 0`)

Use-case: Validating and documenting parameters.

@see {@link NegativeInteger}
@see {@link NonNegative}

@category Numeric
*/
type Negative<T extends _Numeric> = T extends Zero ? never : `${T}` extends `-${string}` ? T : never;

/**
Returns a boolean for whether the given number is a negative number.

@see {@link Negative}

@example
```
import type {IsNegative} from 'type-fest';

type ShouldBeFalse = IsNegative<1>;
type ShouldBeTrue = IsNegative<-1>;
```

@category Numeric
*/
type IsNegative<T extends _Numeric> = T extends Negative<T> ? true : false;

declare const tag: unique symbol;

// eslint-disable-next-line type-fest/require-exported-types
type TagContainer<Token> = {
	readonly [tag]: Token;
};

type Tag<Token extends PropertyKey, TagMetadata> = TagContainer<{[K in Token]: TagMetadata}>;

/**
Attach a "tag" to an arbitrary type. This allows you to create distinct types, that aren't assignable to one another, for distinct concepts in your program that should not be interchangeable, even if their runtime values have the same type. (See examples.)

A type returned by `Tagged` can be passed to `Tagged` again, to create a type with multiple tags.

[Read more about tagged types.](https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d)

A tag's name is usually a string (and must be a string, number, or symbol), but each application of a tag can also contain an arbitrary type as its "metadata". See {@link GetTagMetadata} for examples and explanation.

A type `A` returned by `Tagged` is assignable to another type `B` returned by `Tagged` if and only if:
  - the underlying (untagged) type of `A` is assignable to the underlying type of `B`;
	- `A` contains at least all the tags `B` has;
	- and the metadata type for each of `A`'s tags is assignable to the metadata type of `B`'s corresponding tag.

There have been several discussions about adding similar features to TypeScript. Unfortunately, nothing has (yet) moved forward:
	- [Microsoft/TypeScript#202](https://github.com/microsoft/TypeScript/issues/202)
	- [Microsoft/TypeScript#4895](https://github.com/microsoft/TypeScript/issues/4895)
	- [Microsoft/TypeScript#33290](https://github.com/microsoft/TypeScript/pull/33290)

@example
```
import type {Tagged} from 'type-fest';

type AccountNumber = Tagged<number, 'AccountNumber'>;
type AccountBalance = Tagged<number, 'AccountBalance'>;

function createAccountNumber(): AccountNumber {
	// As you can see, casting from a `number` (the underlying type being tagged) is allowed.
	return 2 as AccountNumber;
}

declare function getMoneyForAccount(accountNumber: AccountNumber): AccountBalance;

// This will compile successfully.
getMoneyForAccount(createAccountNumber());

// But this won't, because it has to be explicitly passed as an `AccountNumber` type!
// Critically, you could not accidentally use an `AccountBalance` as an `AccountNumber`.
// @ts-expect-error
getMoneyForAccount(2);

// You can also use tagged values like their underlying, untagged type.
// I.e., this will compile successfully because an `AccountNumber` can be used as a regular `number`.
// In this sense, the underlying base type is not hidden, which differentiates tagged types from opaque types in other languages.
const accountNumber = createAccountNumber() + 2;
```

@example
```
import type {Tagged} from 'type-fest';

// You can apply multiple tags to a type by using `Tagged` repeatedly.
type Url = Tagged<string, 'URL'>;
type SpecialCacheKey = Tagged<Url, 'SpecialCacheKey'>;

// You can also pass a union of tag names, so this is equivalent to the above, although it doesn't give you the ability to assign distinct metadata to each tag.
type SpecialCacheKey2 = Tagged<string, 'URL' | 'SpecialCacheKey'>;
```

@category Type
*/
type Tagged<Type, TagName extends PropertyKey, TagMetadata = never> = Type & Tag<TagName, TagMetadata>;

/**
Revert a tagged type back to its original type by removing all tags.

Why is this necessary?

1. Use a `Tagged` type as object keys
2. Prevent TS4058 error: "Return type of exported function has or is using name X from external module Y but cannot be named"

@example
```
import type {Tagged, UnwrapTagged} from 'type-fest';

type AccountType = Tagged<'SAVINGS' | 'CHECKING', 'AccountType'>;

const moneyByAccountType: Record<UnwrapTagged<AccountType>, number> = {
	SAVINGS: 99,
	CHECKING: 0.1,
};

// Without UnwrapTagged, the following expression would throw a type error.
const money = moneyByAccountType.SAVINGS; // TS error: Property 'SAVINGS' does not exist

// Attempting to pass a non-Tagged type to UnwrapTagged will raise a type error.
// @ts-expect-error
type WontWork = UnwrapTagged<string>;
```

@category Type
*/
type UnwrapTagged<TaggedType extends Tag<PropertyKey, any>> =
RemoveAllTags<TaggedType>;

type RemoveAllTags<T> = T extends Tag<PropertyKey, any>
	? {
		[ThisTag in keyof T[typeof tag]]: T extends Tagged<infer Type, ThisTag, T[typeof tag][ThisTag]>
			? RemoveAllTags<Type>
			: never
	}[keyof T[typeof tag]]
	: T;

/**
Returns a boolean for whether the given type is a `string` [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).

Useful for:
	- providing strongly-typed string manipulation functions
	- constraining strings to be a string literal
	- type utilities, such as when constructing parsers and ASTs

The implementation of this type is inspired by the trick mentioned in this [StackOverflow answer](https://stackoverflow.com/a/68261113/420747).

@example
```
import type {IsStringLiteral} from 'type-fest';

type CapitalizedString<T extends string> = IsStringLiteral<T> extends true ? Capitalize<T> : string;

// https://github.com/yankeeinlondon/native-dash/blob/master/src/capitalize.ts
function capitalize<T extends Readonly<string>>(input: T): CapitalizedString<T> {
	return (input.slice(0, 1).toUpperCase() + input.slice(1)) as CapitalizedString<T>;
}

const output = capitalize('hello, world!');
//=> 'Hello, world!'
```

@example
```
// String types with infinite set of possible values return `false`.

import type {IsStringLiteral} from 'type-fest';

type AllUppercaseStrings = IsStringLiteral<Uppercase<string>>;
//=> false

type StringsStartingWithOn = IsStringLiteral<`on${string}`>;
//=> false

// This behaviour is particularly useful in string manipulation utilities, as infinite string types often require separate handling.

type Length<S extends string, Counter extends never[] = []> =
	IsStringLiteral<S> extends false
		? number // return `number` for infinite string types
		: S extends `${string}${infer Tail}`
			? Length<Tail, [...Counter, never]>
			: Counter['length'];

type L1 = Length<Lowercase<string>>;
//=> number

type L2 = Length<`${number}`>;
//=> number
```

@category Type Guard
@category Utilities
*/
type IsStringLiteral<S> = IfNotAnyOrNever<S,
	_IsStringLiteral<CollapseLiterals<S extends TagContainer<any> ? UnwrapTagged<S> : S>>,
	false, false>;

type _IsStringLiteral<S> =
// If `T` is an infinite string type (e.g., `on${string}`), `Record<T, never>` produces an index signature,
// and since `{}` extends index signatures, the result becomes `false`.
S extends string
	? {} extends Record<S, never>
		? false
		: true
	: false;

/**
Create a tuple type of the specified length with elements of the specified type.

@example
```
import type {TupleOf} from 'type-fest';

type RGB = TupleOf<3, number>;
//=> [number, number, number]

type Line = TupleOf<2, {x: number; y: number}>;
//=> [{x: number; y: number}, {x: number; y: number}]

type TicTacToeBoard = TupleOf<3, TupleOf<3, 'X' | 'O' | null>>;
//=> [['X' | 'O' | null, 'X' | 'O' | null, 'X' | 'O' | null], ['X' | 'O' | null, 'X' | 'O' | null, 'X' | 'O' | null], ['X' | 'O' | null, 'X' | 'O' | null, 'X' | 'O' | null]]
```

@example
```
import type {TupleOf} from 'type-fest';

type Range<Start extends number, End extends number> = Exclude<keyof TupleOf<End>, keyof TupleOf<Start>>;

type ZeroToFour = Range<0, 5>;
//=> '0' | '1' | '2' | '3' | '4'

type ThreeToEight = Range<3, 9>;
//=> '5' | '3' | '4' | '6' | '7' | '8'
```

Note: If the specified length is the non-literal `number` type, the result will not be a tuple but a regular array.

@example
```
import type {TupleOf} from 'type-fest';

type StringArray = TupleOf<number, string>;
//=> string[]
```

Note: If the type for elements is not specified, it will default to `unknown`.

@example
```
import type {TupleOf} from 'type-fest';

type UnknownTriplet = TupleOf<3>;
//=> [unknown, unknown, unknown]
```

Note: If the specified length is negative, the result will be an empty tuple.

@example
```
import type {TupleOf} from 'type-fest';

type EmptyTuple = TupleOf<-3, string>;
//=> []
```

Note: If you need a readonly tuple, simply wrap this type with `Readonly`, for example, to create `readonly [number, number, number]` use `Readonly<TupleOf<3, number>>`.

@category Array
*/
type TupleOf<Length extends number, Fill = unknown> = IfNotAnyOrNever<Length,
	_TupleOf<If<IsNegative<Length>, 0, Length>, Fill, []>,
	Fill[], []>;

type _TupleOf<L extends number, Fill, Accumulator extends UnknownArray> = number extends L
	? Fill[]
	: L extends Accumulator['length']
		? Accumulator
		: _TupleOf<L, Fill, [...Accumulator, Fill]>;

/**
Return a string representation of the given string or number.

Note: This type is not the return type of the `.toString()` function.
*/
type ToString<T> = T extends string | number ? `${T}` : never;

/**
Converts a numeric string to a number.

@example
```
type PositiveInt = StringToNumber<'1234'>;
//=> 1234

type NegativeInt = StringToNumber<'-1234'>;
//=> -1234

type PositiveFloat = StringToNumber<'1234.56'>;
//=> 1234.56

type NegativeFloat = StringToNumber<'-1234.56'>;
//=> -1234.56

type PositiveInfinity = StringToNumber<'Infinity'>;
//=> Infinity

type NegativeInfinity = StringToNumber<'-Infinity'>;
//=> -Infinity
```

@category String
@category Numeric
@category Template literal
*/
type StringToNumber<S extends string> = S extends `${infer N extends number}`
	? N
	: S extends 'Infinity'
		? PositiveInfinity
		: S extends '-Infinity'
			? NegativeInfinity
			: never;

/**
Returns an array of the characters of the string.

@example
```
type A = StringToArray<'abcde'>;
//=> ['a', 'b', 'c', 'd', 'e']

type B = StringToArray<string>;
//=> never
```

@category String
*/
type StringToArray<S extends string, Result extends string[] = []> = string extends S
	? never
	: S extends `${infer F}${infer R}`
		? StringToArray<R, [...Result, F]>
		: Result;

/**
Returns the length of the given string.

@example
```
type A = StringLength<'abcde'>;
//=> 5

type B = StringLength<string>;
//=> never
```

@category String
@category Template literal
*/
type StringLength<S extends string> = string extends S
	? never
	: StringToArray<S>['length'];

/**
Returns a boolean for whether `A` represents a number greater than `B`, where `A` and `B` are both numeric strings and have the same length.

@example
```
type A = SameLengthPositiveNumericStringGt<'50', '10'>;
//=> true

type B = SameLengthPositiveNumericStringGt<'10', '10'>;
//=> false
```
*/
type SameLengthPositiveNumericStringGt<A extends string, B extends string> = A extends `${infer FirstA}${infer RestA}`
	? B extends `${infer FirstB}${infer RestB}`
		? FirstA extends FirstB
			? SameLengthPositiveNumericStringGt<RestA, RestB>
			: PositiveNumericCharacterGt<FirstA, FirstB>
		: never
	: false;

type NumericString = '0123456789';

/**
Returns a boolean for whether `A` is greater than `B`, where `A` and `B` are both positive numeric strings.

@example
```
type A = PositiveNumericStringGt<'500', '1'>;
//=> true

type B = PositiveNumericStringGt<'1', '1'>;
//=> false

type C = PositiveNumericStringGt<'1', '500'>;
//=> false
```
*/
type PositiveNumericStringGt<A extends string, B extends string> = A extends B
	? false
	: [TupleOf<StringLength<A>, 0>, TupleOf<StringLength<B>, 0>] extends infer R extends [readonly unknown[], readonly unknown[]]
		? R[0] extends [...R[1], ...infer Remain extends readonly unknown[]]
			? 0 extends Remain['length']
				? SameLengthPositiveNumericStringGt<A, B>
				: true
			: false
		: never;

/**
Returns a boolean for whether `A` represents a number greater than `B`, where `A` and `B` are both positive numeric characters.

@example
```
type A = PositiveNumericCharacterGt<'5', '1'>;
//=> true

type B = PositiveNumericCharacterGt<'1', '1'>;
//=> false
```
*/
type PositiveNumericCharacterGt<A extends string, B extends string> = NumericString extends `${infer HeadA}${A}${infer TailA}`
	? NumericString extends `${infer HeadB}${B}${infer TailB}`
		? HeadA extends `${HeadB}${infer _}${infer __}`
			? true
			: false
		: never
	: never;

/**
Returns the absolute value of a given value.

@example
```
type A = NumberAbsolute<-1>;
//=> 1

type B = NumberAbsolute<1>;
//=> 1

type C = NumberAbsolute<NegativeInfinity>;
//=> PositiveInfinity
```
*/
type NumberAbsolute<N extends number> = `${N}` extends `-${infer StringPositiveN}` ? StringToNumber<StringPositiveN> : N;

/**
Check whether the given type is a number or a number string.

Supports floating-point as a string.

@example
```
type A = IsNumberLike<'1'>;
//=> true

type B = IsNumberLike<'-1.1'>;
//=> true

type C = IsNumberLike<'5e-20'>;
//=> true

type D = IsNumberLike<1>;
//=> true

type E = IsNumberLike<'a'>;
//=> false
*/
type IsNumberLike<N> =
	IfNotAnyOrNever<N,
		N extends number | `${number}`
			? true
			: false,
		boolean, false>;

/**
Returns the number with reversed sign.

@example
```
type A = ReverseSign<-1>;
//=> 1

type B = ReverseSign<1>;
//=> -1

type C = ReverseSign<NegativeInfinity>;
//=> PositiveInfinity

type D = ReverseSign<PositiveInfinity>;
//=> NegativeInfinity
```
*/
type ReverseSign<N extends number> =
	// Handle edge cases
	N extends 0 ? 0 : N extends PositiveInfinity ? NegativeInfinity : N extends NegativeInfinity ? PositiveInfinity :
	// Handle negative numbers
	`${N}` extends `-${infer P extends number}` ? P
		// Handle positive numbers
		: `-${N}` extends `${infer R extends number}` ? R : never;

/**
Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.

@example
```
import type {Simplify} from 'type-fest';

type PositionProps = {
	top: number;
	left: number;
};

type SizeProps = {
	width: number;
	height: number;
};

// In your editor, hovering over `Props` will show a flattened object with all the properties.
type Props = Simplify<PositionProps & SizeProps>;
```

Sometimes it is desired to pass a value as a function argument that has a different type. At first inspection it may seem assignable, and then you discover it is not because the `value`'s type definition was defined as an interface. In the following example, `fn` requires an argument of type `Record<string, unknown>`. If the value is defined as a literal, then it is assignable. And if the `value` is defined as type using the `Simplify` utility the value is assignable.  But if the `value` is defined as an interface, it is not assignable because the interface is not sealed and elsewhere a non-string property could be added to the interface.

If the type definition must be an interface (perhaps it was defined in a third-party npm package), then the `value` can be defined as `const value: Simplify<SomeInterface> = ...`. Then `value` will be assignable to the `fn` argument.  Or the `value` can be cast as `Simplify<SomeInterface>` if you can't re-declare the `value`.

@example
```
import type {Simplify} from 'type-fest';

interface SomeInterface {
	foo: number;
	bar?: string;
	baz: number | undefined;
}

type SomeType = {
	foo: number;
	bar?: string;
	baz: number | undefined;
};

const literal = {foo: 123, bar: 'hello', baz: 456};
const someType: SomeType = literal;
const someInterface: SomeInterface = literal;

declare function fn(object: Record<string, unknown>): void;

fn(literal); // Good: literal object type is sealed
fn(someType); // Good: type is sealed
// @ts-expect-error
fn(someInterface); // Error: Index signature for type 'string' is missing in type 'someInterface'. Because `interface` can be re-opened
fn(someInterface as Simplify<SomeInterface>); // Good: transform an `interface` into a `type`
```

@link https://github.com/microsoft/TypeScript/issues/15300
@see {@link SimplifyDeep}
@category Object
*/
type Simplify<T> = {[KeyType in keyof T]: T[KeyType]} & {};

/**
Returns a boolean for whether the two given types are equal.

@link https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
@link https://stackoverflow.com/questions/68961864/how-does-the-equals-work-in-typescript/68963796#68963796

Use-cases:
- If you want to make a conditional branch based on the result of a comparison of two types.

@example
```
import type {IsEqual} from 'type-fest';

// This type returns a boolean for whether the given array includes the given item.
// `IsEqual` is used to compare the given array at position 0 and the given item and then return true if they are equal.
type Includes<Value extends readonly any[], Item> =
	Value extends readonly [Value[0], ...infer rest]
		? IsEqual<Value[0], Item> extends true
			? true
			: Includes<rest, Item>
		: false;
```

@category Type Guard
@category Utilities
*/
type IsEqual<A, B> =
	[A] extends [B]
		? [B] extends [A]
			? _IsEqual<A, B>
			: false
		: false;

// This version fails the `equalWrappedTupleIntersectionToBeNeverAndNeverExpanded` test in `test-d/is-equal.ts`.
type _IsEqual<A, B> =
	(<G>() => G extends A & G | G ? 1 : 2) extends
	(<G>() => G extends B & G | G ? 1 : 2)
		? true
		: false;

/**
Omit any index signatures from the given object type, leaving only explicitly defined properties.

This is the counterpart of `PickIndexSignature`.

Use-cases:
- Remove overly permissive signatures from third-party types.

This type was taken from this [StackOverflow answer](https://stackoverflow.com/a/68261113/420747).

It relies on the fact that an empty object (`{}`) is assignable to an object with just an index signature, like `Record<string, unknown>`, but not to an object with explicitly defined keys, like `Record<'foo' | 'bar', unknown>`.

(The actual value type, `unknown`, is irrelevant and could be any type. Only the key type matters.)

```
const indexed: Record<string, unknown> = {}; // Allowed

// @ts-expect-error
const keyed: Record<'foo', unknown> = {}; // Error
// TS2739: Type '{}' is missing the following properties from type 'Record<"foo" | "bar", unknown>': foo, bar
```

Instead of causing a type error like the above, you can also use a [conditional type](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) to test whether a type is assignable to another:

```
type Indexed = {} extends Record<string, unknown>
	? '✅ `{}` is assignable to `Record<string, unknown>`'
	: '❌ `{}` is NOT assignable to `Record<string, unknown>`';

type IndexedResult = Indexed;
//=> '✅ `{}` is assignable to `Record<string, unknown>`'

type Keyed = {} extends Record<'foo' | 'bar', unknown>
	? '✅ `{}` is assignable to `Record<\'foo\' | \'bar\', unknown>`'
	: '❌ `{}` is NOT assignable to `Record<\'foo\' | \'bar\', unknown>`';

type KeyedResult = Keyed;
//=> '❌ `{}` is NOT assignable to `Record<\'foo\' | \'bar\', unknown>`'
```

Using a [mapped type](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#further-exploration), you can then check for each `KeyType` of `ObjectType`...

```
type OmitIndexSignature<ObjectType> = {
	[KeyType in keyof ObjectType // Map each key of `ObjectType`...
	]: ObjectType[KeyType]; // ...to its original value, i.e. `OmitIndexSignature<Foo> == Foo`.
};
```

...whether an empty object (`{}`) would be assignable to an object with that `KeyType` (`Record<KeyType, unknown>`)...

```
type OmitIndexSignature<ObjectType> = {
	[KeyType in keyof ObjectType
	// Is `{}` assignable to `Record<KeyType, unknown>`?
	as {} extends Record<KeyType, unknown>
		? never // ✅ `{}` is assignable to `Record<KeyType, unknown>`
		: KeyType // ❌ `{}` is NOT assignable to `Record<KeyType, unknown>`
	]: ObjectType[KeyType];
};
```

If `{}` is assignable, it means that `KeyType` is an index signature and we want to remove it. If it is not assignable, `KeyType` is a "real" key and we want to keep it.

@example
```
import type {OmitIndexSignature} from 'type-fest';

type Example = {
	// These index signatures will be removed.
	[x: string]: any;
	[x: number]: any;
	[x: symbol]: any;
	[x: `head-${string}`]: string;
	[x: `${string}-tail`]: string;
	[x: `head-${string}-tail`]: string;
	[x: `${bigint}`]: string;
	[x: `embedded-${number}`]: string;

	// These explicitly defined keys will remain.
	foo: 'bar';
	qux?: 'baz';
};

type ExampleWithoutIndexSignatures = OmitIndexSignature<Example>;
//=> {foo: 'bar'; qux?: 'baz'}
```

@see {@link PickIndexSignature}
@category Object
*/
type OmitIndexSignature<ObjectType> = {
	[KeyType in keyof ObjectType as {} extends Record<KeyType, unknown>
		? never
		: KeyType]: ObjectType[KeyType];
};

/**
Pick only index signatures from the given object type, leaving out all explicitly defined properties.

This is the counterpart of `OmitIndexSignature`.

@example
```
import type {PickIndexSignature} from 'type-fest';

declare const symbolKey: unique symbol;

type Example = {
	// These index signatures will remain.
	[x: string]: unknown;
	[x: number]: unknown;
	[x: symbol]: unknown;
	[x: `head-${string}`]: string;
	[x: `${string}-tail`]: string;
	[x: `head-${string}-tail`]: string;
	[x: `${bigint}`]: string;
	[x: `embedded-${number}`]: string;

	// These explicitly defined keys will be removed.
	['kebab-case-key']: string;
	[symbolKey]: string;
	foo: 'bar';
	qux?: 'baz';
};

type ExampleIndexSignature = PickIndexSignature<Example>;
// {
// 	[x: string]: unknown;
// 	[x: number]: unknown;
// 	[x: symbol]: unknown;
// 	[x: `head-${string}`]: string;
// 	[x: `${string}-tail`]: string;
// 	[x: `head-${string}-tail`]: string;
// 	[x: `${bigint}`]: string;
// 	[x: `embedded-${number}`]: string;
// }
```

@see {@link OmitIndexSignature}
@category Object
*/
type PickIndexSignature<ObjectType> = {
	[KeyType in keyof ObjectType as {} extends Record<KeyType, unknown>
		? KeyType
		: never]: ObjectType[KeyType];
};

// Merges two objects without worrying about index signatures.
type SimpleMerge<Destination, Source> = Simplify<{
	[Key in keyof Destination as Key extends keyof Source ? never : Key]: Destination[Key];
} & Source>;

/**
Merge two types into a new type. Keys of the second type overrides keys of the first type.

This is different from the TypeScript `&` (intersection) operator. With `&`, conflicting property types are intersected, which often results in `never`. For example, `{a: string} & {a: number}` makes `a` become `string & number`, which resolves to `never`. With `Merge`, the second type's keys cleanly override the first, so `Merge<{a: string}, {a: number}>` gives `{a: number}` as expected. `Merge` also produces a flattened type (via `Simplify`), making it more readable in IDE tooltips compared to `A & B`.

@example
```
import type {Merge} from 'type-fest';

type Foo = {
	a: string;
	b: number;
};

type Bar = {
	a: number; // Conflicts with Foo['a']
	c: boolean;
};

// With `&`, `a` becomes `string & number` which is `never`. Not what you want.
type WithIntersection = (Foo & Bar)['a'];
//=> never

// With `Merge`, `a` is cleanly overridden to `number`.
type WithMerge = Merge<Foo, Bar>['a'];
//=> number
```

@example
```
import type {Merge} from 'type-fest';

type Foo = {
	[x: string]: unknown;
	[x: number]: unknown;
	foo: string;
	bar: symbol;
};

type Bar = {
	[x: number]: number;
	[x: symbol]: unknown;
	bar: Date;
	baz: boolean;
};

export type FooBar = Merge<Foo, Bar>;
//=> {
// 	[x: string]: unknown;
// 	[x: number]: number;
// 	[x: symbol]: unknown;
// 	foo: string;
// 	bar: Date;
// 	baz: boolean;
// }
```

Note: If you want a merge type that more accurately reflects the runtime behavior of object spread or `Object.assign`, refer to the {@link ObjectMerge} type.

@see {@link ObjectMerge}
@category Object
*/
type Merge<Destination, Source> =
	Destination extends unknown // For distributing `Destination`
		? Source extends unknown // For distributing `Source`
			? If<IsEqual<Destination, Source>, Destination, _Merge<Destination, Source>>
			: never // Should never happen
		: never; // Should never happen

type _Merge<Destination, Source> =
	Simplify<
		SimpleMerge<PickIndexSignature<Destination>, PickIndexSignature<Source>>
		& SimpleMerge<OmitIndexSignature<Destination>, OmitIndexSignature<Source>>
	>;

/**
Merges user specified options with default options.

@example
```
type PathsOptions = {maxRecursionDepth?: number; leavesOnly?: boolean};
type DefaultPathsOptions = {maxRecursionDepth: 10; leavesOnly: false};
type SpecifiedOptions = {leavesOnly: true};

type Result = ApplyDefaultOptions<PathsOptions, DefaultPathsOptions, SpecifiedOptions>;
//=> {maxRecursionDepth: 10; leavesOnly: true}
```

@example
```
// Complains if default values are not provided for optional options

type PathsOptions = {maxRecursionDepth?: number; leavesOnly?: boolean};
type DefaultPathsOptions = {maxRecursionDepth: 10};
type SpecifiedOptions = {};

type Result = ApplyDefaultOptions<PathsOptions, DefaultPathsOptions, SpecifiedOptions>;
//                                              ~~~~~~~~~~~~~~~~~~~
// Property 'leavesOnly' is missing in type 'DefaultPathsOptions' but required in type '{ maxRecursionDepth: number; leavesOnly: boolean; }'.
```

@example
```
// Complains if an option's default type does not conform to the expected type

type PathsOptions = {maxRecursionDepth?: number; leavesOnly?: boolean};
type DefaultPathsOptions = {maxRecursionDepth: 10; leavesOnly: 'no'};
type SpecifiedOptions = {};

type Result = ApplyDefaultOptions<PathsOptions, DefaultPathsOptions, SpecifiedOptions>;
//                                              ~~~~~~~~~~~~~~~~~~~
// Types of property 'leavesOnly' are incompatible. Type 'string' is not assignable to type 'boolean'.
```

@example
```
// Complains if an option's specified type does not conform to the expected type

type PathsOptions = {maxRecursionDepth?: number; leavesOnly?: boolean};
type DefaultPathsOptions = {maxRecursionDepth: 10; leavesOnly: false};
type SpecifiedOptions = {leavesOnly: 'yes'};

type Result = ApplyDefaultOptions<PathsOptions, DefaultPathsOptions, SpecifiedOptions>;
//                                                                   ~~~~~~~~~~~~~~~~
// Types of property 'leavesOnly' are incompatible. Type 'string' is not assignable to type 'boolean'.
```
*/
type ApplyDefaultOptions<
	Options extends object,
	Defaults extends Simplify<Omit<Required<Options>, RequiredKeysOf<Options>> & Partial<Record<RequiredKeysOf<Options>, never>>>,
	SpecifiedOptions extends Options,
> =
	If<IsAny<SpecifiedOptions>, Defaults,
		If<IsNever<SpecifiedOptions>, Defaults,
			Simplify<Merge<Defaults, {
				[Key in keyof SpecifiedOptions
				as Key extends OptionalKeysOf<Options> ? undefined extends SpecifiedOptions[Key] ? never : Key : Key
				]: SpecifiedOptions[Key]
			}> & Required<Options>>>>; // `& Required<Options>` ensures that `ApplyDefaultOptions<SomeOption, ...>` is always assignable to `Required<SomeOption>`

/**
Collapses literal types in a union into their corresponding primitive types, when possible. For example, `CollapseLiterals<'foo' | 'bar' | (string & {})>` returns `string`.

Note: This doesn't collapse literals within tagged types. For example, `CollapseLiterals<Tagged<'foo' | (string & {}), 'Tag'>>` returns `("foo" & Tag<"Tag", never>) | (string & Tag<"Tag", never>)` and not `string & Tag<"Tag", never>`.

Use-case: For collapsing unions created using {@link LiteralUnion}.

@example
```
import type {LiteralUnion} from 'type-fest';

type A = CollapseLiterals<'foo' | 'bar' | (string & {})>;
//=> string

type B = CollapseLiterals<LiteralUnion<1 | 2 | 3, number>>;
//=> number

type C = CollapseLiterals<LiteralUnion<'onClick' | 'onChange', `on${string}`>>;
//=> `on${string}`

type D = CollapseLiterals<'click' | 'change' | (`on${string}` & {})>;
//=> 'click' | 'change' | `on${string}`

type E = CollapseLiterals<LiteralUnion<'foo' | 'bar', string> | null | undefined>;
//=> string | null | undefined
```
*/
type CollapseLiterals<T> = {} extends T
	? T
	: T extends infer U & {}
		? U
		: T;

/**
@see {@link SomeExtend}
*/
type SomeExtendOptions = {
	/**
	Consider `never` elements to match the target type only if the target type itself is `never` (or `any`).

	- When set to `true` (default), `never` is _not_ treated as a bottom type, instead, it is treated as a type that matches only itself (or `any`).
	- When set to `false`, `never` is treated as a bottom type, and behaves as it normally would.

	@default true

	@example
	```
	import type {SomeExtend} from 'type-fest';

	type A = SomeExtend<[1, 2, never], string, {strictNever: true}>;
	//=> false

	type B = SomeExtend<[1, 2, never], string, {strictNever: false}>;
	//=> true

	type C = SomeExtend<[1, never], never, {strictNever: true}>;
	//=> true

	type D = SomeExtend<[1, never], never, {strictNever: false}>;
	//=> true

	type E = SomeExtend<[never], any, {strictNever: true}>;
	//=> true

	type F = SomeExtend<[never], any, {strictNever: false}>;
	//=> true
	```
	*/
	strictNever?: boolean;
};

type DefaultSomeExtendOptions = {
	strictNever: true;
};

/**
Returns a boolean for whether some element in an array type extends another type.

@example
```
import type {SomeExtend} from 'type-fest';

type A = SomeExtend<['1', '2', 3], number>;
//=> true

type B = SomeExtend<[1, 2, 3], string>;
//=> false

type C = SomeExtend<[string, number | string], number>;
//=> boolean

type D = SomeExtend<[true, boolean, true], false>;
//=> boolean
```

Note: Behaviour of optional elements depend on the `exactOptionalPropertyTypes` compiler option. When the option is disabled, the target type must include `undefined` for a successful match.

```
// @exactOptionalPropertyTypes: true
import type {SomeExtend} from 'type-fest';

type A = SomeExtend<[1?, 2?, '3'?], string>;
//=> true
```

```
// @exactOptionalPropertyTypes: false
import type {SomeExtend} from 'type-fest';

type A = SomeExtend<[1?, 2?, '3'?], string>;
//=> boolean

type B = SomeExtend<[1?, 2?, '3'?], string | undefined>;
//=> true
```

@see {@link SomeExtendOptions}

@category Utilities
@category Array
*/
type SomeExtend<TArray extends UnknownArray, Type, Options extends SomeExtendOptions = {}> =
	_SomeExtend<CollapseRestElement<TArray>, Type, ApplyDefaultOptions<SomeExtendOptions, DefaultSomeExtendOptions, Options>>;

type _SomeExtend<TArray extends UnknownArray, Type, Options extends Required<SomeExtendOptions>> = IfNotAnyOrNever<TArray,
	TArray extends readonly [infer First, ...infer Rest]
		? IsNever<First> extends true
			? Or<Or<IsNever<Type>, IsAny<Type>>, Not<Options['strictNever']>> extends true
				// If target `Type` is also `never`, or is `any`, or `strictNever` is disabled, return `true`.
				? true
				: _SomeExtend<Rest, Type, Options>
			: First extends Type
				? true
				: _SomeExtend<Rest, Type, Options>
		: false,
	false, false>;

/**
Returns a boolean for whether any of the given elements is `true`.

Use-cases:
- Check if at least one condition in a list of booleans is met.

@example
```
import type {OrAll} from 'type-fest';

type FFT = OrAll<[false, false, true]>;
//=> true

type FFF = OrAll<[false, false, false]>;
//=> false
```

Note: When `boolean` is passed as an element, it is distributed into separate cases, and the final result is a union of those cases.
For example, `OrAll<[false, boolean]>` expands to `OrAll<[false, true]> | OrAll<[false, false]>`, which simplifies to `true | false` (i.e., `boolean`).

@example
```
import type {OrAll} from 'type-fest';

type A = OrAll<[false, boolean]>;
//=> boolean

type B = OrAll<[true, boolean]>;
//=> true
```

Note: If `never` is passed as an element, it is treated as `false` and the result is computed accordingly.

@example
```
import type {OrAll} from 'type-fest';

type A = OrAll<[never, never, true]>;
//=> true

type B = OrAll<[never, never, false]>;
//=> false

type C = OrAll<[never, never, never]>;
//=> false

type D = OrAll<[never, never, boolean]>;
//=> boolean
```

Note: If `any` is passed as an element, it is treated as `boolean` and the result is computed accordingly.

@example
```
import type {OrAll} from 'type-fest';

type A = OrAll<[false, any]>;
//=> boolean

type B = OrAll<[true, any]>;
//=> true
```

Note: `OrAll<[]>` evaluates to `false` because there are no `true` elements in an empty tuple. See [Wikipedia: Clause (logic) > Empty clauses](https://en.wikipedia.org/wiki/Clause_(logic)#Empty_clauses:~:text=The%20truth%20evaluation%20of%20an%20empty%20disjunctive%20clause%20is%20always%20false.).

@see {@link Or}
@see {@link AndAll}
*/
type OrAll<T extends readonly boolean[]> = SomeExtend<T, true>;

/**
Returns a boolean for whether either of two given types is true.

Use-case: Constructing complex conditional types where at least one condition must be satisfied.

@example
```
import type {Or} from 'type-fest';

type TT = Or<true, true>;
//=> true

type TF = Or<true, false>;
//=> true

type FT = Or<false, true>;
//=> true

type FF = Or<false, false>;
//=> false
```

Note: When `boolean` is passed as an argument, it is distributed into separate cases, and the final result is a union of those cases.
For example, `Or<false, boolean>` expands to `Or<false, true> | Or<false, false>`, which simplifies to `true | false` (i.e., `boolean`).

@example
```
import type {Or} from 'type-fest';

type A = Or<false, boolean>;
//=> boolean

type B = Or<boolean, false>;
//=> boolean

type C = Or<true, boolean>;
//=> true

type D = Or<boolean, true>;
//=> true

type E = Or<boolean, boolean>;
//=> boolean
```

Note: If `never` is passed as an argument, it is treated as `false` and the result is computed accordingly.

@example
```
import type {Or} from 'type-fest';

type A = Or<true, never>;
//=> true

type B = Or<never, true>;
//=> true

type C = Or<false, never>;
//=> false

type D = Or<never, false>;
//=> false

type E = Or<boolean, never>;
//=> boolean

type F = Or<never, boolean>;
//=> boolean

type G = Or<never, never>;
//=> false
```

@see {@link OrAll}
@see {@link And}
@see {@link Xor}
*/
type Or<A extends boolean, B extends boolean> = OrAll<[A, B]>;

/**
@see {@link AllExtend}
*/
type AllExtendOptions = {
	/**
	Consider `never` elements to match the target type only if the target type itself is `never` (or `any`).

	- When set to `true` (default), `never` is _not_ treated as a bottom type, instead, it is treated as a type that matches only itself (or `any`).
	- When set to `false`, `never` is treated as a bottom type, and behaves as it normally would.

	@default true

	@example
	```
	import type {AllExtend} from 'type-fest';

	type A = AllExtend<[1, 2, never], number, {strictNever: true}>;
	//=> false

	type B = AllExtend<[1, 2, never], number, {strictNever: false}>;
	//=> true

	type C = AllExtend<[never, never], never, {strictNever: true}>;
	//=> true

	type D = AllExtend<[never, never], never, {strictNever: false}>;
	//=> true

	type E = AllExtend<['a', 'b', never], any, {strictNever: true}>;
	//=> true

	type F = AllExtend<['a', 'b', never], any, {strictNever: false}>;
	//=> true

	type G = AllExtend<[never, 1], never, {strictNever: true}>;
	//=> false

	type H = AllExtend<[never, 1], never, {strictNever: false}>;
	//=> false
	```
	*/
	strictNever?: boolean;
};

type DefaultAllExtendOptions = {
	strictNever: true;
};

/**
Returns a boolean for whether every element in an array type extends another type.

@example
```
import type {AllExtend} from 'type-fest';

type A = AllExtend<[1, 2, 3], number>;
//=> true

type B = AllExtend<[1, 2, '3'], number>;
//=> false

type C = AllExtend<[number, number | string], number>;
//=> boolean

type D = AllExtend<[true, boolean, true], true>;
//=> boolean
```

Note: Behaviour of optional elements depend on the `exactOptionalPropertyTypes` compiler option. When the option is disabled, the target type must include `undefined` for a successful match.

```
// @exactOptionalPropertyTypes: true
import type {AllExtend} from 'type-fest';

type A = AllExtend<[1?, 2?, 3?], number>;
//=> true
```

```
// @exactOptionalPropertyTypes: false
import type {AllExtend} from 'type-fest';

type A = AllExtend<[1?, 2?, 3?], number>;
//=> boolean

type B = AllExtend<[1?, 2?, 3?], number | undefined>;
//=> true
```

@see {@link AllExtendOptions}

@category Utilities
@category Array
*/
type AllExtend<TArray extends UnknownArray, Type, Options extends AllExtendOptions = {}> =
	_AllExtend<CollapseRestElement<TArray>, Type, ApplyDefaultOptions<AllExtendOptions, DefaultAllExtendOptions, Options>>;

type _AllExtend<TArray extends UnknownArray, Type, Options extends Required<AllExtendOptions>> = IfNotAnyOrNever<TArray,
	TArray extends readonly [infer First, ...infer Rest]
		? IsNever<First> extends true
			? Or<Or<IsNever<Type>, IsAny<Type>>, Not<Options['strictNever']>> extends true
				// If target `Type` is also `never`, or is `any`, or `strictNever` is disabled, recurse further.
				? _AllExtend<Rest, Type, Options>
				: false
			: First extends Type
				? _AllExtend<Rest, Type, Options>
				: false
		: true,
	false, false>;

/**
Returns a boolean for whether all of the given elements are `true`.

Use-cases:
- Check if all conditions in a list of booleans are met.

@example
```
import type {AndAll} from 'type-fest';

type TTT = AndAll<[true, true, true]>;
//=> true

type TTF = AndAll<[true, true, false]>;
//=> false

type TFT = AndAll<[true, false, true]>;
//=> false
```

Note: When `boolean` is passed as an element, it is distributed into separate cases, and the final result is a union of those cases.
For example, `AndAll<[true, boolean]>` expands to `AndAll<[true, true]> | AndAll<[true, false]>`, which simplifies to `true | false` (i.e., `boolean`).

@example
```
import type {AndAll} from 'type-fest';

type A = AndAll<[true, boolean]>;
//=> boolean

type B = AndAll<[false, boolean]>;
//=> false
```

Note: If any of the elements is `never`, the result becomes `false`.

@example
```
import type {AndAll} from 'type-fest';

type A = AndAll<[true, true, never]>;
//=> false

type B = AndAll<[false, never, never]>;
//=> false

type C = AndAll<[never, never, never]>;
//=> false

type D = AndAll<[boolean, true, never]>;
//=> false
```

Note: If `any` is passed as an element, it is treated as `boolean` and the result is computed accordingly.

@example
```
import type {AndAll} from 'type-fest';

type A = AndAll<[false, any]>;
//=> false

type B = AndAll<[true, any]>;
//=> boolean
```

Note: `AndAll<[]>` evaluates to `true` due to the concept of [vacuous truth](https://en.wikipedia.org/wiki/Logical_conjunction#:~:text=In%20keeping%20with%20the%20concept%20of%20vacuous%20truth%2C%20when%20conjunction%20is%20defined%20as%20an%20operator%20or%20function%20of%20arbitrary%20arity%2C%20the%20empty%20conjunction%20(AND%2Ding%20over%20an%20empty%20set%20of%20operands)%20is%20often%20defined%20as%20having%20the%20result%20true.), i.e., there are no `false` elements in an empty tuple.

@see {@link And}
@see {@link OrAll}
*/
type AndAll<T extends readonly boolean[]> = AllExtend<T, true>;

/**
Returns a boolean for whether two given types are both true.

Use-case: Constructing complex conditional types where multiple conditions must be satisfied.

@example
```
import type {And} from 'type-fest';

type TT = And<true, true>;
//=> true

type TF = And<true, false>;
//=> false

type FT = And<false, true>;
//=> false

type FF = And<false, false>;
//=> false
```

Note: When `boolean` is passed as an argument, it is distributed into separate cases, and the final result is a union of those cases.
For example, `And<true, boolean>` expands to `And<true, true> | And<true, false>`, which simplifies to `true | false` (i.e., `boolean`).

@example
```
import type {And} from 'type-fest';

type A = And<true, boolean>;
//=> boolean

type B = And<boolean, true>;
//=> boolean

type C = And<false, boolean>;
//=> false

type D = And<boolean, false>;
//=> false

type E = And<boolean, boolean>;
//=> boolean
```

Note: If either of the types is `never`, the result becomes `false`.

@example
```
import type {And} from 'type-fest';

type A = And<true, never>;
//=> false

type B = And<never, true>;
//=> false

type C = And<false, never>;
//=> false

type D = And<never, false>;
//=> false

type E = And<boolean, never>;
//=> false

type F = And<never, boolean>;
//=> false

type G = And<never, never>;
//=> false
```

@see {@link AndAll}
@see {@link Or}
@see {@link Xor}
*/
type And<A extends boolean, B extends boolean> = AndAll<[A, B]>;

/**
Returns a boolean for whether a given number is greater than another number.

@example
```
import type {GreaterThan} from 'type-fest';

type A = GreaterThan<1, -5>;
//=> true

type B = GreaterThan<1, 1>;
//=> false

type C = GreaterThan<1, 5>;
//=> false
```

Note: If either argument is the non-literal `number` type, the result is `boolean`.

@example
```
import type {GreaterThan} from 'type-fest';

type A = GreaterThan<number, 1>;
//=> boolean

type B = GreaterThan<1, number>;
//=> boolean

type C = GreaterThan<number, number>;
//=> boolean
```

@example
```
import type {GreaterThan} from 'type-fest';

// Use `GreaterThan` to constrain a function parameter to positive numbers.
declare function setPositive<N extends number>(value: GreaterThan<N, 0> extends true ? N : never): void;

setPositive(1); // ✅ Allowed
setPositive(2); // ✅ Allowed

// @ts-expect-error
setPositive(0);

// @ts-expect-error
setPositive(-1);
```
*/
type GreaterThan<A extends number, B extends number> =
	A extends number // For distributing `A`
		? B extends number // For distributing `B`
			? number extends A | B
				? boolean
				: [
					IsEqual<A, PositiveInfinity>, IsEqual<A, NegativeInfinity>,
					IsEqual<B, PositiveInfinity>, IsEqual<B, NegativeInfinity>,
				] extends infer R extends [boolean, boolean, boolean, boolean]
					? Or<
						And<IsEqual<R[0], true>, IsEqual<R[2], false>>,
						And<IsEqual<R[3], true>, IsEqual<R[1], false>>
					> extends true
						? true
						: Or<
							And<IsEqual<R[1], true>, IsEqual<R[3], false>>,
							And<IsEqual<R[2], true>, IsEqual<R[0], false>>
						> extends true
							? false
							: true extends R[number]
								? false
								: [IsNegative<A>, IsNegative<B>] extends infer R extends [boolean, boolean]
									? [true, false] extends R
										? false
										: [false, true] extends R
											? true
											: [false, false] extends R
												? PositiveNumericStringGt<`${A}`, `${B}`>
												: PositiveNumericStringGt<`${NumberAbsolute<B>}`, `${NumberAbsolute<A>}`>
									: never
					: never
			: never // Should never happen
		: never; // Should never happen

/**
Returns a boolean for whether a given number is greater than or equal to another number.

@example
```
import type {GreaterThanOrEqual} from 'type-fest';

type A = GreaterThanOrEqual<1, -5>;
//=> true

type B = GreaterThanOrEqual<1, 1>;
//=> true

type C = GreaterThanOrEqual<1, 5>;
//=> false
```

Note: If either argument is the non-literal `number` type, the result is `boolean`.

@example
```
import type {GreaterThanOrEqual} from 'type-fest';

type A = GreaterThanOrEqual<number, 1>;
//=> boolean

type B = GreaterThanOrEqual<1, number>;
//=> boolean

type C = GreaterThanOrEqual<number, number>;
//=> boolean
```

@example
```
import type {GreaterThanOrEqual} from 'type-fest';

// Use `GreaterThanOrEqual` to constrain a function parameter to non-negative numbers.
declare function setNonNegative<N extends number>(value: GreaterThanOrEqual<N, 0> extends true ? N : never): void;

setNonNegative(0); // ✅ Allowed
setNonNegative(1); // ✅ Allowed

// @ts-expect-error
setNonNegative(-1);

// @ts-expect-error
setNonNegative(-2);
```
*/
type GreaterThanOrEqual<A extends number, B extends number> = number extends A | B
	? boolean
	: A extends number // For distributing `A`
		? B extends number // For distributing `B`
			? A extends B
				? true
				: GreaterThan<A, B>
			: never // Should never happen
		: never; // Should never happen

/**
Returns a boolean for whether a given number is less than another number.

@example
```
import type {LessThan} from 'type-fest';

type A = LessThan<1, -5>;
//=> false

type B = LessThan<1, 1>;
//=> false

type C = LessThan<1, 5>;
//=> true
```

Note: If either argument is the non-literal `number` type, the result is `boolean`.

@example
```
import type {LessThan} from 'type-fest';

type A = LessThan<number, 1>;
//=> boolean

type B = LessThan<1, number>;
//=> boolean

type C = LessThan<number, number>;
//=> boolean
```

@example
```
import type {LessThan} from 'type-fest';

// Use `LessThan` to constrain a function parameter to negative numbers.
declare function setNegative<N extends number>(value: LessThan<N, 0> extends true ? N : never): void;

setNegative(-1); // ✅ Allowed
setNegative(-2); // ✅ Allowed

// @ts-expect-error
setNegative(0);

// @ts-expect-error
setNegative(1);
```
*/
type LessThan<A extends number, B extends number> =
	GreaterThanOrEqual<A, B> extends infer Result
		? Result extends true
			? false
			: true
		: never; // Should never happen

// Should never happen

/**
Returns the maximum value from a tuple of integers.

Note:
- Float numbers are not supported.

@example
```
type A = TupleMax<[1, 2, 5, 3]>;
//=> 5

type B = TupleMax<[1, 2, 5, 3, 99, -1]>;
//=> 99
```
*/
type TupleMax<A extends number[], Result extends number = NegativeInfinity> = number extends A[number]
	? never :
	A extends [infer F extends number, ...infer R extends number[]]
		? GreaterThan<F, Result> extends true
			? TupleMax<R, F>
			: TupleMax<R, Result>
		: Result;

/**
Returns the difference between two numbers.

Note:
- A or B can only support `-999` ~ `999`.

@example
```
import type {Subtract, PositiveInfinity} from 'type-fest';

type A = Subtract<333, 222>;
//=> 111

type B = Subtract<111, -222>;
//=> 333

type C = Subtract<-111, 222>;
//=> -333

type D = Subtract<18, 96>;
//=> -78

type E = Subtract<PositiveInfinity, 9999>;
//=> Infinity

type F = Subtract<PositiveInfinity, PositiveInfinity>;
//=> number
```

@category Numeric
*/
// TODO: Support big integer.
type Subtract<A extends number, B extends number> =
	// Handle cases when A or B is the actual "number" type
	number extends A | B ? number
		// Handle cases when A and B are both +/- infinity
		: A extends B & (PositiveInfinity | NegativeInfinity) ? number
			// Handle cases when A is - infinity or B is + infinity
			: A extends NegativeInfinity ? NegativeInfinity : B extends PositiveInfinity ? NegativeInfinity
				// Handle cases when A is + infinity or B is - infinity
				: A extends PositiveInfinity ? PositiveInfinity : B extends NegativeInfinity ? PositiveInfinity
					// Handle case when numbers are equal to each other
					: A extends B ? 0
						// Handle cases when A or B is 0
						: A extends 0 ? ReverseSign<B> : B extends 0 ? A
							// Handle remaining regular cases
							: SubtractPostChecks<A, B>;

/**
Subtracts two numbers A and B, such that they are not equal and neither of them are 0, +/- infinity or the `number` type
*/
type SubtractPostChecks<A extends number, B extends number, AreNegative = [IsNegative<A>, IsNegative<B>]> =
	AreNegative extends [false, false]
		? SubtractPositives<A, B>
		: AreNegative extends [true, true]
			// When both numbers are negative we subtract the absolute values and then reverse the sign
			? ReverseSign<SubtractPositives<NumberAbsolute<A>, NumberAbsolute<B>>>
			// When the signs are different we can add the absolute values and then reverse the sign if A < B
			: [...TupleOf<NumberAbsolute<A>>, ...TupleOf<NumberAbsolute<B>>] extends infer R extends unknown[]
				? LessThan<A, B> extends true ? ReverseSign<R['length']> : R['length']
				: never;

/**
Subtracts two positive numbers.
*/
type SubtractPositives<A extends number, B extends number> =
	LessThan<A, B> extends true
		// When A < B we can reverse the result of B - A
		? ReverseSign<SubtractIfAGreaterThanB<B, A>>
		: SubtractIfAGreaterThanB<A, B>;

/**
Subtracts two positive numbers A and B such that A > B.
*/
type SubtractIfAGreaterThanB<A extends number, B extends number> =
	// This is where we always want to end up and do the actual subtraction
	TupleOf<A> extends [...TupleOf<B>, ...infer R]
		? R['length']
		: never;

/**
Returns the sum of two numbers.

Note:
- A or B can only support `-999` ~ `999`.

@example
```
import type {Sum, PositiveInfinity, NegativeInfinity} from 'type-fest';

type A = Sum<111, 222>;
//=> 333

type B = Sum<-111, 222>;
//=> 111

type C = Sum<111, -222>;
//=> -111

type D = Sum<PositiveInfinity, -9999>;
//=> Infinity

type E = Sum<PositiveInfinity, NegativeInfinity>;
//=> number
```

@category Numeric
*/
// TODO: Support big integer.
type Sum<A extends number, B extends number> =
	// Handle cases when A or B is the actual "number" type
	number extends A | B ? number
		// Handle cases when A and B are both +/- infinity
		: A extends B & (PositiveInfinity | NegativeInfinity) ? A // A or B could be used here as they are equal
			// Handle cases when A and B are opposite infinities
			: A | B extends PositiveInfinity | NegativeInfinity ? number
				// Handle cases when A is +/- infinity
				: A extends PositiveInfinity | NegativeInfinity ? A
					// Handle cases when B is +/- infinity
					: B extends PositiveInfinity | NegativeInfinity ? B
						// Handle cases when A or B is 0 or it's the same number with different signs
						: A extends 0 ? B : B extends 0 ? A : A extends ReverseSign<B> ? 0
							// Handle remaining regular cases
							: SumPostChecks<A, B>;

/**
Adds two numbers A and B, such that they are not equal with different signs and neither of them are 0, +/- infinity or the `number` type
*/
type SumPostChecks<A extends number, B extends number, AreNegative = [IsNegative<A>, IsNegative<B>]> =
	AreNegative extends [false, false]
		// When both numbers are positive we can add them together
		? SumPositives<A, B>
		: AreNegative extends [true, true]
			// When both numbers are negative we add the absolute values and then reverse the sign
			? ReverseSign<SumPositives<NumberAbsolute<A>, NumberAbsolute<B>>>
			// When the signs are different we can subtract the absolute values, remove the sign
			// and then reverse the sign if the larger absolute value is negative
			: NumberAbsolute<Subtract<NumberAbsolute<A>, NumberAbsolute<B>>> extends infer Result extends number
				? TupleMax<[NumberAbsolute<A>, NumberAbsolute<B>]> extends infer Max_ extends number
					? Max_ extends A | B
						// The larger absolute value is positive, so the result is positive
						? Result
						// The larger absolute value is negative, so the result is negative
						: ReverseSign<Result>
					: never
				: never;

/**
Adds two positive numbers.
*/
type SumPositives<A extends number, B extends number> =
	[...TupleOf<A>, ...TupleOf<B>]['length'] extends infer Result extends number
		? Result
		: never;

/**
Paths options.

@see {@link Paths}
*/
type PathsOptions = {
	/**
	The maximum depth to recurse when searching for paths. Range: 0 ~ 10.

	@default 5
	*/
	maxRecursionDepth?: number;

	/**
	Use bracket notation for array indices and numeric object keys.

	@default false

	@example
	```
	import type {Paths} from 'type-fest';

	type ArrayExample = {
		array: ['foo'];
	};

	type A = Paths<ArrayExample, {bracketNotation: false}>;
	//=> 'array' | 'array.0'

	type B = Paths<ArrayExample, {bracketNotation: true}>;
	//=> 'array' | 'array[0]'
	```

	@example
	```
	import type {Paths} from 'type-fest';

	type NumberKeyExample = {
		1: ['foo'];
	};

	type A = Paths<NumberKeyExample, {bracketNotation: false}>;
	//=> 1 | '1' | '1.0'

	type B = Paths<NumberKeyExample, {bracketNotation: true}>;
	//=> '[1]' | '[1][0]'
	```
	*/
	bracketNotation?: boolean;

	/**
	Only include leaf paths in the output.

	@default false

	@example
	```
	import type {Paths} from 'type-fest';

	type Post = {
		id: number;
		author: {
			id: number;
			name: {
				first: string;
				last: string;
			};
		};
	};

	type AllPaths = Paths<Post, {leavesOnly: false}>;
	//=> 'id' | 'author' | 'author.id' | 'author.name' | 'author.name.first' | 'author.name.last'

	type LeafPaths = Paths<Post, {leavesOnly: true}>;
	//=> 'id' | 'author.id' | 'author.name.first' | 'author.name.last'
	```

	@example
	```
	import type {Paths} from 'type-fest';

	type ArrayExample = {
		array: Array<{foo: string}>;
		tuple: [string, {bar: string}];
	};

	type AllPaths = Paths<ArrayExample, {leavesOnly: false}>;
	//=> 'array' | 'tuple' | `array.${number}` | `array.${number}.foo` | 'tuple.0' | 'tuple.1' | 'tuple.1.bar'

	type LeafPaths = Paths<ArrayExample, {leavesOnly: true}>;
	//=> `array.${number}.foo` | 'tuple.0' | 'tuple.1.bar'
	```
	*/
	leavesOnly?: boolean;

	/**
	Only include paths at the specified depth. By default all paths up to {@link PathsOptions.maxRecursionDepth | `maxRecursionDepth`} are included.

	Note: Depth starts at `0` for root properties.

	@default number

	@example
	```
	import type {Paths} from 'type-fest';

	type Post = {
		id: number;
		author: {
			id: number;
			name: {
				first: string;
				last: string;
			};
		};
	};

	type DepthZero = Paths<Post, {depth: 0}>;
	//=> 'id' | 'author'

	type DepthOne = Paths<Post, {depth: 1}>;
	//=> 'author.id' | 'author.name'

	type DepthTwo = Paths<Post, {depth: 2}>;
	//=> 'author.name.first' | 'author.name.last'

	type LeavesAtDepthOne = Paths<Post, {leavesOnly: true; depth: 1}>;
	//=> 'author.id'
	```
	*/
	depth?: number;
};

type DefaultPathsOptions = {
	maxRecursionDepth: 5;
	bracketNotation: false;
	leavesOnly: false;
	depth: number;
};

/**
Generate a union of all possible paths to properties in the given object.

It also works with arrays.

Use-case: You want a type-safe way to access deeply nested properties in an object.

@example
```
import type {Paths} from 'type-fest';

type Project = {
	filename: string;
	listA: string[];
	listB: [{filename: string}];
	folder: {
		subfolder: {
			filename: string;
		};
	};
};

type ProjectPaths = Paths<Project>;
//=> 'filename' | 'listA' | 'listB' | 'folder' | `listA.${number}` | 'listB.0' | 'listB.0.filename' | 'folder.subfolder' | 'folder.subfolder.filename'

declare function open<Path extends ProjectPaths>(path: Path): void;

open('filename'); // Pass
open('folder.subfolder'); // Pass
open('folder.subfolder.filename'); // Pass
// @ts-expect-error
open('foo'); // TypeError

// Also works with arrays
open('listA.1'); // Pass
open('listB.0'); // Pass
// @ts-expect-error
open('listB.1'); // TypeError. Because listB only has one element.
```

@category Object
@category Array
*/
type Paths<T, Options extends PathsOptions = {}> = _Paths<T, ApplyDefaultOptions<PathsOptions, DefaultPathsOptions, Options>>;

type _Paths<T, Options extends Required<PathsOptions>, CurrentDepth extends number = 0> =
	T extends NonRecursiveType | Exclude<MapsSetsOrArrays, UnknownArray>
		? never
		: IsAny<T> extends true
			? never
			: T extends object
				? InternalPaths<Required<T>, Options, CurrentDepth>
				: never;

type InternalPaths<T, Options extends Required<PathsOptions>, CurrentDepth extends number> =
	{[Key in keyof T]: Key extends string | number // Limit `Key` to `string | number`
		? (
			And<Options['bracketNotation'], IsNumberLike<Key>> extends true
				? `[${Key}]`
				: CurrentDepth extends 0
					// Return both `Key` and `ToString<Key>` because for number keys, like `1`, both `1` and `'1'` are valid keys.
					? Key | ToString<Key>
					: `.${(Key | ToString<Key>)}`
		) extends infer TransformedKey extends string | number
			? ((Options['leavesOnly'] extends true
				? Options['maxRecursionDepth'] extends CurrentDepth
					? TransformedKey
					: IsNever<T[Key]> extends true
						? TransformedKey
						: T[Key] extends infer Value // For distributing `T[Key]`
							? (Value extends readonly [] | NonRecursiveType | Exclude<MapsSetsOrArrays, UnknownArray>
								? TransformedKey
								: IsNever<keyof Value> extends true // Check for empty object & `unknown`, because `keyof unknown` is `never`.
									? TransformedKey
									: never)
							: never // Should never happen
				: TransformedKey
			) extends infer _TransformedKey
				// If `depth` is provided, the condition becomes truthy only when it matches `CurrentDepth`.
				// Otherwise, since `depth` defaults to `number`, the condition is always truthy, returning paths at all depths.
				? CurrentDepth extends Options['depth']
					? _TransformedKey
					: never
				: never)
			// Recursively generate paths for the current key
			| (GreaterThan<Options['maxRecursionDepth'], CurrentDepth> extends true // Limit the depth to prevent infinite recursion
				? `${TransformedKey}${_Paths<T[Key], Options, Sum<CurrentDepth, 1>> & (string | number)}`
				: never)
			: never
		: never
	}[keyof T & (T extends UnknownArray ? number : unknown)];

type _LiteralStringUnion<T> = LiteralUnion<T, string>;

/**
Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.

Currently, when a union type of a primitive type is combined with literal types, TypeScript loses all information about the combined literals. Thus, when such type is used in an IDE with autocompletion, no suggestions are made for the declared literals.

This type is a workaround for [Microsoft/TypeScript#29729](https://github.com/Microsoft/TypeScript/issues/29729). It will be removed as soon as it's not needed anymore.

@example
```
import type {LiteralUnion} from 'type-fest';

// Before

type Pet = 'dog' | 'cat' | string;

const petWithoutAutocomplete: Pet = '';
// Start typing in your TypeScript-enabled IDE.
// You **will not** get auto-completion for `dog` and `cat` literals.

// After

type Pet2 = LiteralUnion<'dog' | 'cat', string>;

const petWithAutoComplete: Pet2 = '';
// You **will** get auto-completion for `dog` and `cat` literals.
```

@category Type
*/
type LiteralUnion<
	LiteralType,
	BaseType extends Primitive$1,
> = LiteralType | (BaseType & Record<never, never>);

/**
Get keys of the given type as strings.

Number keys are converted to strings.

Use-cases:
- Get string keys from a type which may have number keys.
- Makes it possible to index using strings retrieved from template types.

@example
```
import type {KeyAsString} from 'type-fest';

type Foo = {
	1: number;
	stringKey: string;
};

type StringKeysOfFoo = KeyAsString<Foo>;
//=> 'stringKey' | '1'
```

@category Object
*/
type KeyAsString<BaseType> = `${Extract<keyof BaseType, string | number>}`;

/**
Split options.

@see {@link Split}
*/
type SplitOptions = {
	/**
	When enabled, instantiations with non-literal string types (e.g., `string`, `Uppercase<string>`, `on${string}`) simply return back `string[]` without performing any splitting, as the exact structure cannot be statically determined.

	@default true

	@example
	```ts
	import type {Split} from 'type-fest';

	type Example1 = Split<`foo.${string}.bar`, '.', {strictLiteralChecks: false}>;
	//=> ['foo', string, 'bar']

	type Example2 = Split<`foo.${string}`, '.', {strictLiteralChecks: true}>;
	//=> string[]

	type Example3 = Split<'foobarbaz', `b${string}`, {strictLiteralChecks: false}>;
	//=> ['foo', 'r', 'z']

	type Example4 = Split<'foobarbaz', `b${string}`, {strictLiteralChecks: true}>;
	//=> string[]
	```
	*/
	strictLiteralChecks?: boolean;
};

type DefaultSplitOptions = {
	strictLiteralChecks: true;
};

/**
Represents an array of strings split using a given character or character set.

Use-case: Defining the return type of a method like `String.prototype.split`.

@example
```
import type {Split} from 'type-fest';

declare function split<S extends string, D extends string>(string: S, separator: D): Split<S, D>;

type Item = 'foo' | 'bar' | 'baz' | 'waldo';
const items = 'foo,bar,baz,waldo';
const array: Item[] = split(items, ',');
```

@see {@link SplitOptions}

@category String
@category Template literal
*/
type Split<
	S extends string,
	Delimiter extends string,
	Options extends SplitOptions = {},
> =
	SplitHelper<S, Delimiter, ApplyDefaultOptions<SplitOptions, DefaultSplitOptions, Options>>;

type SplitHelper<
	S extends string,
	Delimiter extends string,
	Options extends Required<SplitOptions>,
	Accumulator extends string[] = [],
> = S extends string // For distributing `S`
	? Delimiter extends string // For distributing `Delimiter`
		// If `strictLiteralChecks` is `false` OR `S` and `Delimiter` both are string literals, then perform the split
		? Or<Not<Options['strictLiteralChecks']>, And<IsStringLiteral<S>, IsStringLiteral<Delimiter>>> extends true
			? S extends `${infer Head}${Delimiter}${infer Tail}`
				? SplitHelper<Tail, Delimiter, Options, [...Accumulator, Head]>
				: Delimiter extends ''
					? S extends ''
						? Accumulator
						: [...Accumulator, S]
					: [...Accumulator, S]
			// Otherwise, return `string[]`
			: string[]
		: never // Should never happen
	: never; // Should never happen

type GetOptions = {
	/**
	Include `undefined` in the return type when accessing properties.

	Setting this to `false` is not recommended.

	@default true
	*/
	strict?: boolean;
};

type DefaultGetOptions = {
	strict: true;
};

/**
Like the `Get` type but receives an array of strings as a path parameter.
*/
type GetWithPath<BaseType, Keys, Options extends Required<GetOptions>> =
	Keys extends readonly []
		? BaseType
		: Keys extends readonly [infer Head, ...infer Tail]
			? GetWithPath<
				PropertyOf<BaseType, Extract<Head, string>, Options>,
				Extract<Tail, string[]>,
				Options
			>
			: never;

/**
Adds `undefined` to `Type` if `strict` is enabled.
*/
type Strictify<Type, Options extends Required<GetOptions>> =
	Options['strict'] extends false ? Type : (Type | undefined);

/**
If `Options['strict']` is `true`, includes `undefined` in the returned type when accessing properties on `Record<string, any>`.

Known limitations:
- Does not include `undefined` in the type on object types with an index signature (for example, `{a: string; [key: string]: string}`).
*/
type StrictPropertyOf<BaseType, Key extends keyof BaseType, Options extends Required<GetOptions>> =
	Record<string, any> extends BaseType
		? string extends keyof BaseType
			? Strictify<BaseType[Key], Options> // Record<string, any>
			: BaseType[Key] // Record<'a' | 'b', any> (Records with a string union as keys have required properties)
		: BaseType[Key];

/**
Splits a dot-prop style path into a tuple comprised of the properties in the path. Handles square-bracket notation.

@example
```
type A = ToPath<'foo.bar.baz'>;
//=> ['foo', 'bar', 'baz']

type B = ToPath<'foo[0].bar.baz'>;
//=> ['foo', '0', 'bar', 'baz']
```
*/
type ToPath<S extends string> = Split<FixPathSquareBrackets<S>, '.', {strictLiteralChecks: false}>;

/**
Replaces square-bracketed dot notation with dots, for example, `foo[0].bar` -> `foo.0.bar`.
*/
type FixPathSquareBrackets<Path extends string> =
	Path extends `[${infer Head}]${infer Tail}`
		? Tail extends `[${string}`
			? `${Head}.${FixPathSquareBrackets<Tail>}`
			: `${Head}${FixPathSquareBrackets<Tail>}`
		: Path extends `${infer Head}[${infer Middle}]${infer Tail}`
			? `${Head}.${FixPathSquareBrackets<`[${Middle}]${Tail}`>}`
			: Path;

/**
Returns true if `LongString` is made up out of `Substring` repeated 0 or more times.

@example
```
type A = ConsistsOnlyOf<'aaa', 'a'>; //=> true
type B = ConsistsOnlyOf<'ababab', 'ab'>; //=> true
type C = ConsistsOnlyOf<'aBa', 'a'>; //=> false
type D = ConsistsOnlyOf<'', 'a'>; //=> true
```
*/
type ConsistsOnlyOf<LongString extends string, Substring extends string> =
	LongString extends ''
		? true
		: LongString extends `${Substring}${infer Tail}`
			? ConsistsOnlyOf<Tail, Substring>
			: false;

/**
Convert a type which may have number keys to one with string keys, making it possible to index using strings retrieved from template types.

@example
```
type WithNumbers = {foo: string; 0: boolean};
type WithStrings = WithStringKeys<WithNumbers>;

type WithNumbersKeys = keyof WithNumbers;
//=> 'foo' | 0
type WithStringsKeys = keyof WithStrings;
//=> 'foo' | '0'
```
*/
type WithStringKeys<BaseType> = {
	[Key in KeyAsString<BaseType>]: UncheckedIndex<BaseType, Key>
};

/**
Perform a `T[U]` operation if `T` supports indexing.
*/
type UncheckedIndex<T, U extends string | number> = [T] extends [Record<string | number, any>] ? T[U] : never;

/**
Get a property of an object or array. Works when indexing arrays using number-literal-strings, for example, `PropertyOf<number[], '0'> = number`, and when indexing objects with number keys.

Note:
- Returns `unknown` if `Key` is not a property of `BaseType`, since TypeScript uses structural typing, and it cannot be guaranteed that extra properties unknown to the type system will exist at runtime.
- Returns `undefined` from nullish values, to match the behaviour of most deep-key libraries like `lodash`, `dot-prop`, etc.
*/
type PropertyOf<BaseType, Key extends string, Options extends Required<GetOptions>> =
	BaseType extends null | undefined
		? undefined
		: Key extends keyof BaseType
			? StrictPropertyOf<BaseType, Key, Options>
			// Handle arrays and tuples
			: BaseType extends readonly unknown[]
				? Key extends `${number}`
					// For arrays with unknown length (regular arrays)
					? number extends BaseType['length']
						? Strictify<BaseType[number], Options>
						// For tuples: check if the index is valid
						: Key extends keyof BaseType
							? Strictify<BaseType[Key & keyof BaseType], Options>
							// Out-of-bounds access for tuples
							: unknown
					// Non-numeric string key for arrays/tuples
					: unknown
				// Handle array-like objects
				: BaseType extends {
					[n: number]: infer Item;
					length: number; // Note: This is needed to avoid being too lax with records types using number keys like `{0: string; 1: boolean}`.
				}
					? (
						ConsistsOnlyOf<Key, DigitCharacter> extends true
							? Strictify<Item, Options>
							: unknown
					)
					: Key extends keyof WithStringKeys<BaseType>
						? StrictPropertyOf<WithStringKeys<BaseType>, Key, Options>
						: unknown;

// This works by first splitting the path based on `.` and `[...]` characters into a tuple of string keys. Then it recursively uses the head key to get the next property of the current object, until there are no keys left. Number keys extract the item type from arrays, or are converted to strings to extract types from tuples and dictionaries with number keys.
/**
Get a deeply-nested property from an object using a key path, like Lodash's `.get()` function.

Use-case: Retrieve a property from deep inside an API response or some other complex object.

@example
```
import type {Get} from 'type-fest';

declare function get<BaseType, const Path extends string | readonly string[]>(object: BaseType, path: Path): Get<BaseType, Path>;

type ApiResponse = {
	hits: {
		hits: Array<{
			_id: string;
			_source: {
				name: Array<{
					given: string[];
					family: string;
				}>;
				birthDate: string;
			};
		}>;
	};
};

const getName = (apiResponse: ApiResponse) => get(apiResponse, 'hits.hits[0]._source.name');
//=> (apiResponse: ApiResponse) => {
// 	given: string[];
// 	family: string;
// }[] | undefined

// Path also supports a readonly array of strings
const getNameWithPathArray = (apiResponse: ApiResponse) => get(apiResponse, ['hits', 'hits', '0', '_source', 'name']);
//=> (apiResponse: ApiResponse) => {
// 	given: string[];
// 	family: string;
// }[] | undefined

// Non-strict mode:
type A = Get<string[], '3', {strict: false}>;
//=> string

type B = Get<Record<string, string>, 'foo', {strict: true}>;
//=> string | undefined
```

@category Object
@category Array
@category Template literal
*/
type Get<
	BaseType,
	Path extends
	| readonly string[]
	| _LiteralStringUnion<ToString<Paths<BaseType, {bracketNotation: false; maxRecursionDepth: 2}> | Paths<BaseType, {bracketNotation: true; maxRecursionDepth: 2}>>>,
	Options extends GetOptions = {},
> =
	GetWithPath<
		BaseType,
		Path extends string ? ToPath<Path> : Path,
		ApplyDefaultOptions<GetOptions, DefaultGetOptions, Options>
	>;

/**
 * 将联合类型转换为交叉类型
 *
 * 将多个对象的联合类型合并为一个包含所有属性的对象类型。
 * 这在需要将多个可能的类型合并为一个统一类型时非常有用。
 *
 * @template T - 输入的联合类型
 * @example
 * ```ts
 * type A = { x: number };
 * type B = { y: string };
 * type Result = Union<A | B>; // { x: number; y: string }
 * ```
 */
type Union<T> = T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
/**
 * 可变记录类型 - 用于构建类型安全的联合记录
 *
 * 创建一个基于类型键的联合类型系统，类似于 TypeScript 的 discriminated unions。
 * 常用于构建状态机、动作类型或消息类型系统。
 *
 * @template Items - 各种类别的类型定义集合
 * @template KindKey - 用于区分类型的键名，默认为 "type"
 * @template Share - 所有类型共享的属性
 * @template DefaultKind - 默认类型，该类型的 KindKey 是可选的
 *
 * @example
 * ```ts
 * type Actions = MutableRecord<{
 *   increment: { amount: number };
 *   decrement: { amount: number };
 *   reset: {};
 * }, "type", never, "reset">;
 *
 * // 结果包含：
 * // { type: "increment"; amount: number } |
 * // { type: "decrement"; amount: number } |
 * // { type?: "reset" }  // reset 的 type 是可选的
 * ```
 */
type MutableRecord<Items, KindKey extends string = "type", Share = unknown, DefaultKind extends keyof Items = never> = {
    [Kind in keyof Items]: Union<{
        [type in KindKey]: Kind;
    } & Items[Kind] & Share>;
}[Exclude<keyof Items, DefaultKind>] | (DefaultKind extends never ? never : Union<{
    [K in KindKey]?: DefaultKind;
} & Items[DefaultKind] & Share>);
/**
 * 从记录类型中提取所有值的联合类型
 *
 * 将对象的所有值类型合并为一个联合类型，常用于提取可配置项的可能类型。
 *
 * @template T - 输入的记录类型
 * @example
 * ```ts
 * type Config = {
 *   a: { type: "text" };
 *   b: { type: "number" };
 *   c: { type: "boolean" };
 * };
 * type ValueTypes = PickValues<Config>;
 * // { type: "text" } | { type: "number" } | { type: "boolean" }
 * ```
 */
type PickValues<T extends Record<string, any>> = Union<UnionToIntersection<T[keyof T]>>;
/**
 * 提取计算属性的返回值类型
 *
 * 从各种计算属性描述符或函数中提取最终的值类型。支持：
 * - Schema 描述符构建器
 * - 同步计算属性描述符
 * - 异步计算属性描述符（返回 AsyncComputedValue）
 * - Watch 描述符
 * - 普通计算函数（同步和异步）
 *
 * @template T - 计算属性描述符或函数类型
 * @example
 * ```ts
 * // 同步计算
 * type SyncResult = PickComputedResult<(scope: any) => string>; // string
 *
 * // 异步计算
 * type AsyncResult = PickComputedResult<computed<(scope: any) => Promise<number>>>;
 * // AsyncComputedValue<number>
 * ```
 */
type PickComputedResult<T> = T extends SchemaDescriptorBuilder<infer X> ? X : T extends SyncComputedDescriptorBuilder<infer X, any> ? X : T extends AsyncLiteComputedDescriptorBuilder<infer X, any> ? X : T extends AsyncComputedDescriptorBuilder<infer X, any> ? AsyncComputedValue<X> : T extends WatchDescriptorBuilder<infer X, any> ? X : T extends ComputedGetter<infer X, any> ? X : T extends AsyncComputedGetter<infer X, any> ? AsyncComputedValue<X> : T;
/**
 * 转换状态中的计算属性函数为返回值类型
 *
 * 递归遍历状态树，将所有计算属性函数替换为其返回值类型。
 * 这是 AutoStore 类型系统的核心，用于推导计算后的状态类型。
 *
 * 支持以下转换：
 * - 同步计算函数: `(scope) => T` → `T`
 * - 异步计算函数: `computed((scope) => Promise<T>)` → `AsyncComputedValue<T>`
 * - 数组类型: 递归处理数组元素
 * - 嵌套对象: 递归处理对象属性
 *
 * @template T - 包含计算属性函数的状态类型
 * @example
 * ```ts
 * type State = ComputedState<{
 *   count: number;
 *   double: (scope) => scope.count * 2;
 *   user: {
 *     name: string;
 *     greeting: (scope) => `Hello, ${scope.name}`;
 *   };
 * }>;
 * // 结果类型:
 * // {
 * //   count: number;
 * //   double: number;
 * //   user: {
 * //     name: string;
 * //     greeting: string;
 * //   };
 * // }
 * ```
 */
type ComputedState<T> = T extends unknown[] ? ComputedState<T[number]>[] : T extends RawObject<T> ? T : T extends (...args: any) => any ? PickComputedResult<T> : T extends Dict ? {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? PickComputedResult<T[K]> : T[K] extends Record<string, any> ? ComputedState<T[K]> : T[K] extends unknown[] ? ComputedState<T[K][number]>[] : T[K];
} : T;
/**
 * 状态路径类型
 *
 * 获取状态树中所有可能的路径字符串，用于类型安全的路径访问。
 * 路径基于计算后的状态类型（ComputedState），因此会排除计算属性函数本身。
 *
 * @template T - 原始状态类型
 * @example
 * ```ts
 * type State = {
 *   user: {
 *     name: string;
 *     age: number;
 *   };
 *   count: number;
 * };
 * type Paths = StatePath<State>;
 * // "user" | "user.name" | "user.age" | "count"
 * ```
 */
type StatePath<T> = ObjectKeyPaths<ComputedState<T>>;
/**
 * 必需的计算状态类型
 *
 * 在 ComputedState 的基础上，排除所有 undefined 的类型，并确保所有属性都是必需的。
 * 使用 TypeScript 的 `-?` 映射修饰符移除可选标记。
 *
 * @template T - 原始状态类型，必须是 Record 类型
 * @example
 * ```ts
 * type State = {
 *   name?: string;
 *   age: number | undefined;
 *   fullName?: () => string;
 * };
 * type RequiredState = RequiredComputedState<State>;
 * // { name: string; age: number; fullName: string }
 * ```
 */
type RequiredComputedState<T extends Record<string, any>> = {
    [K in keyof T]-?: Exclude<T[K], undefined> extends (...args: any) => any ? PickComputedResult<Exclude<T[K], undefined>> : Required<T[K]> extends Record<string, any> ? ComputedState<Exclude<T[K], undefined>> : Exclude<T[K], undefined>;
};
/**
 * 全局 AutoStore 扩展注册表
 *
 * 用于在运行时注册 AutoStore 的扩展插件。所有扩展函数都会在创建 store 实例时被调用，
 * 允许插件向 store 实例添加额外的功能或属性。
 *
 * @example
 * ```ts
 * // 在插件中注册扩展
 * globalThis.__AUTOSTORE_EXTENDS__ ||= [];
 * globalThis.__AUTOSTORE_EXTENDS__.push((store) => {
 *   store.pluginMethod = () => { ... };
 * });
 * ```
 */
declare global {
    var __AUTOSTORE_EXTENDS__: (<S extends AutoStore<any>>(store: S) => void)[];
}
/**
 * JavaScript 原始类型联合
 *
 * 包含所有 JavaScript 原始数据类型，用于类型检查和约束。
 *
 * @example
 * ```ts
 * function isPrimitive(value: unknown): value is Primitive {
 *   return value === null || (typeof value !== 'object' && typeof value !== 'function');
 * }
 * ```
 */
type Primitive = string | number | boolean | null | undefined | symbol | bigint;
/**
 * 表示所有非函数类型
 * 排除函数类型，保留所有其他类型
 */
type NonFunction = Exclude<unknown, (...args: any[]) => any>;
/**
 * 字典类型
 *
 * 表示一个键为字符串的对象类型，但排除函数类型。
 * 这是一个通用的对象类型约束，用于状态树定义。
 *
 * @template T - 值的类型，默认为 any
 * @example
 * ```ts
 * type UserDict = Dict<{ name: string; age: number }>;
 * // 等同于: Record<string, { name: string; age: number }>
 *
 * // 函数类型会被排除
 * type NotValid = Dict<() => void>; // never
 * ```
 */
type Dict<T = any> = T extends (...args: any[]) => any ? never : Record<string, T>;
/**
 * 对象键路径类型
 *
 * 递归获取对象类型中所有可能的属性路径字符串，支持嵌套对象。
 * 使用 type-fest 的 Paths 工具类型，设置最大递归深度为 50 层。
 *
 * @template T - 对象类型
 * @example
 * ```ts
 * type User = {
 *   name: string;
 *   profile: {
 *     age: number;
 *     address: {
 *       city: string;
 *     };
 *   };
 * };
 * type Paths = ObjectKeyPaths<User>;
 * // "name" | "profile" | "profile.age" | "profile.address" | "profile.address.city"
 * ```
 */
type ObjectKeyPaths<T> = Exclude<Paths<T, {
    maxRecursionDepth: 50;
}>, number>;
/**
 * 根据路径字符串获取状态类型
 *
 * 从状态类型中通过点分隔的路径字符串获取对应的值类型。
 * 空路径或 undefined 返回整个状态类型。
 *
 * @template State - 状态对象类型
 * @template Path - 路径字符串
 * @example
 * ```ts
 * type State = {
 *   user: {
 *     name: string;
 *     age: number;
 *   };
 * };
 *
 * type NameType = GetTypeByPath<State, "user.name">; // string
 * type UserType = GetTypeByPath<State, "user">; // { name: string; age: number }
 * type WholeType = GetTypeByPath<State, "">; // State
 * ```
 */
type GetTypeByPath<State, Path extends string> = Path extends "" | undefined ? State : State extends Dict ? Get<State, Path> : never;
/**
 * 移除 unknown 类型
 *
 * 从联合类型中过滤掉 unknown 类型，保留其他类型。
 *
 * @template T - 输入类型
 * @example
 * ```ts
 * type Mixed = string | number | unknown;
 * type WithoutUnknown = RemoveUnknown<Mixed>; // string | number
 * ```
 */
type RemoveUnknown<T> = T extends unknown ? never : T;
/**
 * 转换为原始基础类型
 *
 * 将具体的字面量类型转换为其对应的基础类型。
 * 例如：将 "hello" 转换为 string，将 42 转换为 number。
 * 但对于已经是基础类型的（如 string 本身），则保持不变。
 *
 * @template T - 输入类型
 * @example
 * ```ts
 * type Literal1 = ToRawType<"hello">; // string
 * type Literal2 = ToRawType<42>; // number
 * type Literal3 = ToRawType<true>; // boolean
 * type Already = ToRawType<string>; // string (保持不变)
 * type Union = ToRawType<"a" | "b">; // string
 * ```
 */
type ToRawType<T> = T extends string ? string extends T ? T : string : T extends number ? number extends T ? T : number : T extends boolean ? boolean extends T ? T : boolean : T;

declare class ComputedObjects<State extends Dict = Dict> extends Map<string, ComputedObject<Dict>> {
    store: AutoStore<State>;
    constructor(store: AutoStore<State>);
    get enable(): boolean;
    set enable(value: boolean);
    /**
     * 动态创建一个新的计算对象
     *
     * @description
     *
     * 如同在状态对象中使用computed创建计算属性一样，可以使用computedObjects.create动态创建一个计算对象
     *
     * 差别在于
     * - 在状态对象中使用computed创建计算属性时，有计算上下文，因此可以为scope和depends指定相对依赖路径
     * - 在computedObjects.create中，没有计算上下文
     * computedObjects.create(async ()=>{
     *
     * },[],{
     *  scope: 'CURRENT'  // 无效
     *  scope: 'ROOT'    // 有效
     *  scope: 'parent'  // 无效
     *  scope: './xxx'   // 无效
     *  scope: '/xxx'    // 有效
     *  scope: '../../xxx' // 无效
     * })
     *
     * - 动态创建的计算对象的scope只能是根状态对象或者指定绝对路径,不能是相对路径
     *
     *
     *
     */
    create<Value = any, Scope = any>(getter: ComputedGetter<Value, Scope>, options?: SyncComputedOptions<Value, Scope>): SyncComputedObject<Value, Scope>;
    create<Value = any, Scope = any>(getter: AsyncLiteComputedGetter<Value, Scope>, depends: ComputedDepends, options?: ComputedOptions<Value, Scope>): AsyncLiteComputedObject<Value, Scope>;
    create<Value = any, Scope = any>(descriptor: ComputedDescriptor<Value, Scope>): AsyncComputedObject<Value, Scope> | SyncComputedObject<Value, Scope>;
    /**
     * 运行指定组的计算函数
     *
     * 注意：并不会等待所有的计算函数都执行完毕，而是返回一个Promise.all
     *
     * @param string
     * @param
     * @param string
     * @param param3
     */
    runGroup(group: string, runArgs?: RuntimeComputedOptions, options?: {
        wait?: boolean;
        timeout?: number;
    }): Promise<any>;
    /**
     * 运行指定id或满足条件的计算函数
     *
     * 当wait=true时则等待所有的计算函数执行完毕
     * 也可以指定一个timeout时间，超时后会抛出异常TIMEOUT
     *
     *
     * @param filter
     * @param runArgs 传递给计算属性的run函数的参数
     * @param options
     */
    run(filter: (computedObject: ComputedObject) => boolean, runArgs?: RuntimeComputedOptions, options?: {
        wait?: boolean;
        timeout?: number;
    }): Promise<any>;
    run(id: string, runArgs?: RuntimeComputedOptions, options?: {
        wait?: boolean;
        timeout?: number;
    }): Promise<any>;
    /**
     * 启用或禁用计算
     * @param value
     */
    enableGroup(value: boolean): Promise<void>;
    /**
     * 移除指定的计算对象
     *
     * 注意：如果该计算对象是state的某个属性创建的，只会删除计算对象，不会删除state属性
     *
     * @param id
     * @returns
     */
    delete(id: string): boolean;
    /**
     * 返回指定路径的计算对象
     *
     * @example
     *
     *
     * const computedObjects = store.computedObjects.find(['a','b'])
     *
     * @param path
     */
    find(path: string | string[] | undefined): ComputedObject | undefined;
}

type LogMessageArgs = string | Error | (() => string);
type LogLevel = 'info' | 'error' | 'warn';

declare class WatchObjects<State extends Dict> extends Map<string, WatchObject> {
    store: AutoStore<State>;
    private _watcher;
    private _enable;
    constructor(store: AutoStore<State>);
    get enable(): boolean;
    set enable(value: boolean);
    set(key: string, value: WatchObject): this;
    /**
     * 创建全局侦听器,
     * 此侦听器会侦听根对象，当对象所有的状态变化,会执行所有监听过滤函数，如果返回true，则执行对应的监听函数
     * 负责处理动态侦听
     */
    private createWacher;
    /**
     * 重置侦听器
     */
    reset(): void;
    /**
     * 动态加一个侦听器对象
     *
     * @description
     *
     * 动态创建一个侦听器对象，侦听器对象是一个函数，当侦听器侦听的路径发生变化时，侦听器会被调用
     *
     * @param selfPath              侦听函数所在的路径,用来接收侦听函数的返回值，当使用useWatch时
     * @param listener              侦听函数
     * @param options               参数
     * @param watchTo               侦听结果写到处下载
     * @returns
     */
    create<Value = any, DependValue = any>(getter: WatchGetter<Value, DependValue>, filter?: WatchDependFilter<DependValue>, options?: Omit<WatchOptions<Value>, 'filter'>): WatchObject<Value>;
    create<Value = any>(descriptor: WatchDescriptorBuilder<Value>): WatchObject<Value>;
    /**
     * 控制某个组的侦听器是否启用
     * @param groupName
     * @param value
     */
    enableGroup(groupName: string, value?: boolean): void;
}

declare class AutoStore<State extends Dict, Options = unknown> extends FastEvent<AutoStoreEvents> {
    types: FastEvent<AutoStoreEvents>["types"] & {
        rawState: State;
        state: ComputedState<State>;
    };
    private _data;
    private _errors?;
    computedObjects: ComputedObjects<State>;
    watchObjects: WatchObjects<State>;
    protected _operates: FastEvent<fastevent.TransformedEvents<Record<string, StateOperate<any, any>>>, Record<string, any>, never, {
        [x: string]: fastevent.FastMessagePayload<StateOperate<any, any>>;
    }, string, fastevent.FastEventMeta & Record<string, any>, string>;
    private _silenting;
    private _batching;
    private _batchOperates;
    private _updateFlags;
    private _peeping;
    private _safeEval?;
    private _updateValidateBehavior;
    private _configManager?;
    private _updatedState?;
    private _updatedWatcher;
    private _configurabled?;
    constructor(state?: State, options?: AutoStoreOptions<State>);
    get state(): ComputedState<State>;
    get operates(): FastEvent<fastevent.TransformedEvents<Record<string, StateOperate<any, any>>>, Record<string, any>, never, {
        [x: string]: fastevent.FastMessagePayload<StateOperate<any, any>>;
    }, string, fastevent.FastEventMeta & Record<string, any>, string>;
    get configurabled(): Set<string>;
    get errors(): Record<string, string>;
    get options(): AutoStoreOptions<State> & FastEventOptions & Options;
    get silenting(): boolean;
    get delimiter(): string;
    get batching(): boolean;
    get peeping(): boolean;
    get resetable(): boolean;
    get configManager(): ConfigManager | undefined;
    set resetable(value: boolean);
    private _createSandbox;
    /**
     * 重置store恢复到状态的原始状态
     *
     * @description
     *
     * 当启用resetable=true选项时，可以调用此方法将store恢复到初始状态
     *
     */
    reset(entry?: string): void;
    private _createConfigManager;
    private _onFirstEachState;
    log(message: LogMessageArgs, level?: LogLevel): void;
    shadow<T extends Dict>(state: T, options?: AutoStoreOptions<T>): AutoStore<T, unknown>;
    private installExtends;
    private subscribeCallbacks;
    /**
     *
     * 当状态读写时调用此方法触发事件
     *
     * @description
     *
     * 本方法是一个内部方法，用于在状态读写时触发事件，不推荐直接调用
     *
     * type:StateOperates, path: string[], indexs:number[] , value: any, oldValue: any, parentPath: string[], parent: any
     */
    _notify(params: StateOperate): void;
    /**
     * 监视数据变化，并在变化时执行指定的监听器函数。
     *
     * @example
     *
     * - 侦听所有的数据变化
     *
     * const watcher = state.watch(({type,path,value,oldValue,parentPath,parent})=>{})
     * watcher.off() 取消侦听
     *
     * - 侦听指定路径的数据变化
     *
     * const watcher = state.watch("job.title",({type,path,value,oldValue,parentPath,parent})=>{})
     * watcher.off() 取消侦听
     *
     * - 侦听多个路径的数据变化
     *
     * const watcher = state.watch(["job.title","job.salary"],({type,path,value,oldValue,parentPath,parent})=>{})
     * watcher.off() 取消侦听
     *
     * - 使用通配符
     * const watcher = state.watch(["job.*"],(operate)=>{})  job子路径
     * const watcher = state.watch(["job.**"],(operate)=>{}) job下的所有路径
     *
     *
     * @param {string|string[]} keyPaths - 要监视的数据路径，可以是单个字符串或字符串数组。
     * @param {WatchListenerOptions} listener - 当监视的数据路径变化时执行的回调函数。
     * @param {WatchOptions} [options] - 可选参数，用于配置监视行为。
     * @returns {Watcher} - 返回一个表示监听器的数字标识符，用来取消监听。
     */
    watch(listener: WatchListener, options?: WatchListenerOptions): Watcher;
    watch(paths: StatePath<State> | StatePath<State>[], listener: WatchListener, options?: WatchListenerOptions): Watcher;
    watch(paths: "*" | string | (string | string[])[], listener: WatchListener, options?: WatchListenerOptions): Watcher;
    /**
     *
     * 创建动态值对象
     *
     * @param path
     * @param value
     * @param parentPath
     * @param parent
     * @returns
     */
    private createObserverObject;
    /**
     * @description 创建计算属性对象
     *
     */
    _createComputed(descriptor: ComputedDescriptor, computedContext?: ComputedContext): ComputedObject<any, unknown>;
    /**
     * 创建侦听对象
     * @param computedContext
     * @param descriptor
     */
    _createWatch(descriptor: WatchDescriptor, computedContext?: ComputedContext): WatchObject<any>;
    /**
     *
     * 更新状态并且不触发事件
     *
     * @description
     *
     * 正常情况下可以通过store.state.xxx.xxx='xxxx'来更新状态，同时会触发事件，通过侦听事件可以用来实现
     * 计算属性的重新计算
     *
     * 静默更新时则指不会触发事件,也因此不会触发计算属性的重新计算,
     *
     * 因此，可能会干扰正常的计算依赖情况，所以只在特殊情况下使用, 比如初始化
     *
     * @example
     *
     * - 只能是同步函数
     * store.update((state)=>{
     *      state.xxx.xxx='111'
     * })
     *
     *
     * -  不支持异步函数
     * store.update(async (state)=>{
     *      state.xxx.xxx='111'
     *      await fetch('xxxx')
     *      state.xxx.xxx='222'
     * })
     *
     *
     * @param fn   更新方法，在此方法内部进行更新操作
     */
    silentUpdate(fn: (state: ComputedState<State>) => void): void;
    batchUpdate(fn: (state: ComputedState<State>) => void): void;
    /**
     * 更新状态值
     *
     * @description
     *
     * 在指定函数内部更新状态值，更新完成后触发事件
     *
     * 注意不支持批量异步更新，如
     *
     * update(async (state)=>{
     *      state.a=1
     *      await delay()
     *      state.b=2
     * })
     *
     *
     * @throws {Error} 如果 `fn` 不是一个函数，则抛出错误
     *
     * @example
     *
     * - 批量更新
     * update((state)=>{
     *  state.a=xxx
     *  state.b=xxx
     * },{
     *      batch:true           事件名称默认为__batch_update__
     *      batch:"批量更新事件名称"，
     * ]})
     *
     * @example
     * - 更新状态，并且每一次更新均会触发变更事件
     * update((state)=>{
     *  state.xxx=xxx
     * },{
     *  batch:false       不批量更新
     * })
     *
     * @example
     * - 静默更新，更新过程中不会触发变更事件
     *   update((state)=>{
     *      state.xxx=xxx
     *   },{
     *     silent:true
     *   })
     *
     * @param {function(ComputedState<State>): void} fn - 用于更新状态的函数,只能是同步函数
     * @param {Object} [schema] - 可选参数
     * @param {boolean} [schema.batch=true] -  是否批量更新，=false 不批量更新，=true 批量更新，批量更新事件名称为__batch_update__，=<批量更新事件名称> 指定一个字符串
     * @param {boolean} [schema.silent=false] - 是否静默更新不触发事件，默认为 false
     * @param {boolean} [schema.peep=false] - 是否偷看，即读取状态值但不触发事件，默认为 false
     * @param {boolean} [schema.reply=false] - 当更新完成回放所有依赖的变化事件，默认为true，即回放所有依赖的变化事件，=false 不回放依赖的变化事件
     *  比如update(state=>{
     *
     *  })
     */
    update(fn: (state: ComputedState<State>) => void, options?: UpdateOptions): void;
    /**
     *
     * 回放批量操作
     *
     */
    private replyBatchOperates;
    /**
     *
     * 读取指定路径的状态值并且不触发事件，即偷看
     *
     * @example
     *
     * peep(["a","b"])
     * peep("a.b")
     * peep(state=>state.a.b)
     *
     */
    peep<Value = any>(getter: (state: State) => Value): Value;
    peep<PATH extends StatePath<State> = StatePath<State>, VALUE extends GetTypeByPath<ComputedState<State>, PATH> = GetTypeByPath<ComputedState<State>, PATH>>(path: PATH): VALUE;
    peep<Value = any>(path: string[]): Value;
    /**
     * 跟踪函数内部的操作，返回依赖路径
     *
     * @example
     *
     * - 执行函数，并且收集依赖，返回依赖路径
     * const deps = store.collectDependencies(()=>{
     *      store.state.xxx.xxx
     * })
     * @example
     * - 只收集函数内部的read操作
     *
     * const deps = store.collectDependencies(()=>{
     *     store.state.xxx.xxx
     * },'read')
     *
     *
     * @example
     *
     * @param fn
     */
    collectDependencies(fn: () => void, operates?: WatchListenerOptions["operates"]): string[][];
    /**
     *  跟踪函数内部的操作
     *
     * 主要用于调试，跟踪函数内部的操作
     *
     * 比如我们想要知道执行一个state.xxx=1时，会触发哪些操作，可以通过此方法来跟踪
     *
     * 注意： 本方法主要用于调试，不要在生产环境中使用
     *
     * @example
     *
     * - 跟踪同步函数内部的操作
     *   trace((state)=>{
     *      state.xxx.xxx = 1
     *   },(operate)=>{
     *      console.log(operate)
     *   })
     *
     * - 跟踪异步函数内部的操作???
     *
     *  注意：
     *  由于无法控制异步上下文，特别是在同时运行多个异步trace函数时，不同的trace函数可能会相互干扰，无法区分。
     *  因此，异步函数的跟踪难以实现，只能用在调试时且只运行单个异步trace函数时使用
     *
     *  const store= new AutoStore({
     *      price:10,
     *      count:2,
     *      total: async (state)=>{
     *          await delay(1000)
     *          return state.price * state.count
     *      }
     *  })
     *
     *
     *
     *  const fn = async ()=>{
     *     await fetch('xxxx')
     *     store.state.price = 20
     *     store.state.count= 3
     * }
     * 我们想要知道fn执行时会触发哪些操作，可以通过trace来跟踪
     * const ops = await trace(fn).start()
     *
     *
     *  我们可以看到，fn执行时，只有显式的对price和count，但是由于total是异步计算属性，所以也会触发total的变化。
     *  因此也应该被跟踪，但是由于其是异步计算属性，所以不会被跟踪。
     * 因此需要显式的提供一个abort参数来结束包括异步的跟踪过程
     *
     *
     * stateTracker.stop()  // 取消跟踪
     * const operates = await stateTracker.start((operate)=>{
     *       return operate.type=='set' && path[0]==='total'
     * })  // 开始跟踪
     *
     *
     * @param fn
     * @param operates
     * @returns
     */
    trace(fn: () => any, operates?: WatchListenerOptions["operates"]): StateTracker;
    /**
     *
     * 当store销毁时调用，用来取消一些订阅
     *
     */
    destroy(): void;
    /**
     *
     * 返回当前状态的快照数据
     *  @param options.entry  - 指定要获取的路径，如果不指定则返回整个状态数据
     *  @param reserveAsync - 默认false,是否保留异步对象。
     *      异步对象的值是一个AsyncComputedValue对象。=true时会保留。=false时会只返回value值
     *  @returns
     */
    getSnap<Entry extends string>(options?: {
        entry?: Entry;
        reserveAsync?: boolean;
        includeFunc?: boolean;
    }): GetTypeByPath<ComputedState<State>, Entry>;
    /**
     *
     * 获取指定路径的值
     *
     * eg.
     *  store.get("user.name")
     *  await store.get("user.async")
     *
     * @param path
     * @param options
     * @param options.defaultValue - 默认值，如果指定则当指定路径不存在时返回默认值
     * @param options.waitAsyncDone - 如果异步计算正在进行中，则等待异步计算结束再返回
     * @param options.timeout - 当等待异步计算时的超时时间
     * @param options.expandAsync - 如果是异步计算则返回异步计算对象的value,=false时则返回异步计算对象而不是值
     *
     *
     */
    get<T extends ObjectKeyPaths<State>>(path: T, options?: {
        defaultValue?: any;
        waitAsyncDone?: boolean;
        timeout?: number;
        expandAsync?: boolean;
    }): any;
    toString(): string;
}

/**
 *
 * 基于现有的store创建一个shadowStore
 *
 * shadowStore的所有computed,watch均基于store
 *
 *
 * const shadowStore = store.createShadow({
 *     a:computed((state:any)=>state.a+1))
 * }
 *
 * shadowStore.a
 *
 *
 */

declare function createShadow<T extends Dict>(store: AutoStore<any>, shadowObject: T, options?: AutoStoreOptions<T>): AutoStore<T>;

declare function watch<Value = any, DependValue = any>(getter: WatchGetter<Value, DependValue>, filter?: WatchDependFilter<DependValue>, options?: Omit<WatchOptions<Value>, "filter">): WatchDescriptorBuilder<Value>;
declare function watch<Value = any, DependValue = any>(getter: WatchGetter<Value, DependValue>, options?: Omit<WatchOptions<Value>, "filter">): WatchDescriptorBuilder<Value>;

declare class AutoStoreError extends Error {
}
declare class AbortError extends AutoStoreError {
}
declare class TimeoutError extends AutoStoreError {
}
declare class CyleDependError extends AutoStoreError {
}
declare class InvalidComputedArgumentsError extends AutoStoreError {
}
declare class InvalidScopeError extends AutoStoreError {
}
declare class InvalidDependsError extends AutoStoreError {
}
declare class ValidateError extends AutoStoreError {
    /**
     * 用于控制验证失败时的行为
     * - 'pass' - 校验失败但继续写入
     * - 'ignore' - 校验失败，静默忽略（不写入）
     * - 'throw' - 校验失败，抛出异常
     * - 'throw-pass' - 写入数据但同时抛出异常
     * - undefined - 使用 validate.onInvalid 的配置
     */
    onInvalid?: "pass" | "ignore" | "throw" | "throw-pass";
}

export { ASYNC_COMPUTED_VALUE, AbortError, type AnyObserverDescriptor, type AsyncComputed, type AsyncComputedDescriptor, type AsyncComputedDescriptorBuilder, type AsyncComputedGetter, type AsyncComputedGetterArgs, AsyncComputedObject, type AsyncComputedValue, type AsyncLiteComputedDescriptor, type AsyncLiteComputedDescriptorBuilder, type AsyncLiteComputedGetter, type AsyncLiteComputedGetterArgs, AsyncLiteComputedObject, type AsyncReturnType, type AutoStateSchemaBase, AutoStore, type AutoStoreAction, type AutoStoreConfigures, AutoStoreError, type AutoStoreEvents, type AutoStoreExtend, type AutoStoreOptions, type AutoStoreStateSchema, type AutoStoreWidgetTypes, type AutoStoreWidgets, BATCH_UPDATE_EVENT, type BatchChangeEvent, type Computed, type ComputedBuilder, type ComputedContext, type ComputedDepend, type ComputedDepends, type ComputedDescriptor, type ComputedDescriptorBuilder, type ComputedDescriptorParameter, type ComputedGetter, type ComputedGetterArgs, ComputedObject, ComputedObjects, type ComputedOptions, type ComputedProgressbar, type ComputedScope, type ComputedState, type ComputedSyncReturns, type Computedable, type ComputedableStateSchema, ConfigManager, type ConfigManagerOptions, type ConfigSource, type ConfigurableKeyPaths, type ConfigurableState, CyleDependError, DELETE_FLAG, type Dict, EMPTY, type EventDefines, type ExtendAsyncOptions, type ExtractWidgetFromBuilder, type ForEachObjectCallback, GLOBAL_CONFIG_MANAGER, type GetTypeByPath, InvalidComputedArgumentsError, InvalidDependsError, InvalidScopeError, type LiteComputedOptions, type MutableRecord, type NonFunction, OBSERVER_DESCRIPTOR_BUILDER_FLAG, OBSERVER_DESCRIPTOR_FLAG, type ObjectKeyPaths, type ObserverBuilder, type ObserverDependMatcher, type ObserverDepends, type ObserverDescriptor, type ObserverDescriptorBuilder, type ObserverDescriptorGetter, ObserverObject, type ObserverOptions, type ObserverScope, ObserverScopeRef, type ObserverType, PATH_DELIMITER, type PickComputedResult, type PickValues, type Primitive, type RawObject, type RemoveUnknown, type RequiredComputedOptions, type RequiredComputedState, type RuntimeComputedOptions, SKIP_PROXY_FLAG, type SchemaBuilder, type SchemaDescriptor, type SchemaDescriptorBuilder, type StateChangeEvents, type StateOperate, type StateOperateType, type StatePath, type StateTracker, type StateValidator, type StateValidatorFunction, type StoreRawStateType, type StoreSyncOptions, type StoreSyncer, type SyncComputedDescriptor, type SyncComputedDescriptorBuilder, SyncComputedObject, type SyncComputedOptions, type SyncRuntimeComputedOptions, TimeoutError, type ToRawType, type Union, type UpdateOptions, VALUE_SCHEMA_BUILDER_FLAG, ValidateError, type ValidationBehavior, type ValueSchema, WITH_SCHEMA_VALUE, type WatchDependFilter, type WatchDescriptor, type WatchDescriptorBuilder, type WatchGetter, type WatchListener, type WatchListenerOptions, WatchObject, WatchObjects, type WatchOptions, type WatchScope, type Watcher, type WidgetConfig, type WidgetConfigPrecise, asyncComputed, calcDependPaths, computed, configurable, createAsyncComptuedValue, createObserverObject, createShadow, createTypeSchemaBuilder, defineExtend, delay, forEachObject, getAbsolutePath, getAsyncVal, getComputedId, getDepends, getId, getMapVal, getSchemaValue, getSnap, getSnapshot, getVal, isAbsolutePath, isAsyncComputedValue, isComputedDescriptorParameter, isEq, isFunction, isMap, isObserverDescriptor, isObserverDescriptorBuilder, isPathEq, isPathMatched, isPlainObject, isPrimitive, isPromise, isProxy, isRaw, isRelPath, isSchemaBuilder, isWithSchemaValue, joinValuePath, markRaw, noRepeat, normalizeDeps, pathIsExists, pathStartsWith, s, schema, schemas, setVal, updateObjectVal, watch, withSchema };
