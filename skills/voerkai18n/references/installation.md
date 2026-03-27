# VoerkaI18n 安装配置详解

## @voerkai18n/cli 全局安装

VoerkaI18n 的核心是 `@voerkai18n/cli` 命令行工具，**必须全局安装**。

### 安装方式

```bash
# npm
npm install -g @voerkai18n/cli

# yarn
yarn global add @voerkai18n/cli

# pnpm
pnpm add -g @voerkai18n/cli
```

### 验证安装

```bash
voerkai18n --help
```

输出：

```
Voerkai18n       Version: 3.0.6

Usage: voerkai18n [options] [command]

Commands:
  init|config    初始化VoerkaI18n配置
  extract        提取要翻译的文本
  compile        编译语言包
  translate      执行自动翻译
  wrap           扫描源代码并自动包裹t翻译函数
  inspect        检查VoerkaI18n配置
  apply          配置vue/react/nextjs/svelte等支持
```

## 可选包安装

根据项目类型选择性安装以下包：

### 核心包

| 包名 | 说明 | 是否必需 |
|------|------|---------|
| `@voerkai18n/runtime` | 核心运行时 | ✅ 必需 |
| `@voerkai18n/formatters` | 格式化器插件（日期、货币等） | 可选 |
| `@voerkai18n/patch` | 在线语言补丁编辑功能 | 可选 |

### 构建工具插件

| 包名 | 说明 | 构建工具 |
|------|------|---------|
| `@voerkai18n/plugins` | 基于 unplugin 的通用插件 | Vite/Webpack/Rollup |
| `@voerkai18n/babel` | Babel 插件 | Babel |
| `@voerkai18n/webpack` | Webpack loader | Webpack |

### 框架适配器

| 包名 | 说明 | 框架 |
|------|------|------|
| `@voerkai18n/vue` | Vue 3 支持 | Vue 3 |
| `@voerkai18n/vue2` | Vue 2 支持 | Vue 2 |
| `@voerkai18n/react` | React 支持 | React |
| `@voerkai18n/nextjs` | Next.js 支持 | Next.js |
| `@voerkai18n/svelte` | Svelte 支持 | Svelte |
| `@voerkai18n/lit` | Lit/Web Components 支持 | Lit |
| `@voerkai18n/solid` | Solid 支持 | Solid |

## CLI 命令详解

### 1. init - 初始化项目

```bash
voerkai18n init [options]
```

**选项：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-d, --language-dir [path]` | 语言目录路径 | `src/languages` |
| `--library` | 是否为库工程 | `false` |
| `-l, --languages <tags...>` | 选择支持的语言 | 交互式选择 |
| `--defaultLanguage <tag>` | 默认语言 | 首个选择语言 |
| `--activeLanguage <tag>` | 激活语言 | 默认语言 |
| `-t, --typescript` | 启用 TypeScript | `true` |

**交互式示例：**

```bash
$ voerkai18n init

? 选择要支持的语言 (按空格选择，回车确认)
  ◯ zh-CN (简体中文)
  ◯ en-US (英语)
  ◯ ja-JP (日语)
  ◯ de-DE (德语)

? 默认语言: zh-CN
? 当前激活语言: zh-CN
? 是否启用 TypeScript: Yes

✓ 初始化完成
✓ 创建语言工作目录: src/languages
```

**生成的目录结构：**

```
src/languages/
├── api.json              # 翻译 API 配置
├── component.ts          # 翻译组件
├── index.ts              # 入口文件
├── messages/             # 编译后的语言包
├── paragraphs/           # 编译后的段落
├── prompts/              # AI 翻译提示词
├── settings.json         # 配置文件
├── storage.ts            # 语言存储
├── loader.ts             # 语言包加载器
├── transform.ts          # 翻译变换
├── formatters.json       # 格式化器配置
└── translates/           # 待翻译内容
    ├── messages/         # 提取的文本
    └── paragraphs/       # 提取的段落
```

### 2. apply - 启用框架支持

```bash
voerkai18n apply [options]
```

**选项：**

| 参数 | 说明 |
|------|------|
| `-f, --framework <name>` | 指定框架 (vue/vue2/react/nextjs/svelte/lit) |

**交互式示例：**

```bash
$ voerkai18n apply

? 选择框架:
  vue3
  vue2
  react
  nextjs
  svelte
  lit
```

**自动执行的操作：**

1. 安装对应的框架适配器包
2. 更新 `languages/component.ts`
3. 更新 `languages/transform.ts`
4. 更新构建配置文件（如 `vite.config.ts`）

### 3. extract - 提取翻译文本

```bash
voerkai18n extract [options]
```

**选项：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-m, --mode <value>` | 更新模式：sync/overwrite/merge | `sync` |
| `-p, --patterns <patterns...>` | 文件匹配规则 | 默认规则 |

**模式说明：**

| 模式 | 说明 | 推荐场景 |
|------|------|---------|
| `sync` | 同步，自动合并，删除源码中不存在的文本 | ✅ 推荐，日常使用 |
| `overwrite` | 覆盖现有翻译 | ⚠️ 慎用，会丢失已翻译内容 |
| `merge` | 合并，不删除源码中不存在的文本 | 保留历史翻译 |

**文件匹配规则：**

默认排除以下目录：
- `coverage`, `dist`, `node_modules`
- `**/*.test.*`, `**/*.spec.*`
- `**/*.d.ts`, `*.config.{js,ts}`
- `.git`, `.vscode`, `.turbo`

**示例：**

```bash
# 默认提取
voerkai18n extract

# 排除特定目录
voerkai18n extract -p "!src/libs/**"

# 指定文件类型
voerkai18n extract -p "src/**/*.{js,ts,tsx}"
```

### 4. translate - AI 自动翻译

```bash
voerkai18n translate [options]
```

**选项：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-m, --mode <value>` | 翻译模式：auto/full | `auto` |
| `-l, --language <name>` | 只翻译指定语言 | 所有语言 |
| `-f, --file <name>` | 只翻译指定文件 | 所有文件 |
| `-p, --provider <value>` | 翻译服务：ai/baidu | `ai` |
| `--api <name>` | API 服务名称（在 api.json 中声明） | - |
| `--api-key <key>` | API 密钥 | - |
| `--api-url <url>` | API 地址 | - |
| `--api-model <name>` | AI 模型名称 | - |
| `--max-package-size <value>` | 单次请求最大字节数 | `150` |
| `-q, --qps <value>` | QPS 限制 | `0` |

**API 配置文件 (`languages/api.json`)：**

```json
{
  "baidu": {
    "id": "<百度翻译 appid>",
    "key": "<百度翻译 appkey>"
  },
  "openai": {
    "key": "<OpenAI API Key>",
    "url": "https://api.openai.com/v1/chat/completions",
    "model": "gpt-4"
  },
  "qwen": {
    "key": "<阿里通义千问 API Key>",
    "url": "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    "model": "qwen-max-latest"
  }
}
```

**⚠️ 安全提示：**

将 `languages/api.json` 添加到 `.gitignore`：

```bash
echo "languages/api.json" >> .gitignore
```

**翻译示例：**

```bash
# 使用 AI 翻译（需在 api.json 配置）
voerkai18n translate --api qwen

# 使用百度翻译
voerkai18n translate --provider baidu

# 只翻译英语
voerkai18n translate -l en-US

# 完全重新翻译
voerkai18n translate --mode full
```

### 5. compile - 编译语言包

```bash
voerkai18n compile [options]
```

**选项：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-t, --typescript` | 启用 TypeScript | `true` |
| `-m, --module-type <values...>` | 模块类型：cjs/esm | `esm` |

**输出：**

编译后会在 `languages/` 目录生成：

```
languages/
├── messages/
│   ├── zh-CN.ts           # 简体中文语言包
│   ├── en-US.ts           # 英语语言包
│   ├── ja-JP.ts           # 日语语言包
│   └── idMap.json         # 文本 ID 映射表
└── paragraphs/
    ├── zh-CN/
    │   └── paragraph1.html
    └── en-US/
        └── paragraph1.html
```

### 6. wrap - 自动包裹翻译函数

```bash
voerkai18n wrap [options]
```

**选项：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-p, --patterns <patterns...>` | 扫描匹配规则 | `./src/**/*.{js,ts,tsx,jsx}` |
| `--apply` | 应用修改到源文件 | `false` (预览模式) |
| `--prompt [value]` | 提示词模板名称 | `wrap` |
| `--api <name>` | AI 服务名称 | - |

**示例：**

```bash
# 预览模式（不修改文件）
voerkai18n wrap

# 应用修改
voerkai18n wrap --apply
```

### 7. inspect - 检查配置

```bash
voerkai18n inspect
```

显示当前项目配置信息。

## settings.json 配置

初始化后生成的 `languages/settings.json` 配置文件：

```json
{
  "languages": [
    {
      "name": "zh-CN",
      "title": "简体中文",
      "default": true
    },
    {
      "name": "en-US",
      "title": "English"
    }
  ],
  "defaultLanguage": "zh-CN",
  "activeLanguage": "zh-CN",
  "namespaces": false,
  "autoImport": false,
  "storage": "localStorage",
  "injectLangAttr": true,
  "debug": false
}
```

**配置项说明：**

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `languages` | 支持的语言列表 | - |
| `defaultLanguage` | 默认语言 | 首个语言 |
| `activeLanguage` | 当前激活语言 | 默认语言 |
| `namespaces` | 是否启用命名空间 | `false` |
| `autoImport` | 是否自动导入 t 函数 | `false` |
| `storage` | 语言存储方式 | `localStorage` |
| `injectLangAttr` | 是否注入 lang 属性 | `true` |
| `debug` | 调试模式 | `false` |

## 常见问题

### Q1: CLI 命令无法找到？

```bash
# 检查全局安装路径
npm config get prefix

# 添加到 PATH
export PATH=$PATH:$(npm config get prefix)/bin
```

### Q2: extract 提取不到文本？

检查：
1. 文件是否在 `src/` 目录下
2. 文件是否被默认规则排除（如 `*.test.*`）
3. 使用 `-p` 参数自定义匹配规则

### Q3: translate 翻译失败？

检查：
1. `languages/api.json` 配置是否正确
2. API Key 是否有效
3. 网络是否正常
4. 使用 `--provider` 指定正确的翻译服务

### Q4: 编译后类型错误？

```bash
# 重新编译
voerkai18n compile --typescript

# 重启 TypeScript 服务器
# VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## 最佳实践

1. **全局安装 CLI** - 确保所有项目使用统一版本
2. **使用 sync 模式** - extract 命令默认模式最安全
3. **保护 API 密钥** - api.json 加入 .gitignore
4. **AI 翻译优先** - 推荐使用阿里通义千问等 AI 翻译
5. **定期 compile** - 每次修改翻译后重新编译
6. **版本管理** - 使用 package.json 统一管理版本
