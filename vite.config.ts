import {resolve} from 'path'
import type {ConfigEnv, UserConfig} from 'vite'
import {loadEnv} from 'vite'
import {createVitePlugins} from './build/vite'
import {exclude, include} from "./build/vite/optimize"
import eslintPlugin from 'vite-plugin-eslint'
// 当前执行node命令时文件夹的地址(工作目录)
const root = process.cwd()

// 路径查找
function pathResolve(dir: string) {
    return resolve(root, '.', dir)
}

// https://vitejs.dev/config/
export default ({command, mode}: ConfigEnv): UserConfig => {
    let env = {} as any
    const isBuild = command === 'build'
    if (!isBuild) {
        env = loadEnv((process.argv[3] === '--mode' ? process.argv[4] : process.argv[3]), root)
    } else {
        env = loadEnv(mode, root)
    }
    return {
        base: env.VITE_BASE_PATH,
        root: root,
        // 服务端渲染
        server: {
            port: 48080, // 端口号
            host: "0.0.0.0",
            open: env.VITE_OPEN === 'true',
            proxy: {
              '/__geo_proxy': {
                target: 'https://yishizhijian.jikeyun.net',
                ws: false,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/__geo_proxy/, '')
              }
            },
        },
        // 项目使用的vite插件。 单独提取到build/vite/plugin中管理
        plugins: [...createVitePlugins(), eslintPlugin({
      // 添加下面这些配置，防止终端崩溃
      failOnError: false,
      failOnWarning: false,
      emitWarning: true,
      emitError: true
    })],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "@/styles/variables.scss" as *;',
                    javascriptEnabled: true,
                    silenceDeprecations: ["legacy-js-api"], // 参考自 https://stackoverflow.com/questions/78997907/the-legacy-js-api-is-deprecated-and-will-be-removed-in-dart-sass-2-0-0
                }
            }
        },
        resolve: {
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss', '.css'],
            alias: [
                {
                    find: 'vue-i18n',
                    replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
                },
                {
                    find: /\@\//,
                    replacement: `${pathResolve('src')}/`
                }
            ]
        },
        build: {
            minify: 'terser',
            outDir: env.VITE_OUT_DIR || 'dist',
            sourcemap: env.VITE_SOURCEMAP === 'true' ? 'inline' : false,
            // brotliSize: false,
            terserOptions: {
                compress: {
                    drop_debugger: env.VITE_DROP_DEBUGGER === 'true',
                    drop_console: env.VITE_DROP_CONSOLE === 'true'
                }
            },
            rollupOptions: {
                output: {
                    chunkFileNames: 'assets/js/[name]-[hash].js', // 将 chunk 文件放入 js 文件夹
                    entryFileNames: 'assets/js/[name]-[hash].js', // 将入口文件放入 js 文件夹
                    assetFileNames: (assetInfo) => {
                        const name = assetInfo.name || ''
                        if (name.endsWith('.css')) {
                            return 'assets/css/[name]-[hash][extname]' // css 文件
                        }
                        const imgExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico']
                        if (imgExts.some(ext => name.toLowerCase().endsWith(ext))) {
                            return 'assets/images/[name]-[hash][extname]' // 图片文件
                        }
                        const fontExts = ['.woff2', '.woff', '.ttf', '.eot', '.otf']
                        if (fontExts.some(ext => name.toLowerCase().endsWith(ext))) {
                            return 'assets/fonts/[name]-[hash][extname]' // 字体文件
                        }
                        const mediaExts = ['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.flac', '.aac']
                        if (mediaExts.some(ext => name.toLowerCase().endsWith(ext))) {
                            return 'assets/media/[name]-[hash][extname]' // 媒体视频/音频文件
                        }
                        return 'assets/others/[name]-[hash][extname]' // 其余资产
                    },
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('element-plus')) return 'element-plus';
                            if (id.includes('echarts') || id.includes('zrender')) return 'echarts';
                            if (id.includes('@form-create')) return 'form-create';
                            if (id.includes('wangeditor')) return 'wangeditor';
                            if (id.includes('@videojs-player/vue') || id.includes('video.js')) return 'videojs';
                            if (id.includes('maptalks')) return 'maptalks';
                            if (id.includes('lodash-es')) return 'lodash';
                            return 'vendor';
                        }
                        // 处理大型地图 JSON
                        if (id.includes('assets/map/json')) {
                            return 'map-data';
                        }
                    }
                },
            },
        },
        optimizeDeps: {include, exclude}
    }
}
