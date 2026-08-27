# 壹拾智检数智服务平台部署手册

文档更新时间：2026-08-26

本文只写当前仓库的前端 Web 和 Electron 桌面端。后端、数据库、对象存储和讯飞账号需要另行准备。

## 1. 构建机环境

### 1.1 版本要求

| 工具 | 要求 | 当前项目建议 |
| --- | --- | --- |
| Node.js | `>=16.0.0` | Node.js 20 LTS，已验证 `v20.19.0` |
| pnpm | `>=8.6.0` | pnpm 9.15.5（与 Windows CI 一致） |
| Git | 可用 | 用于拉取代码和确认 commit |
| Electron | 项目锁定 36.7.3 | 由 `pnpm install` 安装 |
| electron-builder | 项目锁定 26.0.12 | 由 `pnpm install` 安装 |

检查版本：

    node --version
    pnpm --version
    git --version

Node 版本不合适时，建议使用 nvm：

    nvm install 20.19.0
    nvm use 20.19.0
    node --version

如果没有 pnpm：

    corepack enable
    corepack prepare pnpm@9.15.5 --activate
    pnpm --version

Windows 原生唤醒 helper 只能在 Windows runner 上编译，需要 Visual Studio/MSBuild 和 Windows SDK。macOS 打包需要 Xcode Command Line Tools。

### 1.2 拉取代码

    git clone <仓库地址>
    cd 拾壹
    git checkout main
    git pull --ff-only

构建前查看工作区：

    git status --short

不要用 `git reset --hard` 或 `git checkout --` 清理工作区，先确认修改是否属于当前发布。

## 2. 安装依赖

首次安装或锁文件有变化时，在仓库根目录执行：

    pnpm install --frozen-lockfile

安装完成后可确认依赖是否可用：

    pnpm exec vite --version
    pnpm exec electron-builder --version

`--frozen-lockfile` 会严格使用 `pnpm-lock.yaml`。如果提示 lockfile 与 `package.json` 不一致，不要在生产机直接改锁文件，应在开发分支执行 `pnpm install`、检查变更后再提交锁文件。

常见错误：

- `packages field missing or empty`：通常是 pnpm 工作区配置或执行目录不对。确认当前目录是仓库根目录，并检查 `pnpm-workspace.yaml`；不要把 `pnpm run` 命令当成 `pnpm exec` 使用。
- `ERR_PNPM_LINKING_FAILED`：常见于 Windows 文件被占用。关闭正在运行的 Electron、Vite 和编辑器终端后重试；必要时删除项目自己的 `node_modules`，再执行 `pnpm install --frozen-lockfile`。
- 依赖下载失败：确认网络、代理和 Electron 下载源；不要把半完成的 `node_modules` 复制到另一台机器。

## 3. 环境文件

Vite 根据命令的 mode 读取环境文件：

| 命令 | 环境文件 | 输出目录 | 用途 |
| --- | --- | --- | --- |
| `pnpm dev` | `.env.local` | 无 | 浏览器本地开发 |
| `pnpm dev-server` | `.env.dev` | 无 | 开发后端联调 |
| `pnpm build:test` | `.env.test` | `dist-test` | 测试环境 |
| `pnpm build:stage` | `.env.stage` | `dist-stage` | 预发布环境 |
| `pnpm build:prod` | `.env.prod` | `dist-prod` | Web 生产环境 |
| `pnpm build:desktop` | `.env.desktop` | `dist-desktop` | Electron renderer |

常用变量：

| 变量 | 作用 |
| --- | --- |
| `VITE_BASE_URL` | API 服务根地址；同域代理时可以为空 |
| `VITE_API_URL` | API 前缀，当前为 `/admin-api` |
| `VITE_BASE_PATH` | 静态资源和 Hash 路由基础路径 |
| `VITE_OUT_DIR` | Vite 输出目录 |
| `VITE_UPLOAD_TYPE` | 上传方式，当前为 `server` |
| `VITE_APP_TENANT_ENABLE` | 租户开关 |
| `VITE_APP_CAPTCHA_ENABLE` | 验证码开关 |
| `VITE_APP_API_ENCRYPT_ENABLE` | API 加解密开关 |
| `VITE_XFYUN_RTASR_SIGN_URL` | 讯飞实时转写签名接口 |
| `VITE_APP_DESKTOP` | 桌面模式标识，`.env.desktop` 为 `true` |

当前生产 API 配置为：

    VITE_BASE_URL=https://yishizhijian.jikeyun.net
    VITE_API_URL=/admin-api

如果使用同域 Nginx 代理，建议把 `VITE_BASE_URL` 设为空，只保留 `VITE_API_URL=/admin-api`。修改环境文件后必须重新构建。

不要提交以下内容：

- 讯飞 `APP_ID`、`API_KEY`、`API_SECRET` 和实时转写密钥。
- SSH 密码、SSH 私钥、服务器面板密码。
- 数据库、对象存储、API 加密私钥和管理员初始密码。

## 4. 本地启动

### 4.1 启动 Web 前端

默认开发环境：

    pnpm dev

开发后端联调环境：

    pnpm dev-server

启动后终端会显示本地地址。浏览器打开终端显示的地址，不要手工改端口。需要预览生产构建时：

    pnpm build:prod
    pnpm serve:prod

### 4.2 启动桌面应用

    pnpm desktop:dev

该命令会启动桌面 mode 的 Vite 和 Electron。桌面开发 renderer 默认使用 `127.0.0.1:48081`，API 请求由 Electron 主进程转发。

如果只想检查 renderer：

    pnpm build:desktop
    pnpm desktop:prepare

输出目录：

    dist-desktop/    Vite 桌面静态文件
    desktop-app/     Electron staging 目录

## 5. Web 构建与部署

### 5.1 构建

发布前建议依次执行：

    pnpm install --frozen-lockfile
    pnpm ts:check
    pnpm build:prod

构建成功后检查：

    test -f dist-prod/index.html
    find dist-prod/assets -type f | wc -l
    du -sh dist-prod

Windows PowerShell：

    pnpm build:prod
    Test-Path .\\dist-prod\\index.html
    Get-ChildItem .\\dist-prod\\assets -Recurse -File | Measure-Object

测试和预发布构建：

    pnpm build:test
    pnpm build:stage

不要手工编辑 `dist-prod`。修改环境、API 或基础路径后重新执行构建。

### 5.2 上传到服务器

上传 `dist-prod` **里面的内容**，不要再套一层 `dist-prod`：

    rsync -av --delete dist-prod/ deploy@server:/var/www/yishizhijian/

服务器目录应该是：

    /var/www/yishizhijian/index.html
    /var/www/yishizhijian/assets/...

### 5.3 宝塔文件管理上传

进入目标站点目录，例如 `/www/wwwroot/web`，选择“上传/下载” -> “上传文件”，把 `dist-prod` 内的全部文件和目录上传到站点根目录。

![宝塔文件管理上传 dist-prod 文件](/deployment/baota-upload-files.png)

上传完成后，站点根目录应直接看到 `index.html`、`assets`、`models`、`vendor` 等内容。图片文件来自 `public/deployment/baota-upload-files.png`，执行 `pnpm build:prod` 后会自动出现在 `dist-prod/deployment/baota-upload-files.png`。

### 5.4 Nginx 配置

根路径部署时，静态文件和 Hash 路由可以这样配置：

    server {
        listen 443 ssl http2;
        server_name admin.example.com;
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

### 5.5 Web 验收

1. `index.html` 返回 200。
2. JS、CSS、字体、图片和媒体没有 404。
3. 登录、退出、刷新和账号切换正常。
4. 请求带 `Authorization`；租户模式下带 `tenant-id`。
5. 上传、下载、导出和大文件请求正常。
6. 刷新 `#/ai-assistant`、`#/tutorial`、`#/infra/file/file` 等 Hash 路由正常。
7. Console 没有 CORS、Mixed Content、解密或资源加载错误。

## 6. Electron 打包

### 6.1 macOS

在 macOS 上执行：

    pnpm install --frozen-lockfile
    pnpm ts:check
    pnpm desktop:build -- --mac dmg zip

需要分步排查时：

    pnpm build:desktop
    pnpm desktop:prepare
    pnpm exec electron-builder --config electron-builder.yml --mac dmg zip

产物在 `release/desktop/`。当前目标为 DMG 和 ZIP。未配置签名、公证时，其他 Mac 可能被 Gatekeeper 拦截；正式发布需要 Developer ID Application 和 Apple 公证配置。

### 6.2 Windows

Mac 不负责编译 Windows 原生唤醒 helper。Windows 包使用 GitHub Actions：

1. 推送 `main`，或在 Actions 页面手动运行 workflow。
2. Windows runner 使用 Node 20 和 pnpm 9.15.5。
3. CI 安装依赖、编译 `xfyun-awake.exe`、构建 renderer、生成 NSIS x64 安装包。
4. 从 Actions 的 artifact 下载经过校验的 `*-setup.exe`。

仓库需要配置以下 GitHub Secrets：

    XFYUN_APP_ID
    XFYUN_API_KEY
    XFYUN_API_SECRET

位置：GitHub 仓库 -> Settings -> Secrets and variables -> Actions -> New repository secret。

三个值只要有一个为空，唤醒配置就不完整。下载 artifact 后检查 Actions 的 commit SHA 与准备发布的提交一致，不要把 `win-unpacked` 当成普通安装包。

### 6.3 Windows 唤醒资源

源目录：

    electron/native/xfyun-awake/runtime/

主要文件：

    xfyun-awake.exe
    xfyun-awake.ini
    xfyun-awake.ini.example
    keyword.txt
    resource/

安装包中的 helper 位于 `resources/xfyun-awake`。`xfyun-awake.ini` 不应提交到 Git，CI 负责注入凭据。唤醒阈值示例：

    [wake]
    threshold=0 0:999

不要把 `threshold` 写成单独的 `0`，否则可能出现 `AIKIT_Start failed: 100011`。

### 6.4 实时语音转写

生产环境建议由后端提供讯飞签名接口：

1. 配置 `VITE_XFYUN_RTASR_SIGN_URL`。
2. 重新执行 `pnpm build:desktop`。
3. 再执行 Electron Builder 打包。
4. 前端只取得临时 WebSocket 地址。

没有签名接口时，前端回退签名只适合本地调试。不要把 `VITE_XFYUN_RTASR_API_KEY` 编译进公开 Web 包。

### 6.5 桌面包验收

1. 卸载旧版本后安装最新安装包。
2. 允许应用使用麦克风。
3. 登录并测试手动录音转文字。
4. 测试唤醒词，确认状态变为“正在等待唤醒词”。
5. 结束录音，确认没有重复文本，唤醒监听按预期恢复。
6. 确认没有 `AIKIT_Init`、`AIKIT_Start`、`EPIPE` 或重复错误弹窗。

## 7. 检查与故障排查

发布前检查：

    node --check electron/main.cjs
    pnpm ts:check
    pnpm test:unit
    pnpm build:prod
    pnpm build:desktop
    pnpm desktop:prepare
    git diff --check

### Web 白屏或资源 404

- 检查 `index.html` 是否在站点根目录。
- 检查 `VITE_BASE_PATH` 和实际部署目录是否一致。
- 检查浏览器 Network 中第一个 404。
- 检查 Hash 路由是否回退到 `index.html`。

### API 404、跨域或 401

- 检查请求是否包含 `/admin-api`。
- 检查 Nginx `proxy_pass` 末尾斜杠。
- 检查 `Authorization`、`tenant-id` 和 `visit-tenant-id`。
- 检查后端 CORS、HTTPS 和网关路径。

### Windows 唤醒问题

- `Please fill app_id...`：检查是否安装了旧 artifact，或 GitHub Secrets 没有注入。
- `AIKIT_Start failed: 100011`：检查 `[wake]` 和 `threshold=0 0:999`。
- `AIKIT_Init failed: 18400`：检查用户数据目录权限、helper 相对路径、keyword、resource 和 DLL。
- `Error: write EPIPE`：通常是 helper 已退出但主进程仍在写入。升级完整安装包，不要只替换 renderer 文件。

### macOS 麦克风权限

系统设置 -> 隐私与安全性 -> 麦克风，允许应用后完全退出并重新打开。未签名应用可能被 Gatekeeper 拦截。
