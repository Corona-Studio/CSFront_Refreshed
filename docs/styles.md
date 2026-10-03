# 样式架构与维护约定

## 本次审计

原有 23 个 CSS 文件混用了全局 CSS、CSS Modules、Tailwind 和组件动态 `<style>`。问题主要在于样式归属和覆盖关系，而不是必须替换现有技术栈：

- 443 行 `globals.css` 同时包含主题、基础规则、营销布局、认证布局、控制台和数据表格。
- `Home.module.css` 的旧首页规则没有任何引用，已经与当前首页实现脱节。
- Fallback、GradientText、InfiniteScroll 使用全局类名；InfiniteScroll 与 MagicBento 将实例参数写入全局 `<style>`，多个实例会相互覆盖。
- 用户、赞助者、构建管理页面重复了共享管理表格规则。
- AuthFormLayout 与构建开关存在多余 `!important`；首页通过强制工具类覆盖共享布局的后代选择器。
- Board 与仪表盘图表存在指向未定义模块类名的引用。
- Prettier 自动重排导入可能改变 Next.js 生产 CSS 顺序。

## 目录和职责

| 位置                                   | 职责                                                                  |
| -------------------------------------- | --------------------------------------------------------------------- |
| `src/app/globals.css`                  | 唯一全局入口；按顺序加载 Tailwind、主题、基础、共享规则，定义深色变体 |
| `src/styles/theme.css`                 | 浅色/深色语义变量、字体和 Tailwind `@theme inline` 映射               |
| `src/styles/base.css`                  | 全站元素默认值、焦点、选择态、减少动画偏好                            |
| `src/styles/shared.css`                | 多页面复用的 `m-container`、`m-section`、`m-grid` 等公共布局与排版    |
| `src/components/ui`                    | Tailwind + CVA 的基础组件及变体                                       |
| `src/components/marathon/*.module.css` | 控制台、数据表格等产品组件拥有的布局                                  |
| `src/app/auth/layout.module.css`       | 认证路由布局                                                          |
| `src/features/*.module.css`            | 页面专属布局、复杂交互、响应式规则                                    |
| `src/ReactBits/**/*.module.css`        | 动画组件隔离样式；JS 动画选择器也必须使用模块导出的类名               |

## 如何选择样式方式

1. 简单布局、间距和已有语义颜色使用 Tailwind，类名通过 `cn` 合并；公共组件的变化优先通过已有变体表达。
2. 复杂选择器、伪元素、关键帧、多个响应式状态使用与组件同目录的 CSS Module。
3. 全局规则只进入上表中的四个全局文件。组件不得直接导入普通 `.css`，不得生成运行时 `<style>`。
4. 静态样式不要散落在 `style` 中；尺寸、裁切坐标、图表高度、用户图片、动画数值等运行时参数可以使用 `style`。伪元素所需参数通过组件根节点的 CSS 自定义属性传入，例如 Bento 的 `--glow-color`。
5. 共用主题使用 `var(--card)`、`var(--foreground)`、`var(--primary-ink)` 等语义变量或对应 Tailwind 工具类。ASCII 场景和第三方动画的固定艺术配色可以保留在局部组件中；不要把这些颜色提升成全站主题。
6. 模块类名必须从模块对象读取，不能在生成的类名后拼接后缀。新增代码采用有语义的 camelCase；本次迁移的第三方类名保留原有拼写以减少动画钩子的变动。

## 级联与覆盖

Tailwind 的顺序是 `theme → base → components → utilities`。全局入口以及使用 `components` 层的独立模块均显式声明完整层顺序，避免 Next.js 先加载路由 CSS 时使基础重置规则反过来覆盖组件留白。公共布局及 Marathon 布局默认放在 `@layer components` 中，使工具类能够覆盖默认值；这些布局的媒体查询也要留在该层中。

已有 feature 模块中用于定制基础组件的规则保持局部、未分层，其优先级高于 Tailwind 工具类。修改这类规则前应检查具体使用者，避免直接给所有 CSS Modules 套同一个层而改变现有组件外观。使用低复杂度的局部选择器，不堆叠深层 DOM 路径。

管理表格的公共外观由 `AdminTable.module.css` 提供。页面只保留独有尺寸和内容布局。构建列表通过 `--admin-table-row-height: 62px` 调整行高；其他页面默认 58px，避免依赖两个样式文件谁最后加载。

需要穿透子组件时使用局部根类 + 稳定 `data-slot`，例如 `.table :global([data-slot="pagination"])`。不要依赖生成后的模块类名或跨模块全局类。原 `.m-pagination` 已迁移为 DataTable 局部类及 `data-slot="pagination"`。

普通组件规则不使用 `!important`。全局减少动画偏好保留强制规则，以压过局部 CSS 和工具类动画；JS 驱动的动画仍需要组件自己处理减少动画偏好。不要简单删除这些无障碍规则。

全局样式只在根 layout 中导入。Prettier 已关闭导入排序，避免格式化改变 CSS 的加载顺序。CSS 声明的格式化仍使用现有插件。

## 检查与验证

- `pnpm lint:styles`：解析所有源 CSS；检查文件引用、组件全局 CSS、静态 CSS Module 类名、重复声明、非基础文件的 `!important` 和组件 `<style>`。
- `pnpm lint`：同时执行 ESLint 和样式检查，`pnpm quality` 也自动包含这些规则。
- `pnpm quality`：样式检查、现有单元测试、TypeScript、生产构建。
- InfiniteScroll 新增多实例回归测试，检查不同实例的宽度、高度和间距不会互相覆盖。

检查器是针对当前架构的轻量约束，不能替代浏览器视觉验证：动态类名、Tailwind 字符串中的强制修饰符、所有 CSS 属性语义和视觉差异不在它的完整校验范围内。涉及布局或主题变动时，应在生产构建中检查首页、登录/注册、设计系统以及桌面/手机宽度；认证后的后台流程仍需要测试账号和后端。

## 参考

本次遵循仓库安装的 Next.js 16.3.8 样式指南，并对照官方文档：

- [Next.js CSS：全局范围、CSS Modules 与导入顺序](https://nextjs.org/docs/app/getting-started/css)
- [Tailwind CSS 主题变量](https://tailwindcss.com/docs/theme)

## 本次生产页面验证

已检查实际生产 CSS，而不仅是开发构建：

| 场景                                      | 结果                                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| 首页，1440px                              | 左右容器边距 40px，区块上下留白 88px，卡片内边距 28px，标题与正文显示正常，无页面横向溢出 |
| 首页，390px                               | 左右容器边距 16px，区块上下留白 48px，公共网格为单列，无页面横向溢出                      |
| 登录，390/768/1024/1440px                 | 表单跟随卡片可用空间收缩，输入框和按钮边界均在卡片内，无页面横向溢出                      |
| 注册、忘记密码、重置密码、设计系统，390px | 表单宽度随容器收缩，无页面横向溢出                                                        |

认证布局在 900px 及以下采用单栏；所有认证表单移除按视口断点强制的 300/400/450px 宽度。保持登录选项和操作组允许换行。未执行真实登录、验证码提交或认证后的后台端到端操作。
