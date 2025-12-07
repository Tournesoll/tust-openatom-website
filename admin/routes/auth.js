const express = require('express');
const axios = require('axios');
const router = express.Router();

// GitHub OAuth 授权
router.get('/github', (req, res) => {
  const { clientId } = req.config.github;
  const redirectUri = `http://localhost:${req.config.server.port}/api/auth/github/callback`;
  const scope = 'repo';
  const state = Math.random().toString(36).substring(7);
  
  req.session.oauthState = state;
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  
  res.redirect(authUrl);
});

// GitHub OAuth 回调
router.get('/github/callback', async (req, res) => {
  const { code, state } = req.query;
  const { clientId, clientSecret } = req.config.github;
  
  // 验证 state
  if (state !== req.session.oauthState) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }
  
  try {
    // 交换 access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    }, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (tokenResponse.data.error) {
      return res.status(400).json({ error: tokenResponse.data.error_description });
    }
    
    // 保存 token 到 session
    req.session.githubToken = tokenResponse.data.access_token;
    
    // 获取用户信息
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenResponse.data.access_token}`,
      },
    });
    
    req.session.githubUser = userResponse.data;
    
    res.redirect('/');
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'OAuth authentication failed' });
  }
});

// 检查登录状态
router.get('/status', (req, res) => {
  if (req.session.githubToken) {
    res.json({
      authenticated: true,
      user: req.session.githubUser,
    });
  } else {
    res.json({
      authenticated: false,
    });
  }
});

// 登出
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;



