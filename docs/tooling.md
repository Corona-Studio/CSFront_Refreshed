# 开发工具与规则

使用 Node.js 24、`package.json` 指定的 pnpm，以及提交的 `pnpm-lock.yaml`。CI 和部署使用 `pnpm install --frozen-lockfile`，避免安装时隐式升级。

## TypeScript 7

`typescript` 使用 npm `latest` 稳定版本 7.0.2，类型检查运行原生 `tsc`。`pnpm typecheck` 先执行 `next typegen`，因此全新检出也会生成 Next.js 环境声明和路由类型。Next.js 16.4 默认通过本地 `tsc` CLI 检查生产构建，保持类型错误阻止构建。

项目启用 `strict`、`verbatimModuleSyntax`、副作用导入检查、大小写一致性和 switch fallthrough 检查；类型依赖使用 `import type`。Next.js 自动维护 `plugins: [{ name: "next" }]` 配置；TypeScript 7 尚不加载 JavaScript 语言服务插件，原生 CLI 构建检查不依赖它。编辑器建议使用 TypeScript 7 扩展，并通过工作区设置选择 `node_modules/typescript`。

多语言类型声明引用实际的 `@/i18n` 和 `zhCN` 资源，翻译键参与类型检查；静态键列表保留字面量类型，来自 API 的未知指标提供显式文本回退。

TypeScript 7 不提供旧 JavaScript 编译器 API。样式审计改用 `oxc-parser` 和类型化 Visitor，保留 CSS 引用、缺失类名、全局样式边界、重复声明、级联层顺序和运行时 style 标签检查；其回归测试随 `pnpm test` 执行。

参考：[TypeScript 7 发布说明](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)、[Next.js TypeScript 文档](https://nextjs.org/docs/app/api-reference/config/typescript)。

## Oxlint

规则集中在 `oxlint.config.ts`，使用 Oxlint 原生实现的 ESLint、TypeScript、React、Next.js、无障碍、import、Vitest、Unicorn 和 Oxc 规则，不再安装 ESLint、typescript-eslint 或 ESLint 插件。

- 启用 correctness 类规则，以及 React Hooks 调用顺序和依赖检查。
- 通过 `oxlint-tsgolint` 启用类型感知检查：未处理 Promise、Promise 回调误用、await 非 Promise 和 switch 穷尽性。
- 禁止显式 `any`、`var`、`eval`、调试器；统一严格相等和 `const`，强制独立的类型导入。
- 未使用参数、变量和 catch 错误只有明确使用 `_` 前缀时才允许；对象 rest 解构允许舍弃字段。
- 禁止提交 focused / disabled 测试，未使用的忽略指令和所有 lint 警告都会使检查失败。
- 生成文件、构建产物和审计报告不参与检查，业务代码、测试和工具脚本参与检查。

新增局部忽略时使用 `oxlint-disable-next-line` 并说明必要原因。不要通过全局关闭规则来绕过实际缺陷。

参考：[Oxlint 配置](https://oxc.rs/docs/guide/usage/linter/config)、[类型感知检查](https://oxc.rs/docs/guide/usage/linter/type-aware)。

## Oxfmt

工具名称是 `oxfmt`，配置为 `oxfmt.config.ts`。保持仓库现有的四空格缩进、双引号、分号、120 列、无尾逗号及 LF 换行；统一 import、package.json 和 Tailwind 类名排序，包括 `cn`、`clsx`、`cva` 调用。排序不主动重排有副作用的导入，避免改变初始化或 CSS 级联顺序。`.editorconfig` 与 `.gitattributes` 统一编辑器和 Git 的换行行为。

Oxfmt 不加载原 Prettier 的 CSS 声明和 HTML 属性排序插件，移除这些依赖及其配置。CSS 审计继续独立运行；不通过文本重排改变 CSS 声明的覆盖顺序。生成文件、锁文件、审计报告及 Next.js 自动维护的代理说明文件不参与格式化。

VS Code 推荐安装 Oxc 扩展；仓库提供保存时格式化和显式保存时自动修复的工作区设置。

参考：[Oxfmt 迁移说明](https://oxc.rs/docs/guide/usage/formatter/migrate-from-prettier)、[排序配置](https://oxc.rs/docs/guide/usage/formatter/sorting)。

## 验证命令

```bash
pnpm format          # 写入统一格式
pnpm format:check    # 只检查格式
pnpm typecheck       # Next.js 类型生成 + TypeScript 7
pnpm lint            # 类型感知 Oxlint + CSS 审计
pnpm lint:fix        # 安全自动修复 + CSS 审计
pnpm test            # 单元与回归测试
pnpm build           # 生产构建，包含原生 tsc 检查
pnpm quality         # 按上述顺序执行全部只读检查与构建
```
