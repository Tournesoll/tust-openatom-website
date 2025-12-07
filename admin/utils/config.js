/**
 * 配置管理工具
 * 负责配置文件的读取、验证和保存
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'config.json');
const CONFIG_EXAMPLE = path.join(__dirname, '..', 'config.example.json');

/**
 * 检查配置文件是否存在
 */
function configExists() {
  return fs.existsSync(CONFIG_FILE);
}

/**
 * 读取配置文件
 */
function readConfig() {
  try {
    if (!configExists()) {
      return null;
    }
    const content = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('读取配置文件失败:', error);
    return null;
  }
}

/**
 * 保存配置文件
 */
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存配置文件失败:', error);
    return false;
  }
}

/**
 * 检查配置是否完整
 */
function isConfigValid(config = null) {
  const cfg = config || readConfig();
  if (!cfg) {
    return false;
  }

  // 检查必需的配置项
  const required = [
    'github.clientId',
    'github.clientSecret',
    'github.repo',
    'server.port'
  ];

  for (const key of required) {
    const keys = key.split('.');
    let value = cfg;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined || value === null || value === '') {
        return false;
      }
    }
  }

  return true;
}

/**
 * 检查是否首次运行
 */
function isFirstRun() {
  if (!configExists()) {
    return true;
  }

  const config = readConfig();
  return !isConfigValid(config);
}

/**
 * 创建默认配置
 */
function createDefaultConfig() {
  const defaultConfig = {
    github: {
      clientId: '',
      clientSecret: '',
      repo: '',
      branch: 'main',
      owner: '',
      repoName: ''
    },
    server: {
      port: 8888,
      sessionSecret: generateSessionSecret()
    },
    paths: {
      postsDir: '../_posts',
      imagesDir: '../assets/images/uploads'
    }
  };

  // 如果存在示例文件，尝试读取
  if (fs.existsSync(CONFIG_EXAMPLE)) {
    try {
      const example = JSON.parse(fs.readFileSync(CONFIG_EXAMPLE, 'utf8'));
      return { ...defaultConfig, ...example };
    } catch (error) {
      console.error('读取示例配置失败:', error);
    }
  }

  return defaultConfig;
}

/**
 * 生成会话密钥
 */
function generateSessionSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

/**
 * 更新配置（部分更新）
 */
function updateConfig(updates) {
  const config = readConfig() || createDefaultConfig();
  
  // 深度合并
  function deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  deepMerge(config, updates);
  return saveConfig(config);
}

module.exports = {
  configExists,
  readConfig,
  saveConfig,
  isConfigValid,
  isFirstRun,
  createDefaultConfig,
  updateConfig,
  CONFIG_FILE
};


