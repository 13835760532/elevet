'use strict'

const { cp, mkdir, rm } = require('node:fs/promises')
const { join, resolve } = require('node:path')

const root = resolve(__dirname, '..')
const stagingRoot = join(root, 'desktop-app')

/**
 * 将前端构建产物和最小 Electron 运行文件复制到隔离的打包目录。
 *
 * Electron Builder 会根据 lockfile 判断包管理器。现有项目根目录的 workspace 配置不完整，
 * 因而不能直接作为 app 目录；该暂存目录没有业务依赖，也不会包含开发期 node_modules。
 */
const prepare = async () => {
  await rm(stagingRoot, { recursive: true, force: true })
  await mkdir(join(stagingRoot, 'electron'), { recursive: true })

  await Promise.all([
    cp(join(root, 'dist-desktop'), join(stagingRoot, 'dist-desktop'), { recursive: true }),
    cp(join(__dirname, 'main.cjs'), join(stagingRoot, 'electron', 'main.cjs')),
    cp(join(__dirname, 'preload.cjs'), join(stagingRoot, 'electron', 'preload.cjs')),
    cp(join(__dirname, 'staging.package.json'), join(stagingRoot, 'package.json')),
    cp(join(__dirname, 'staging.package-lock.json'), join(stagingRoot, 'package-lock.json'))
  ])
}

prepare().catch((error) => {
  console.error('准备桌面端打包目录失败:', error)
  process.exitCode = 1
})
