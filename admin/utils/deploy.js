/**
 * 部署自动化工具
 * 负责自动修改配置、Git 操作、部署到 GitHub
 */

const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_YML = path.join(PROJECT_ROOT, '_config.yml');

/**
 * 修改 _config.yml
 */
function updateJekyllConfig(config) {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(CONFIG_YML)) {
      return { 
        success: false, 
        message: `配置文件不存在: ${CONFIG_YML}` 
      };
    }
    
    let content = fs.readFileSync(CONFIG_YML, 'utf8');
    
    // 更新 baseurl
    if (config.baseurl) {
      content = content.replace(
        /baseurl:\s*["']?[^"'\n]+["']?/,
        `baseurl: "${config.baseurl}"`
      );
    }

    // 更新 url
    if (config.url) {
      content = content.replace(
        /url:\s*["']?[^"'\n]+["']?/,
        `url: "${config.url}"`
      );
    }

    // 更新 title
    if (config.title) {
      content = content.replace(
        /^title:\s*.*$/m,
        `title: ${config.title}`
      );
    }

    // 更新 description
    if (config.description) {
      content = content.replace(
        /^description:\s*.*$/m,
        `description: ${config.description}`
      );
    }

    // 更新 github_username
    if (config.github_username) {
      content = content.replace(
        /^github_username:\s*.*$/m,
        `github_username: ${config.github_username}`
      );
    }

    fs.writeFileSync(CONFIG_YML, content, 'utf8');
    return { success: true, message: '配置文件已更新' };
  } catch (error) {
    return { success: false, message: error.message || '更新配置文件失败' };
  }
}

/**
 * 初始化 Git 仓库
 */
async function initGitRepo() {
  try {
    const git = simpleGit(PROJECT_ROOT);
    
    // 检查是否已经是 Git 仓库
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
    }

    return { success: true, message: 'Git 仓库已初始化' };
  } catch (error) {
    return { success: false, message: error.message || '初始化 Git 仓库失败' };
  }
}

/**
 * 添加远程仓库
 */
async function addRemote(owner, repo) {
  try {
    const git = simpleGit(PROJECT_ROOT);
    const remoteUrl = `https://github.com/${owner}/${repo}.git`;
    
    // 检查远程仓库是否存在
    const remotes = await git.getRemotes();
    const originExists = remotes.some(r => r.name === 'origin');

    if (originExists) {
      await git.removeRemote('origin');
    }

    await git.addRemote('origin', remoteUrl);
    return { success: true, message: '远程仓库已添加' };
  } catch (error) {
    return { success: false, message: error.message || '添加远程仓库失败' };
  }
}

/**
 * 提交并推送代码
 */
async function commitAndPush(message = 'Initial commit', branch = 'main') {
  try {
    const git = simpleGit(PROJECT_ROOT);
    
    // 配置 Git 用户（如果还没有）
    try {
      await git.addConfig('user.name', 'Jekyll Admin');
      await git.addConfig('user.email', 'admin@jekyll.local');
    } catch (error) {
      // 忽略已存在的配置错误
    }

    // 添加所有文件
    await git.add('.');
    
    // 检查是否有更改
    const status = await git.status();
    if (status.files.length === 0) {
      return { success: true, message: '没有需要提交的更改', skipped: true };
    }

    // 提交
    await git.commit(message);
    
    // 推送（如果远程仓库存在）
    // 注意：推送需要 GitHub Token 认证，但这里没有传递 Token
    // 首次部署时，用户需要手动配置 Git 凭据或使用 Token
    try {
      await git.push('origin', branch, ['--set-upstream']);
      return { success: true, message: '代码已推送到 GitHub' };
    } catch (error) {
      // 如果推送失败，可能是认证问题
      const errorMsg = error.message || error.toString();
      
      // 检查是否是认证错误
      if (errorMsg.includes('Authentication') || 
          errorMsg.includes('permission') || 
          errorMsg.includes('denied') ||
          errorMsg.includes('401') ||
          errorMsg.includes('403')) {
        return { 
          success: false, 
          message: '推送失败：需要 GitHub 认证',
          suggestion: '请配置 Git 凭据或使用 GitHub Token。可以在命令行运行: git config --global credential.helper store，然后手动推送一次以保存凭据。',
          needsAuth: true
        };
      }
      
      // 尝试强制推送（首次部署）
      try {
        await git.push('origin', branch, ['--force']);
        return { success: true, message: '代码已推送到 GitHub' };
      } catch (forceError) {
        const forceErrorMsg = forceError.message || forceError.toString();
        return { 
          success: false, 
          message: `推送失败: ${forceErrorMsg}`,
          suggestion: '请检查是否有推送权限，或手动推送代码到 GitHub'
        };
      }
    }
  } catch (error) {
    const errorMsg = error.message || error.toString();
    return { 
      success: false, 
      message: `提交或推送失败: ${errorMsg}` 
    };
  }
}

/**
 * 完整的部署流程
 */
async function deploy(config, progressCallback) {
  const steps = [];
  
  try {
    // 步骤 1: 更新 Jekyll 配置
    if (progressCallback) progressCallback('正在更新网站配置...', 1, 6);
    const configResult = updateJekyllConfig({
      baseurl: `/${config.repoName}`,
      url: `https://${config.owner}.github.io`,
      title: config.title || '我的博客',
      description: config.description || '使用 Jekyll 构建的博客网站',
      github_username: config.owner
    });
    steps.push({ step: '更新配置', ...configResult });
    if (!configResult.success) {
      throw new Error(configResult.message);
    }

    // 步骤 2: 初始化 Git
    if (progressCallback) progressCallback('正在初始化 Git 仓库...', 2, 6);
    const gitInitResult = await initGitRepo();
    steps.push({ step: '初始化 Git', ...gitInitResult });
    if (!gitInitResult.success) {
      throw new Error(gitInitResult.message);
    }

    // 步骤 3: 添加远程仓库
    if (progressCallback) progressCallback('正在配置远程仓库...', 3, 6);
    const remoteResult = await addRemote(config.owner, config.repoName);
    steps.push({ step: '添加远程仓库', ...remoteResult });
    if (!remoteResult.success) {
      throw new Error(remoteResult.message);
    }

    // 步骤 4: 提交代码
    if (progressCallback) progressCallback('正在提交代码...', 4, 6);
    const commitResult = await commitAndPush('Initial setup via Jekyll Admin', 'main');
    steps.push({ step: '提交代码', ...commitResult });
    
    // 提交失败不影响整体流程（可能是没有更改）
    if (!commitResult.success && !commitResult.skipped) {
      steps.push({ 
        step: '提交代码', 
        success: false, 
        message: commitResult.message,
        warning: true 
      });
    }

    // 步骤 5: 生成部署说明
    if (progressCallback) progressCallback('部署完成！', 6, 6);
    const siteUrl = `https://${config.owner}.github.io/${config.repoName}/`;
    
    return {
      success: true,
      message: '部署成功',
      steps,
      siteUrl,
      pagesUrl: `https://github.com/${config.owner}/${config.repoName}/settings/pages`
    };
  } catch (error) {
    const errorMsg = error.message || error.toString();
    console.error('部署错误:', errorMsg);
    console.error('错误堆栈:', error.stack);
    
    return {
      success: false,
      message: errorMsg || '部署失败',
      steps,
      error: errorMsg
    };
  }
}

module.exports = {
  updateJekyllConfig,
  initGitRepo,
  addRemote,
  commitAndPush,
  deploy
};


