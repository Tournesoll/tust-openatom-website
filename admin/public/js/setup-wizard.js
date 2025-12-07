/**
 * 设置向导前端逻辑
 * 处理步骤切换、表单验证、API 调用等
 */

const API_BASE = '/api/setup';

// 状态管理
let currentStep = 1;
const totalSteps = 6;
let wizardData = {
  oauth: {},
  repo: {},
  site: {}
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initWizard();
  setupEventListeners();
});

/**
 * 初始化向导
 */
function initWizard() {
  updateProgress();
  showStep(1);
}

/**
 * 设置事件监听
 */
function setupEventListeners() {
  // 导航按钮
  document.getElementById('prev-btn').addEventListener('click', prevStep);
  document.getElementById('next-btn').addEventListener('click', nextStep);

  // 步骤 2: OAuth 验证
  document.getElementById('verify-oauth-btn').addEventListener('click', verifyOAuth);
  document.getElementById('toggle-tutorial').addEventListener('click', toggleTutorial);

  // 步骤 3: 仓库操作
  document.getElementById('check-repo-btn').addEventListener('click', checkRepository);
  document.getElementById('create-repo-btn').addEventListener('click', createRepository);
  document.getElementById('github-username').addEventListener('input', onRepoInputChange);
  document.getElementById('github-repo').addEventListener('input', onRepoInputChange);

  // 步骤 5: 部署
  document.getElementById('start-deploy-btn').addEventListener('click', startDeploy);

  // 步骤 6: 完成
  document.getElementById('start-using-btn').addEventListener('click', () => {
    window.location.href = '/';
  });
}

/**
 * 显示步骤
 */
function showStep(step) {
  // 隐藏所有步骤
  document.querySelectorAll('.wizard-step').forEach(s => {
    s.classList.remove('active');
  });

  // 显示当前步骤
  const stepElement = document.querySelector(`[data-step="${step}"]`);
  if (stepElement) {
    stepElement.classList.add('active');
  }

  currentStep = step;
  updateProgress();
  updateNavigation();
}

/**
 * 更新进度条
 */
function updateProgress() {
  const percentage = (currentStep / totalSteps) * 100;
  document.getElementById('progress-fill').style.width = `${percentage}%`;
  document.getElementById('current-step').textContent = currentStep;
  document.getElementById('total-steps').textContent = totalSteps;
}

/**
 * 更新导航按钮状态
 */
function updateNavigation() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  prevBtn.disabled = currentStep === 1;
  
  // 根据步骤决定下一步按钮文本
  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
  } else {
    nextBtn.style.display = 'inline-flex';
    nextBtn.innerHTML = currentStep === totalSteps - 1 
      ? '<i class="fas fa-check"></i> 完成' 
      : '下一步 <i class="fas fa-arrow-right"></i>';
  }
}

/**
 * 上一步
 */
function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

/**
 * 下一步
 */
function nextStep() {
  // 验证当前步骤
  if (!validateCurrentStep()) {
    return;
  }

  // 保存当前步骤数据
  saveCurrentStepData();

  if (currentStep < totalSteps) {
    showStep(currentStep + 1);
  }
}

/**
 * 验证当前步骤
 */
function validateCurrentStep() {
  switch (currentStep) {
    case 2:
      return validateOAuthStep();
    case 3:
      return validateRepoStep();
    case 4:
      return validateSiteStep();
    default:
      return true;
  }
}

/**
 * 保存当前步骤数据
 */
function saveCurrentStepData() {
  switch (currentStep) {
    case 2:
      wizardData.oauth = {
        clientId: document.getElementById('oauth-client-id').value,
        clientSecret: document.getElementById('oauth-client-secret').value
      };
      break;
    case 3:
      wizardData.repo = {
        owner: document.getElementById('github-username').value,
        repo: document.getElementById('github-repo').value,
        token: document.getElementById('github-token')?.value || ''
      };
      break;
    case 4:
      wizardData.site = {
        title: document.getElementById('site-title').value,
        description: document.getElementById('site-description').value,
        author: document.getElementById('site-author').value
      };
      break;
  }
}

/**
 * 验证 OAuth 步骤
 */
function validateOAuthStep() {
  const clientId = document.getElementById('oauth-client-id').value.trim();
  const clientSecret = document.getElementById('oauth-client-secret').value.trim();

  if (!clientId || !clientSecret) {
    showStatus('oauth-status', '请填写 Client ID 和 Client Secret', 'error');
    return false;
  }

  if (clientId.length < 10 || clientSecret.length < 10) {
    showStatus('oauth-status', 'Client ID 或 Client Secret 格式不正确', 'error');
    return false;
  }

  return true;
}

/**
 * 验证仓库步骤
 */
function validateRepoStep() {
  const owner = document.getElementById('github-username').value.trim();
  const repo = document.getElementById('github-repo').value.trim();

  if (!owner || !repo) {
    showStatus('repo-status', '请填写 GitHub 用户名和仓库名', 'error');
    return false;
  }

  const repoPattern = /^[a-zA-Z0-9._-]+$/;
  if (!repoPattern.test(repo)) {
    showStatus('repo-status', '仓库名格式不正确', 'error');
    return false;
  }

  return true;
}

/**
 * 验证网站信息步骤
 */
function validateSiteStep() {
  const title = document.getElementById('site-title').value.trim();
  if (!title) {
    showStatus('site-status', '请填写网站标题', 'error');
    return false;
  }
  return true;
}

/**
 * 验证 OAuth App
 */
async function verifyOAuth() {
  const clientId = document.getElementById('oauth-client-id').value.trim();
  const clientSecret = document.getElementById('oauth-client-secret').value.trim();

  if (!clientId || !clientSecret) {
    showStatus('oauth-status', '请填写 Client ID 和 Client Secret', 'error');
    return;
  }

  const btn = document.getElementById('verify-oauth-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 验证中...';

  try {
    const response = await fetch(`${API_BASE}/verify-oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret })
    });

    const data = await response.json();

    if (data.success || response.ok) {
      showStatus('oauth-status', 'OAuth App 配置已保存', 'success');
      wizardData.oauth = { clientId, clientSecret };
      // 自动进入下一步
      setTimeout(() => nextStep(), 1000);
    } else {
      showStatus('oauth-status', data.error || '验证失败', 'error');
    }
  } catch (error) {
    showStatus('oauth-status', '网络错误，请检查连接', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> 验证并保存';
  }
}

/**
 * 切换教程显示
 */
function toggleTutorial() {
  const content = document.getElementById('tutorial-content');
  const btn = document.getElementById('toggle-tutorial');
  const icon = btn.querySelector('i');

  if (content.classList.contains('show')) {
    content.classList.remove('show');
    icon.className = 'fas fa-chevron-down';
  } else {
    content.classList.add('show');
    icon.className = 'fas fa-chevron-up';
  }
}

/**
 * 检查仓库
 */
async function checkRepository() {
  const owner = document.getElementById('github-username').value.trim();
  const repo = document.getElementById('github-repo').value.trim();
  const token = document.getElementById('github-token')?.value.trim() || '';

  if (!owner || !repo) {
    showStatus('repo-status', '请先填写用户名和仓库名', 'error');
    return;
  }

  if (!token) {
    document.getElementById('repo-info').style.display = 'block';
    showStatus('repo-status', '需要 GitHub Token 来检查仓库', 'info');
    return;
  }

  const btn = document.getElementById('check-repo-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 检查中...';

  try {
    const response = await fetch(`${API_BASE}/check-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, repo, token })
    });

    const data = await response.json();

    if (data.exists) {
      showStatus('repo-status', '仓库存在，可以使用', 'success');
      // 保存仓库配置
      await saveRepoConfig(owner, repo);
      document.getElementById('create-repo-btn').style.display = 'none';
    } else {
      showStatus('repo-status', '仓库不存在，可以创建新仓库', 'info');
      document.getElementById('create-repo-btn').style.display = 'inline-flex';
    }
  } catch (error) {
    showStatus('repo-status', '检查失败：' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search"></i> 检查仓库';
  }
}

/**
 * 创建仓库
 */
async function createRepository() {
  const owner = document.getElementById('github-username').value.trim();
  const repo = document.getElementById('github-repo').value.trim();
  const token = document.getElementById('github-token')?.value.trim() || '';

  if (!owner || !repo) {
    showStatus('repo-status', '请先填写用户名和仓库名', 'error');
    return;
  }

  if (!token) {
    showStatus('repo-status', '需要 GitHub Token 来创建仓库', 'error');
    return;
  }

  const btn = document.getElementById('create-repo-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 创建中...';

  try {
    const response = await fetch(`${API_BASE}/create-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: repo, 
        description: 'Jekyll 博客网站',
        isPrivate: false,
        token 
      })
    });

    const data = await response.json();

    if (data.success) {
      showStatus('repo-status', '仓库创建成功！', 'success');
      await saveRepoConfig(owner, repo);
    } else {
      showStatus('repo-status', data.message || '创建失败', 'error');
    }
  } catch (error) {
    showStatus('repo-status', '创建失败：' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus"></i> 创建仓库';
  }
}

/**
 * 保存仓库配置
 */
async function saveRepoConfig(owner, repo) {
  try {
    const response = await fetch(`${API_BASE}/save-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, repo })
    });

    const data = await response.json();
    if (data.success) {
      wizardData.repo = { owner, repo };
    }
  } catch (error) {
    console.error('保存仓库配置失败:', error);
  }
}

/**
 * 仓库输入变化
 */
function onRepoInputChange() {
  document.getElementById('repo-status').classList.remove('show');
  document.getElementById('create-repo-btn').style.display = 'none';
}

/**
 * 开始部署
 */
async function startDeploy() {
  const btn = document.getElementById('start-deploy-btn');
  const progress = document.getElementById('deploy-progress');
  const log = document.getElementById('deploy-log');
  const progressFill = document.getElementById('deploy-progress-fill');

  btn.disabled = true;
  btn.style.display = 'none';
  progress.style.display = 'block';
  log.classList.add('show');
  log.innerHTML = '';

  // 保存网站信息
  const siteInfo = {
    title: document.getElementById('site-title').value,
    description: document.getElementById('site-description').value,
    author: document.getElementById('site-author').value
  };

  try {
    const response = await fetch(`${API_BASE}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteInfo)
    });

    const data = await response.json();

    if (data.progress) {
      data.progress.forEach((item, index) => {
        setTimeout(() => {
          addLog(item.message, item.success !== false ? 'success' : 'error');
          const percentage = ((index + 1) / data.progress.length) * 100;
          progressFill.style.width = `${percentage}%`;
          document.getElementById('deploy-message').textContent = item.message;
        }, index * 500);
      });
    }

    if (data.success) {
      setTimeout(() => {
        document.getElementById('deploy-message').textContent = '部署完成！';
        progressFill.style.width = '100%';
        
        // 显示网站地址
        if (data.siteUrl) {
          document.getElementById('site-url').textContent = data.siteUrl;
          document.getElementById('site-url-link').href = data.siteUrl;
        }

        // 进入下一步
        setTimeout(() => {
          showStep(6);
        }, 1000);
      }, data.progress ? data.progress.length * 500 : 1000);
    } else {
      const errorMsg = data.message || data.error || '部署失败';
      addLog(errorMsg, 'error');
      
      // 显示详细错误信息
      if (data.suggestion) {
        addLog('提示: ' + data.suggestion, 'warning');
      }
      
      // 如果是认证问题，显示特殊提示
      if (data.needsAuth) {
        addLog('解决方案: 需要配置 GitHub 认证', 'warning');
        addLog('方法1: 在命令行运行: git config --global credential.helper store', 'info');
        addLog('方法2: 手动推送代码到 GitHub', 'info');
      }
      
      btn.disabled = false;
      btn.style.display = 'inline-flex';
    }
  } catch (error) {
    addLog('部署失败：' + error.message, 'error');
    btn.disabled = false;
    btn.style.display = 'inline-flex';
  }
}

/**
 * 添加日志
 */
function addLog(message, type = 'info') {
  const log = document.getElementById('deploy-log');
  const item = document.createElement('div');
  item.className = `log-item ${type}`;
  item.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
  
  // 如果是错误，也在控制台输出
  if (type === 'error' || type === 'warning') {
    console.error(`[部署] ${message}`);
  }
}

/**
 * 显示状态消息
 */
function showStatus(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `status-message ${type} show`;
  
  // 3秒后自动隐藏（成功消息）
  if (type === 'success') {
    setTimeout(() => {
      element.classList.remove('show');
    }, 3000);
  }
}


