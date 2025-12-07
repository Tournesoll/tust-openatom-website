/**
 * GitHub API 封装
 * 提供 GitHub API 调用的统一接口
 */

const axios = require('axios');

/**
 * 验证 OAuth App 配置
 */
async function verifyOAuthApp(clientId, clientSecret) {
  try {
    // 尝试使用 client credentials 验证（如果支持）
    // 或者返回一个测试 URL 让用户授权
    return {
      success: true,
      message: 'OAuth App 配置已保存，将在首次登录时验证'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '验证失败'
    };
  }
}

/**
 * 检查仓库是否存在
 */
async function checkRepository(owner, repo, token) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    return {
      exists: true,
      data: response.data,
      message: '仓库存在'
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        exists: false,
        message: '仓库不存在'
      };
    }
    throw error;
  }
}

/**
 * 创建 GitHub 仓库
 */
async function createRepository(name, description, isPrivate, token) {
  try {
    const response = await axios.post(
      'https://api.github.com/user/repos',
      {
        name,
        description: description || 'Jekyll 博客网站',
        private: isPrivate || false,
        auto_init: false
      },
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    return {
      success: true,
      data: response.data,
      message: '仓库创建成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || '创建仓库失败'
    };
  }
}

/**
 * 启用 GitHub Pages
 */
async function enablePages(owner, repo, token) {
  try {
    // GitHub Pages 通过仓库设置启用，这里只是检查状态
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pages`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    return {
      success: true,
      enabled: true,
      url: response.data.html_url,
      message: 'GitHub Pages 已启用'
    };
  } catch (error) {
    if (error.response?.status === 404) {
      // Pages 未启用，需要用户在 GitHub 上手动启用
      return {
        success: false,
        enabled: false,
        message: 'GitHub Pages 未启用，请在仓库 Settings → Pages 中启用'
      };
    }
    throw error;
  }
}

/**
 * 获取用户信息
 */
async function getUserInfo(token) {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '获取用户信息失败'
    };
  }
}

/**
 * 测试 GitHub Token
 */
async function testToken(token) {
  try {
    const userInfo = await getUserInfo(token);
    if (userInfo.success) {
      return {
        success: true,
        user: userInfo.data,
        message: 'Token 有效'
      };
    }
    return {
      success: false,
      message: 'Token 无效或已过期'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Token 验证失败'
    };
  }
}

module.exports = {
  verifyOAuthApp,
  checkRepository,
  createRepository,
  enablePages,
  getUserInfo,
  testToken
};


