import { Sum, LessThan, ValueOf as ValueOf$1, Subtract, UnionToTuple as UnionToTuple$1 } from 'type-fest';

type RemoveAnyRecord<T extends Record<string, any>> = T extends Record<string, any> & (infer X) ? X extends Record<string, any> ? X : Record<string, any> : T;

type Split<S extends string, Delimiter extends string = "/"> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];

type Join<T extends string[], Delimiter extends string = "/"> = T extends [
    infer First extends string,
    ...infer Rest extends string[]
] ? Rest["length"] extends 0 ? First : `${First}${Delimiter}${Join<Rest, Delimiter>}` : "";

type Decrement<N extends number> = N extends 0 ? 0 : N extends 1 ? 0 : N extends 2 ? 1 : N extends 3 ? 2 : N extends 4 ? 3 : N extends 5 ? 4 : N extends 6 ? 5 : N extends 7 ? 6 : N extends 8 ? 7 : N extends 9 ? 8 : number;

type Slice<T extends any[], Start extends number, Result extends any[] = []> = Start extends 0 ? T : T extends [infer _First, ...infer Rest] ? Slice<Rest, Decrement<Start>, Result> : Result;

type MatchPatternAndGetRemainder<KeyParts extends string[], PrefixParts extends string[], Result extends string[] = []> = PrefixParts["length"] extends 0 ? KeyParts["length"] extends 0 ? never : KeyParts : KeyParts["length"] extends 0 ? never : KeyParts[0] extends PrefixParts[0] | "*" ? MatchPatternAndGetRemainder<Slice<KeyParts, 1>, Slice<PrefixParts, 1>, Result> : never;
type ScopeEventsImpl<Events extends Record<string, any>, Prefix extends string> = {
    [K in keyof Events as K extends string ? MatchPatternAndGetRemainder<Split<K, "/">, Split<Prefix, "/">> extends infer Remainder ? Remainder extends string[] ? Join<Remainder, "/"> : never : never : never]: Events[K];
};
/**
 *
 * 返回指定前缀的作用域事件列表
 *
 * - 当 Prefix = '' 时，直接返回 Events
 * - 当没有事件匹配 Prefix 时，返回 Default
 *
 */
type ScopeEvents<Events extends Record<string, any>, Prefix extends string, Default extends Record<string, any> = Record<string, any>> = Prefix extends "" ? Events : [keyof ScopeEventsImpl<Events, Prefix>] extends [never] ? Default : ScopeEventsImpl<Events, Prefix>;

type ContainsWildcard<T extends string> = T extends `${string}/*/${string}` ? true : T extends `${string}/*` ? true : T extends `*/${string}` ? true : T extends `*` | `**` ? true : T extends `${string}/**` ? true : false;

type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * 移除空对象类型约束
 * @description 从类型中移除空的字面量类型约束，返回基础类型
 * @example
 * type Result = RemoveEmptyObject<{} & string>;
 * // Result = string
 */
type RemoveEmptyObject<T extends Record<string, any>> = T extends {} & (infer O) ? O : T;

/**
 * 断言类型为记录类型
 * @description 如果类型 T 是 Record<string, any> 的子类型，返回 T；否则返回 Record<string, any>
 * @example
 * type Result1 = AssertRecord<{ a: 1 }>;
 * // Result1 = { a: 1 }
 * type Result2 = AssertRecord<string>;
 * // Result2 = Record<string, any>
 */
type AssertRecord<T> = T extends Record<string, any> ? T : Record<string, any>;

/**
 * 展开联合类型的成员
 * @description 将联合类型的每个成员展开为独立对象，再重新组合
 * @example
 * type Result = Union<{ a: 1 } | { b: 2 }>;
 * // Result = { a: 1 } | { b: 2 }
 */
type Union<T> = T extends infer O ? {
    [K in keyof O]: O[K];
} : never;

/**
 * 断言类型为字符串类型
 * @description 如果类型 T 是 string 的子类型，返回 T；否则返回 string
 * @example
 * type Result1 = AssertString<"hello">;
 * // Result1 = "hello"
 * type Result2 = AssertString<number>;
 * // Result2 = string
 */
type AssertString<T> = T extends string ? T : string;

/**
 * 判断两个类型是否相等
 * @description 使用函数返回类型来比较两个类型是否完全相同
 */
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;

/**
 * 将事件映射转换为可变联合类型
 * 根据事件的键名确定 type 字段，根据事件的值确定 payload 字段
 *
 * @example
 * ```ts
 * type Events = {
 *   a: number;
 *   b: boolean;
 * };
 *
 * type Result = MutableRecord<Events>;
 * // Result = { type: "a"; payload: number } | { type: "b"; payload: boolean }
 * ```
 */

type MutableRecord<Items, KindKey extends string = "type", Share = unknown, DefaultKind extends keyof Items = never> = {
    [Kind in keyof Items]: Union<{
        [type in KindKey]: Kind;
    } & Items[Kind] & Share>;
}[Exclude<keyof Items, DefaultKind>] | (DefaultKind extends never ? never : Union<{
    [K in KindKey]?: DefaultKind | undefined;
} & Items[DefaultKind] & Share>);

type KeyOf<T extends Record<string, any>> = Exclude<keyof T, number | symbol> extends never ? string : Exclude<keyof T, number | symbol>;

/**
 * 当类型为 never 或 undefined 时返回默认值
 * @description 如果 T 是 never 或 undefined，返回默认值 F；否则返回原类型 T
 * @example
 * type Result1 = Fallback<never, string>;
 * // Result1 = string
 * type Result2 = Fallback<number, string>;
 * // Result2 = number
 * type Result3 = Fallback<undefined, string>;
 * // Result3 = string
 */
type Fallback<T, F> = [T] extends [never] ? F : T extends undefined ? F : T;

/**
 * 检查对象类型是否为空
 * @description 判断对象类型是否没有任何属性
 * @example
 * type Result1 = isEmpty<{}>;
 * // Result1 = true
 * type Result2 = isEmpty<{ a: 1 }>;
 * // Result2 = false
 */
type isEmpty<T extends Record<string, any>> = [keyof T] extends [never] ? true : false;

/**
 * 提取出精确等于指定键的记录
 * @description 从对象类型中提取出键精确等于指定字符串的属性
 * @example
 * type Result = PickEqualRecord<{ a: 1; b: 2; c: 3 }, "a">;
 * // Result = { a: 1 }
 */
type PickEqualRecord<R extends Record<string, any>, T extends string> = {
    [K in keyof R as Equal<K, T> extends true ? K : never]: R[K];
};

/**
 * 提取出精确不等于指定键的记录
 * @description 从对象类型中提取出键不精确等于指定字符串的属性
 * @example
 * type Result = PickNotEqualRecord<{ a: 1; b: 2; c: 3 }, "a">;
 * // Result = { b: 2; c: 3 }
 */
type PickNotEqualRecord<R extends Record<string, any>, T extends string> = {
    [K in keyof R as Equal<K, T> extends true ? never : K]: R[K];
};

/**
 * 提取键中包含分隔符的记录
 * @description 从对象类型中提取出键包含 "/" 分隔符的属性
 * @example
 * type Result = PickInlcudeDelimiterRecord<{ "user/login": 1; logout: 2 }>;
 * // Result = { "user/login": 1 }
 */
type PickInlcudeDelimiterRecord<R extends Record<string, any>> = {
    [K in keyof R as K extends `${string}/${string}` ? K : never]: R[K];
};

/**
 * 提取键中不包含分隔符的记录
 * @description 从对象类型中提取出键不包含 "/" 分隔符的属性
 * @example
 * type Result = PickNotInlcudeDelimiterRecord<{ "user/login": 1; logout: 2 }>;
 * // Result = { logout: 2 }
 */
type PickNotInlcudeDelimiterRecord<R extends Record<string, any>> = {
    [K in keyof R as K extends `${string}/${string}` ? never : K]: R[K];
};

/**
 * 展开类型，使交集类型合并为单一对象类型
 * @description 展开交叉类型和映射类型，使类型更容易阅读
 * @example
 * type Result = Expand<{ a: 1 } & { b: 2 }>;
 * // Result = { a: 1; b: 2 }
 */
type Expand<T> = T extends infer O ? {
    [K in keyof O]: O[K];
} : never;

/**
 * 将对象的键转换为元组类型
 * @description 将对象类型的键转换为元组类型，保留所有键
 * @example
 * type Result = Keys<{ a: 1; b: 2; c: 3 }>;
 * // Result = ["a", "b", "c"]
 */
/**
 * 将联合类型转换为元组类型的辅助类型
 */
type UnionToTuple<T> = UnionToTupleRec<T, []>;
type UnionToTupleRec<T, R extends any[]> = [T] extends [never] ? R : UnionToTupleRec<Exclude<T, LastOfUnion<T>>, [LastOfUnion<T>, ...R]>;
/**
 * 获取联合类型的最后一个成员
 */
type LastOfUnion<T> = UnionToIntersection$1<T extends any ? (x: T) => 0 : never> extends (x: infer L) => 0 ? L : never;
type UnionToIntersection$1<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type Keys<T extends Record<string, any>> = UnionToTuple<keyof T>;

/**
 * 获取对象的第一个属性
 * @description 从对象类型中提取出第一个键值对
 * @example
 * type Result = FirstObjectItem<{ a: 1; b: 2; c: 3 }>;
 * // Result = { a: 1 }
 */
type FirstObjectItem<T extends Record<string, any>> = Pick<T, Keys<T> extends any[] ? Keys<T>[0] : never>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * 获取联合类型的第一个成员
 * @description 从联合类型中提取出第一个成员类型
 * @example
 * type Result = FirstOfUnion<"a" | "b" | "c">;
 * // Result = "a"
 */
type FirstOfUnion<T> = UnionToIntersection<T extends any ? (x: T) => any : never> extends (x: infer U) => any ? U : never;

/**
 * 检查类型是否为多级通配符（包含 **）
 * @description 判断字符串类型是否包含多级通配符 "**"
 * @example
 * type Result1 = IsMultiWildcard<"user/**">;
 * // Result1 = true
 * type Result2 = IsMultiWildcard<"user/*">;
 * // Result2 = false
 * type Result3 = IsMultiWildcard<**">;
 * // Result3 = true
 */
type IsMultiWildcard<T extends string> = T extends `${string}/**` | "**" ? true : false;

/**
 * 在数字前面追加数字
 * @example PrefixNumber<123, 99> = 99123
 */
type PrefixNumber<T extends number, P extends number> = `${P}${T}` extends `${infer R extends number}` ? R : never;

/**
 * 将记录类型转换为键值对联合类型
 * @example ExpandRecord<{ a: 1; b: 2 }> = ["a", 1] | ["b", 2]
 */
type ExpandRecord<T extends Record<string, any>> = {
    [K in keyof T]: [K, T[K]];
}[keyof T];

/**
 * 检查类型是否为 never
 * @description 判断类型是否为 TypeScript 的 never 类型
 * @example
 * type Result1 = IsNever<never>;
 * // Result1 = true
 * type Result2 = IsNever<string>;
 * // Result2 = false
 */
type IsNever<T> = [T] extends [never] ? true : false;

/**
 * 如果类型为 never，返回默认值；否则返回原类型
 * @description 条件类型工具，当类型为 never 时提供默认值
 * @example
 * type Result1 = IfNever<never, string>;
 * // Result1 = string
 * type Result2 = IfNever<number, string>;
 * // Result2 = number
 */
type IfNever<T, Default> = IsNever<T> extends true ? Default : T;

/**
 * 分割路径为数组（支持没有 / 的情况）
 *
 * 处理逻辑：
 * - 如果有 /，按 / 分割成多段数组
 * - 如果没有 /，返回包含单个元素的数组 [原字符串]
 * - 空字符串会返回 [""]
 *
 * @example
 * - SplitPath<"a/b/c"> => ["a", "b", "c"]
 * - SplitPath<"click"> => ["click"]
 * - SplitPath<"*"> => ["*"]
 * - SplitPath<""> => [""]
 */

type SplitPath<T extends string> = Split<T>;

/**
 * 返回对象的所有Keys
 */
type ObjectKeys<T, I = string> = {
    [P in keyof T]: P extends I ? P : never;
}[keyof T];

type Add<A extends number, B extends number> = Sum<A, B>;

type Min<T extends number[], M extends number = T[0]> = T extends [infer F, ...infer R] ? F extends number ? R extends number[] ? LessThan<F, M> extends true ? Min<R, F> : Min<R, M> : M : M : M;

type IndexOfMin<T extends number[], M = Min<T>, Idx extends any[] = []> = T extends [
    infer F,
    ...infer R extends number[]
] ? F extends M ? Idx["length"] : IndexOfMin<R, M, [...Idx, any]> : never;

type Max<T extends number[], M extends number = T[0]> = T extends [infer F, ...infer R] ? F extends number ? R extends number[] ? LessThan<F, M> extends true ? Max<R, M> : Max<R, F> : M : M : M;

type IndexOfMax<T extends number[], M = Max<T>, Idx extends any[] = []> = T extends [
    infer F,
    ...infer R extends number[]
] ? F extends M ? Idx["length"] : IndexOfMax<R, M, [...Idx, any]> : never;

type Class = (new (...args: any[]) => any) | (abstract new (...args: any[]) => any);

type ChangeFieldType<Record, Name extends string, Type = any> = Expand<Omit<Record, Name> & {
    [K in Name]: Type;
}>;

/**
 * 从类型数组中移除重复项，返回保留唯一类型的元组
 * @template T - 输入的任意类型数组（元组）
 * @template Result - 内部使用的累积结果数组（默认空数组）
 * @returns {any[]} 去重后的类型元组，保留首次出现的顺序
 *
 * @example
 * type T1 = Unique<[number, string, number]>;  // [number, string]
 * type T2 = Unique<[1, 2, 2, 3]>;              // [1, 2, 3]
 * type T3 = Unique<['a', 'b', 'a']>;           // ['a', 'b']
 */
type Unique<T extends any[], Result extends any[] = []> = T extends [
    infer First,
    ...infer Rest
] ? First extends Result[number] ? Unique<Rest, Result> : Unique<Rest, [...Result, First]> : Result;

type Overloads<T> = Unique<T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
    (...args: infer A8): infer R8;
} ? [
    (...args: A1) => R1,
    (...args: A2) => R2,
    (...args: A3) => R3,
    (...args: A4) => R4,
    (...args: A5) => R5,
    (...args: A6) => R6,
    (...args: A7) => R7,
    (...args: A8) => R8
] : T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
    (...args: infer A7): infer R7;
} ? [
    (...args: A1) => R1,
    (...args: A2) => R2,
    (...args: A3) => R3,
    (...args: A4) => R4,
    (...args: A5) => R5,
    (...args: A6) => R6,
    (...args: A7) => R7
] : T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
    (...args: infer A6): infer R6;
} ? [
    (...args: A1) => R1,
    (...args: A2) => R2,
    (...args: A3) => R3,
    (...args: A4) => R4,
    (...args: A5) => R5,
    (...args: A6) => R6
] : T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
    (...args: infer A5): infer R5;
} ? [
    (...args: A1) => R1,
    (...args: A2) => R2,
    (...args: A3) => R3,
    (...args: A4) => R4,
    (...args: A5) => R5
] : T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
    (...args: infer A4): infer R4;
} ? [
    (...args: A1) => R1,
    (...args: A2) => R2,
    (...args: A3) => R3,
    (...args: A4) => R4
] : T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
    (...args: infer A3): infer R3;
} ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3] : T extends {
    (...args: infer A1): infer R1;
    (...args: infer A2): infer R2;
} ? [(...args: A1) => R1, (...args: A2) => R2] : T extends {
    (...args: infer A1): infer R1;
} ? [(...args: A1) => R1] : [T]>;

type OverrideOptions<T> = ChangeFieldType<Required<T>, "context", never>;

type Merge<T extends object, U extends object> = {
    [K in keyof T | keyof U]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
};

/**
 * 将联合类型合并为单个对象类型
 * @description 将多个对象类型的联合类型合并成一个包含所有属性的对象类型
 * @example
 * type Result = MergeUnion<{ a: 1 } | { b: 2 }>;
 * // Result = { a: 1; b: 2 }
 */
type MergeUnion<T> = (T extends any ? (x: T) => void : never) extends (x: infer U) => void ? {
    [K in keyof U]: U[K];
} : never;

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type RequiredItems<T extends object, Items extends string[]> = Omit<T, Items[number]> & {
    [K in Items[number] & keyof T]-?: Exclude<T[K], undefined>;
};

type Dict<V = any> = Record<Exclude<string, number | symbol>, V>;

type ValueOf<R extends Record<string, any>> = R[keyof R];

type OptionalKeys<T, K extends keyof T> = Expand<Omit<T, K> & {
    [P in K]?: T[P];
}>;

type Tuple<T extends number, R extends unknown[] = []> = R["length"] extends T ? R : Tuple<T, [...R, unknown]>;

/**
 * 确保字符串类型至少包含指定的字符串字面量
 *
 * 该类型工具保证结果类型包含 T1 中的所有字符串，同时可以包含 T2 中的其他字符串。
 * 通过使用 `Omit<T2, T1>` 排除 T2 中已在 T1 存在的字符串，避免重复。
 *
 * @template T1 - 必须包含的字符串类型（字符串字面量或联合类型）
 * @template T2 - 可选的字符串类型集合，默认为 `string`
 *
 * @example
 * ```ts
 * // 基础用法
 * type Result1 = EnsureString<'a', 'a' | 'b' | 'c'>;
 * // Result1: 'a' | 'b' | 'c'
 *
 * // 使用默认的 T2 参数
 * type Result2 = EnsureString<'hello'>;
 * // Result2: 'hello' | string（即 string）
 *
 * // 多个字符串字面量
 * type Result3 = EnsureString<'a' | 'b', 'a' | 'b' | 'c' | 'd'>;
 * // Result3: 'a' | 'b' | 'c' | 'd'
 * ```
 *
 * @category Type Utils
 */
type MergeStrings<T1 extends string, T2 extends string = string> = T1 | Omit<T2, T1>;

type IsMatchingOverload<Overloads extends any[], Args extends any[]> = Overloads extends [
    infer First,
    ...infer Rest
] ? First extends (...args: any) => any ? Args extends Parameters<First> ? true : IsMatchingOverload<Rest, Args> : never : false;
type AllowCall<F extends (...args: any) => any, Args extends any[] = []> = Overloads<F> extends infer Overloads ? Overloads extends any[] ? IsMatchingOverload<Overloads, Args> extends true ? true : false : Args extends Parameters<F> ? true : false : never;

type StrictEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type IsAnyRecord<T> = StrictEqual<T, Record<string, any>>;

type RequiredKeys<T extends object, Keys extends keyof T> = Union<T & Required<Pick<T, Keys>>>;

type ProcessSegment<S extends string> = S extends "*" ? `${string}` : S;
type ProcessSegments<Arr extends string[]> = Arr extends [] ? [] : Arr extends [infer First extends string, ...infer Rest extends string[]] ? [ProcessSegment<First>, ...ProcessSegments<Rest>] : [];
type ReplaceWildcard<T> = T extends string ? IsMultiWildcard<T> extends true ? T extends "**" ? `${string}/${string}` : T extends "*" ? string : T extends `${infer Head}/**` ? `${ReplaceWildcard<Head>}/${string}` : T : Join<ProcessSegments<Split<T>>> : T;

type WildcardKeys<T> = {
    [K in keyof T]: K extends string ? (ContainsWildcard<K> extends true ? K : never) : never;
}[keyof T];

type ExpandWildcard<T extends Record<string, any>> = Expand<{
    [K in WildcardKeys<T> as ReplaceWildcard<K>]: T[K];
} & {
    [K in Exclude<keyof T, WildcardKeys<T>>]: T[K];
}>;

/**
 * 判断单个路径段是否为通配符
 *
 * 示例：
 * - IsWildcardSegment 星号 → true
 * - IsWildcardSegment "rooms" → false
 */
type IsWildcardPart<S extends string> = S extends "*" | "**" ? true : false;

/**
 * CountWildcardSegments 的辅助实现
 * 使用累加器模式计算通配符段数量
 * @param Arr - 路径段数组
 * @param Acc - 累加器（元组），长度即为当前计数
 */
type CountWildcardSegmentsAcc<Arr extends string[], Acc extends any[]> = Arr extends [] ? Acc["length"] : Arr extends [infer First extends string, ...infer Rest extends string[]] ? IsWildcardPart<First> extends true ? CountWildcardSegmentsAcc<Rest, [...Acc, any]> : CountWildcardSegmentsAcc<Rest, Acc> : Acc["length"];
/**
 * 计算路径中通配符段的数量
 *
 * 通配符段是指完全等于星号或双星号的段
 *
 * @example
 *
 * GetWildcardCount<"*">
 *
 *
 */
type GetWildcardCount<T extends string> = IsMultiWildcard<T> extends true ? 99 : CountWildcardSegmentsAcc<SplitPath<T>, []>;

type NormalEvents<T extends Record<string, any>> = {
    [K in Exclude<keyof T, WildcardKeys<T>>]: T[K];
};

type IsSingleStar<T extends string> = T extends "*" ? true : false;
type WildcardKeyToObject<K extends string, V> = K extends K ? IsSingleStar<K> extends true ? {
    [x: string]: V;
} : {
    [P in ReplaceWildcard<K>]: V;
} : never;

type WildcardEvents<T extends Record<string, any>> = {
    [K in WildcardKeys<T>]: ValueOf$1<WildcardKeyToObject<K, T[K]>>;
};

/**
 *
 * 输入原始事件类型定义
 *
 */
type GetWildcardEventList<Events extends Record<string, any>> = {
    wildcard: WildcardEvents<Events>;
    normal: NormalEvents<Events>;
};

/**
 * 通配符优先级计算工具
 *
 * 用于区分通配符模式的具体程度，解决
 * 核心规则：固定段多的优先级更高
 */

/**
 * CountFixedSegments 的辅助实现
 * 使用累加器模式计算固定段数量
 * @param Arr - 路径段数组
 * @param Acc - 累加器（元组），长度即为当前计数
 */
type CountFixedSegmentsAcc<Arr extends string[], Acc extends any[]> = Arr extends [] ? Acc["length"] : Arr extends [infer First extends string, ...infer Rest extends string[]] ? IsWildcardPart<First> extends true ? CountFixedSegmentsAcc<Rest, Acc> : CountFixedSegmentsAcc<Rest, [...Acc, any]> : Acc["length"];
/**
 * 计算路径中的固定段数量（非通配符的段）
 * 使用累加器模式，通过元组长度来表示数字
 */
type GetFixedPartCount<T extends string> = CountFixedSegmentsAcc<SplitPath<T>, []>;
type GetPartCountAcc<Arr extends string[], Acc extends any[]> = Arr extends [] ? Acc["length"] : Arr extends [infer _First extends string, ...infer Rest extends string[]] ? GetPartCountAcc<Rest, [...Acc, any]> : Acc["length"];

/**
 * 检查是否为全通配符模式
 *
 * 全通配符定义：
 * 只有完全没有任何固定段（即所有段都是通配符段）的模式才是全通配符
 *
 * 示例：
 * - "*" → true（没有固定段）
 * - "**" → true（没有固定段）
 */
type IsFullWildcard<T extends string> = GetFixedPartCount<T> extends 0 ? GetWildcardCount<T> extends 0 ? false : true : false;

/**
 * 判断是否为半通配符（既有固定段又有独立的通配符段）
 *
 * 判断逻辑：
 * 1. 使用 SplitPath 将路径分割成段数组（自动处理没有斜杠的情况）
 * 2. 检查是否有固定段（非通配符段）且至少有一个独立的通配符段
 * 3. 独立的通配符段是指完全等于星号或双星号的段
 *
 * 详细示例请参考测试文件 WildcardPriority.test.ts
 */
type IsSemiWildcard<T extends string> = GetFixedPartCount<T> extends 0 ? false : GetWildcardCount<T> extends 0 ? false : true;

type ToWildcardMessage<Events extends Record<string, any>, Meta = Record<string, any>> = {
    [K in keyof Events]: {
        type: ReplaceWildcard<Exclude<K, number | symbol>>;
        payload: ValueOf$1<Events[K]>;
        meta?: Meta;
    };
}[keyof Events];

/**
 * 将事件的所有应用通配符
 *
 * 将所有健中的通配符转换为${string}
 *
 */
type ApplyWildcardEvents<Events extends Record<string, any>> = {
    [K in KeyOf<Events> as IsMultiWildcard<K> extends true ? `${string}/${string}` : ReplaceWildcard<K>]: Events[K];
};

/**
 * 扩展通配符事件类型
 * @description 将包含通配符的事件键扩展为模板字面量类型
 *
 * 优先级：非通配符键 > 单级通配符 > 多级通配符
 * 使用交叉类型实现，确保精确键优先匹配
 */
type ExtendWildcardEvents<Events extends Record<string, any>> = AssertRecord<RemoveEmptyObject<{
    [K in keyof Events as K extends `${string}*${string}` | `*` ? never : K]: Events[K];
} & {
    [K in keyof Events as K extends `${string}*${string}` | `*` ? ReplaceWildcard<K & string> : never]: Events[K];
}>>;

/**
 * 计算输入的Key元组的优先级元组
 *
 * 用于匹配时使用
 */
type ToKeyPrioritys<T extends any[]> = {
    [i in keyof T]: IsMultiWildcard<T[i]> extends true ? PrefixNumber<Subtract<10, GetPartCount<T[i]>>, 99> : GetWildcardCount<T[i]>;
};

type ClosestMatch<T> = UnionToTuple$1<T>[IndexOfMin<ToKeyPrioritys<UnionToTuple$1<T>>>];

type GetPartCount<T extends string> = GetPartCountAcc<SplitPath<T>, []>;

type MatchSegment<Input extends string, Pattern extends string> = Pattern extends "*" ? true : Pattern extends "**" ? true : Input extends Pattern ? true : false;
type MatchPatternArray<InputArr extends string[], PatternArr extends string[]> = InputArr extends [
    infer InputHead extends string,
    ...infer InputTail extends string[]
] ? PatternArr extends [infer PatternHead extends string, ...infer PatternTail extends string[]] ? PatternHead extends "**" ? MatchPatternArray<InputArr, PatternTail> extends true ? true : InputArr extends [infer _First, ...infer Rest extends string[]] ? MatchPatternArray<Rest, PatternTail> extends true ? true : MatchPatternArray<Rest, PatternArr> extends true ? true : false : false : MatchSegment<InputHead, PatternHead> extends true ? MatchPatternArray<InputTail, PatternTail> : false : false : PatternArr extends [infer PatternHead extends string, ...infer PatternTail extends string[]] ? PatternHead extends "**" ? PatternTail extends [] ? false : MatchPatternArray<InputArr, PatternTail> : false : true;
/**
 * 判断输入路径是否匹配通配符模式
 * @param Input 输入路径
 * @param Pattern 通配符模式（支持 `*` 单级匹配和 `**` 末尾多级匹配）
 * @returns 匹配返回 true，否则返回 false
 *
 * @example true
 * IsWildcardMatched<"api/v1/users", "users/**"> // false
 */
type IsWildcardMatched<Input extends string, Pattern extends string> = MatchPatternArray<Split<Input>, Split<Pattern>> extends true ? true : false;

/**
 *
 *  列出与T匹配的事件名称
 *
 * {<通配符数量>:<事件名称>}
 *
     type Events = {
        "users/* /login": { userId: number };
        "* /* /login": { userId: number };
        "users/* /profile": { username: string };
    };
 
    type S2 = GetClosestEventNames<Events, "users/123/login">;
    {
        1: "users/* /login";
        2: "* /* /login";
    }
 */
type GetMatchedEventNames<Events extends Record<string, any>, T extends string> = {
    [Key in Exclude<keyof Events, number | symbol> as IsWildcardMatched<T, Key> extends true ? IsMultiWildcard<Key> extends true ? GetPartCount<Key> extends 9 ? 9 : GetPartCount<Key> extends 8 ? 8 : GetPartCount<Key> extends 7 ? 7 : GetPartCount<Key> extends 6 ? 6 : GetPartCount<Key> extends 5 ? 5 : GetPartCount<Key> extends 4 ? 4 : GetPartCount<Key> extends 3 ? 3 : GetPartCount<Key> extends 2 ? 2 : 1 : GetPartCount<Key> extends GetPartCount<T> ? GetWildcardCount<Key> extends 0 ? 0 : GetWildcardCount<Key> extends 1 ? 1 : GetWildcardCount<Key> extends 2 ? 2 : GetWildcardCount<Key> extends 3 ? 3 : GetWildcardCount<Key> extends 4 ? 4 : GetWildcardCount<Key> extends 5 ? 5 : GetWildcardCount<Key> extends 6 ? 6 : GetWildcardCount<Key> extends 7 ? 7 : GetWildcardCount<Key> extends 8 ? 8 : GetWildcardCount<Key> extends 9 ? 9 : never : never : T extends Key ? 0 : never]: Key;
};

/**
 *
 *
 * 返回匹配T的所有Key的元素
 *
 * @example
 *
 *
 */
type GetClosestEventNameTuple<Events extends Record<string, any>, T extends string> = (GetMatchedEventNames<Events, T> extends {
    0: infer V;
} ? V extends never ? never : V : never) | (GetMatchedEventNames<Events, T> extends {
    1: infer V;
} ? V extends never ? never : V : never) | (GetMatchedEventNames<Events, T> extends {
    2: infer V;
} ? V extends never ? never : V : never) | (GetMatchedEventNames<Events, T> extends {
    3: infer V;
} ? V extends never ? never : V : never) | (GetMatchedEventNames<Events, T> extends {
    4: infer V;
} ? V extends never ? never : V : never) | (GetMatchedEventNames<Events, T> extends {
    5: infer V;
} ? V extends never ? never : V : never) | (GetMatchedEventNames<Events, T> extends {
    6: infer V;
} ? V extends never ? never : V : never) | (GetMatchedEventNames<Events, T> extends {
    7: infer V;
} ? V extends never ? never : V : never) | (GetMatchedEventNames<Events, T> extends {
    8: infer V;
} ? V extends never ? never : V : never) | (GetMatchedEventNames<Events, T> extends {
    9: infer V;
} ? V extends never ? never : V : never);

/**
 * 返回最接近的Key
 */
type GetClosestEventName<Events extends Record<string, any>, T extends string> = GetMatchedEventNames<Events, T> extends never ? never : ClosestMatch<GetClosestEventNameTuple<Events, T>>;

/**
 
 type Events = {
        "users/* /login": { userId: number };
        "* /* /login": { userId: number };
        "users/* /profile": { username: string };
    };

type Result1 = GetClosestEvents<Events, "users/123/login">;

 {
    "users/* /login": {
        userId: number;
    };
}
 */
type GetClosestEvents<Events extends Record<string, any>, T extends string, D = Record<string, any>> = GetClosestEventName<Events, T> extends never ? D : Record<AssertString<GetClosestEventName<Events, T>>, Events[AssertString<GetClosestEventName<Events, T>>]>;

/**
 * 返回最匹配的事件元组
 *
 * [事件名称，事件负载]
 *
 * type Events = {
  *   "users/* /login": string;
    "users/* /logout": number;
    "users/* /*": { name: string };
};
 
type Result =GetClosestEventTuple<Events,"users/fisher/login">
type Result = ["users/* /login", string]

 *
 */
type GetClosestEventTuple<Events extends Record<string, any>, T extends string> = ExpandRecord<GetClosestEvents<Events, T>>;

type ToFixedCounts<T extends any[]> = {
    [i in keyof T]: GetPartCount<T[i]>;
};

/**
 * 判断事件名 T 是否匹配模式 P
 *
 * 匹配规则：
 * - 精确匹配：T 完全等于 P（当 P 不包含通配符时）
 * - 单级通配符 *：匹配任意单段路径
 * - 多级通配符 **：匹配零或多段路径
 * - 支持联合类型：P 可以是多个模式的联合，如 "a" | "b"
 *
 * @example
 * - IsMatchEventName<"user/login", "user/login"> = true
 * - IsMatchEventName<"user/login", "user&#47;*"> = true (末尾单级通配符)
 * - IsMatchEventName<"user/login", "*&#47;login"> = true (开头单级通配符)
 * - IsMatchEventName<"user/profile/edit", "user&#47;**"> = true (末尾多级通配符)
 * - IsMatchEventName<"a/b/c", "**"> = true (全通配符)
 * - IsMatchEventName<"user/login", "user/login" | "admin/*"> = true (联合类型)
 */
type MatchSingleStar<T extends string[], P extends string[]> = T extends [] ? P extends [] ? true : false : P extends [] ? false : T extends [infer TFirst extends string, ...infer TRest extends string[]] ? P extends [infer PFirst extends string, ...infer PRest extends string[]] ? PFirst extends "*" ? MatchSingleStar<TRest, PRest> : TFirst extends PFirst ? MatchSingleStar<TRest, PRest> : false : false : false;
type MatchWithDoubleStar<T extends string[], P extends string[]> = T extends [] ? P extends [] ? true : false : P extends [] ? false : T extends [infer TFirst extends string, ...infer TRest extends string[]] ? P extends [infer PFirst extends string, ...infer PRest extends string[]] ? PFirst extends "*" ? MatchWithDoubleStar<TRest, PRest> : PFirst extends "**" ? MatchDoubleStar<T, PRest> : TFirst extends PFirst ? MatchWithDoubleStar<TRest, PRest> : false : false : false;
type MatchDoubleStar<T extends string[], P extends string[]> = T extends [] ? P extends [] ? true : false : P extends [] ? true : T extends [infer _TFirst extends string, ...infer TRest extends string[]] ? P extends ["**"] ? MatchDoubleStar<TRest, P> : P extends [infer PFirst extends string, ...infer PRest extends string[]] ? PFirst extends "*" ? MatchWithDoubleStar<TRest, PRest> : PFirst extends "**" ? MatchDoubleStar<T, PRest> : T extends [infer TFirst extends string, ...infer TRest2 extends string[]] ? TFirst extends PFirst ? MatchWithDoubleStar<TRest2, PRest> : MatchDoubleStar<TRest, P> : false : false : false;
type IsMatchEventNameImpl<T extends string, P> = P extends string ? ContainsWildcard<P> extends false ? T extends P ? true : false : IsMultiWildcard<P> extends true ? MatchWithDoubleStar<SplitPath<T>, SplitPath<P>> : MatchSingleStar<SplitPath<T>, SplitPath<P>> : false;
type IsMatchEventNameDistributed<T extends string, P> = P extends any ? IsMatchEventNameImpl<T, P> : never;
type IsMatchEventName<T extends string, P> = true extends IsMatchEventNameDistributed<T, P> ? true : false;

/**
 *
 * - 当K不包括通配符时,直接返回K
 * - 当包括通配符时，返回K | Omit<ReplaceWildcard<K>, K>
 *   这样操作的目的是为了能让IDE提供"users/* /login"并且能适配通配符
 *   如果不这样操作，IDE不会提示
 *
 *
 *
 */
type EnsureEventType<K extends string> = ContainsWildcard<K> extends true ? K | ReplaceWildcard<K> : K;
type MutableMessage<Events extends Record<string, any>, Meta extends Record<string, any> = Record<string, any>> = IsAnyRecord<Events> extends true ? OptionalKeys<FastEventMessage<string, any, Meta>, "meta"> & FastEventMessageExtends : {
    [K in KeyOf<Events>]: Events[K] extends FastMessagePayload ? IfNever<Events[K]["type"], any> : {
        type: ReplaceWildcard<K extends "*" ? string : EnsureEventType<K>>;
        payload: IfNever<Events[K], any>;
        meta?: Meta;
    } & FastEventMessageExtends;
}[KeyOf<Events>];

/**
 * 事件消息相关
 */

interface FastEventMeta {
}
interface FastEventMessageExtends {
}
type FastEventMessage<T extends string = string, P = any, M extends Record<string, any> = Record<string, any>> = {
    type: T;
    payload: P;
    meta?: FastEventMeta & M & Record<string, any>;
} & FastEventMessageExtends;
/**
 * 用于emit方法，允许meta可选，更加宽泛
 */
type FastEventEmitMessage<T extends string = string, P = any, M extends Record<string, any> = Record<string, any>> = OptionalKeys<FastEventMessage<T, P, M>, "meta">;
type WildcardStyle = `*` | `**` | `${string}/*` | `*/${string}` | `${string}/*/${string}` | `${string}/**`;
type TypedFastEventMessage<Events extends Record<string, any> = Record<string, any>, M = any> = ({
    [K in keyof Events as K extends WildcardStyle ? ReplaceWildcard<K> : never]: {
        type: ReplaceWildcard<K>;
        payload: Events[K];
        meta?: Partial<FastEventMeta & M> & Record<string, any>;
    };
} & {
    [K in keyof Events as K extends WildcardStyle ? never : K]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
        meta?: Partial<FastEventMeta> & M & Record<string, any>;
    };
})[Exclude<keyof Events, number | symbol>] & FastEventMessageExtends;
type TypedFastEventMessageOptional<Events extends Record<string, any> = Record<string, any>, M = any> = {
    [K in keyof Events]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
        meta?: DeepPartial<FastEventMeta & M & Record<string, any>>;
    };
}[Exclude<keyof Events, number | symbol>] & FastEventMessageExtends;
type FastMessagePayload<P = any> = {
    type: P;
    __IS_FAST_MESSAGE__: true;
};
/**
 * 通用事件消息类型
 * @description 根据 Events 类型生成联合类型，每个成员包含 type 和 payload 字段
 *
 * @example
 * type Events = {
 *     userCreated: { id: number; name: string };
 *     userDeleted: number;
 *     statusChanged: 'active' | 'inactive';
 * };
 *
 * type Message = FastEventCommonMessage<Events>;
 * // 等价于:
 * // type Message = {
 * //     type: 'userCreated';
 * //     payload: { id: number; name: string };
 * // } | {
 * //     type: 'userDeleted';
 * //     payload: number;
 * // } | {
 * //     type: 'statusChanged';
 * //     payload: 'active' | 'inactive';
 * // }
 */
type FastEventCommonMessage<Events extends Record<string, any>> = {
    [K in keyof Events]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
    };
}[Exclude<keyof Events, number | symbol>];
/**
 * 声明事件类型时，一般情况下，K=事件名称，V=事件Payload参数类型
 *
 * AssertFastMessage用于声明V是一个FastMessage类型，而不是Payload类型
 *
 * 一般配合transform参数使用
 *
 * 例如：
 * type CustomEvents = {
       click: NotPayload<{ x: number; y: number }>;
       <事件名称,即type>:<事件负载，即payload>
    }
    常规情况下，事件的K=事件名称，V=事件Payload参数类型

    但是如我们使用了transform对事件进行了转换时，此时接收到的消息可能就不是标准事件消息{type,payload}

    此时可以使用NotPayload或AssertFastMessage类型声明

    const emitter = new FastEvent<CustomEvents>();
    emitter.on('click', (message) => {
        // 因为上面的click事件中使用了NotPayload类型
        // typeof message === { x: number; y: number }
    })
    const emitter = new FastEvent<CustomEvents>({
        transform:(message)=>{
            if(message.type === 'click'){
                return message.payload
            }else{
                return message
            }
        }
    });
    emitter.on('click', (message) => {
        // typeof message === { x: number; y: number }
    }
 */
type AssertFastMessage<M> = {
    type: M;
    __IS_FAST_MESSAGE__: true;
};

/**
 * FastEvent 订阅者类型
 *
 * @description
 * 当使用 { iterable: true } 选项时，返回的订阅者对象支持异步迭代，
 * 可以使用 for await...of 语法消费事件消息。
 *
 * @example
 * ```ts
 * // 普通订阅者（不启用 iterable）
 * const subscriber1 = emitter.on('event', listener);
 * subscriber1.off();
 *
 * // 可迭代订阅者（启用 iterable）
 * const subscriber2 = emitter.on('event', null, { iterable: true });
 * for await (const message of subscriber2) {
 *     console.log(message);
 * }
 * ```
 */
type FastEventSubscriber = {
    /**
     * 取消订阅
     */
    off: () => void;
    /**
     * 同步资源释放（支持 using 语句）
     *
     * @example
     * ```ts
     * {
     *     using subscriber = emitter.on('event', listener);
     *     // subscriber 在作用域结束时自动释放
     * }
     * ```
     */
    [Symbol.dispose]: () => void;
    /**
     * 为什么要有一个listener引用? 主要用于移除监听器时使用
     *
     *  - 正常情况下
     *  const subscriber = emitter.on('event', listener)
     *
     *  subscriber.off()
     *  emitter.off('event', listener)
     *  emitter.off(listener)
     *
     *  - 在使用scope时
     *  const scope = emitter.scope("xxx")
     *  const subscriber = scope.on('event', listener)
     *
     *  subscriber.off()        可以正常生效
     *  scope.off('event', listener)    // 无法生效
     *  scope.off(listener) // 无法生效
     *  因为在scope中，为了让监听器可以处理scope的逻辑，对listener进行了包装，
     *  因此在事件注册表中登记的不是listener，而是经过包装的监听器
     *  subscriber.off()        可以正常生效
     *  如果要使用scope.off或emitter.off
     *  需要使用subscriber.listener， subscriber.listener记录了原始的监听器引用
     *   subscriber.listener===listener
     *
     *  scope.off('event', subscriber.listener)    // 生效
     *  scope.off(subscriber.listener) // 生效
     *
     */
    readonly listener: TypedFastEventListener<any, any, any>;
} & {
    /**
     * 将消息加入队列（内部方法，仅当启用 iterable 时可用）
     * @internal
     */
    _enqueue?: (message: TypedFastEventMessage) => void;
    /**
     * 关闭订阅者（内部方法，仅当启用 iterable 时可用）
     * @internal
     */
    _close?: () => void;
};

type FastListenerExecutor = (listeners: FastEventListenerMeta[], message: TypedFastEventMessage, args: FastEventListenerArgs, execute: (this: FastEventListenerMeta, listener: FastEventListenerMeta, message: TypedFastEventMessage, args: FastEventListenerArgs, catchErrors?: boolean) => Promise<any> | any) => Promise<any[]> | any[];

type FastListenerPipe = (listener: TypedFastEventListener) => TypedFastEventListener;

/**
 * FastEventIterator - 使用异步迭代器从 FastEvent 或 FastEventScope 订阅事件
 * 重构：使用 queue.ts 中的队列参数和逻辑
 */

type FastQueueOverflows = "drop" | "expand" | "slide" | "throw";
interface FastEventIteratorOptions<T = FastEventMessage> {
    /** 缓冲区默认大小（默认：100） */
    size?: number;
    /** 缓冲区扩展到多大时不再扩展（默认：1000） */
    maxExpandSize?: number;
    /** 当扩展到最大大小后的溢出策略（默认：'slide'） */
    expandOverflow?: Omit<FastQueueOverflows, "expand">;
    /** 溢出策略（默认：'slide'） */
    overflow?: FastQueueOverflows;
    /** 消息生命周期（毫秒），0表示不启用（默认：0） */
    lifetime?: number;
    /** 当新消息到达时触发此回调 */
    onPush?: (newMessage: T, messages: [T, number][]) => void;
    /** 当消息被弹出时触发此回调，可以在此对消息队列进行排序等操作 */
    onPop?: (messages: [T, number][], hasNew: boolean) => [T, number] | undefined;
    /** 当消息被丢弃时触发此回调 */
    onDrop?: (message: T) => void;
    /** 错误处理函数，返回true表示继续迭代，false表示停止迭代 */
    onError?: (error: Error) => boolean | Promise<boolean>;
    /** 信号，用于取消迭代 */
    signal?: AbortSignal;
}
declare class FastEventIterator<T = any> implements AsyncIterableIterator<T> {
    private eventEmitter;
    private eventName;
    private buffer;
    private resolvers;
    private errorResolvers;
    private isStopped;
    private error;
    private options;
    private currentSize;
    private hasNewMessage;
    private _listener;
    private _ready;
    private _listenOptions?;
    private _cleanups;
    constructor(eventEmitter: FastEvent<any> | FastEventScope<any, any, any>, eventName: string, options?: FastEventIteratorOptions<T>);
    get listener(): FastEventListener;
    get ready(): boolean;
    /**
     * 创建异步迭代器
     */
    create(options?: FastEventListenOptions): void;
    /**
     * 推送消息到缓冲区
     */
    private push;
    /**
     * 处理缓冲区溢出
     * @returns 返回 true 表示消息已添加，false 表示消息被丢弃
     */
    private handleOverflow;
    private onMessage;
    /**
     * 中止监听
     * @param abort
     * @returns
     */
    off(abort?: boolean): void;
    next(): Promise<IteratorResult<T>>;
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
    done(): Promise<IteratorResult<T>>;
    throw(error?: any): Promise<IteratorResult<T>>;
    /**
     * 当 for await...of 循环被 break、return 或 throw 中断时调用
     * 自动清理资源，防止内存泄漏
     */
    return(): Promise<IteratorResult<T>>;
    /**
     * 同步资源释放（支持 using 语句）
     *
     * @description
     * 当使用 `using` 语句时，此方法会在作用域结束时自动调用，
     * 执行 off() 方法取消订阅。
     *
     * @example
     * ```ts
     * {
     *     using subscriber = emitter.on('event');
     *     // subscriber 在作用域结束时自动调用 off()
     * }
     * ```
     */
    [Symbol.dispose](): void;
    on(): void;
}
/**
 * 创建一个异步迭代器，从 FastEvent 或 FastEventScope 订阅事件
 * @param eventEmitter FastEvent 或 FastEventScope 实例
 * @param eventName 事件名称
 * @param options 配置选项
 * @param listenerOptions 监听器配置选项
 * @returns 异步迭代器
 */
declare function createAsyncEventIterator<T = any>(eventEmitter: FastEvent<any> | FastEventScope<any, any, any>, eventName: string, options?: FastEventIteratorOptions<T>): FastEventIterator<T>;

/**
 * 事件相关
 */

type FastEventOptions<Meta = Record<string, any>, Context = never> = {
    id: string;
    title: string;
    debug: boolean;
    delimiter: string;
    context: Context;
    ignoreErrors: boolean;
    meta: Meta;
    onAddBeforeListener?: (type: string, listener: TypedFastEventListener, options: FastEventListenOptions<Record<string, any>, Meta>) => boolean | FastEventSubscriber | void;
    onAddAfterListener?: (type: string, node: FastEventListenerNode) => void;
    onRemoveListener?: (type: string, listener: TypedFastEventListener, node: FastEventListenerNode) => void;
    onClearListeners?: () => void;
    onListenerError?: (error: Error, listener: TypedFastEventListener, message: TypedFastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta> | undefined) => void;
    onBeforeExecuteListener?: (message: TypedFastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta>) => boolean | void | any[];
    onAfterExecuteListener?: (message: TypedFastEventMessage<any, Meta>, returns: any[], listeners: FastEventListenerNode[]) => void;
    /**
     * 全局执行器
     */
    executor?: FastListenerExecutor;
    /**
     * 是否展开emit返回值,默认为false，用于将事件转发给其他FastEvent时使用
     */
    expandEmitResults?: boolean;
    /**
     * 对接收到的消息进行转换，用于将消息转换成其他格式
     *
     * new FastEvent({
     *    transform:(message)=>{
     *        message.payload
     *    }
     * })
     */
    transform?: (message: FastEventMessage) => any;
};
interface FastEvents {
}
type FastEventListenOptions<Events extends Record<string, any> = Record<string, any>, Meta = any> = {
    count?: number;
    prepend?: boolean;
    flags?: number;
    filter?: (message: TypedFastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => boolean;
    off?: (message: TypedFastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => boolean;
    pipes?: FastListenerPipe[];
    /**
     * 为监听器添加一个tag，在监听器注册表中记录,用于调试使用
     * emitter.on(type,listener,{tag:"x"})
     * emitter.getListeners(tag)
     */
    tag?: string;
    /**
     * 异步迭代器选项
     *
     * 用于配置返回异步迭代器的参数
     *
     * 默认值是
        {
            overflow: "expand",
            size: 10,
            maxExpandSize: 100,
        }
     */
    iterable?: FastEventIteratorOptions;
};
declare enum FastEventListenerFlags {
    Transformed = 1
}
type FastEventListenerArgs<M = Record<string, any>> = {
    retain?: boolean;
    meta?: DeepPartial<M> & Record<string, any>;
    abortSignal?: AbortSignal;
    /**
     *
     * allSettled: 使用Promise.allSettled()执行所有监听器
     * race: 使用Promise.race()执行所有监听器，只有第一个执行完成就返回,其他监听器执行结果会被忽略
     * balance: 尽可能平均执行各个监听器
     * sequence: 按照监听器添加顺序依次执行
     */
    executor?: FastListenerExecutor;
    /**
     * 当emit参数解析完成后的回调，用于修改emit参数
     */
    parseArgs?: (message: TypedFastEventMessage, args: FastEventListenerArgs) => void;
    /**
     * 额外的标识
     *
     * - 1: transformed 当消息是经过transform转换后的消息时的标识
     *
     */
    flags?: FastEventListenerFlags;
    /**
     * 如果消息经过转换前的原主题
     */
    rawEventType?: string;
};

type TypedFastEventListener<T extends string = string, P = any, M = any, C = any> = (this: C, message: TypedFastEventMessage<Record<T, P>, M>, args: FastEventListenerArgs<M>) => any | Promise<any>;
type TypedFastEventAnyListener<Events extends Record<string, any> = Record<string, any>, Meta = never, Context = any> = (this: Context, message: TypedFastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => any | Promise<any>;
type FastEventListeners<Events extends Record<string, any> = Record<string, any>, M = any, C = any> = {
    [K in keyof Events]: TypedFastEventListener<Exclude<K, number | symbol>, Events[K], M, C>;
};
type FastEventListener<T extends string = string, P = any, M extends Record<string, any> = Record<string, any>> = (message: FastEventMessage<T, P, M>, args: FastEventListenerArgs<M>) => any | Promise<any>;
type FastEventCommonListener<Message = FastEventMessage, Meta extends Record<string, any> = Record<string, any>, Context = any> = (this: Context, message: Message, args: FastEventListenerArgs<Meta>) => any | Promise<any>;
/**
 * [
 *      0: 监听器函数引用，
 *      1: 需要执行多少次，                     =0代表不限
 *      2: 实际执行的次数(用于负载均衡时记录)
 *      3: 标签            用于调试一般可以标识监听器类型或任意信息
 *      4: 标识,
 *      5: 监听器最后一次执行结果，仅仅在debug时启用，如果结果是对象则是一个WeakRef
 * ]
 */
type FastEventListenerMeta = [
    TypedFastEventListener<any, any>,
    number,
    number,
    string,
    number,
    any?
];
type FastEventListenerNode = {
    __listeners: FastEventListenerMeta[];
} & {
    [key: string]: FastEventListenerNode;
};
type FastListeners = FastEventListenerNode;

/**
 * 获取指定事件名称的负载类型
 */
type GetPayload<Events extends Record<string, any>, T> = T extends string ? GetClosestEventTuple<Events, T>[1] : any;

/**
 * 检查事件对象的所有值是否都为 FastMessagePayload 类型
 * @description
 * - 如果 Events 为空对象，返回 false
 * - 如果所有值都 extends FastMessagePayload，返回 true
 * - 否则返回 false
 *
 * @example
 * type Test1 = IsTransformed<{ a: FastMessagePayload<string> }>; // true
 * type Test2 = IsTransformed<{ a: FastMessagePayload<string>; b: number }>; // false
 * type Test3 = IsTransformed<{}>; // false
 */
type IsAllTransformed<Events extends Record<string, any>> = keyof Events extends never ? false : {
    [K in keyof Events]: Events[K] extends FastMessagePayload<any> ? true : false;
}[keyof Events] extends infer Result ? [Result] extends [true] ? true : false : false;

type GetClosestEventPayload<Events extends Record<string, any>, T extends string> = GetClosestEventTuple<Events, T>[1];

type IsTransformedEvent<Events extends Record<string, any>, T extends string> = T extends keyof Events ? IsAny<Events[T]> extends true ? never : Events[T] extends FastMessagePayload<any> ? T : never : IsAny<GetClosestEventPayload<Events, T>> extends true ? never : GetClosestEventPayload<Events, T> extends FastMessagePayload<any> ? T : never;

type NotPayload<M> = IsAny<M> extends true ? FastMessagePayload<any> : [M] extends [FastMessagePayload] ? M : FastMessagePayload<M>;

type OmitTransformedEvents<T extends Record<string, any>> = {
    [key in keyof T as T[key] extends FastMessagePayload ? never : key]: T[key];
};

type PayloadValues<R extends Record<string, any>> = R[keyof R] extends FastMessagePayload<infer P> ? P : R[keyof R];

type PickPayload<M> = [M] extends [FastMessagePayload] ? M["type"] : M;

type PickTransformedEvents<T extends Record<string, any>> = ExpandWildcard<{
    [key in keyof T as T[key] extends FastMessagePayload<any> ? key : never]: T[key];
}>;

type TransformedEvents<Events extends Record<string, any>> = {
    [K in keyof Events]: NotPayload<Events[K]>;
};

type AtPayloads<Events extends Record<string, any>> = {
    [K in keyof Events]: PickPayload<Events[K]>;
};

/**
 * 将对象中值是FastMessagePayload的类型提取出来
 */
type UnTransformedEvents<Events extends Record<string, any>> = {
    [K in keyof Events]: Events[K] extends FastMessagePayload<infer P> ? P : Events[K];
};

type AddBeforeListenerHook = (type: string, listener: TypedFastEventListener, options: FastEventListenOptions<Record<string, any>, any>) => boolean | FastEventSubscriber | void;
type AddAfterListenerHook = (type: string, node: FastEventListenerNode) => void;
type RemoveListenerHook = (type: string, listener: TypedFastEventListener, node: FastEventListenerNode) => void;
type ClearListenersHook = () => void;
type ListenerErrorHook = (error: Error, listener: TypedFastEventListener, message: TypedFastEventMessage<any, any>, args: FastEventListenerArgs<any> | undefined) => void;
type BeforeExecuteListenerHook = (message: TypedFastEventMessage<any, any>, args: FastEventListenerArgs<any>) => boolean | void | any[];
type AfterExecuteListenerHook = (message: TypedFastEventMessage<any, any>, returns: any[], listeners: FastEventListenerNode[]) => void;
type FastEventHooks = {
    AddBeforeListener: AddBeforeListenerHook[];
    AddAfterListener: AddAfterListenerHook[];
    RemoveListener: RemoveListenerHook[];
    ClearListeners: ClearListenersHook[];
    ListenerError: ListenerErrorHook[];
    BeforeExecuteListener: BeforeExecuteListenerHook[];
    AfterExecuteListener: AfterExecuteListenerHook[];
};

/**
 * 返回最匹配的事件元组
 *
 * [事件名称，事件负载]
 *
 * type Events = {
  *   "users/* /login": string;
    "users/* /logout": number;
    "users/* /*": { name: string };
};
 
type Result =GetClosestEventTuple<Events,"users/fisher/login">
type Result = ["users/* /login", string]

 *
 */
type GetClosestMessage<Events extends Record<string, any>, T extends string, Meta extends Record<string, any> = never> = FastEventMessage<ContainsWildcard<T> extends true ? ReplaceWildcard<Exclude<ExpandRecord<GetClosestEvents<Events, T>>[0], number | symbol>> : T, ExpandRecord<GetClosestEvents<Events, T>>[1], Meta>;

type InMatchedEvent<Events extends Record<string, any>, T> = T extends KeyOf<Events> | ReplaceWildcard<KeyOf<Events>> ? true : false;

type FastEventScopeOptions<Meta = Record<string, any>, Context = never> = {
    meta: FastEventScopeMeta & FastEventMeta & Meta;
    context: Context;
    executor?: FastListenerExecutor;
    /**
     * 对接收到的消息进行转换，用于将消息转换成其他格式
     *
     * new FastEvent({
     *    transform:(message)=>{
     *        message.payload
     *    }
     * })
     */
    transform?: (message: FastEventMessage) => any;
};
interface FastEventScopeMeta {
    scope: string;
}
interface IFastEventScope<Events extends Record<string, any> = Record<string, any>, Meta extends Record<string, any> = Record<string, any>, Context = never> {
    __FastEventScope__: boolean;
    readonly __events__: Events;
    readonly __meta__: Meta;
    readonly __context__: Context;
}
declare class FastEventScope<Events extends Record<string, any> = Record<string, any>, Meta extends Record<string, any> = Record<string, any>, Context = never, Types extends keyof Events = keyof Events, FinalMeta extends Record<string, any> = FastEventMeta & FastEventScopeMeta & Meta> {
    __FastEventScope__: boolean;
    readonly __events__: Events;
    readonly __meta__: Meta & FastEventScopeMeta;
    readonly __context__: Context;
    private _options;
    types: {
        events: ExtendWildcardEvents<Events>;
        eventNames: KeyOf<ExtendWildcardEvents<Events>>;
        messages: MutableMessage<Events, FinalMeta>;
        rawEvents: Events;
        meta: FinalMeta;
    };
    prefix: string;
    emitter: FastEvent<any>;
    constructor(options?: DeepPartial<FastEventScopeOptions<FinalMeta, Context>>);
    get context(): Fallback<Context, typeof this>;
    get options(): FastEventScopeOptions<FinalMeta, Context>;
    /**
     * 获取监听器
     * @returns 监听器
     */
    get listeners(): FastEventListenerMeta[];
    bind(emitter: FastEvent<any>, prefix: string, options?: DeepPartial<FastEventScopeOptions<FinalMeta, Context>>): void;
    /**
     * 初始化选项
     *
     * 本方法主要供子类重载
     *
     * @param initial - 可选的初始字典对象
     * @returns 返回传入的初始字典对象
     */
    _initOptions(initial: Dict | undefined): Dict | undefined;
    /**
     * 获取作用域监听器
     * 当启用作用域时,对原始监听器进行包装,添加作用域前缀处理逻辑
     * @param listener 原始事件监听器
     * @returns 包装后的作用域监听器
     * @private
     */
    private _getScopeListener;
    private _getScopeType;
    private _fixScopeType;
    on<T extends string = KeyOf<Events> | "**">(type: T, options?: FastEventListenOptions<Events, FinalMeta>): T extends IsTransformedEvent<Events, T> ? FastEventIterator<T extends "**" ? IsAllTransformed<Events> extends true ? PayloadValues<Events> : any : PickPayload<ValueOf<GetClosestEvents<Events, T>>>> : FastEventIterator<T extends "**" ? MutableMessage<Events> : GetClosestMessage<Events, T, FinalMeta>>;
    on<T extends string = KeyOf<Events> | "**">(type: T, listener: FastEventCommonListener<T extends IsTransformedEvent<Events, T> ? PickPayload<ValueOf<GetClosestEvents<Events, T>>> : T extends "**" ? MutableMessage<Events> : GetClosestMessage<Events, T, FinalMeta>, FinalMeta, Fallback<Context, typeof this>>, options?: FastEventListenOptions): FastEventSubscriber;
    /**
     * 只订阅一次
     * @param type
     * @param options
     */
    once<T extends string = KeyOf<Events> | "**">(type: T, listener: FastEventCommonListener<T extends IsTransformedEvent<Events, T> ? PickPayload<ValueOf<GetClosestEvents<Events, T>>> : T extends "**" ? MutableMessage<Events> : GetClosestMessage<Events, T, FinalMeta>, Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions): FastEventSubscriber;
    /**
     * 订阅全部
     * @param options
     */
    onAny(options?: FastEventListenOptions<Events, FinalMeta>): FastEventIterator<MutableMessage<Events, FinalMeta>>;
    onAny(listener: FastEventCommonListener<MutableMessage<Events, FinalMeta>, Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions<Events, FinalMeta>): FastEventSubscriber;
    off(listener: TypedFastEventListener<any, any, any>): void;
    off(type: string, listener: TypedFastEventListener<any, any, any>): void;
    off(type: Types, listener: TypedFastEventListener<any, any, any>): void;
    off(type: string): void;
    off(type: Types): void;
    offAll(): void;
    clear(): void;
    /**
     * 触发事件
     * @param type
     * @param directive
     */
    emit<R = any, T extends Types = Types>(type: T, payload?: UnTransformedEvents<Events>[T], retain?: boolean): R[];
    emit<R = any, T extends string = string>(type: ReplaceWildcard<T> | Types, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<Events>, T> : any, retain?: boolean): R[];
    emit<R = any, T extends string = string>(type: ReplaceWildcard<T> | Types, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<Events>, T> : any, options?: FastEventListenerArgs<Partial<FinalMeta>>): R[];
    emit<R = any, T extends KeyOf<Events> = KeyOf<Events>>(message: FastEventEmitMessage<T, UnTransformedEvents<Events>[T], Partial<FinalMeta>>, retain?: boolean): R[];
    emit<R = any>(message: MutableMessage<Events, FinalMeta>, retain?: boolean): R[];
    emit<R = any>(message: {
        type: keyof Events;
    }, retain?: boolean): R[];
    emit<R = any, T extends string = string>(type: T, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<Events>, T> : any, retain?: boolean): R[];
    private _transformMessage;
    emitAsync<R = any, T extends Types = Types>(type: T, payload?: UnTransformedEvents<Events>[T], retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any, T extends string = string>(type: ReplaceWildcard<T> | Types, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<Events>, T> : any, retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any, T extends string = string>(type: ReplaceWildcard<T> | Types, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<Events>, T> : any, options?: FastEventListenerArgs<Partial<FinalMeta>>): Promise<(R | Error)[]>;
    emitAsync<R = any, T extends KeyOf<Events> = KeyOf<Events>>(message: FastEventEmitMessage<T, UnTransformedEvents<Events>[T], Partial<FinalMeta>>, retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any>(message: MutableMessage<Events, FinalMeta>, retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any>(message: {
        type: keyof Events;
    }, retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any, T extends string = string>(type: T, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<Events>, T> : any, retain?: boolean): Promise<(R | Error)[]>;
    waitFor<T extends string = KeyOf<Events>>(type: T, timeout?: number): Promise<T extends IsTransformedEvent<Events, T> ? PickPayload<ValueOf<GetClosestEvents<Events, T>>> : FastEventMessage<T, GetClosestEventPayload<Events, T>, FinalMeta>>;
    waitFor<T extends string = string>(type: T, timeout?: number): Promise<TypedFastEventMessage<Events, FinalMeta>>;
    /**
     * 创建一个新的作用域实例
     * @param prefix - 作用域前缀
     * @returns 新的FastEventScope实例
     *
     * @description
     * 基于当前作用域创建一个新的子作用域。新作用域会继承当前作用域的所有特性，
     * 并在事件类型前添加额外的前缀。这允许创建层级化的事件命名空间。
     *
     * 作用域的特性：
     * - 自动为所有事件类型添加前缀
     * - 在触发事件时自动添加前缀
     * - 在接收事件时自动移除前缀
     * - 支持多层级的作用域嵌套
     *
     * @example
     * ```ts
     * const emitter = new FastEvent();
     * const userScope = emitter.scope('user');
     * const profileScope = userScope.scope('profile');
     *
     * // 在profileScope中监听'update'事件
     * // 实际监听的是'user/profile/update'
     * profileScope.on('update', (data) => {
     *   console.log('Profile updated:', data);
     * });
     *
     * // 在profileScope中触发'update'事件
     * // 实际触发的是'user/profile/update'
     * profileScope.emit('update', { name: 'John' });
     * ```
     */
    scope<E extends Record<string, any> = Record<string, any>, P extends string = string, M extends Record<string, any> = Record<string, any>, C = Context>(prefix: P, options?: DeepPartial<FastEventScopeOptions<Partial<FinalMeta> & M, C>>): FastEventScope<ScopeEvents<Events & E, P>, FinalMeta & M, C>;
    scope<E extends Record<string, any> = Record<string, any>, P extends string = string, M extends Record<string, any> = Record<string, any>, C = Context, ScopeInstance extends IFastEventScope<Record<string, any>, any, any> = FastEventScope<Record<string, any>, any, any>>(prefix: P, scopeObj: ScopeInstance, options?: DeepPartial<FastEventScopeOptions<Partial<FinalMeta> & M, C>>): FastEventScope<ScopeEvents<Events & E, P>, FinalMeta & M, C> & ScopeInstance;
}

/**
 * FastEvent 事件发射器类
 *
 * @template Events - 事件类型定义，继承自FastEvents接口
 * @template Meta - 事件元数据类型，默认为任意键值对对象
 * @template Types - 事件类型的键名类型，默认为Events的键名类型
 */
declare class FastEvent<Events extends Record<string, any> = Record<string, any>, Meta extends Record<string, any> = Record<string, any>, Context = never, AllEvents extends Record<string, any> = Expand<Events & FastEvents>, Types extends keyof AllEvents = KeyOf<AllEvents>, AllMeta extends Record<string, any> = FastEventMeta & Meta, EventNames = KeyOf<ExtendWildcardEvents<AllEvents>>> {
    __FastEvent__: boolean;
    /** 事件监听器树结构，存储所有注册的事件监听器 */
    listeners: FastListeners;
    /** 事件发射器的配置选项 */
    private _options;
    /** 事件名称的分隔符，默认为'/' */
    private _delimiter;
    /** 事件监听器执行时的上下文对象 */
    private _context;
    private _hooks?;
    /** 保留的事件消息映射，Key是事件名称，Value是保留的事件消息 */
    retainedMessages: Map<string, any>;
    /** 当前注册的监听器总数 */
    listenerCount: number;
    types: {
        events: ExtendWildcardEvents<AllEvents>;
        eventNames: KeyOf<ExtendWildcardEvents<AllEvents>>;
        meta: AllMeta;
        context: Expand<Fallback<Context, FastEvent<AllEvents, Meta, Context>>>;
        messages: MutableMessage<AllEvents, Meta>;
        message: MutableMessage<AllEvents, Meta>;
        listeners: FastEventListeners<AllEvents, Expand<FastEventMeta & Meta & Record<string, any>>>;
        anyListener: TypedFastEventAnyListener<AllEvents, Expand<FastEventMeta & Meta & Record<string, any>>>;
    };
    /**
     * 创建FastEvent实例
     * @param options - 事件发射器的配置选项
     *
     * 默认配置：
     * - debug: false - 是否启用调试模式
     * - id: 随机字符串 - 实例唯一标识符
     * - delimiter: '/' - 事件名称分隔符
     * - context: null - 监听器执行上下文
     * - ignoreErrors: true - 是否忽略监听器执行错误
     */
    constructor(options?: Partial<FastEventOptions<Meta, Context>>);
    /** 获取事件发射器的配置选项 */
    get options(): FastEventOptions<Meta, Context>;
    get context(): Fallback<Context, typeof this>;
    get meta(): Meta;
    /** 获取事件发射器的唯一标识符 */
    get id(): string;
    /** 获取事件发射器的唯一标识符 */
    get title(): string;
    get hooks(): FastEventHooks;
    private _execAfterExecuteListener;
    /**
     * 执行Hook
     *
     * AfterExecuteListener为什么需要特别处理？
     *
     * 因为AfterExecuteListener是在监听器执行完成后调用
     * 并且将监听器的结果传入，但是监听器有可能返回Promise
     * 因为需要等等Promise resolve，再调用AfterExecuteListener
     *
     *
     * @param hookName
     * @param args
     * @param onlyAsyncHook 只运行异步HOOK
     * @returns
     */
    private _executeHooks;
    /**
     * 初始化选项
     *
     * 本方法主要供子类重载
     *
     * @param initial - 可选的初始字典对象
     * @returns 返回传入的初始字典对象
     */
    _initOptions(initial?: Partial<FastEventOptions<Meta, Context>>): Partial<FastEventOptions<Meta, Context>> | undefined;
    /**
     * 添加事件监听器到事件树中
     * @param parts - 事件路径数组
     * @param listener - 事件监听器函数
     * @param options - 监听器配置选项
     * @param options.count - 监听器触发次数限制
     * @param options.prepend - 是否将监听器添加到监听器列表开头
     * @returns [节点, 监听器索引] - 返回监听器所在节点和在节点监听器列表中的索引
     * @private
     */
    private _addListener;
    /**
     *
     * 根据parts路径遍历监听器树，并在最后的节点上执行回调函数
     *
     * @param parts
     * @param callback
     * @returns
     */
    private _forEachNodes;
    /**
     * 从监听器节点中移除指定的事件监听器
     * @private
     * @param node - 监听器节点
     * @param listener - 需要移除的事件监听器
     * @description 遍历节点的监听器列表,移除所有匹配的监听器。支持移除普通函数和数组形式的监听器
     */
    private _removeListener;
    /**
     * 注册事件监听器
     * @param type - 事件类型，支持以下格式：
     *   - 普通字符串：'user/login'
     *   - 通配符：'user/*'（匹配单层）或'user/**'（匹配多层）
     *   - 全局监听：'**'（监听所有事件）
     * @param listener - 事件监听器函数
     * @param options - 监听器配置选项：
     *   - count: 触发次数限制，0表示无限制
     *   - prepend: 是否将监听器添加到监听器队列开头
     * @returns 返回订阅者对象，包含off方法用于取消监听
     *
     * @example
     * ```ts
     * // 监听特定事件
     * emitter.on('user/login', (data) => console.log(data));
     *
     * // 使用通配符
     * emitter.on('user/*', (data) => console.log(data));
     *
     * // 限制触发次数
     * emitter.on('event', handler, { count: 3 });
     * ```
     */
    on<T extends string = KeyOf<Events> | "**">(type: T, options?: FastEventListenOptions<AllEvents, Meta>): T extends IsTransformedEvent<AllEvents, T> ? FastEventIterator<T extends "**" ? IsAllTransformed<Events> extends true ? PayloadValues<AllEvents> : any : PickPayload<ValueOf<GetClosestEvents<AllEvents, T>>>> : FastEventIterator<T extends "**" ? MutableMessage<AllEvents> : GetClosestMessage<Events, T, Meta>>;
    on<T extends string = KeyOf<Events> | "**">(type: T, listener: FastEventCommonListener<T extends IsTransformedEvent<AllEvents, T> ? PickPayload<ValueOf<GetClosestEvents<Events, T>>> : T extends "**" ? MutableMessage<Events> : GetClosestMessage<Events, T, Meta>, Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions): FastEventSubscriber;
    /**
     * 注册一次性事件监听器
     * @param type - 事件类型，支持与on方法相同的格式：
     *   - 普通字符串：'user/login'
     *   - 通配符：'user/*'（匹配单层）或'user/**'（匹配多层）
     * @param listener - 事件监听器函数
     * @returns 返回订阅者对象，包含off方法用于取消监听
     *
     * @description
     * 监听器只会在事件首次触发时被调用一次，之后会自动解除注册。
     * 这是on方法的特例，相当于设置options.count = 1。
     * 如果事件有保留消息，新注册的监听器会立即收到最近一次的保留消息并解除注册。
     *
     * @example
     * ```ts
     * // 只监听一次登录事件
     * emitter.once('user/login', (data) => {
     *   console.log('用户登录:', data);
     * });
     * ```
     */
    once<T extends string = KeyOf<Events> | "**">(type: T, listener: FastEventCommonListener<T extends IsTransformedEvent<AllEvents, T> ? PickPayload<ValueOf<GetClosestEvents<Events, T>>> : T extends "**" ? MutableMessage<Events> : GetClosestMessage<Events, T, Meta>, Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions): FastEventSubscriber;
    /**
     * 注册一个监听器，用于监听所有事件
     * @param listener 事件监听器函数，可以接收任意类型的事件数据
     * @returns {FastEventSubscriber} 返回一个订阅者对象，包含 off 方法用于取消监听
     * @example
     * ```ts
     * const subscriber = emitter.onAny((eventName, data) => {
     *   console.log(eventName, data);
     * });
     *
     * // 取消监听
     * subscriber.off();
     * ```
     */
    onAny(options?: FastEventListenOptions<AllEvents, AllMeta>): FastEventIterator<MutableMessage<AllEvents, AllMeta>>;
    onAny(listener: FastEventCommonListener<MutableMessage<AllEvents, AllMeta>, Meta, Fallback<Context, typeof this>>, options?: FastEventListenOptions<AllEvents, AllMeta>): FastEventSubscriber;
    /**
     *
     * 当调用on/once/onAny时如果没有指定监听器，则调用此方法
     *
     * 此方法供子类继承
     *
     */
    off(listener: TypedFastEventListener<any, any, any>): void;
    off(type: string, listener: TypedFastEventListener<any, any, any>): void;
    off(type: Types, listener: TypedFastEventListener<any, any, any>): void;
    off(type: string): void;
    off(type: Types): void;
    /**
     * 移除所有事件监听器
     * @param entry - 可选的事件前缀,如果提供则只移除指定前缀下的的监听器
     * @description
     * - 如果提供了prefix参数,则只清除该前缀下的所有监听器
     * - 如果没有提供prefix,则清除所有监听器
     * - 同时会清空保留的事件(_retainedEvents)
     * - 重置监听器对象为空
     
    * @example
     *
     * ```ts
     * emitter.offAll();    // 清除所有监听器
     * emitter.offAll('a/b'); // 清除a/b下的所有监听器
     *
     */
    offAll(entry?: string): void;
    /**
     * 移除保留的事件
     * @param prefix - 事件前缀。如果不提供，将清除所有保留的事件。
     *                如果提供前缀，将删除所有以该前缀开头的事件。
     *                如果前缀不以分隔符结尾，会自动添加分隔符。
     * @private
     */
    private _removeRetainedEvents;
    clear(prefix?: string): void;
    /**
     * 发送最后一次事件的消息给对应的监听器
     *
     * @param type - 事件类型,支持通配符(*)匹配
     * @private
     *
     * 处理流程:
     * 1. 如果事件类型包含通配符,则遍历所有保留的消息,匹配符合模式的事件
     * 2. 如果是普通事件类型,则直接获取对应的保留消息
     * 3. 遍历匹配到的消息,查找对应路径的监听器节点
     * 4. 执行所有匹配到的监听器
     */
    private _emitRetainMessage;
    /**
     * 遍历监听器节点树
     * @param node 当前遍历的监听器节点
     * @param parts 事件名称按'.'分割的部分数组
     * @param callback 遍历到目标节点时的回调函数
     * @param index 当前遍历的parts数组索引,默认为0
     * @param lastFollowing  当命中**时该值为true, 注意**只能作在路径的最后面，如a.**有效，而a.**.b无效
     * @private
     *
     * 支持三种匹配模式:
     * - 精确匹配: 'a.b.c'
     * - 单层通配: 'a.*.c'
     * - 多层通配: 'a.**'
     */
    private _traverseToPath;
    private _traverseListeners;
    private _onListenerError;
    /**
     * 执行单个监听器函数
     * @param listener - 要执行的监听器函数或包装过的监听器对象
     * @param message - 事件消息对象，包含type、payload和meta
     * @param args - 监听器参数
     * @param catchErrors - 是否捕获并处理执行过程中的错误
     * @returns 监听器的执行结果或错误对象（如果配置了ignoreErrors）
     * @private
     *
     * @description
     * 执行单个监听器函数，处理以下情况：
     * - 如果监听器是包装过的（有__wrappedListener属性），调用包装的函数
     * - 否则直接调用监听器函数
     * - 使用配置的上下文（_context）作为this
     * - 捕获并处理执行过程中的错误：
     *   - 如果有onListenerError回调，调用它
     *   - 如果配置了ignoreErrors，返回错误对象
     *   - 否则抛出错误
     */
    private _executeListener;
    private _getListenerExecutor;
    /**
     * 执行监听器节点列表中的所有监听器函数
     * @param nodes 监听器节点列表
     * @param message 事件消息对象
     * @param args 监听器参数
     * @param args 监听器参数
     * @returns 所有监听器函数的执行结果数组
     * @private
     *
     * 执行流程:
     * 1. 将所有节点中的监听器函数展平为一维数组
     * 2. 通过执行器执行所有监听器函数
     * 3. 更新监听器的执行次数,并移除达到执行次数限制的监听器
     */
    private _executeListeners;
    /**
     * 减少侦听器的执行次数
     * @param listeners
     */
    _decListenerExecCount(listeners: [FastEventListenerMeta, number, FastEventListenerMeta[]][]): void;
    /**
     * 获取指定类型的所有事件监听器
     * @param type - 事件类型，必须是 AllEvents 的键
     * @returns 包含指定类型的所有监听器元数据的数组
     */
    getListeners(type: keyof AllEvents): FastEventListenerMeta[];
    /**
     * 清除所有事件或指定事件的保留消息
     * @param type
     */
    clearRetainMessages(type?: EventNames | string): void;
    /**
     * 触发事件并执行对应的监听器
     *
     * @param type - 事件类型字符串或包含事件信息的对象
     * @param payload - 事件携带的数据负载
     * @param retain - 是否保留该事件(用于新订阅者)
     * @param meta - 事件元数据
     * @returns 所有监听器的执行结果数组
     *
     * @example
     * // 方式1: 参数形式
     * emit('user.login', { id: 1 }, true)
     *
     * // 方式2: 对象形式
     * emit({ type: 'user.login', payload: { id: 1 } ,meta:{...}}}, true)
     */
    /**
     * 同步触发事件
     * @param type - 事件类型，可以是字符串或预定义的事件类型
     * @param payload - 事件数据负载
     * @param retain - 是否保留该事件，用于后续新的订阅者
     * @param meta - 事件元数据
     * @returns 所有监听器的执行结果数组
     *
     * @description
     * 同步触发指定类型的事件，支持两种调用方式：
     * 1. 参数形式：emit(type, payload, retain, meta)
     * 2. 对象形式：emit({ type, payload, meta }, retain)
     *
     * 特性：
     * - 支持通配符匹配，一个事件可能触发多个监听器
     * - 如果设置了retain为true，会保存最后一次的事件数据
     * - 按照注册顺序同步调用所有匹配的监听器
     * - 如果配置了ignoreErrors，监听器抛出的错误会被捕获并返回
     *
     * @example
     * ```ts
     * // 简单事件触发
     * emitter.emit('user/login', { userId: 123 });
     *
     * // 带保留的事件触发
     * emitter.emit('status/change', { online: true }, true);
     *
     * // 带元数据的事件触发
     * emitter.emit('data/update', newData, false, { timestamp: Date.now() });
     *
     * // 使用对象形式触发
     * emitter.emit({
     *   type: 'user/login',
     *   payload: { userId: 123 },
     *   meta: { time: Date.now() }
     * }, true);
     *
     * // 清除保留事件
     * emitter.emit("user/login")
     *
     * ```
     *
     * 为什么事件要使用UnTransformedEvents？
     *
     * 因为如果事件使用NotPayload，则会进行转换
     *
     */
    emit<R = any, T extends Types = Types>(type: T, payload?: UnTransformedEvents<AllEvents>[T], retain?: boolean): R[];
    emit<R = any, T extends string = string>(type: ReplaceWildcard<T> | Types, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<AllEvents>, T> : any, retain?: boolean): R[];
    emit<R = any, T extends string = string>(type: ReplaceWildcard<T> | Types, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<AllEvents>, T> : any, options?: FastEventListenerArgs<Partial<Meta>>): R[];
    emit<R = any, T extends KeyOf<AllEvents> = KeyOf<AllEvents>>(message: FastEventEmitMessage<T, UnTransformedEvents<AllEvents>[T], Partial<Meta>>, retain?: boolean): R[];
    emit<R = any>(message: MutableMessage<AllEvents, Meta>, retain?: boolean): R[];
    emit<R = any>(message: {
        type: keyof AllEvents;
    }, retain?: boolean): R[];
    emit<R = any>(message: FastEventMessage, retain?: boolean): R[];
    emit<R = any, T extends string = string>(type: T, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<AllEvents>, T> : any, retain?: boolean): R[];
    /**
     * 异步触发事件
     * @param type - 事件类型，可以是字符串或预定义的事件类型
     * @param payload - 事件数据负载
     * @param retain - 是否保留该事件，用于后续新的订阅者
     * @param meta - 事件元数据
     * @returns Promise，解析为所有监听器的执行结果数组
     *
     * @description
     * 异步触发指定类型的事件，与emit方法类似，但有以下区别：
     * - 返回Promise，等待所有异步监听器执行完成
     * - 使用Promise.allSettled处理监听器的执行结果
     * - 即使某些监听器失败，也会等待所有监听器执行完成
     * - 返回结果包含成功值或错误信息
     *
     * @example
     * ```ts
     * // 异步事件处理
     * const results = await emitter.emitAsync('data/process', rawData);
     *
     * // 处理结果包含成功和失败的情况
     * results.forEach(result => {
     *   if (result instanceof Error) {
     *     console.error('处理失败:', result);
     *   } else {
     *     console.log('处理成功:', result);
     *   }
     * });
     *
     * // 带元数据的异步事件
     * await emitter.emitAsync('batch/process', items, false, {
     *   batchId: 'batch-001',
     *   timestamp: Date.now()
     * });
     * ```
     */
    emitAsync<R = any, T extends Types = Types>(type: T, payload?: UnTransformedEvents<AllEvents>[T], retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any, T extends string = string>(type: ReplaceWildcard<T> | Types, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<AllEvents>, T> : any, retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any, T extends string = string>(type: ReplaceWildcard<T> | Types, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<AllEvents>, T> : any, options?: FastEventListenerArgs<Partial<Meta>>): Promise<(R | Error)[]>;
    emitAsync<R = any, T extends KeyOf<AllEvents> = KeyOf<AllEvents>>(message: FastEventEmitMessage<T, UnTransformedEvents<AllEvents>[T], Partial<Meta>>, retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any>(message: MutableMessage<AllEvents, Meta>, retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any>(message: {
        type: keyof AllEvents;
    }, retain?: boolean): Promise<(R | Error)[]>;
    emitAsync<R = any, T extends string = string>(type: T, payload?: InMatchedEvent<Events, T> extends true ? GetPayload<UnTransformedEvents<AllEvents>, T> : any, retain?: boolean): Promise<(R | Error)[]>;
    /**
     * 等待指定事件发生，返回一个Promise
     * @param type - 要等待的事件类型
     * @param timeout - 超时时间（毫秒），默认为0表示永不超时
     * @returns Promise，解析为事件消息对象，包含type、payload和meta
     *
     * @description
     * 创建一个Promise，在指定事件发生时解析。
     * - 当事件触发时，Promise会解析为事件消息对象
     * - 如果设置了timeout且超时，Promise会被拒绝
     * - 一旦事件发生或超时，会自动取消事件监听
     *
     * @example
     * ```ts
     * try {
     *   // 等待登录事件，最多等待5秒
     *   const event = await emitter.waitFor('user/login', 5000);
     *   console.log('用户登录成功:', event.payload);
     * } catch (error) {
     *   console.error('等待登录超时');
     * }
     *
     * // 无限等待事件
     * const event = await emitter.waitFor('server/ready');
     * console.log('服务器就绪');
     *
     * // 等待指定的事件发生，并且如果该事件有其他订阅者，则同时等待该事件的所有订阅执行完成
     * waitFor
     *
     *
     *
     * ```
     */
    waitFor<T extends string = KeyOf<AllEvents>>(type: T, timeout?: number): Promise<T extends IsTransformedEvent<AllEvents, T> ? PickPayload<ValueOf<GetClosestEvents<Events, T>>> : FastEventMessage<T, GetClosestEventPayload<AllEvents, T>, Meta>>;
    waitFor<T extends string = string>(type: T, timeout?: number): Promise<TypedFastEventMessage<AllEvents, Meta>>;
    /**
     * 创建一个新的事件作用域
     * @param prefix - 作用域前缀，将自动添加到该作用域下所有事件名称前
     * @returns 新的FastEventScope实例
     *
     * @description
     * 创建一个新的事件作用域，用于在特定命名空间下管理事件。
     *
     * 重要特性：
     * - 作用域与父事件发射器共享同一个监听器表
     * - 作用域中的事件会自动添加前缀
     * - 作用域的所有操作都会映射到父事件发射器上
     * - 作用域不是完全隔离的，只是提供了事件名称的命名空间
     *
     * @example
     * ```ts
     * const emitter = new FastEvent();
     *
     * // 创建用户相关事件的作用域
     * const userEvents = emitter.scope('user');
     *
     * // 在作用域中监听事件
     * userEvents.on('login', (data) => {
     *   // 实际监听的是 'user/login'
     *   console.log('用户登录:', data);
     * });
     *
     * // 在作用域中触发事件
     * userEvents.emit('login', { userId: 123 });
     * // 等同于 emitter.emit('user/login', { userId: 123 })
     *
     * // 创建嵌套作用域
     * const profileEvents = userEvents.scope('profile');
     * profileEvents.emit('update', { name: 'John' });
     * // 等同于 emitter.emit('user/profile/update', { name: 'John' })
     *
     * // 清理作用域
     * userEvents.offAll();  // 清理 'user' 前缀下的所有事件
     * ```
     */
    scope<P extends string = string, ScopeInstance extends IFastEventScope = IFastEventScope>(prefix: P, scopeObj: ScopeInstance, options?: DeepPartial<FastEventScopeOptions<Meta>>): FastEventScope<RemoveAnyRecord<ScopeEvents<AllEvents, P> & ScopeInstance["__events__"]>, RemoveAnyRecord<Meta & ScopeInstance["__meta__"]>, RemoveAnyRecord<Context & ScopeInstance["__context__"]>> & ScopeInstance;
    scope<E = unknown, //用于扩展事件
    P extends string = string, M extends Record<string, any> = Record<string, any>, C = Context>(prefix: P, options?: DeepPartial<FastEventScopeOptions<Meta & M, C>>): FastEventScope<ScopeEvents<Events, P> & E, Meta & M, C>;
}

declare const __FastEvent__: unique symbol;
declare const __FastEventScope__: unique symbol;
declare class FastEventError extends Error {
    constructor(message?: string);
}
declare class TimeoutError extends FastEventError {
}
declare class UnboundError extends FastEventError {
}
declare class AbortError extends FastEventError {
}
declare class CancelError extends FastEventError {
}
declare class QueueOverflowError extends FastEventError {
}

declare function isFastEventScope(target: any): target is FastEventScope;

declare function isFastEventMessage(msg: any): msg is TypedFastEventMessage;

declare function isFunction(fn: any): fn is Function;

declare function isString(str: any): str is string;

/**
 *
 *
 * 用于包括输入值为可展开的对象
 *
 *
 * 用在emit事件
 *
 * emitter1 = new FastEvent()
 * emitter2 = new FastEvent()
 *
 * emitter1.on("xxx",(message)=>{
 *      return emitter2.emit(message)
 * })
 *
 * emitter2.on("xxx",()=>1)
 * emitter2.on("xxx",()=>2)
 *
 * const results = emitter1.emit("xxx")
 * // results == [[1,2]] 而不 [1,2]，因为emitter2.emit返回的是一个[]
 *
 * expandable的作用就是对emit结果进行包括，当isExpandable时，在emit内部进行展开
 *
 *
 *
 *
 * emitter1.on("xxx",(message)=>{
 *      // 告诉emitter2.emit返回的是一个expandable对象
 *      // 然后在内部就展开此对象
 *      return emitter2.emit(message)
 * })
 *
*  const results = emitter1.emit("xxx")
 * // results ==  [1,2]
 *
 * 为了实现对结果数据的展开处理，在emit内部需要对监听器的执行结果进行依次检查
 * 这多了一个迭代操作，为了不影响性能，可以关闭此特性
 * options.expandEmitResults = false
 *
 *
 */
declare const __expandable__: unique symbol;
declare function expandable(value: any): any;
declare function isExpandable(value: any): any;

/**
 *
 * 判断path是否与pattern匹配
 *
 * isPathMatched("a.b.c","a.b.c")  == true
 * isPathMatched("a.b.c","a.b.*")  == true
 * isPathMatched("a.b.c","a.*.*")  == true
 * isPathMatched("a.b.c","*.*.*")  == true
 * isPathMatched("a.b.c",".b.*")  == true
 * isPathMatched("a.b.c.d","a.**")  == true
 *
 * - '**' 匹配后续的
 * - '*' 匹配任意数量的字符，包括零个字符
 *
 * @param path
 * @param pattern
 */
declare function isPathMatched(path: string[], pattern: string[]): boolean;

declare function isSubsctiber(val: any): val is FastEventSubscriber;

declare function isClass(target: unknown): target is new (...args: any[]) => any;

declare function isFastEvent(target: any): target is FastEvent;

/**
 * 判断是否为可异步迭代对象（AsyncIterable）
 * 即具有 Symbol.asyncIterator 方法的对象
 *
 * @param value - 要检查的值
 * @returns 如果是可异步迭代对象返回 true
 */
declare function isAsyncIterable<T = any>(value: unknown): value is AsyncIterable<T>;

export { AbortError, type Add, type AddAfterListenerHook, type AddBeforeListenerHook, type AfterExecuteListenerHook, type AllowCall, type ApplyWildcardEvents, type AssertFastMessage, type AssertRecord, type AssertString, type AtPayloads, type BeforeExecuteListenerHook, CancelError, type ChangeFieldType, type Class, type ClearListenersHook, type ClosestMatch, type ContainsWildcard, type Decrement, type DeepPartial, type Dict, type Equal, type Expand, type ExpandRecord, type ExpandWildcard, type ExtendWildcardEvents, type Fallback, FastEvent, type FastEventCommonListener, type FastEventCommonMessage, type FastEventEmitMessage, FastEventError, type FastEventHooks, FastEventIterator, type FastEventIteratorOptions, type FastEventListenOptions, type FastEventListener, type FastEventListenerArgs, FastEventListenerFlags, type FastEventListenerMeta, type FastEventListenerNode, type FastEventListeners, type FastEventMessage, type FastEventMessageExtends, type FastEventMeta, type FastEventOptions, FastEventScope, type FastEventScopeMeta, type FastEventScopeOptions, type FastEventSubscriber, type FastEvents, type FastListeners, type FastMessagePayload, type FastQueueOverflows, type FirstObjectItem, type FirstOfUnion, type GetClosestEventName, type GetClosestEventNameTuple, type GetClosestEventPayload, type GetClosestEventTuple, type GetClosestEvents, type GetFixedPartCount, type GetMatchedEventNames, type GetPartCount, type GetPartCountAcc, type GetPayload, type GetWildcardCount, type GetWildcardEventList, type IFastEventScope, type IfNever, type IndexOfMax, type IndexOfMin, type IsAllTransformed, type IsAny, type IsAnyRecord, type IsFullWildcard, type IsMatchEventName, type IsMultiWildcard, type IsNever, type IsSemiWildcard, type IsTransformedEvent, type IsWildcardPart, type Join, type KeyOf, type Keys, type ListenerErrorHook, type Max, type Merge, type MergeStrings, type MergeUnion, type Min, type MutableMessage, type MutableRecord, type NormalEvents, type NotEqual, type NotPayload, type ObjectKeys, type OmitTransformedEvents, type OptionalKeys, type Overloads, type OverrideOptions, type PayloadValues, type PickEqualRecord, type PickInlcudeDelimiterRecord, type PickNotEqualRecord, type PickNotInlcudeDelimiterRecord, type PickPayload, type PickTransformedEvents, type PrefixNumber, type ProcessSegments, QueueOverflowError, type RemoveEmptyObject, type RemoveListenerHook, type ReplaceWildcard, type RequiredItems, type RequiredKeys, type ScopeEvents, type Slice, type Split, type SplitPath, type StrictEqual, TimeoutError, type ToFixedCounts, type ToKeyPrioritys, type ToWildcardMessage, type TransformedEvents, type Tuple, type TypedFastEventAnyListener, type TypedFastEventListener, type TypedFastEventMessage, type TypedFastEventMessageOptional, type UnTransformedEvents, UnboundError, type Union, type UnionToIntersection, type Unique, type ValueOf, type WildcardEvents, type WildcardKeyToObject, type WildcardKeys, type WildcardStyle, __FastEventScope__, __FastEvent__, __expandable__, createAsyncEventIterator, expandable, isAsyncIterable, isClass, type isEmpty, isExpandable, isFastEvent, isFastEventMessage, isFastEventScope, isFunction, isPathMatched, isString, isSubsctiber };
