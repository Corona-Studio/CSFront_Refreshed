# Motion 与 Marathon 视觉细节

使用仓库已有的 `motion`，不重复增加动画依赖。全站配置位于 `src/components/motion/provider.tsx`：`MotionConfig` 统一缓动与减少动画偏好，`LazyMotion` 异步加载 `domAnimation`，交互展示组件从 `motion/react-m` 引入轻量元素。

## 页面与滚动

- `PageEntrance` 仅在路由路径变化时淡入正文，不重新挂载表单，不等待旧页面退出，也不改变 Next.js 的滚动和焦点管理。仅改变透明度，不创建影响 sticky/fixed 布局的 transform 容器。
- `ScrollReveal` 使用 `motion/mini` 的原生动画和 Motion `scroll()`。元素顶部从视口约 96% 移到 60% 时，透明度从 0.12 到 1、纵向位移从 32px 到 0；手机位移为 18px。`index` 在空间上轻微错开进度，`zoom` 为产品截图增加 0.97 到 1 的缩放。
- 这是与滚动位置直接绑定的渐入，向上滚回入场区时会反向变化。保持浏览器原生滚动，不增加平滑滚动容器、不劫持滚轮、不额外拉长页面。
- 服务器和未 hydration 时内容正常显示；首屏、恢复的滚动位置和加载时已位于视口内的元素不隐藏。键盘焦点进入元素时立即取消动画，让焦点内容完整可见。
- `asChild` 复用原来的 article、figure、li、Link 等 DOM 节点，保持网格直接子元素、HTML 语义、锚点和布局不变。子节点的 key 应稳定，列表 key 放在 `ScrollReveal` 上。
- 首页、LauncherX、CMFS 的标题、卡片、图片与时间线已接入；LauncherX 的故事文案只在桌面端粘性定位。功能性控制台以快速路由淡入与控件反馈为主。
- `useMotionAllowed` 通过 `useSyncExternalStore` 监听系统偏好，运行期间开启减少动态效果也会停止并清理原生动画。卸载时清理滚动订阅；不使用每帧 React 状态。

## 控件

简单悬停/按压用 CSS，避免为所有按钮增加客户端 JS。共享模块为按钮、可悬停卡片、弹窗、下拉菜单、选择框、提示和折叠面板提供实际关键帧，替代原先没有对应定义的动画工具类。Radix 的 `data-state` 驱动关闭动画并保留自身的卸载、焦点和键盘行为。只有折叠面板为适配内容高度使用 height 动画，其余主要使用 opacity、transform、translate、scale。

## 渐进式模糊与视觉语言

- `ProgressiveBlur` 使用四层固定、带渐变 mask 的 backdrop-filter，形成导航下沿从强到弱的软边界；产品截图底部只处理 36px 高的图像边缘。
- 文字、操作按钮和图注放在模糊层之外；装饰层 `aria-hidden`、禁止指针事件，不阻挡点击。
- 手机减少为三层；不支持 backdrop-filter/mask 的浏览器显示普通边缘，减少透明度偏好下停用模糊并使用不透明导航背景。
- 保留琥珀色主色和黑色/纸色主题，以少量荧光绿方点、等宽编号、刻度、实线、直角截图框与角标加强 Marathon 风格；模糊只作为局部材质，不在滚动时逐帧改变大面积 filter。

## 验证

`scroll-reveal.test.tsx` 覆盖 SSR 可读性、首屏可见性、键盘焦点、运行期间改变减少动画偏好，以及卸载清理。现有 LauncherX 预览切换/语言切换测试继续通过。已执行全站 lint、样式检查、测试、类型检查和生产构建，并在生产预览中检查桌面及 390px 手机布局、实际滚动进度、截图切换与浏览器错误。

参考：[Motion 滚动动画](https://motion.dev/docs/react-scroll-animations)、[LazyMotion](https://motion.dev/docs/react-lazy-motion)、[MotionConfig](https://motion.dev/docs/react-motion-config)。
