# 壹拾智检数智服务平台（专业版 v2.0）

> 文档用途：客户代码审计、交接、部署核对和二次开发定位。
>
> 本仓库是农产品质量安全业务的管理端前端项目，不包含后端服务、数据库脚本或生产数据。页面可见范围、接口返回数据和最终的数据权限由后端、账号角色、所属机构及行政区划共同决定。本 README 以当前前端路由、目录和代码实现为准。

## 1. 系统范围

平台服务于农产品质量安全业务，覆盖以下主链路：

1. 主体、机构和农产品建档。
2. 快检方案制定、任务下发、任务接收、转派和进度跟踪。
3. 自主检测、任务检测、AI 试纸判读、复检、报告生成和导出。
4. 承诺达标合格证开具、上游证书关联、收证查验、作废和辖区监管。
5. 产品溯源、国标限量和检测项目推荐。
6. 风险公告、快捷统计、监管大屏、工作台和 AI 风险问答。
7. 组织、用户、角色、菜单、字典、日志、消息、短信、邮件和基础设施配置。

## 2. 技术与运行环境

| 分类 | 组件/版本 | 审计关注点 |
| --- | --- | --- |
| 前端框架 | Vue 3.5.12 | 页面使用单文件组件，业务状态主要采用 Composition API。 |
| 构建工具 | Vite 5.1.4 | 环境变量在 `.env.*` 中维护，构建产物不可手工修改。 |
| 类型系统 | TypeScript 5.3.3 | 新增公共接口、状态和路由时应运行类型检查。 |
| UI 组件 | Element Plus 2.11.1 | 表格、表单、弹窗、上传、分页等通用交互基础。 |
| 状态管理 | Pinia 2.1.7 | 用户、权限、字典、标签页和应用布局状态。 |
| 路由 | Vue Router 4.4.5 | 静态路由与后端动态菜单路由并存，使用 Hash 路由。 |
| 图表/地图 | ECharts、Three.js、MapTalks、D3 Geo | 快捷统计、监管大屏、三维地图和区域边界渲染。 |
| 请求与缓存 | Axios、web-storage-cache | Token、用户、部门、菜单、字典和部分页面偏好缓存。 |
| 测试 | Vitest、vue-tsc、ESLint | 单元测试、类型检查、静态检查。 |

运行要求：Node.js 18 及以上，推荐 Node.js 20 LTS；pnpm 8.6 及以上。

```bash
pnpm i
pnpm dev             # 使用 .env.local，默认 http://localhost:48080
pnpm dev-server      # 使用 .env.dev
pnpm test:unit       # Vitest
pnpm ts:check        # vue-tsc --noEmit
pnpm build:stage     # 预发布构建
pnpm build:prod      # 生产构建
```

## 3. 审计阅读顺序

建议按以下顺序检查，避免只看单个页面而忽略权限、缓存和路由前置条件：

1. [src/permission.ts](src/permission.ts)：全局导航守卫、登录恢复、动态路由注册、退出后的清理逻辑。
2. [src/router/modules/remaining.ts](src/router/modules/remaining.ts)：前端固定业务路由、隐藏详情页和页面高亮规则。
3. [src/store/modules/user.ts](src/store/modules/user.ts)：用户、角色、权限、部门缓存的刷新与账号切换隔离。
4. [src/store/modules/permission.ts](src/store/modules/permission.ts) 与 [src/utils/routerHelper.ts](src/utils/routerHelper.ts)：后端菜单转换为前端动态路由的过程。
5. [src/api/](src/api/)：各业务接口的 URL、请求方法、参数和返回契约。
6. [src/views/](src/views/)：页面编排、表单校验、列表查询、导出、跳转和状态处理。
7. [src/utils/](src/utils/) 与 [src/components/](src/components/)：通用格式化、打印、蓝牙、地区选择、上传和共享展示逻辑。

## 4. 顶层目录与职责

```text
.
├── build/                  Vite 插件、构建辅助配置
├── public/                 直接静态托管的资源、导入模板、地图资源
├── src/
│   ├── api/                按业务域划分的 HTTP 接口封装
│   ├── assets/             打包进前端的图片、字体、音频、地图和 Logo
│   ├── components/         跨页面共享的业务与基础组件
│   ├── config/             Axios、全局应用等配置
│   ├── directives/         权限等 Vue 指令
│   ├── hooks/              组合式函数，例如缓存、表格高度、消息提示
│   ├── layout/             主框架、侧栏、顶部栏、面包屑、标签页
│   ├── locales/            国际化资源
│   ├── plugins/            ECharts、Element Plus、UnoCSS、I18n 等插件注册
│   ├── router/             路由实例、静态路由、动态路由辅助
│   ├── store/              Pinia 状态模块
│   ├── styles/             全局样式和第三方样式覆盖
│   ├── types/              全局 TypeScript 类型
│   ├── utils/              认证、路由、树、下载、打印、蓝牙、字典等工具
│   └── views/              全部页面和页面局部组件
├── .env.*                  各环境前端配置
├── vite.config.ts          Vite 主配置
└── package.json            依赖与构建/检查脚本
```

## 5. `src` 核心目录说明

| 目录 | 主要内容 | 审计重点 |
| --- | --- | --- |
| `src/api/agri` | 农业质量安全接口：方案、任务、检测记录、报告、证书、建档、看板、AI。 | 业务请求的最终 URL、HTTP 方法和字段契约。 |
| `src/api/system` | 用户、部门、角色、菜单、字典、区域、日志、通知、租户。 | 权限相关接口、组织树和审计日志入口。 |
| `src/api/infra` | 文件、数据源、配置、代码生成、Redis、作业日志等。 | 基础设施配置是否被授权账号暴露。 |
| `src/api/member`、`src/api/mp`、`src/api/mall`、`src/api/pay` | 通用后台能力和可选业务域。 | 多数入口由后端动态菜单控制，未授权账号不应看到。 |
| `src/components` | `AreaCascader`、`CertificatePreview`、`CertificatePrintTemplate`、`DetectionProgress`、`Qrcode`、上传/表格/表单等。 | 共享组件变更会影响多个路由；尤其检查地区、打印和文件上传逻辑。 |
| `src/hooks/web/useCache.ts` | WebStorageCache 封装和缓存 Key。 | 用户、部门、菜单缓存是否在退出和账号切换时清理。 |
| `src/utils/auth.ts` | accessToken、refreshToken、租户和记住密码。 | Token 与用户缓存是不同职责，删除 Token 不等于删除用户菜单缓存。 |
| `src/utils/certificatePrint.ts` | 证书承诺依据解析、打印区域截图。 | 打印图像为前端生成，最终证书字段仍以接口详情为准。 |
| `src/utils/bluetoothPrinter.ts` | Web Bluetooth 热敏打印适配器。 | 仅 HTTPS/localhost 且 Chromium 浏览器支持；设备授权由浏览器管理。 |

## 6. 路由机制、权限和缓存

### 6.1 路由分层

系统有两类路由：

| 类型 | 来源 | 作用 |
| --- | --- | --- |
| 静态路由 | `src/router/modules/remaining.ts` | 登录、首页、错误页、核心业务详情页、大屏、统计、工作台、AI 助手等固定地址。 |
| 动态菜单路由 | 后端登录信息中的 `menus` | 由当前账号角色裁剪后下发，前端通过 `generateRoute` 转为 Vue Router 路由。系统、会员、公众号、基础设施等多数管理页面通常由该方式进入。 |

静态路由的 `meta.activeMenu` 用于保持侧栏高亮；`hidden` 表示不显示在侧栏，不表示不可访问；是否允许访问仍取决于路由守卫、后端菜单和接口权限。

### 6.2 登录和首次进入流程

```text
访问地址
  -> permission.ts 路由守卫检查 accessToken
  -> 无 Token：跳转 /login?redirect=<原地址>
  -> 有 Token、用户未初始化：请求 /login/get-info
  -> 缓存用户/角色/权限/menus，读取所属部门
  -> permission store 将 menus 转换为动态路由并注册
  -> replace 回原地址，保留 query 参数
  -> 页面发起自身列表、统计或详情请求
```

大屏路由可先用同账号用户缓存恢复首屏，再在后台刷新用户信息；该优化只影响首屏时机，不以缓存替代最终权限结果。

### 6.3 本地缓存 Key

| Key | 内容 | 生命周期与审计说明 |
| --- | --- | --- |
| `ACCESS_TOKEN`、`REFRESH_TOKEN` | 会话 Token。 | 登录/刷新时写入，退出或会话失效时删除。 |
| `USER` | 用户、角色、权限及后端菜单响应。 | 账号切换时必须与 Token 一同清除。 |
| `USER_DEPT` | 当前用户所属部门及行政区划。 | 仅当部门 ID 与当前用户匹配时恢复。 |
| `ROLE_ROUTERS` | 后端菜单原始数据。 | 用于生成动态路由，不可跨账号复用。 |
| `dictCache` | 字典缓存。 | 提升字典标签渲染速度。 |
| `statistics_current_tab`、`statistics_dropdown_commands` | 快捷统计当前页签和下拉筛选偏好。 | 不包含业务数据，仅保存界面偏好。 |
| `big-screen-data-config` | 大屏数据配置偏好。 | 退出时与用户相关缓存一起清理。 |
| `loginForm` | “记住我”登录表单。 | 密码经前端加密保存 30 天；不作为登录态凭据。 |

## 7. 静态业务路由清单

以下路径均使用 Hash 路由，部署后的完整地址通常为 `https://域名/#/路径`。

### 7.1 公共、账户和错误页

| 路由 | 页面/文件 | 功能与关键行为 |
| --- | --- | --- |
| `/` -> `/index` | `views/Home/Index.vue` | 首页入口与默认跳转页。 |
| `/login` | `views/Login/Login.vue` | 登录、验证码/租户能力、登录成功后的 Token 写入与动态路由初始化。 |
| `/register` | `views/Login/register.vue` | 注册流程。是否开放取决于后端和环境配置。 |
| `/forgotPassword` | `views/Login/forgot-password.vue` | 找回密码的验证码和身份校验入口。 |
| `/reset-password` | `views/Login/reset-password.vue` | 重置密码表单。 |
| `/user/profile` | `views/Profile/Index.vue` | 当前账号资料、头像、密码、社交绑定等。 |
| `/user/notify-message` | `views/system/notify/my/index.vue` | 当前账号站内信列表。 |
| `/user/distribution/relation` | `views/distribution/relation/index.vue` | 分发关系管理。 |
| `/user/distribution/relation-create` | `views/distribution/relation/create.vue` | 新建/编辑分发关系。 |
| `/dict/type/data/:dictType` | `views/system/dict/data/index.vue` | 指定字典类型下的字典数据维护。 |
| `/403`、`/404`、`/500` | `views/Error/*` | 无权限、未找到和异常兜底页面。 |

### 7.2 快检方案、任务接收与转派

| 路由 | 页面/文件 | 功能与关键行为 |
| --- | --- | --- |
| `/fastCheckPlan/scheme` | `views/fastCheckPlan/scheme/index.vue` | 检测方案列表、查询、导出、创建和编辑入口。 |
| `/fastCheckPlan/schemeCreate` | `views/fastCheckPlan/scheme/createScheme.vue` | 新建/编辑方案，维护周期、品种、区域、下发部门、附件和样本总量。 |
| `/fastCheckPlan/schemeTask` | `views/fastCheckPlan/scheme/schemeTask.vue` | 方案详情、任务树、任务进度、检测结果和任务导出。 |
| `/fastCheckPlan/createSchemeTask` | `views/fastCheckPlan/scheme/createSchemeTask.vue` | 从方案选择承担机构并拆分检测任务。 |
| `/fastCheckPlan/resultDetail` | `views/fastCheckPlan/resultDetail.vue` | 方案/任务检测结果详情。 |
| `/fastCheckPlan/task` | `views/fastCheckPlan/task/index.vue` | 当前机构待接收或可处理的快检任务。 |
| `/fastCheckPlan/taskAllocate` | `views/fastCheckPlan/task/taskAllocate.vue` | 已接收任务详情、子任务转派、检测结果和进度监控。 |
| `/fastCheckPlan/task/createSchemeTask` | `views/fastCheckPlan/task/createSchemeTask.vue` | 从接收任务继续拆分并下发子任务。 |

关键接口目录：`api/agri/detectionPlan`、`api/agri/detectionTask`、`api/agri/dist-relation`。

### 7.3 建档备案

| 路由 | 页面/文件 | 功能与关键行为 |
| --- | --- | --- |
| `/filing/subject` | `views/filing/subject/index.vue` | 生产经营主体列表、查询、状态和详情入口。 |
| `/filing/subjectCreate` | `views/filing/subject/create.vue` | 单个主体建档。 |
| `/filing/subjectBatch` | `views/filing/subject/batchFiling.vue` | 批量主体建档。 |
| `/filing/subjectDetail` | `views/filing/subject/productDetail.vue` | 主体及关联产品详情。 |
| `/filing/product` | `views/filing/product/index.vue` | 农产品档案列表。 |
| `/filing/productCreate` | `views/filing/product/create.vue` | 单个农产品建档，可关联主体。 |
| `/filing/productBatch` | `views/filing/product/batchCreate.vue` | 批量农产品建档。 |
| `/filing/productDetail` | `views/filing/product/productDetail.vue` | 农产品档案详情。 |
| `/filing/institutionCreate` | `views/filing/institution/create.vue` | 机构备案。 |
| `/filing/filingForm`、`/filing/filingSuccess` | `views/filing/*` | 历史/辅助建档表单和成功页。 |

关键接口目录：`api/agri/subject`、`api/agri/product`、`api/agri/organization`、`api/agri/produceCategory`。

### 7.4 快速检测与报告

| 路由 | 页面/文件 | 功能与关键行为 |
| --- | --- | --- |
| `/rapidDetection/self` | `views/rapidDetection/self/index.vue` | 本机构自主检测记录、公开状态、复检、导出和报告规则。 |
| `/rapidDetection/create` | `views/rapidDetection/rapidDetectionCreate.vue` | 自主或任务单条检测的四步录入。`id` 与 `action` 用于继续检测/复检，`taskId` 用于按任务预填。 |
| `/rapidDetection/task` | `views/rapidDetection/task/index.vue` | 任务检测管理首页。 |
| `/rapidDetection/taskDetection` | `views/rapidDetection/task/taskDetection.vue` | 单个任务下的样品检测列表和录入入口。 |
| `/rapidDetection/taskDetectionCreate` | `views/rapidDetection/rapidDetectionCreate.vue` | 任务检测录入复用页，侧栏高亮保持在任务检测。 |
| `/rapidDetection/taskResultList` | `views/rapidDetection/task/taskResultList.vue` | 任务检测结果列表。 |
| `/rapidDetection/taskResult` | `views/rapidDetection/task/taskResult.vue` | 检测结果、AI 判读项目和报告预览。 |
| `/rapidDetection/batchImportData` | `views/rapidDetection/batchImportData.vue` | 批量导入检测数据。 |

检测录入关键步骤：基础样品与主体校验 -> 预存检测记录取得主键 -> 上传试纸图片并 AI 识别 -> 保存识别结果/复检结果 -> 保存备注并生成报告 -> 预览、下载或归档。AI 原始识别 JSON 会保留给结果页和报告解析，不能只保留页面展示的文字结论。

关键接口目录：`api/agri/detectionRecord`、`api/agri/detectionResultItem`、`api/agri/detectionReport`、`api/agri/voiceAssistant`。

### 7.5 合格证服务与溯源

| 路由 | 页面/文件 | 功能与关键行为 |
| --- | --- | --- |
| `/certificate/issue` | `views/certificate/issue/index.vue` | 合格证列表、筛选、导出、作废、创建和详情入口。 |
| `/certificate/issue/create` | `views/certificate/issue/createIssue.vue` | 三步开具：产品/主体与上游证书 -> 承诺依据与检测关联 -> 服务端详情回显、下载和蓝牙打印。 |
| `/certificate/issue/detail/:id` | `views/certificate/issue/issueDetail.vue` | 主证及上游证书详情、打印联选择和蓝牙打印。开具时间统一使用服务端 `createTime` 并保留秒。 |
| `/certificate/verify` | `views/certificate/verify/index.vue` | 收证/查验记录列表、查询、导出和删除。 |
| `/certificate/verify/detail` | `views/certificate/verify/verifyDetail.vue` | 本平台查验证书详情。 |
| `/certificate/verify/other` | `views/certificate/verify/verifyOther.vue` | 上传本平台或其他平台证书图片，识别后创建/更新查验存证。 |
| `/certificate/jurisdiction` | `views/certificate/jurisdiction/index.vue` | 辖区合格证监管查询。 |
| `/productTraceability/index` | `views/productTraceability/index.vue` | 根据证书/产品等线索汇总产品、主体、检测和合格证信息。 |

合格证审计要点：

- 开具成功后页面会二次查询证书详情，二维码、证书编号和 `createTime` 以服务端返回为准。
- 平台检测记录关联时按页面规则筛选；上游证书分为本平台编号关联和其他平台原件图片两条分支。
- 作废需要原因，作废后的展示与可操作范围由后端状态控制。
- 热敏打印是浏览器端截图、图像转换和蓝牙分包写入，不替代后端证书存证。

关键接口目录：`api/agri/certificate`、`api/agri/certificateVerification`、`utils/certificatePrint.ts`、`utils/bluetoothPrinter.ts`。

### 7.6 标准查询、统计、大屏、工作台和 AI

| 路由 | 页面/文件 | 功能与关键行为 |
| --- | --- | --- |
| `/standard/limit` | `views/standard/limit/index.vue` | 国标限量查询。 |
| `/standard/recommend` | `views/standard/recommend/index.vue` | 根据产品/分类推荐检测项目。 |
| `/standard/manage` | `views/standard/manage/index.vue` | 指标限量维护。 |
| `/statistics/index`、`/statistics/quick` | `views/statistics/index.vue` | 同一统计容器，提供全部、任务、快检、开具、收证、建档页签。 |
| `/big-screen` | `views/visualization/BigScreen.vue` | 统一监管大屏，`key` 可切换默认、任务、快检、证书视图。 |
| `/big-screen-three` | 重定向到 `/big-screen?renderer=three` | 以 Three.js 渲染地图视图。 |
| `/big-screen-certificate`、`/big-screen-task`、`/big-screen-quick` | 重定向到统一大屏 | 分别传入 `key=cert/task/quick`。 |
| `/big-screen-task-receive` | `views/visualization/BigScreenTaskReceive.vue` | 任务接收场景的大屏。 |
| `/workBench/index` | `src/workBench.vue` | 工作台、待办、预警、任务跟踪和日报/月报入口。 |
| `/ai-assistant` | `views/ai/ChatAssistant.vue` | 小壹助手：风险问答、结构化表格回答、语音输入和唤醒词。 |

统计权限口径：`queryDeptScope` 是看板接口约定，必须结合具体接口解释，不能将数字含义机械套用到所有端点。当前前端本机构默认采用 `3`，辖区统计采用 `1`；任务“执行/下发”等特殊口径和监管账号下拉选项仍可能由页面命令映射为其他值。具体实现见 `views/statistics/index.vue`、`views/statistics/components/TabAll.vue` 与对应接口定义。

## 8. 动态菜单页面目录

以下目录多数由后端菜单决定是否进入侧栏。前端目录存在不代表任何账号默认拥有访问权限。

| `src/views` 子目录 | 页面范围 | 对应接口域 |
| --- | --- | --- |
| `system/` | 用户、部门、角色、菜单、区域、字典、租户、日志、站内信、短信、邮件、OAuth 客户端。 | `api/system`、`api/infra` |
| `member/` | 会员用户、等级、积分、标签、分组、签到、余额及详情明细。 | `api/member` |
| `mp/` | 公众号账号、素材、草稿、发布、自动回复、菜单、用户、标签和统计。 | `api/mp` |
| `report/` | GoView、积木报表等嵌入式报表页面。 | 报表服务地址/后端配置 |
| `taskDetection/` | 历史或独立任务检测管理页面。 | `api/agri/detectionTask`、`api/agri/detectionRecord` |
| `distribution/` | 机构分发关系、可分配范围和用户关联。 | `api/agri/dist-relation`、`api/system/dept` |
| `visualization/` | 大屏、地图、分面看板和局部面板。 | `api/agri/dashboard` |
| `certificate/`、`rapidDetection/`、`fastCheckPlan/`、`filing/` | 质量安全核心业务模块。 | `api/agri/*` |

## 9. 核心接口域说明

| 接口目录 | 主要职责 | 典型操作 |
| --- | --- | --- |
| `api/agri/detectionPlan` | 检测方案。 | 分页、详情、新增、编辑、附件、统计、导出、方案拆分。 |
| `api/agri/detectionTask` | 检测任务。 | 分页、接收、催办、撤回、任务树、子任务拆分。 |
| `api/agri/detectionRecord` | 检测记录。 | 新增、更新、复检、删除、导出、备注、公开状态。 |
| `api/agri/detectionReport` | 检测报告。 | 生成报告、报告详情。 |
| `api/agri/certificate` | 合格证与查验。 | 开具、更新、作废、草稿、上游查询、导出、溯源。 |
| `api/agri/certificateVerification` | 外部/本平台合格证存证。 | 图片识别、归档、详情、更新。 |
| `api/agri/dashboard` | 统计和大屏。 | 总览、趋势、地图、分类分布、风险排行、公告。 |
| `api/agri/voiceAssistant` | AI 风险问答与语音能力。 | 问答请求、浏览器语音识别、唤醒词和音频总线。 |
| `api/agri/subject`、`product`、`produce` | 主体、产品、农产品分类/档案。 | 建档、查询、详情、关联回填。 |
| `api/system/*` | 系统管理。 | 用户、部门、角色、菜单、字典、区域、日志、通知和租户。 |

## 10. 关键业务数据流

### 10.1 方案到检测结果

```text
检测方案
  -> 指定样本总量、区域、品种、项目、周期和下发机构
  -> 任务拆分/下发
  -> 承担机构接收或转派子任务
  -> 单条录入或批量导入检测记录
  -> AI 判读/人工结果/复检
  -> 生成检测报告
  -> 任务完成率、统计页面、大屏和风险排行汇总
```

### 10.2 主体、产品、检测和证书

```text
主体建档 <-> 产品建档
      -> 检测记录（样品、产地、主体、结果、报告）
      -> 合格证开具（可关联平台检测记录/上游证书）
      -> 收证查验或辖区监管
      -> 产品溯源、统计、大屏和 AI 问答
```

### 10.3 账号切换和退出

```text
登录成功
  -> Token
  -> USER / USER_DEPT / ROLE_ROUTERS 缓存
  -> 动态路由注册

退出、Token 失效或用户信息异常
  -> 删除 Token
  -> 删除用户、部门、菜单及用户相关统计/大屏缓存
  -> resetRouter 删除动态路由
  -> 返回登录页
```

## 11. 页面方法注释规范

为便于审计，`src/views` 中的方法已补充中文 JSDoc。阅读时可按方法前缀快速定位职责：

| 方法前缀 | 常见含义 |
| --- | --- |
| `load*`、`fetch*`、`query*`、`init*` | 页面初始化或接口数据加载。 |
| `handle*`、`on*` | 模板事件、组件回调、分页、筛选、上传或弹窗交互。 |
| `build*`、`parse*`、`format*`、`resolve*` | 接口参数、历史字段、日期/地区/结果标签和展示结构转换。 |
| `submit*`、`save*`、`create*`、`update*`、`delete*` | 会产生服务端副作用的操作。 |
| `set*`、`reset*`、`clear*`、`sync*` | 本地响应式状态和筛选条件同步。 |
| `go*`、`back*`、`navigate*` | 步骤切换或路由跳转。 |

方法注释说明的是前端职责、输入来源、状态变化和调用关系；服务端字段合法性、数据权限、并发和最终持久化结果必须以接口实现为准。

## 12. 环境变量与部署核对

| 变量 | 用途 | 审计/部署关注点 |
| --- | --- | --- |
| `VITE_APP_TITLE` | 系统标题。 | 不影响权限。 |
| `VITE_BASE_URL` | 后端服务地址。 | 必须指向对应环境，避免测试前端调用生产接口。 |
| `VITE_API_URL` | 管理端 API 前缀。 | 与网关路由、跨域配置一致。 |
| `VITE_BASE_PATH` | 前端部署基础路径。 | Hash 路由仍需保证静态资源路径正确。 |
| `VITE_OUT_DIR` | 构建输出目录。 | `dist/`、`dist-prod/` 为构建产物，不手工编辑。 |
| `VITE_APP_TENANT_ENABLE` | 租户能力开关。 | 影响登录和租户相关页面行为。 |
| `VITE_APP_CAPTCHA_ENABLE` | 登录验证码开关。 | 与后端验证码配置必须一致。 |
| `VITE_UPLOAD_TYPE` | 上传方式。 | 核对文件服务、对象存储或本地存储配置。 |
| `VITE_SOURCEMAP` | Source map 开关。 | 生产环境开启前应评估源代码暴露风险。 |

环境文件包括 `.env.local`、`.env.dev`、`.env.test`、`.env.stage`、`.env.prod`。不得在仓库中提交真实生产账号、密码、Token、密钥或对象存储凭据。

## 13. 客户审计检查清单

### 13.1 权限与会话

- 检查后端 `/login/get-info` 返回的 `permissions`、`roles`、`menus` 是否按账号隔离。
- 检查退出、Token 失效、账号切换时是否同时清除 `USER`、`USER_DEPT`、`ROLE_ROUTERS`。
- 检查隐藏路由是否仍有后端接口权限校验，前端 `hidden` 不能作为安全边界。
- 检查动态菜单 component 路径是否仅允许映射到预构建的 `src/views` 模块。

### 13.2 业务与数据

- 检查检测记录、任务、方案、主体、产品和合格证 ID 的接口归属是否一致。
- 检查复检、作废、撤回、催办、接收、公开状态等写操作是否有后端状态机限制。
- 检查导出接口是否复用列表筛选条件并在后端进行数据权限过滤。
- 检查统计 `queryDeptScope`、行政区划、部门 ID/名称参数是否与后端口径一致。

### 13.3 文件、打印与浏览器能力

- 检查图片/附件上传的大小、类型、病毒扫描、对象存储访问控制和下载鉴权。
- 检查证书二维码地址、上游证书图片和溯源页面是否避免泄露不应公开的主体信息。
- 检查 Web Bluetooth 只在 HTTPS 或 localhost、受支持浏览器下使用，并由浏览器授予设备权限。
- 检查语音输入和唤醒词仅在用户授权麦克风后工作，页面离开时释放相关监听器。

### 13.4 前端边界

- 前端校验只改善交互，后端必须重新校验所有写入参数、角色、机构、区域和资源归属。
- 前端缓存只用于体验和首屏性能，不能作为授权或数据真实性依据。
- 前端可见菜单不等于 API 授权；所有接口必须由服务端进行二次鉴权。

## 14. 开发与变更约定

- 页面新增：放入对应 `src/views/<业务域>/`，在静态路由或后端菜单中建立入口。
- 接口新增：放入对应 `src/api/<业务域>/`，避免在页面中直接拼接请求 URL。
- 动态菜单新增：确认后端 `component` 路径可以被 `routerHelper.ts` 的 `import.meta.glob` 匹配。
- 共享状态新增：优先评估是否属于 Pinia、页面局部 `ref/reactive` 或 WebStorage 缓存，明确清理时机。
- 共享组件新增：放入 `src/components/`，在 README 或组件注释中说明受影响业务范围。
- 业务方法新增：补充中文 JSDoc，至少说明输入来源、状态变化、接口副作用和异常处理责任。
- 修改路由、用户缓存、权限、统计参数或 API 契约后，至少运行类型检查和相关测试。

## 15. 常用检查命令

```bash
pnpm test:unit
pnpm ts:check
pnpm build:stage
pnpm build:prod

# 下列命令会修改文件，执行前先检查 Git 工作区
pnpm lint:eslint
pnpm lint:format
pnpm lint:style
```

## 16. 文档维护原则

当新增、删除或调整以下内容时，应同步更新本 README：

1. 固定路由、页面用途或 `meta.activeMenu`。
2. 动态菜单生成规则、登录/退出缓存边界。
3. 方案、任务、检测、合格证、统计或 AI 的关键业务流程。
4. 新增环境变量、第三方浏览器能力、文件存储或打印设备要求。
5. 客户审计需要了解的字段口径、数据范围和前后端职责边界。
