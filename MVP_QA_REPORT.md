# MVP QA REPORT

## 2026-10-16 视觉更新复验

- 首页改为通栏海岸视频、三件商品并列、穿搭预览、品牌理念和 Journal 图片；Story 改为通栏图片与分段叙事。共享页面使用白底导航。
- 新增海岸小径、T 恤穿搭、音乐、日常物件四组生成图片。穿搭图继续注明设计预览；商品尺寸、材质等未知信息保持待确认。
- 重新通过 7 个宽度的 70 组页面检查、91 项主功能检查和 21 项边界检查。
- 新增默认动态模式检查：375/390/430/768/1280/1440/1728/2560px，首页、Story、Journal 共 24 组。验证首屏标题、商品区露出、图片解码、滚动显现、横向溢出和标题／控件裁切。
- 静态检查覆盖 11 个 HTML、241 处本地链接／资源、50 个片段链接和 8 个 sitemap 页面。品牌同步与脚本语法检查通过。
- 新证据：`qa/evidence/campaign-results.json`、`qa/evidence/campaign-*.png`。可复现检查为 `qa/campaign.cjs`。以下为 2026-10-12 的历史验收记录。

验收日期：2026-10-12  
范围：Explore 品牌网站任务 4；保留前 3 个任务的版式、配色、字体与内容结构。  
结论：**本地 MVP 收尾与 QA 已完成；本轮发现的功能和布局问题已修复。尚未部署或验证线上版本。** 网站是品牌展示与个人收藏 MVP，商品仍为设计预览。

## 已修复

### My Picks 与保存功能

- 全站入口统一为 **My Picks**；首页保存入口及提交按钮为 **Save**；详情提交按钮为 **Save piece**；清单使用 **Your picks / Saved pieces**。
- 新入口为 `picks.html`；`order.html` 自动转到新入口，保留无脚本时可点击的链接。
- 页面明确显示 **Saved in this browser only.**，并说明是个人清单，不构成订单、不提交、不付款。
- 原 `explore-bike-order-draft-v1` localStorage 键保持不变。旧数据、顶部数量和跨标签页同步继续工作。
- 保留商品／尺码验证、每个商品尺码 1–99 件限制、toast、图片视图切换和分类筛选，没有重写整份 shop.js。
- 修复重复缓存条目合并后超过上限、异常商品 ID、跨标签页变更后旧行误操作的边界情况。
- 调整数量／移除商品后保留合理键盘焦点；存储被禁用或写入失败时明确提示；复制失败也有反馈。
- 缓存常用 DOM 节点、图片视图按钮；只处理与保存列表有关的 storage 事件。保留内部 `order-*`、`data-cart-*` 等稳定 hooks，避免纯改名引发失效。

### 商品内容与品牌

- 三件商品统一为 **Coastal Tee / Coastal Hoodie / Freedom Jersey**，首页、详情和清单名称一致。
- 统一包含商品名、DROP 001 / COASTAL 与 ITEM 001–003、短故事、Details、Fit、Care / Material 和 Save piece。
- 移除 “What the preview shows”；所有未知尺寸、材质、护理信息保留 **Pending final sample**。数字预览与裁切放大说明保留，没有编造实物性能。
- 当前品牌文字统一使用临时 **Explore**，集中配置在 `brand.json`。同步器更新静态 HTML 和复制清单的品牌配置，关闭 JavaScript 时名称也一致。
- 已列出完整替换清单：[BRAND_REPLACEMENT_MAP.md](BRAND_REPLACEMENT_MAP.md)。Archive 的历史名称与图像说明保留为档案归因，不作为当前品牌名。
- favicon 改为复用页面已有的橙色标记，避免继续使用带旧品牌字样的复杂插画作为浏览器图标。

### 响应式与无障碍

- 手机菜单改为文档流布局，展开时推开正文，取消锁滚动；Escape 关闭并回到菜单按钮，跨断点后状态正确。
- JavaScript 不可用时导航仍可见；保存功能的脚本需求有明确提示。
- 补齐全站 Skip to content、导航 aria-controls、焦点样式；计数标签可扩展，较大数量不挤出圆形区域。
- 图片切换和数量按钮提高到 44px 点击区域；Care / Material 区块完整占行。
- 保留桌面版心约 1240px／首页 1320px 的限制，没有扩大视觉或重新排版品牌。

### 性能与清理

- 三张商品 PNG 的网页引用改为 WebP，保持原 900×900 尺寸和原始 PNG 文件。合计 **2,998,969 → 289,720 字节，减少 90.34%**。
- 首页商品图使用 lazy loading 与异步解码；首屏商品详情主图保持正常加载，避免延迟主内容。
- Hero 保留 poster 预加载与视频 `preload="none"`；可见时播放，离开 viewport 或文档隐藏时暂停。保留手动暂停按钮。
- reduced-motion／saveData 初始开启时视频请求为 0；运行中开启这些偏好会暂停。视频请求失败时保留海报并隐藏失效控制。
- 移除旧首页未引用规则和虚假加载动画；清除安全可判定的重复覆盖声明。`style.css` **52,038 → 42,307 字节，减少 18.7%**。保留有用途的断点、交互与 fallback 样式。
- 本次没有删除用户的原始图形资料，也没有为清理而更改兼容性数据键。

### SEO 与基础质量

- 检查 11 个 HTML 文件：title、description、单一 H1、连续标题层级、alt、ARIA／label 对应关系、唯一 ID、favicon 均通过。
- 验证 **224 处本地链接／资源、49 个片段链接**，无缺失目标。
- 公共 sitemap 含 8 个公开页面，与 canonical 一致；My Picks、旧入口和 404 均保留 noindex，未加入 sitemap。
- 深层不存在地址使用 404 页面时，样式、脚本、导航和 Skip to content 正常。删除了会让 Skip to content 错跳首页的 base 设置。
- robots.txt 中的 Sitemap 指向正确；域名根路径部署限制见下方。

## QA 结果与证据

测试环境：macOS，隔离 Chrome 154.0.8037.97 浏览器配置。测试使用合成收藏数据，没有改动用户正常浏览器的保存内容。

| 宽度 | 首页／Hero／保存控件 | My Picks | 三个详情页 | Story／Journal／Archive | Site map／404 |
| --- | --- | --- | --- | --- | --- |
| 375px | 通过 | 通过 | 通过 | 通过 | 通过 |
| 390px | 通过 | 通过 | 通过 | 通过 | 通过 |
| 430px | 通过 | 通过 | 通过 | 通过 | 通过 |
| 768px | 通过 | 通过 | 通过 | 通过 | 通过 |
| 1280px | 通过 | 通过 | 通过 | 通过 | 通过 |
| 1440px | 通过 | 通过 | 通过 | 通过 | 通过 |
| 1728px | 通过 | 通过 | 通过 | 通过 | 通过 |

共 **70 组页面／宽度组合**，无页面或已检查内容横向溢出、标题／按钮裁切、菜单遮挡。另有 **112 项行为及无障碍断言**通过，浏览器脚本异常为 0。脚本语法检查、品牌同步检查、静态链接检查和 `git diff --check` 通过。

覆盖：空清单、保存与刷新、数量上下限、错误商品／尺码／数量、重复与损坏存储、存储失败、旧链接跳转、跨标签页同步、旧行竞争情况、复制成功／失败、图片切换、分类参数与筛选恢复、移动导航和焦点、视频可见性／动态偏好／加载失败。

- 主检查：[qa/evidence/results.json](qa/evidence/results.json)
- 边界检查：[qa/evidence/edge-results.json](qa/evidence/edge-results.json)
- 静态检查：[qa/evidence/static-results.json](qa/evidence/static-results.json)
- 7 个宽度的首页截图：[qa/evidence/seven-widths.png](qa/evidence/seven-widths.png)
- 手机页面概览：[qa/evidence/overview-375.png](qa/evidence/overview-375.png)
- 桌面页面概览：[qa/evidence/overview-1440.png](qa/evidence/overview-1440.png)
- 可复现检查脚本和启动方式见 [README.md](README.md)。

## 未修复／未完成验证

- **没有剩余已发现且未处理的本地功能或布局缺陷。** 以上结论仅对应已执行的检查，不等于覆盖所有浏览器及辅助技术。
- 本轮没有上线部署，线上 HTTP 状态、CDN 缓存、最终域名和真实访问表现尚未验收；404 状态测试使用本地静态服务器模拟项目路径。
- 未在真实 iPhone／Android、Safari／Firefox 或屏幕阅读器中验收。saveData 与文档隐藏使用受控模拟，reduced-motion 使用浏览器偏好模拟；未做真实移动网络性能评分。
- robots.txt 必须位于域名根目录才会作为抓取规则使用。若继续部署在 GitHub Pages 的 `/explore.bikes/` 子路径，项目内的 robots.txt 不能替代 `laogou233.github.io/robots.txt`；根站配置不在当前目录范围内。页面 noindex 仍已正确设置。参见 [Google robots.txt 文档](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)。
- 商品图上的旧文字和 Archive 原作没有被重绘；材质、护理、价格、库存和最终尺寸没有真实数据，继续明确标为待确认。

## 需要用户决定

1. **最终品牌名**：当前 Explore 是占位，不代表已经选定。名称确认后统一同步；商品图形是否保留历史名称需单独决定。
2. **正式站点地址**：保留现有项目路径还是使用独立域名；确定后统一 canonical、sitemap、robots 根路径和 404 前缀。
3. **真实联系信息与实物信息**：提供后再补充；当前没有伪造联系方式、公司经历或商品规格。

## 建议未来再做

- 发布后复核正式域名、真实 404 状态、sitemap 抓取及缓存；补做 iOS Safari／Android 的实机检查。
- 最终样品确认后，替换实拍图、尺码表、材质与护理信息。
- 发布真实 Journal 内容；目前保持 Coming soon，不虚构文章。
- 有实际访问数据后再评估视频体积、真实加载指标与字体自托管。

本任务到此结束。未添加后端、支付或新的业务功能。
