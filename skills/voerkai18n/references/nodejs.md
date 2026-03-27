# Node.js 应用指南

VoerkaI18n 可以在 Node.js 后端应用中使用，无需任何框架适配器。

## 安装依赖

```bash
# 安装 CLI 工具（全局）
npm install -g @voerkai18n/cli

# 初始化项目
voerkai18n init
```

手动安装运行时：

```bash
npm install @voerkai18n/runtime
```

## 配置

Node.js 应用使用 `@voerkai18n/runtime` 核心包，无需额外配置框架适配器。

### 基本配置

初始化后会生成 `src/languages/` 目录：

```
languages/
├── index.js              # 入口文件
├── messages/             # 编译后的语言包
│   ├── zh-CN.js
│   └── en-US.js
├── settings.json         # 配置文件
└── translates/           # 待翻译内容
    └── messages/
        └── default.json
```

## 使用方式

### 基本用法

```javascript
// src/index.js
const { t, i18nScope } = require('./languages')

// 简单翻译
console.log(t('欢迎使用 VoerkaI18n'))

// 带插值变量
console.log(t('欢迎，{name}！', { name: '张三' }))

// 位置占位符
console.log(t('出生于{0}年', [1990]))

// 切换语言
await i18nScope.change('en-US')
console.log(t('欢迎使用 VoerkaI18n'))  // English output
```

### Express.js 集成

```javascript
// src/app.js
const express = require('express')
const { i18nScope, t } = require('./languages')

const app = express()

// 中间件：自动检测请求头中的语言
app.use((req, res, next) => {
  const acceptLanguage = req.headers['accept-language']
  // 简单的语言检测逻辑
  const language = acceptLanguage?.startsWith('en') ? 'en-US' : 'zh-CN'
  await i18nScope.change(language)
  next()
})

// 路由
app.get('/', (req, res) => {
  res.send({
    message: t('欢迎使用 VoerkaI18n'),
    currentLanguage: i18nScope.activeLanguage
  })
})

app.get('/api/user', (req, res) => {
  res.send({
    message: t('用户信息'),
    data: {
      name: '张三',
      welcome: t('欢迎，{name}！', { name: '张三' })
    }
  })
})

// 语言切换接口
app.post('/api/language', async (req, res) => {
  const { language } = req.body
  await i18nScope.change(language)
  res.send({
    message: t('语言已切换'),
    currentLanguage: i18nScope.activeLanguage
  })
})

app.listen(3000, () => {
  console.log(t('服务器已启动，端口：3000'))
})
```

### Koa.js 集成

```javascript
// src/app.js
const Koa = require('koa')
const Router = require('@koa/router')
const { i18nScope, t } = require('./languages')

const app = new Koa()
const router = new Router()

// 中间件
app.use(async (ctx, next) => {
  const acceptLanguage = ctx.headers['accept-language']
  const language = acceptLanguage?.startsWith('en') ? 'en-US' : 'zh-CN'
  await i18nScope.change(language)

  // 将 t 函数和 i18nScope 挂载到 ctx
  ctx.t = t
  ctx.i18nScope = i18nScope

  await next()
})

// 路由
router.get('/', async (ctx) => {
  ctx.body = {
    message: ctx.t('欢迎使用 VoerkaI18n'),
    currentLanguage: ctx.i18nScope.activeLanguage
  }
})

router.post('/api/language', async (ctx) => {
  const { language } = ctx.request.body
  await ctx.i18nScope.change(language)
  ctx.body = {
    message: ctx.t('语言已切换'),
    currentLanguage: ctx.i18nScope.activeLanguage
  }
})

app.use(router.routes())
app.listen(3000, () => {
  console.log(t('服务器已启动，端口：3000'))
})
```

### Fastify 集成

```javascript
// src/app.js
const Fastify = require('fastify')
const { i18nScope, t } = require('./languages')

const fastify = Fastify({ logger: true })

// 插件
fastify.addHook('onRequest', async (request, reply) => {
  const acceptLanguage = request.headers['accept-language']
  const language = acceptLanguage?.startsWith('en') ? 'en-US' : 'zh-CN'
  await i18nScope.change(language)
})

// 路由
fastify.get('/', async (request, reply) => {
  return {
    message: t('欢迎使用 VoerkaI18n'),
    currentLanguage: i18nScope.activeLanguage
  }
})

fastify.post('/api/language', async (request, reply) => {
  const { language } = request.body
  await i18nScope.change(language)
  return {
    message: t('语言已切换'),
    currentLanguage: i18nScope.activeLanguage
  }
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err
  console.log(t('服务器已启动，端口：3000'))
})
```

### NestJS 集成

```typescript
// src/i18n/i18n.module.ts
import { Module, Global } from '@nestjs/common'
import { I18nService } from './i18n.service'

@Global()
@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}

// src/i18n/i18n.service.ts
import { Injectable } from '@nestjs/common'
import { i18nScope, t } from '../languages'

@Injectable()
export class I18nService {
  async changeLanguage(language: string) {
    await i18nScope.change(language)
  }

  translate(message: string, vars?: object) {
    return t(message, vars)
  }

  get activeLanguage() {
    return i18nScope.activeLanguage
  }

  get languages() {
    return i18nScope.languages
  }
}

// src/app.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common'
import { I18nService } from './i18n/i18n.service'

@Controller()
export class AppController {
  constructor(private readonly i18nService: I18nService) {}

  @Get()
  getIndex() {
    return {
      message: this.i18nService.translate('欢迎使用 VoerkaI18n'),
      currentLanguage: this.i18nService.activeLanguage
    }
  }

  @Post('language')
  async setLanguage(@Body() body: { language: string }) {
    await this.i18nService.changeLanguage(body.language)
    return {
      message: this.i18nService.translate('语言已切换'),
      currentLanguage: this.i18nService.activeLanguage
    }
  }
}
```

## CLI 脚本

```javascript
#!/usr/bin/env node
// src/cli.js
const { program } = require('commander')
const { t, i18nScope } = require('./languages')

program
  .command('hello')
  .description('打印欢迎消息')
  .option('-n, --name <name>', '名称')
  .action((options) => {
    const message = options.name
      ? t('欢迎，{name}！', { name: options.name })
      : t('欢迎使用 VoerkaI18n')
    console.log(message)
  })

program
  .command('language')
  .description('切换语言')
  .argument('<lang>', '语言代码')
  .action(async (lang) => {
    await i18nScope.change(lang)
    console.log(t('语言已切换为：{lang}', { lang }))
  })

program.parse()
```

使用：

```bash
node src/cli.js hello
node src/cli.js hello -n 张三
node src/cli.js language en-US
```

## 定时任务

```javascript
// src/jobs/cron.js
const cron = require('node-cron')
const { t } = require('../languages')

// 每天早上 8 点发送提醒
cron.schedule('0 8 * * *', async () => {
  const message = t('早上好，新的一天开始了！')
  console.log(message)
  // 发送邮件、短信等
})

// 每周一发送周报
cron.schedule('0 9 * * 1', async () => {
  const message = t('请查看本周工作总结')
  console.log(message)
})
```

## WebSocket 应用

```javascript
// src/websocket.js
const WebSocket = require('ws')
const { t, i18nScope } = require('./languages')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    message: t('欢迎连接到服务器')
  }))

  // 处理客户端消息
  ws.on('message', async (data) => {
    const { type, payload } = JSON.parse(data)

    switch (type) {
      case 'changeLanguage':
        await i18nScope.change(payload.language)
        ws.send(JSON.stringify({
          type: 'languageChanged',
          language: i18nScope.activeLanguage,
          message: t('语言已切换')
        }))
        break

      case 'getMessage':
        ws.send(JSON.stringify({
          type: 'message',
          message: t('这是一条测试消息')
        }))
        break
    }
  })
})

console.log(t('WebSocket 服务器已启动，端口：8080'))
```

## 多语言日志

```javascript
// src/logger.js
const { t } = require('./languages')

function log(level, message, vars) {
  const timestamp = new Date().toISOString()
  const translatedMessage = t(message, vars)
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${translatedMessage}`)
}

module.exports = {
  info: (message, vars) => log('info', message, vars),
  warn: (message, vars) => log('warn', message, vars),
  error: (message, vars) => log('error', message, vars),
}

// 使用
const logger = require('./logger')
logger.info('服务器已启动')
logger.warn('内存使用率过高：{percent}%', { percent: 85 })
logger.error('数据库连接失败')
```

## 多语言邮件

```javascript
// src/mail.js
const nodemailer = require('nodemailer')
const { t } = require('./languages')

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
})

async function sendWelcomeEmail(email, name, language) {
  await i18nScope.change(language)

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: t('欢迎注册'),
    text: t('亲爱的{name}，欢迎注册我们的服务！', { name }),
    html: `
      <h1>${t('欢迎注册')}</h1>
      <p>${t('亲爱的{name}，欢迎注册我们的服务！', { name })}</p>
    `
  }

  await transporter.sendMail(mailOptions)
}

// 使用
sendWelcomeEmail('user@example.com', '张三', 'zh-CN')
```

## 数据库多语言

```javascript
// src/models/user.js
const { t } = require('../languages')

class User {
  static async getRoleName(role) {
    return t(`角色_${role}`)
  }

  static async getStatusText(status) {
    return t(`状态_${status}`)
  }
}

// 使用
const adminRole = await User.getRoleName('admin')  // "管理员"
const activeStatus = await User.getStatusText('active')  // "激活"
```

## 常见问题

### Q1: 如何根据用户偏好设置语言？

```javascript
app.use((req, res, next) => {
  // 1. 从查询参数
  const queryLang = req.query.lang

  // 2. 从 Cookie
  const cookieLang = req.cookies?.language

  // 3. 从请求头
  const headerLang = req.headers['accept-language']

  // 4. 从用户 Session
  const sessionLang = req.session?.language

  const language = queryLang || cookieLang || sessionLang || headerLang || 'zh-CN'
  await i18nScope.change(language)

  next()
})
```

### Q2: 如何处理多语言错误消息？

```javascript
// src/errors/AppError.js
class AppError extends Error {
  constructor(message, vars = {}, statusCode = 500) {
    super(t(message, vars))
    this.statusCode = statusCode
    this.messageKey = message  // 保存原始 key
  }
}

// 使用
throw new AppError('用户未找到', { id: userId }, 404)
```

### Q3: 如何在微服务架构中使用？

```javascript
// 方式一：每个服务独立管理语言包
// src/languages/index.js（在每个服务中）

// 方式二：集中管理语言包
// 从远程服务加载语言包
const loader = async (language, scope) => {
  const response = await fetch(`http://i18n-service/languages/${scope.id}/${language}.json`)
  return await response.json()
}
```

## 最佳实践

1. **中间件优先** - 使用中间件统一处理语言检测
2. **异步初始化** - 使用 `i18nScope.ready()` 确保初始化完成
3. **错误处理** - 为翻译函数提供默认值
4. **性能优化** - 缓存常用翻译结果
5. **测试覆盖** - 为多语言场景编写测试
