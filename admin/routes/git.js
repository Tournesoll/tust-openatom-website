const express = require('express');
const simpleGit = require('simple-git');
const path = require('path');
const router = express.Router();

// 中间件：检查认证
function requireAuth(req, res, next) {
  if (!req.session.githubToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// 获取 Git 仓库路径（项目根目录）
const getGitRepo = () => {
  const repoPath = path.resolve(__dirname, '..', '..');
  return simpleGit(repoPath);
};

// 拉取更新
router.post('/pull', requireAuth, async (req, res) => {
  try {
    const git = getGitRepo();
    const result = await git.pull('origin', 'main');
    
    res.json({
      success: true,
      message: '拉取成功',
      result: result,
    });
  } catch (error) {
    console.error('Git pull error:', error);
    res.status(500).json({ error: '拉取失败: ' + error.message });
  }
});

// 提交并推送
router.post('/commit', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const commitMessage = message || `Update posts - ${new Date().toLocaleString()}`;
    
    const git = getGitRepo();
    
    // 添加所有更改
    await git.add('.');
    
    // 提交
    await git.commit(commitMessage);
    
    // 推送
    await git.push('origin', 'main');
    
    res.json({
      success: true,
      message: '提交并推送成功',
    });
  } catch (error) {
    console.error('Git commit error:', error);
    res.status(500).json({ error: '提交失败: ' + error.message });
  }
});

// 获取 Git 状态
router.get('/status', requireAuth, async (req, res) => {
  try {
    const git = getGitRepo();
    
    const status = await git.status();
    
    res.json({
      current: status.current,
      files: status.files,
      ahead: status.ahead,
      behind: status.behind,
    });
  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({ error: '获取状态失败: ' + error.message });
  }
});

module.exports = router;


