const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { Client } = require('ssh2');

// ==================== 自动化部署配置区 ====================
const config = {
  // 腾讯云服务器公网 IP
  host: 'YOUR_SERVER_IP',
  // SSH 端口，宝塔面板默认一般是 22
  port: 22,
  // SSH 登录用户名，通常是 root
  username: 'root',
  
  // 【登录认证方式二选一】
  // 方式 A：使用密码登录，请将密码写在下方，并将 privateKeyPath 设为 null
  password: 'YOUR_SSH_PASSWORD',
  
  // 方式 B：使用 SSH 密钥对登录，请填写密钥文件绝对路径，并将 password 设为 null
  privateKeyPath: null, // 例如: path.join(require('os').homedir(), '.ssh/id_rsa')
  
  // 宝塔服务器上的网站根目录（您的 dist 目录下 index.html 应该被存放在此目录）
  // 比如：/www/wwwroot/your_site_domain
  remotePath: '/www/wwwroot/your_site_directory',
  
  // 本地打包生成的文件夹名
  localDistDir: 'dist',
  // 压缩包临时文件名
  zipName: 'dist.zip'
};
// ==========================================================

const conn = new Client();

// 终端绿色输出
function logSuccess(msg) {
  console.log(`\x1b[32m✔ ${msg}\x1b[0m`);
}

// 终端黄色输出
function logInfo(msg) {
  console.log(`\x1b[36mℹ ${msg}\x1b[0m`);
}

// 终端红色输出
function logError(msg) {
  console.log(`\x1b[31m✘ ${msg}\x1b[0m`);
}

function runCommandLocal(cmd) {
  console.log(`\x1b[90m[本地执行] ${cmd}\x1b[0m`);
  execSync(cmd, { stdio: 'inherit' });
}

async function startDeploy() {
  const localZipPath = path.join(__dirname, config.zipName);
  
  try {
    // 1. 本地打包编译
    logInfo('开始本地打包编译 (npm run build)...');
    runCommandLocal('npm run build');
    logSuccess('本地打包完成！');

    // 2. 本地压缩打包
    logInfo('开始本地压缩 dist 目录...');
    if (fs.existsSync(localZipPath)) {
      fs.unlinkSync(localZipPath);
    }
    // 进入 dist 目录内部压缩，保证解压后 index.html 在根目录而不会嵌套一层 dist/
    runCommandLocal(`cd ${config.localDistDir} && zip -r ../${config.zipName} *`);
    logSuccess('本地压缩 dist.zip 成功！');

    // 3. 连接腾讯云服务器
    logInfo(`正在连接腾讯云服务器: ${config.host}:${config.port}...`);
    const connectionConfig = {
      host: config.host,
      port: config.port,
      username: config.username,
    };

    if (config.privateKeyPath) {
      if (!fs.existsSync(config.privateKeyPath)) {
        throw new Error(`私钥文件未找到: ${config.privateKeyPath}`);
      }
      connectionConfig.privateKey = fs.readFileSync(config.privateKeyPath);
    } else {
      if (!config.password || config.password === 'YOUR_SSH_PASSWORD') {
        throw new Error('请在 deploy.js 中配置正确的密码或私钥文件路径！');
      }
      connectionConfig.password = config.password;
    }

    conn.on('ready', () => {
      logSuccess('SSH 连接服务器成功！');
      
      // 4. 上传文件
      logInfo('开始通过 SFTP 上传压缩包...');
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end();
          throw err;
        }
        
        const remoteZipPath = path.posix.join(config.remotePath, config.zipName);
        console.log(`   正在上传: ${config.zipName} => ${remoteZipPath}`);
        
        sftp.fastPut(localZipPath, remoteZipPath, {}, (uploadErr) => {
          if (uploadErr) {
            logError(`上传失败: ${uploadErr.message}`);
            conn.end();
            cleanupLocalZip(localZipPath);
            return;
          }
          logSuccess('压缩包上传服务器成功！');
          
          // 5. 远程服务器解包部署
          logInfo('正在远程服务器解压部署并清理临时文件...');
          // 宝塔服务器环境通常默认装有 unzip
          const remoteCmds = [
            `cd ${config.remotePath}`,
            `unzip -o ${config.zipName}`, // -o 强制覆盖旧文件
            `rm -f ${config.zipName}`      // 删除上传的 zip 压缩包
          ].join(' && ');
          
          logInfo(`远程执行: ${remoteCmds}`);
          conn.exec(remoteCmds, (execErr, stream) => {
            if (execErr) {
              logError(`远程命令执行失败: ${execErr.message}`);
              conn.end();
              cleanupLocalZip(localZipPath);
              return;
            }
            
            stream.on('close', (code) => {
              if (code === 0) {
                logSuccess('远程服务器解压并部署完毕！');
                cleanupLocalZip(localZipPath);
                console.log('\n\x1b[32m\x1b[1m🎉 🎉 🎉 自动化部署大功告成！项目已成功部署到宝塔服务器。 \x1b[0m\n');
              } else {
                logError(`远程部署脚本异常退出，退出码: ${code}`);
              }
              conn.end();
            }).on('data', (data) => {
              console.log(`[远程输出]: ${data}`);
            }).stderr.on('data', (data) => {
              console.log(`[远程错误]: ${data}`);
            });
          });
        });
      });
    }).on('error', (err) => {
      logError(`SSH 连接失败: ${err.message}`);
      cleanupLocalZip(localZipPath);
    }).connect(connectionConfig);

  } catch (error) {
    logError(`部署中断: ${error.message}`);
    cleanupLocalZip(localZipPath);
  }
}

function cleanupLocalZip(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    logInfo('本地临时压缩包 dist.zip 已清理。');
  }
}

startDeploy();
