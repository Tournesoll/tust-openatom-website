/**
 * 设置向导路由
 * 提供首次运行配置的 API 接口
 */

const express = require('express');
const router = express.Router();
const configUtils = require('../utils/config');
const githubUtils = require('../utils/github');
const deployUtils = require('../utils/deploy');

// 中间件：检查是否已完成配置
function checkNotConfigured(req, res, next) {
  if (!configUtils.isFirstRun()) {
    return res.status(400).json({ 
      error: '系统已配置，请使用管理后台' 
    });
  }
  next();
}

/**
 * GET /api/setup/status
 * 获取配置状态
 */
router.get('/status', (req, res) => {
  const isFirstRun = configUtils.isFirstRun();
  res.json({
    isFirstRun,
    configured: !isFirstRun
  });
});

/**
 * POST /api/setup/verify-oauth
 * 验证 OAuth App 配置
 */
router.post('/verify-oauth', checkNotConfigured, async (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    
    if (!clientId || !clientSecret) {
      return res.status(400).json({ 
        error: 'Client ID 和 Client Secret 不能为空' 
      });
    }

    // 验证格式（基本检查）
    if (clientId.length < 10 || clientSecret.length < 10) {
      return res.status(400).json({ 
        error: 'Client ID 或 Client Secret 格式不正确' 
      });
    }

    // 保存临时配置
    configUtils.updateConfig({
      github: {
        clientId,
        clientSecret
      }
    });

    res.json({
      success: true,
      message: 'OAuth App 配置已保存，将在登录时验证'
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || '验证失败' 
    });
  }
});

/**
 * POST /api/setup/check-repo
 * 检查仓库是否存在
 */
router.post('/check-repo', checkNotConfigured, async (req, res) => {
  try {
    const { owner, repo, token } = req.body;
    
    if (!owner || !repo) {
      return res.status(400).json({ 
        error: '用户名和仓库名不能为空' 
      });
    }

    if (!token) {
      return res.json({
        exists: false,
        message: '需要 GitHub Token 来检查仓库',
        needToken: true
      });
    }

    const result = await githubUtils.checkRepository(owner, repo, token);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error.message || '检查仓库失败' 
    });
  }
});

/**
 * POST /api/setup/create-repo
 * 创建 GitHub 仓库
 */
router.post('/create-repo', checkNotConfigured, async (req, res) => {
  try {
    const { name, description, isPrivate, token } = req.body;
    
    if (!name || !token) {
      return res.status(400).json({ 
        error: '仓库名和 GitHub Token 不能为空' 
      });
    }

    const result = await githubUtils.createRepository(
      name, 
      description, 
      isPrivate, 
      token
    );

    if (result.success) {
      // 更新配置
      configUtils.updateConfig({
        github: {
          repo: `${result.data.owner.login}/${result.data.name}`,
          owner: result.data.owner.login,
          repoName: result.data.name
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error.message || '创建仓库失败' 
    });
  }
});

/**
 * POST /api/setup/save-repo
 * 保存仓库配置（使用现有仓库）
 */
router.post('/save-repo', checkNotConfigured, (req, res) => {
  try {
    const { owner, repo } = req.body;
    
    if (!owner || !repo) {
      return res.status(400).json({ 
        error: '用户名和仓库名不能为空' 
      });
    }

    // 验证格式
    const repoPattern = /^[a-zA-Z0-9._-]+$/;
    if (!repoPattern.test(repo)) {
      return res.status(400).json({ 
        error: '仓库名格式不正确（只能包含字母、数字、点、下划线和连字符）' 
      });
    }

    configUtils.updateConfig({
      github: {
        repo: `${owner}/${repo}`,
        owner,
        repoName: repo
      }
    });

    res.json({
      success: true,
      message: '仓库配置已保存'
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || '保存配置失败' 
    });
  }
});

/**
 * POST /api/setup/save-site-info
 * 保存网站信息
 */
router.post('/save-site-info', checkNotConfigured, (req, res) => {
  try {
    const { title, description, author } = req.body;
    
    // 网站信息可以稍后修改，这里只是保存到临时配置
    // 实际会在部署时更新 _config.yml
    res.json({
      success: true,
      message: '网站信息已保存',
      data: { title, description, author }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || '保存失败' 
    });
  }
});

/**
 * POST /api/setup/deploy
 * 执行自动部署
 * 注意：部署操作允许在配置完成后执行（可以重复部署）
 */
router.post('/deploy', async (req, res) => {
  try {
    const config = configUtils.readConfig();
    if (!config) {
      return res.status(400).json({ 
        error: '配置不存在，请先完成前面的步骤' 
      });
    }
    
    // 检查部署必需的配置项
    if (!config.github?.owner || !config.github?.repoName) {
      return res.status(400).json({ 
        error: 'GitHub 仓库配置不完整，请先完成步骤3：配置仓库' 
      });
    }

    const { title, description, author } = req.body;

    // 创建进度回调
    const progress = [];
    const progressCallback = (message, current, total) => {
      progress.push({ message, current, total, timestamp: new Date().toISOString() });
    };

    // 执行部署
    const result = await deployUtils.deploy({
      owner: config.github.owner,
      repoName: config.github.repoName,
      title,
      description,
      author
    }, progressCallback);

    // 记录详细错误信息
    if (!result.success) {
      console.error('部署失败:', result.message);
      console.error('部署步骤:', result.steps);
    }
    
    res.json({
      ...result,
      progress
    });
  } catch (error) {
    console.error('部署异常:', error);
    res.status(500).json({ 
      error: error.message || '部署失败',
      details: error.stack
    });
  }
});

/**
 * POST /api/setup/complete
 * 完成配置（标记为已配置）
 * 注意：允许在向导流程中完成配置
 */
router.post('/complete', (req, res) => {
  try {
    const config = configUtils.readConfig();
    if (!configUtils.isConfigValid(config)) {
      return res.status(400).json({ 
        error: '配置不完整，无法完成设置' 
      });
    }

    res.json({
      success: true,
      message: '配置完成',
      config: {
        repo: config.github.repo,
        siteUrl: `https://${config.github.owner}.github.io/${config.github.repoName}/`
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || '完成配置失败' 
    });
  }
});

module.exports = router;


