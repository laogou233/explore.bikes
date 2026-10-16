# 品牌名占位与替换清单

当前对外名称 **Explore 仅为统一占位**，最终品牌名未定。本次保留既有颜色、字体、版式和图形，没有决定新的品牌身份。

## 唯一配置入口

修改 `brand.json` 的 `name`；最终确认后再将 `status` 从 `placeholder` 改为 `confirmed`。

运行 `node scripts/sync-brand.cjs`，随后运行 `node scripts/sync-brand.cjs --check`。网站仍是纯静态文件，不需要线上后端或运行时模板处理。

同步器更新所有 `data-brand-name` 文本、`data-brand-template` 标题/description、`data-brand-label` 无障碍标签，并生成 `brand.js`。因此关闭 JavaScript 时也能看到相同品牌名。

| 位置 | 名称出现处 |
| --- | --- |
| `index.html` | title、description、导航标识及 home 标签、Hero 主标题、页脚 |
| `coastal-tee.html`、`coastal-hoodie.html`、`freedom-jersey.html` | title、description、导航标识及 home 标签、页脚 |
| `picks.html` | title、description、导航标识及 home 标签、页眉说明、页脚 |
| `story.html` | title、description、导航标识及 home 标签、页眉说明、WHY 和 WHERE IT STARTED 正文、页脚 |
| `journal.html` | title、description、导航标识及 home 标签、页眉说明、页脚 |
| `archive.html` | title、description、导航标识及 home 标签、底部品牌说明、页脚 |
| `site-map.html` | title、description、导航标识及 home 标签、页眉、页面列表无障碍标签、页脚 |
| `404.html` | title、导航标识及 home 标签、返回提示、页脚 |
| `order.html` | 兼容跳转页 title |
| `brand.js` | 自动生成的当前名称；供复制清单使用，不应手改 |
| `shop.js` | 复制清单读取 `window.SITE_BRAND.name`；配置文件无法加载时的应急 fallback 为 `Explore`，正式改名时可同步更新 |

“Explore the collection”“Explore Drop 001”等句子里的 Explore 是动词，不属于品牌名占位；不会随改名同步。

## 不会自动改动的视觉与历史资料

这些需要用户决定是否更换，不能用字符串替换伪装成已更新的图片：

- `assets/coastal-tee-concept.png` / `.webp`：服装图案中含 Explore Bike 文字。
- `assets/coastal-hoodie-concept.png` / `.webp`、`assets/freedom-jersey-concept.png` / `.webp`：已有图形／文字标识，最终命名后应按实物设计逐图核对。
- `1000016929.png`：Archive 中的历史头盔／海岸图形，含 Explore Bike。
- `file_000000009c1461f7bfed0c58550de573.png`：Archive 中的 Freedom Explore 手写标识。
- `archive.html`：历史图片 alt 与介绍中的旧名称是对既有作品的准确说明，并非当前品牌名称。若保留原作，这些历史归因也应保留。
- `1000016934.png`、`浏览器图标`：保留的原始资料，目前没有网站代码引用；本次没有删除用户素材。
- `assets/favicon.svg`：沿用页面现有的橙色标记；最终身份若改变，需要另行审查。

Story / Archive 中的 bicycle culture 是已保留的品牌起点说明，不作为商品性能宣称或当前受众边界。

## 域名、路径与兼容性

品牌名与站点地址分开管理。当前沿用原项目地址 `https://laogou233.github.io/explore.bikes/`，没有擅自迁移域名或仓库。

若将来换地址，需一起核对：所有页面的 canonical（404 无 canonical）、`sitemap.xml` 的 8 个 loc、`robots.txt` 的 Sitemap、`404.html` 的 `/explore.bikes/` 资源及导航前缀、`qa/serve.py` 的本地路径模拟，以及 README 中的预览说明。纯粹改名不必更改这些路径。

`explore-bike-order-draft-v1` 是既有 localStorage 数据键。它不是对外文案，必须保留，否则访问者的旧选择会消失。`order-*`、`nav-draft`、`data-cart-*` 是保留的内部 hooks，同理不需要为了品牌名改动。

域名变化属于不同 origin，浏览器不会自动迁移旧站 localStorage；若以后迁移，要另行决定是否提供用户主动导出／导入。此次没有增加此功能。

robots.txt 的抓取规则应部署在域名根路径；GitHub Pages 子目录里的副本不能替代根站文件。采用独立域名时应重新核验，详见 MVP QA REPORT。
