// API 基础 URL
const API_BASE = '/api';

// 状态管理
let currentUser = null;
let currentPost = null;
let posts = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// 检查认证状态
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE}/auth/status`);
    const data = await response.json();
    
    if (data.authenticated) {
      currentUser = data.user;
      showMainScreen();
      loadPosts();
    } else {
      showLoginScreen();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    showLoginScreen();
  }
}

// 显示登录界面
function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('main-screen').classList.add('hidden');
}

// 显示主界面
function showMainScreen() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  
  if (currentUser) {
    document.getElementById('user-info').textContent = `欢迎，${currentUser.login}`;
  }
}

// 设置事件监听
function setupEventListeners() {
  // 登录按钮
  document.getElementById('login-btn').addEventListener('click', () => {
    window.location.href = `${API_BASE}/auth/github`;
  });
  
  // 登出按钮
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    currentUser = null;
    showLoginScreen();
  });
  
  // 新建文章按钮
  document.getElementById('new-post-btn').addEventListener('click', () => {
    openEditModal();
  });
  
  // 拉取更新按钮
  document.getElementById('pull-btn').addEventListener('click', async () => {
    await pullUpdates();
  });
  
  // 表单提交
  document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await savePost();
  });
  
  // 保存并推送按钮
  document.getElementById('save-and-push-btn').addEventListener('click', async () => {
    await savePost(true);
  });
  
  // 实时预览
  document.getElementById('post-body').addEventListener('input', updatePreview);
}

// 加载文章列表
async function loadPosts() {
  try {
    const response = await fetch(`${API_BASE}/posts`);
    posts = await response.json();
    renderPosts();
  } catch (error) {
    console.error('Load posts error:', error);
    document.getElementById('posts-list').innerHTML = '<div class="loading">加载失败</div>';
  }
}

// 渲染文章列表
function renderPosts() {
  const container = document.getElementById('posts-list');
  
  if (posts.length === 0) {
    container.innerHTML = '<div class="loading">暂无文章</div>';
    return;
  }
  
  container.innerHTML = posts.map(post => `
    <div class="post-item">
      <div class="post-info">
        <h3>${post.title}</h3>
        <div class="post-meta">
          ${post.date} | ${post.categories.join(', ')} | ${post.tags.join(', ')}
        </div>
      </div>
      <div class="post-actions">
        <button class="btn btn-secondary" onclick="editPost('${post.filename}')">编辑</button>
        <button class="btn btn-danger" onclick="deletePost('${post.filename}')">删除</button>
      </div>
    </div>
  `).join('');
}

// 打开编辑模态框
function openEditModal(post = null) {
  currentPost = post;
  const modal = document.getElementById('edit-modal');
  const title = document.getElementById('modal-title');
  
  if (post) {
    title.textContent = '编辑文章';
    loadPostData(post);
  } else {
    title.textContent = '新建文章';
    resetForm();
  }
  
  modal.classList.remove('hidden');
}

// 加载文章数据
async function loadPostData(filename) {
  try {
    const response = await fetch(`${API_BASE}/posts/${filename}`);
    const post = await response.json();
    
    document.getElementById('post-title').value = post.frontMatter.title || '';
    document.getElementById('post-date').value = post.frontMatter.date ? new Date(post.frontMatter.date).toISOString().slice(0, 16) : '';
    document.getElementById('post-categories').value = Array.isArray(post.frontMatter.categories) ? post.frontMatter.categories[0] : post.frontMatter.categories || 'frontend';
    document.getElementById('post-tags').value = Array.isArray(post.frontMatter.tags) ? post.frontMatter.tags.join(', ') : post.frontMatter.tags || '';
    document.getElementById('post-author').value = post.frontMatter.author || '技术社团';
    document.getElementById('post-layout').value = post.frontMatter.layout || 'post';
    document.getElementById('post-excerpt').value = post.frontMatter.excerpt || '';
    document.getElementById('post-body').value = post.body || '';
    
    updatePreview();
  } catch (error) {
    console.error('Load post error:', error);
    alert('加载文章失败');
  }
}

// 重置表单
function resetForm() {
  document.getElementById('post-form').reset();
  document.getElementById('post-date').value = new Date().toISOString().slice(0, 16);
  document.getElementById('post-author').value = '技术社团';
  document.getElementById('post-layout').value = 'post';
  document.getElementById('post-body').value = '';
  updatePreview();
}

// 更新预览
function updatePreview() {
  const body = document.getElementById('post-body').value;
  const preview = document.getElementById('preview');
  
  // 简单的 Markdown 预览（可以集成 marked 库）
  preview.innerHTML = body
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br>');
}

// 保存文章
async function savePost(push = false) {
  try {
    const formData = {
      title: document.getElementById('post-title').value,
      date: document.getElementById('post-date').value,
      categories: document.getElementById('post-categories').value,
      tags: document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(t => t),
      author: document.getElementById('post-author').value,
      layout: document.getElementById('post-layout').value,
      excerpt: document.getElementById('post-excerpt').value,
      body: document.getElementById('post-body').value,
    };
    
    let response;
    if (currentPost) {
      // 更新
      response = await fetch(`${API_BASE}/posts/${currentPost}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      // 创建
      response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }
    
    const result = await response.json();
    
    if (result.success) {
      alert('保存成功！');
      closeModal();
      await loadPosts();
      
      if (push) {
        await commitAndPush('更新文章');
      }
    } else {
      alert('保存失败：' + result.error);
    }
  } catch (error) {
    console.error('Save post error:', error);
    alert('保存失败');
  }
}

// 编辑文章
async function editPost(filename) {
  openEditModal(filename);
}

// 删除文章
async function deletePost(filename) {
  if (!confirm('确定要删除这篇文章吗？')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/posts/${filename}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('删除成功！');
      await loadPosts();
      await commitAndPush('删除文章');
    } else {
      alert('删除失败：' + result.error);
    }
  } catch (error) {
    console.error('Delete post error:', error);
    alert('删除失败');
  }
}

// 关闭模态框
function closeModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  currentPost = null;
}

// 拉取更新
async function pullUpdates() {
  try {
    const response = await fetch(`${API_BASE}/git/pull`, {
      method: 'POST',
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('拉取成功！');
      await loadPosts();
    } else {
      alert('拉取失败：' + result.error);
    }
  } catch (error) {
    console.error('Pull error:', error);
    alert('拉取失败');
  }
}

// 提交并推送
async function commitAndPush(message) {
  try {
    const response = await fetch(`${API_BASE}/git/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('推送成功！');
    } else {
      alert('推送失败：' + result.error);
    }
  } catch (error) {
    console.error('Commit error:', error);
    alert('推送失败');
  }
}

