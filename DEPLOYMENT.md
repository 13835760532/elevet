# 壹拾智检数智服务平台部署文档

> 适用仓库：壹拾智检数智服务平台前端管理端与 Electron 桌面端。
>
> 文档版本：2026-08-24。
>
> 本文只描述当前仓库中的前端 Web 和桌面应用部署。后端、数据库、对象存储、讯飞控制台和服务器操作系统需要单独准备。

## 1. 交付物与架构

本项目有两种交付物：

| 交付物 | 构建方式 | 运行方式 | 适用场景 |
| --- | --- | --- | --- |
| Web 前端 | Vite 静态构建 | Nginx、宝塔、CDN 或其他静态服务器 | 浏览器访问管理后台 |
| Electron 应用 | Vite + Electron Builder | Windows NSIS、macOS DMG/ZIP | 本地应用、麦克风、本地唤醒 |

Web 请求链路：

    浏览器 -> Nginx/静态文件服务器 -> index.html/assets
            -> /admin-api 反向代理 -> 后端 API

当前 Web 生产 API 配置为：

    VITE_BASE_URL=https://yishizhijian.jikeyun.net
    VITE_API_URL=/admin-api

因此默认完整 API 地址是：

    https://yishizhijian.jikeyun.net/admin-api

如果 Web 使用同域 Nginx 代理，建议把生产环境的 VITE_BASE_URL 设为空、保留 VITE_API_URL=/admin-api，避免浏览器跨域。改环境变量后必须重新构建。

Electron 请求链路：

    app://app/admin-api/*
      -> Electron 主进程
      -> https://yishizhijian.jikeyun.net/admin-api/*

桌面端的 apiOrigin 当前写在 electron/main.cjs 中。仅修改 .env.desktop 不会改变已打包应用的后端地址；若需要多个后端环境，必须先改造主进程配置来源。

## 2. 运行环境

### 2.1 开发机

- Node.js：推荐 20 LTS，最低满足项目 engines 的 Node.js >=16。
- pnpm：>=8.6.0；Windows CI 当前使用 9.15.5。
- Git。
- Electron 开发依赖 Electron 36.7.3。
- Windows 原生唤醒编译需要 Visual Studio/MSBuild 和 Windows SDK。
- macOS 打包需要 macOS 和 Xcode Command Line Tools。
- 生产签名、公证需要相应 Apple Developer 或 Windows 证书。

检查版本：

    node --version
    pnpm --version
    git --version

### 2.2 Web 服务器

- Nginx 或等价静态文件服务器。
- 生产 HTTPS 证书。
- 服务器能访问后端 API。
- 若启用反向代理，服务器能访问 https://yishizhijian.jikeyun.net。
- 若使用 CDN，源站必须正确返回 index.html、assets、字体和媒体文件。

## 3. 首次准备

进入仓库根目录后安装锁定依赖：

    pnpm install --frozen-lockfile

说明：

- 正式构建使用 --frozen-lockfile，避免构建机修改 pnpm-lock.yaml。
- 项目脚本、CI 和 Electron staging 以 pnpm 为准，不建议使用 npm install 替代。
- 不要提交 node_modules、dist*、release、desktop-app 等构建输出。

构建前检查：

    git status --short

不要用 git reset --hard 或 git checkout -- 清理未知修改；先确认修改归属。

## 4. 环境文件

Vite 根据命令的 mode 加载对应文件：

| 命令 | 环境文件 | 输出目录 | 用途 |
| --- | --- | --- | --- |
| pnpm dev | .env.local | 无生产输出 | 本地浏览器开发 |
| pnpm dev-server | .env.dev | 无生产输出 | 开发后端联调 |
| pnpm build:stage | .env.stage | dist-stage | 预发布 |
| pnpm build:test | .env.test | dist-test | 测试 |
| pnpm build:prod | .env.prod | dist-prod | Web 生产 |
| pnpm build:desktop | .env.desktop | dist-desktop | Electron renderer |

关键变量：

| 变量 | 作用 | 注意事项 |
| --- | --- | --- |
| VITE_BASE_URL | API 服务根地址 | Web 可用完整 HTTPS；同域代理时可为空 |
| VITE_API_URL | API 前缀 | 当前为 /admin-api |
| VITE_BASE_PATH | 静态资源和 Hash 路由基础路径 | 根路径用 /，子目录必须配置实际前缀 |
| VITE_OUT_DIR | Vite 输出目录 | 不能与部署脚本目标混淆 |
| VITE_UPLOAD_TYPE | 上传模式 | 当前为 server，后端上传接口必须可用 |
| VITE_APP_TENANT_ENABLE | 租户开关 | 必须与后端租户模式一致 |
| VITE_APP_CAPTCHA_ENABLE | 验证码开关 | 必须与后端验证码接口一致 |
| VITE_APP_API_ENCRYPT_ENABLE | API 加解密开关 | 前后端算法、请求头和密钥必须匹配 |
| VITE_APP_API_ENCRYPT_HEADER | 加密标记头 | 当前默认 X-Api-Encrypt |
| VITE_XFYUN_RTASR_APP_ID | 讯飞实时转写 APPID | 生产不建议直接编译进前端 |
| VITE_XFYUN_RTASR_API_KEY | 讯飞实时转写 API_KEY | VITE 值会进入浏览器 bundle |
| VITE_XFYUN_RTASR_SIGN_URL | 后端签名接口 | 生产推荐使用，前端不持有 API_KEY |
| VITE_APP_DESKTOP | 桌面模式标识 | .env.desktop 为 true |
| VITE_BAIDU_MAP_KEY | 百度地图 Key | 配置来源/域名限制 |

严禁提交：

- 讯飞 API_KEY、API_SECRET 和实时转写服务密钥。
- SSH 密码、SSH 私钥、服务器面板密码。
- 数据库、对象存储和后端签名密钥。
- 管理员初始密码。
- 生产 API 加密私钥（如协议使用私钥）。

Windows 唤醒配置 electron/native/xfyun-awake/runtime/xfyun-awake.ini 已被 .gitignore 忽略，CI 通过 GitHub Secrets 注入。

## 5. Web 部署

### 5.1 生产构建

    pnpm install --frozen-lockfile
    pnpm ts:check
    pnpm build:prod

构建成功后必须存在：

    dist-prod/index.html
    dist-prod/assets/

检查产物：

    test -f dist-prod/index.html
    find dist-prod/assets -type f | wc -l
    du -sh dist-prod

Windows PowerShell：

    pnpm build:prod
    Test-Path .\dist-prod\index.html
    Get-ChildItem .\dist-prod\assets -Recurse -File | Measure-Object

不要手工编辑 dist-prod；修改环境、API 或基础路径后重新构建。

### 5.2 测试和预发布

    pnpm build:test
    pnpm build:stage

当前 .env.test 使用子路径 /admin-ui-vue3/；.env.stage 使用静态资源域名。部署时必须保证服务器真实路径、VITE_BASE_PATH 和 HTML 中的资源 URL 一致。

### 5.3 上传静态文件

将 dist-prod 内部内容部署到站点 root，不要多嵌套一层 dist-prod：

    rsync -av --delete dist-prod/ deploy@server:/var/www/yishizhijian/

正确结构：

    /var/www/yishizhijian/index.html
    /var/www/yishizhijian/assets/...

#### 宝塔文件管理上传

如果使用宝塔面板，可以进入目标站点的文件目录（示例：`/www/wwwroot/web`），选择“上传/下载” -> “上传文件”，将 `dist-prod` 目录内的所有文件和目录上传到站点根目录。

![宝塔文件管理上传 dist-prod 文件](/deployment/baota-upload-files.png)

注意：上传时应上传 `dist-prod` **里面的内容**，不要把本地目录本身再套一层。上传完成后，宝塔站点目录应直接看到 `index.html`、`assets`、`models`、`vendor` 等文件或目录。截图资源位于仓库的 `public/deployment/baota-upload-files.png`，执行 `pnpm build:prod` 后会自动复制到 `dist-prod/deployment/baota-upload-files.png`，无需手工复制到构建目录。

### 5.4 Nginx 示例

以下示例为根路径部署，并把 /admin-api 同域转发到后端：

    server {
        listen 80;
        server_name admin.example.com;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name admin.example.com;

        ssl_certificate /etc/letsencrypt/live/admin.example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/admin.example.com/privkey.pem;

        root /var/www/yishizhijian;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /admin-api/ {
            proxy_pass https://yishizhijian.jikeyun.net/admin-api/;
            proxy_ssl_server_name on;
            proxy_set_header Host yishizhijian.jikeyun.net;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 60s;
            proxy_send_timeout 60s;
        }

        client_max_body_size 100m;
    }

检查并重载：

    sudo nginx -t
    sudo systemctl reload nginx

如果 VITE_BASE_URL 仍是完整后端域名，则必须确认后端 CORS、HTTPS、Authorization、tenant-id、上传和下载响应头配置正确。

### 5.5 Web 验收

打开：

    https://admin.example.com/#/login

依次检查：

1. index.html 返回 200。
2. JS、CSS、字体、图片和媒体无 404。
3. 登录接口地址、状态码和响应结构正确。
4. 请求带 Authorization。
5. 租户模式下带 tenant-id，访问租户时带 visit-tenant-id。
6. API 加密响应头与前端解密配置一致。
7. 上传、下载、导出和大文件请求正常。
8. 退出后切换账号，旧用户菜单和权限不残留。
9. 刷新 #/ai-assistant、#/tutorial、#/infra/file/file 等 Hash 路由正常。
10. Console 没有 CORS、Mixed Content、解密或资源加载异常。

## 6. Electron 桌面部署

### 6.1 桌面开发

    pnpm install --frozen-lockfile
    pnpm desktop:dev

该命令启动 Vite desktop mode（127.0.0.1:48081）和 Electron，并等待 renderer 就绪。开发模式通过 Vite 转发 /admin-api。

### 6.2 生成桌面 renderer

    pnpm build:desktop
    pnpm desktop:prepare

输出：

    dist-desktop/    Vite 桌面静态文件
    desktop-app/     Electron Builder 暂存目录

desktop:prepare 会复制 Electron 主进程、preload、staging package，并修补 Sherpa-ONNX Worker 运行时。不要直接修改构建输出替代源码。

### 6.3 macOS

在 macOS 构建：

    pnpm desktop:build -- --mac dmg zip

排错时分步：

    pnpm build:desktop
    pnpm desktop:prepare
    pnpm exec electron-builder --config electron-builder.yml --mac dmg zip

产物在 release/desktop/。当前目标为 dmg 和 zip，应用声明了麦克风用途说明。

正式发布需要：

- Developer ID Application 证书。
- electron-builder 签名变量（例如 CSC_LINK、CSC_KEY_PASSWORD）。
- Apple 公证账号、Team ID 和 App-specific password。
- 真机验证麦克风权限和 Sherpa-ONNX 唤醒模型。

当前 electron-builder.yml 的 identity 为 null，本地包通常未签名/未公证，其他 Mac 可能被 Gatekeeper 拦截。

### 6.4 Windows 和 GitHub Actions

Mac 不建议交叉编译 Windows AIKit helper；使用 .github/workflows/windows-desktop.yml。

触发方式：

- 推送 main。
- 推送 v* 标签。
- Actions 页面手动 Run workflow。

工作流步骤：

1. Windows runner、Node 20、pnpm 9.15.5。
2. frozen lockfile 安装依赖。
3. 配置 MSBuild。
4. 从 GitHub Secrets 注入讯飞唤醒密钥。
5. 编译 xfyun-awake.exe x64。
6. 构建 renderer 和 Electron staging。
7. 生成 Windows NSIS x64。
8. 校验安装包内凭据和阈值。
9. 上传 windows-x64-installer。

必须配置的 GitHub Secrets：

    XFYUN_APP_ID
    XFYUN_API_KEY
    XFYUN_API_SECRET

位置：GitHub 仓库 -> Settings -> Secrets and variables -> Actions -> New repository secret。

任意一个为空，CI 必须失败，不应生成无法唤醒的安装包。成功后从 Actions 的 Artifacts 下载 windows-x64-installer。普通用户只交付经过验证的 *-setup.exe，不要把 win-unpacked 当普通安装包。

### 6.5 Windows 唤醒资源

源目录：

    electron/native/xfyun-awake/runtime/

主要资源：

    xfyun-awake.exe
    xfyun-awake.ini
    xfyun-awake.ini.example
    keyword.txt
    resource/

安装包放在 resources/xfyun-awake。启动时主进程会复制配置和资源到用户数据下的可写目录，再以相对路径启动 helper。

阈值格式必须类似：

    [wake]
    threshold=0 0:999

threshold=0 会导致 AIKIT_Start 参数错误。不要提交 xfyun-awake.ini。

### 6.6 实时语音转写

桌面端实时转写通过 WebSocket 连接讯飞 RTASR。生产建议：

1. 后端实现签名接口。
2. 专用构建环境设置 VITE_XFYUN_RTASR_SIGN_URL。
3. 重新 build:desktop 和 Electron Builder。
4. 前端只取得临时 WebSocket URL。

没有签名地址时，代码会回退到前端签名，仅适合本地调试，因为 VITE_XFYUN_RTASR_API_KEY 会进入前端资源。生产不要把 API_KEY 写入公开 .env.desktop。

### 6.7 Windows 安装验收

1. 退出并卸载旧版本。
2. 安装最新 *-setup.exe。
3. 允许 Windows 桌面应用使用麦克风。
4. 登录并测试手动录音。
5. 开启唤醒监听，确认状态变为“正在等待唤醒词”。
6. 说出配置的唤醒词，确认进入实时转写。
7. 结束录音，确认无重复文本且唤醒恢复符合预期。
8. 确认无 AIKIT_Init、AIKIT_Start、EPIPE 或重复错误弹窗。
9. 若仍使用旧用户目录，必要时关闭应用后清理用户数据下的 xfyun-awake 目录再测试。

## 7. CI/CD

### 7.1 Web 发布

    git fetch --all --prune
    git checkout main
    git pull --ff-only
    pnpm install --frozen-lockfile
    pnpm ts:check
    pnpm build:prod
    test -f dist-prod/index.html

发布 dist-prod 内部内容，记录域名、环境、commit SHA、构建时间和回滚位置。

### 7.2 Windows 发布

    git checkout main
    git pull --ff-only
    git push github main

推送后检查 Actions 的 head_sha 与刚推送提交一致。必须确认以下步骤均 success：

- Configure XFYUN wake credentials
- Build XFYUN Windows wake helper
- Build renderer
- Package Windows NSIS x64
- Verify packaged XFYUN config
- Upload Windows installer

当前 Windows workflow 只构建 x64，不构建 ARM64。当前没有 macOS GitHub Actions workflow。

### 7.3 deploy.js 注意事项

仓库的 deploy.js 仍包含 YOUR_SERVER_IP、YOUR_SSH_PASSWORD、示例远程目录等占位符，并调用当前 package.json 不存在的 npm run build。不要直接把 node deploy.js 当作生产部署命令；应使用人工审核的 rsync/scp，或先修订脚本并通过安全凭据注入。

## 8. 检查和故障排查

构建检查：

    node --check electron/main.cjs
    pnpm exec eslint src/views/ai/ChatAssistant.vue
    pnpm ts:check
    pnpm build:prod
    pnpm build:desktop
    pnpm desktop:prepare
    git diff --check

完整 ts:check 或 test:unit 若出现仓库基线已有错误，要记录具体错误并区分本次变更，不要用跳过检查掩盖失败。

### Web 白屏或资源 404

- 检查 index.html 是否在 root。
- 检查 VITE_BASE_PATH 和部署目录。
- 检查首个 Network 404。
- 检查服务器是否正确返回 gzip/br 和字体。
- 检查 Hash 路由是否回退到 index.html。

### API 404、跨域或 401

- 检查 API 是否包含 /admin-api。
- 检查 Nginx proxy_pass 斜杠。
- 检查后端 CORS、HTTPS 和网关路径。
- 检查 Authorization、tenant-id、visit-tenant-id。
- 检查 Token 刷新和账号权限。

### Windows 配置错误

提示“Please fill app_id...”：通常是旧 artifact、CI Secret 未注入或安装了错误包；检查配置步骤和 artifact 的 commit SHA。

提示 AIKIT_Start failed: 100011：检查 [wake] 下是否为 threshold=0 0:999；同时确认 keyword.txt、resource 和 DLL 随包存在。

提示 AIKIT_Init failed: 18400：检查用户数据目录可写、helper 使用相对路径，并查看 xfyun-awake.log。

提示 Error: write EPIPE：通常是旧主进程向已退出 helper 写 stdin；升级到包含 EPIPE 处理的完整安装包，不要只替换 renderer 文件。

### macOS 权限

在系统设置 -> 隐私与安全性 -> 麦克风中允许应用。未签名应用可能被 Gatekeeper 拦截；重新授权后完全退出并重新打开应用。

## 9. 回滚

### 9.1 Web

建议按版本保存目录：

    /var/www/releases/2026-08-24-001/
    /var/www/releases/2026-08-24-002/
    /var/www/yishizhijian -> /var/www/releases/2026-08-24-002

回滚：

    ln -sfn /var/www/releases/2026-08-24-001 /var/www/yishizhijian
    sudo nginx -t
    sudo systemctl reload nginx

回滚后清理 CDN 缓存，避免 HTML 和 hashed assets 不匹配。

### 9.2 Electron

- 保留每个 CI run、artifact 和 commit SHA。
- 回滚时分发同一构建的旧 *-setup.exe 或 macOS 包。
- 不要只替换 renderer；main、preload、native helper 和资源必须来自同一构建。
- 记录用户数据目录和配置迁移策略。

## 10. 发布验收清单

### 发布前

- [ ] 后端 API、租户、验证码、加密、上传和对象存储已确认。
- [ ] 生产密钥不在代码、提交、日志和文档中。
- [ ] frozen lockfile 安装通过。
- [ ] 类型检查已通过或已记录基线错误。
- [ ] 目标环境构建成功。
- [ ] VITE_BASE_PATH 与站点目录一致。
- [ ] Windows 三项 XFYUN Secrets 已配置。
- [ ] Actions commit SHA 与发布提交一致。
- [ ] 配置校验和 artifact 上传成功。
- [ ] macOS 签名/公证策略已确认。

### Web 上线后

- [ ] 登录、退出、刷新和账号切换正常。
- [ ] 业务首页、快检、建档、检测、证书、统计和 AI 页面正常。
- [ ] API、上传、下载和导出正常。
- [ ] Console 无关键异常。
- [ ] HTTPS、代理、CORS、文件大小限制已验证。
- [ ] 已记录版本、构建时间、commit SHA 和回滚目录。

### 桌面包上线后

- [ ] Windows 安装、卸载、升级正常。
- [ ] macOS 安装、权限、启动正常。
- [ ] 手动录音转文字正常。
- [ ] Windows 唤醒初始化和唤醒词识别正常。
- [ ] macOS Sherpa-ONNX 模型正常加载。
- [ ] 录音结束后无重复文本，唤醒恢复符合预期。
- [ ] 无 AIKIT_Init、AIKIT_Start、EPIPE 或重复弹窗。
- [ ] 已记录安装包版本、workflow URL、commit SHA 和系统版本。

## 11. 发布记录模板

    项目：壹拾智检数智服务平台
    发布类型：Web / Windows / macOS
    环境：dev / test / stage / prod
    Git commit：
    构建命令：
    构建目录或 artifact：
    Actions run URL：
    部署时间：
    部署人：
    后端 API 地址：
    VITE_BASE_PATH：
    是否启用租户：
    是否启用 API 加密：
    是否启用实时转写签名服务：
    是否启用 Windows 唤醒：
    是否签名/公证：
    验收结果：
    回滚位置：
    已知问题：
