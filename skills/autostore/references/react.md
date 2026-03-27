# AutoStore React 集成参考

React 集成库，提供 Hooks 和组件，实现响应式状态管理和表单双向绑定。

## 安装

```bash
npm install @autostorejs/react
```

可选安装调试工具：

```bash
npm install @autostorejs/devtools
```

## 快速开始

### 创建 Store

```typescript
import { createStore } from "@autostorejs/react";

const store = createStore({
  user: { name: "Alice", age: 25 },
  greeting: (scope) => `Hello, ${scope.user.name}`,
});
```

### 在组件中使用

```typescript
import { useReactive } from "@autostorejs/react";

function App() {
  const state = useReactive(store);
  return <h1>{state.greeting}</h1>;
}
```

## Hooks

### useStore()

创建 Store：

```typescript
import { useStore } from "@autostorejs/react";

function App() {
  const store = useStore({
    count: 0,
    double: (scope) => scope.count * 2,
  });

  return <div>{store.state.double}</div>;
}
```

### useReactive()

访问响应式状态：

```typescript
import { useReactive } from "@autostorejs/react";

function Counter() {
  const state = useReactive(store);

  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Double: {state.double}</p>
      <button onClick={() => store.state.count++}>Increment</button>
    </div>
  );
}
```

### useWatch()

监听状态变化：

```typescript
import { useWatch } from "@autostorejs/react";

function Logger() {
  useWatch(store, "count", ({ value, oldValue }) => {
    console.log(`count changed from ${oldValue} to ${value}`);
  });

  return null;
}
```

### useForm()

表单双向绑定：

```typescript
import { useForm } from "@autostorejs/react";

function LoginForm() {
  const { state, Form, Field } = useForm({
    email: "",
    password: "",
  });

  const handleSubmit = () => {
    console.log(state); // { email: '', password: '' }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field name="email" type="email" />
      <Field name="password" type="password" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

### useField()

单字段绑定：

```typescript
import { useField } from "@autostorejs/react";

function EmailInput() {
  const { value, onChange } = useField(store, "user.email");

  return (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

### useFields()

多字段绑定：

```typescript
import { useFields } from "@autostorejs/react";

function UserProfile() {
  const fields = useFields(store, ["user.name", "user.email"]);

  return (
    <form>
      <input {...fields["user.name"]} />
      <input {...fields["user.email"]} type="email" />
    </form>
  );
}
```

## 组件

### Signal

信号组件，实现细粒度更新：

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

**快捷语法**：

```typescript
function UserCard() {
  return (
    <div>
      {/* 使用 $ 快捷方式 */}
      <$('user.name')>{() => <span>{store.state.user.name}</span>}</$>
      <$('user.age')>{() => <span>{store.state.user.age}</span>}</$>
    </div>
  );
}
```

**优点**：

- 细粒度更新，只重新渲染变化的部分
- 避免 React.memo 的心智负担
- 性能优化更简单

### Field

表单字段组件：

```typescript
import { Field } from "@autostorejs/react";

function MyForm() {
  const { Form } = useForm({
    username: "",
    email: "",
  });

  return (
    <Form>
      <Field name="username" placeholder="Username" />
      <Field name="email" type="email" placeholder="Email" />
    </Form>
  );
}
```

**自定义 Field**：

```typescript
<Field
  name="username"
  render={({ value, onChange, error }) => (
    <div>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <span className="error">{error}</span>}
    </div>
  )}
/>
```

## 表单验证

### HTML5 标准验证

使用标准 HTML5 验证属性：

```typescript
const { Form, Field } = useForm({
  email: '',
  password: ''
});

return (
  <Form>
    <Field
      name="email"
      type="email"
      required
      minLength={3}
      pattern={/\S+@\S+\.\S+/}
    />
    <Field
      name="password"
      type="password"
      required
      minLength={6}
    />
  </Form>
);
```

**验证样式**：

```css
/* 验证失败时的样式 */
input:invalid {
  border-color: red;
}

form:invalid {
  border: 1px solid red;
}
```

### 自定义验证函数

```typescript
const { state, Form, Field } = useForm(
  {
    email: '',
    password: '',
  },
  {
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
      },
    },
  }
);
```

**验证函数签名**：

```typescript
type ValidateFunction = (
  value: any,           // 字段值
  oldValue: any,        // 旧值
  path: string[]        // 字段路径
) => boolean | string;  // true/成功, string/错误信息
```

### 异步验证

```typescript
const { state, Form, Field } = useForm(
  {
    username: '',
  },
  {
    validate: {
      username: async (value) => {
        const exists = await checkUsernameExists(value);
        if (exists) return 'Username already exists';
      },
    },
  }
);
```

### 自定义验证显示

使用 `data-validate-field` 指定错误信息容器：

```typescript
const { Form } = useForm({
  email: '',
  password: ''
});

return (
  <Form customReport={true}>
    <div data-field-name="email">
      <label>Email</label>
      <input name="email" type="email" required />
      <span data-validate-field="email" />
    </div>
    <div data-field-name="password">
      <label>Password</label>
      <input name="password" type="password" required minLength={6} />
      <span data-validate-field="password" />
    </div>
  </Form>
);
```

**说明**：
- `customReport=true` 启用自定义验证显示
- `data-field-name` 指定字段名
- `data-validate-field` 指定错误信息显示位置

### 验证样式类

验证失败时自动添加 `invalid` 类：

```css
/* 字段容器 */
[data-field-name].invalid {
  border: 1px solid red;
}

/* 输入元素 */
input.invalid {
  border-color: red;
  background-color: #fff0f0;
}

/* 错误信息 */
[data-validate-field]::before {
  content: attr(data-error);
  color: red;
}
```

### 表单状态

```typescript
const { state, dirty, valid, errors, touched } = useForm({...});

// dirty: 表单是否被修改
// valid: 表单是否有效
// errors: 错误信息对象
// touched: 字段是否被触碰
```

## 计算属性

### 同步计算

```typescript
const store = createStore({
  price: 100,
  count: 2,
  total: (scope) => scope.price * scope.count,
});
```

### 异步计算

```typescript
import { computed } from "@autostorejs/react";

const store = createStore({
  userId: 1,
  user: computed(
    async (scope) => {
      const res = await fetch(`/api/user/${scope.userId}`);
      return res.json();
    },
    ["userId"],
    { async: true, initial: null }
  ),
});

function UserProfile() {
  const state = useReactive(store);

  if (state.user.loading) return <div>Loading...</div>;
  if (state.user.error) return <div>Error: {state.user.error.message}</div>;

  return <div>{state.user.value.name}</div>;
}
```

## 调试

### Redux DevTools

```typescript
import '@autostorejs/devtools';

const store = createStore({...}, {
  debug: true,
  id: 'my-store'
});
```

## 最佳实践

### 1. 组件拆分

使用 Signal 组件实现细粒度更新：

```typescript
function UserCard() {
  return (
    <div className="card">
      <Signal $="user.name">{() => <Name />}</Signal>
      <Signal $="user.email">{() => <Email />}</Signal>
    </div>
  );
}

function Name() {
  return <span>{store.state.user.name}</span>;
}

function Email() {
  return <span>{store.state.user.email}</span>;
}
```

### 2. 表单组织

```typescript
function RegistrationForm() {
  const { state, Form, Field } = useForm({
    profile: {
      name: "",
      email: "",
    },
    password: "",
  });

  return (
    <Form>
      <Field name="profile.name" label="Name" />
      <Field name="profile.email" type="email" label="Email" />
      <Field name="password" type="password" label="Password" />
    </Form>
  );
}
```

### 3. 计算属性优先

```typescript
// ✅ 推荐
const store = createStore({
  items: [],
  total: (scope) => scope.items.reduce((sum, item) => sum + item.price, 0)
});

// ❌ 不推荐
function Cart() {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(store.state.items.reduce(...));
  }, [store.state.items]);
}
```

## 类型安全

完整 TypeScript 支持：

```typescript
interface UserStore {
  user: {
    name: string;
    age: number;
  };
  adult: (scope: UserStore) => boolean;
}

const store = createStore<UserStore>({
  user: { name: "Alice", age: 25 },
  adult: (scope) => scope.user.age >= 18,
});

// 完整类型推断
store.state.user.name; // string
```

## API 参考

### Hooks

| Hook            | 说明           |
| --------------- | -------------- |
| `useStore()`    | 创建 Store     |
| `useReactive()` | 访问响应式状态 |
| `useWatch()`    | 监听状态变化   |
| `useForm()`     | 表单双向绑定   |
| `useField()`    | 单字段绑定     |
| `useFields()`   | 多字段绑定     |

### 组件

| 组件       | 说明     |
| ---------- | -------- |
| `<Signal>` | 信号组件 |
| `<Field>`  | 表单字段 |
| `<Form>`   | 表单容器 |

## 参考资源

- **源代码**：
  - React: `https://github.com/zhangfisher/autostore/tree/master/packages/react`
- **官方文档**：`https://zhangfisher.github.io/autostore/`
