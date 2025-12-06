// API 基础 URL
const API_BASE = '/api';

// 状态管理
let currentUser = null;
let currentPost = null;
let posts = [];
let currentTags = [];
let filteredPosts = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  setupTagsManager();
  setupEditorTabs();
  setupFilters();
  setupSearch();
  loadCategories();
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
    const btn = document.getElementById('pull-btn');
    btn.classList.add('is-loading');
    await pullUpdates();
    btn.classList.remove('is-loading');
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
  
  // 标签输入 - 延迟绑定，确保元素存在
  const tagInput = document.getElementById('tag-input');
  const addTagBtn = document.getElementById('add-tag-btn');
  
  if (tagInput) {
    tagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    });
  }
  
  if (addTagBtn) {
    addTagBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addTag();
    });
  }
  
  // 常用标签点击 - 使用事件委托，因为标签是动态的
  document.addEventListener('click', (e) => {
    if (e.target.closest('#common-tags .tag')) {
      const tag = e.target.closest('#common-tags .tag');
      const tagText = tag.dataset.tag;
      if (tagText && !currentTags.includes(tagText)) {
        addTagToArray(tagText);
        updateTagsDisplay();
        const input = document.getElementById('tag-input');
        if (input) input.value = '';
      }
    }
  });
  
  // 导航栏汉堡菜单
  const navbarBurgers = document.querySelectorAll('.navbar-burger');
  navbarBurgers.forEach(burger => {
    burger.addEventListener('click', () => {
      const target = burger.dataset.target;
      const menu = document.getElementById(target);
      burger.classList.toggle('is-active');
      menu.classList.toggle('is-active');
    });
  });
  
  // 模态框关闭按钮
  const modalBackground = document.getElementById('modal-background');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  
  if (modalBackground) {
    modalBackground.addEventListener('click', closeModal);
  }
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
}

// 设置标签管理器
function setupTagsManager() {
  currentTags = [];
  updateTagsDisplay();
}

// 添加标签
function addTag() {
  const input = document.getElementById('tag-input');
  const tagText = input.value.trim();
  if (tagText && !currentTags.includes(tagText)) {
    addTagToArray(tagText);
    updateTagsDisplay();
    input.value = '';
  }
}

// 添加标签到数组
function addTagToArray(tagText) {
  if (tagText && !currentTags.includes(tagText)) {
    currentTags.push(tagText);
  }
}

// 删除标签
function removeTag(tagText) {
  currentTags = currentTags.filter(t => t !== tagText);
  updateTagsDisplay();
}

// 更新标签显示
function updateTagsDisplay() {
  const container = document.getElementById('tags-display');
  if (!container) return;
  
  container.innerHTML = currentTags.map(tag => {
    // 转义HTML特殊字符
    const safeTag = tag.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    return `
      <span class="tag is-medium">
        ${tag}
        <button class="delete is-small" data-tag="${safeTag}"></button>
      </span>
    `;
  }).join('');
  
  // 重新绑定删除按钮事件
  container.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tagToRemove = btn.dataset.tag;
      removeTag(tagToRemove);
    });
  });
}

// 设置编辑器标签页
function setupEditorTabs() {
  const tabs = document.querySelectorAll('.editor-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
}

// 切换编辑器标签页
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.editor-tab');
  const editArea = document.getElementById('post-body');
  const previewArea = document.getElementById('preview');
  
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  if (tabName === 'edit') {
    editArea.classList.remove('hidden');
    previewArea.classList.add('hidden');
  } else {
    editArea.classList.add('hidden');
    previewArea.classList.remove('hidden');
    updatePreview();
  }
}

// 设置筛选器
function setupFilters() {
  document.getElementById('filter-published').addEventListener('change', applyFilters);
  document.getElementById('filter-category').addEventListener('change', applyFilters);
}

// 设置搜索功能
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (e.target.value) {
        searchClear.style.display = 'block';
      } else {
        searchClear.style.display = 'none';
      }
      applyFilters();
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFilters();
      }
    });
  }
  
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      applyFilters();
    });
  }
  
  // 管理标签按钮
  const manageTagsBtn = document.getElementById('manage-tags-btn');
  if (manageTagsBtn) {
    manageTagsBtn.addEventListener('click', openTagsModal);
  }
}

// 应用筛选
function applyFilters() {
  const publishedFilter = document.getElementById('filter-published').value;
  const categoryFilter = document.getElementById('filter-category').value;
  const searchInput = document.getElementById('search-input');
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  
  filteredPosts = posts.filter(post => {
    // 发布状态筛选
    if (publishedFilter === 'published' && post.published === false) return false;
    if (publishedFilter === 'hidden' && post.published !== false) return false;
    
    // 分类筛选
    if (categoryFilter !== 'all') {
      const categories = Array.isArray(post.categories) ? post.categories : [post.categories];
      if (!categories.includes(categoryFilter)) return false;
    }
    
    // 搜索筛选
    if (searchQuery) {
      const tags = Array.isArray(post.tags) ? post.tags : [];
      const searchText = `${post.title} ${post.excerpt || ''} ${tags.join(' ')} ${post.author || ''}`.toLowerCase();
      if (!searchText.includes(searchQuery)) return false;
    }
    
    return true;
  });
  
  renderPosts();
}

// 加载文章列表
async function loadPosts() {
  try {
    const response = await fetch(`${API_BASE}/posts`);
    posts = await response.json();
    filteredPosts = [...posts];
    applyFilters();
  } catch (error) {
    console.error('Load posts error:', error);
    document.getElementById('posts-list').innerHTML = `
      <div class="column is-12">
        <div class="box has-text-centered">
          <p class="has-text-danger">加载失败，请刷新页面重试</p>
        </div>
      </div>
    `;
  }
}

// 渲染文章列表
function renderPosts() {
  const container = document.getElementById('posts-list');
  
  if (filteredPosts.length === 0) {
    container.innerHTML = `
      <div class="column is-12">
        <div class="empty-state">
          <i class="fas fa-file-alt"></i>
          <p>暂无文章</p>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredPosts.map(post => {
    const categories = Array.isArray(post.categories) ? post.categories : [post.categories];
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const date = post.date ? new Date(post.date).toLocaleDateString('zh-CN') : '未设置';
    const isPublished = post.published !== false;
    // 转义文件名中的特殊字符
    const safeFilename = post.filename.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    
    return `
      <div class="column is-6-tablet is-4-desktop">
        <div class="post-card ${!isPublished ? 'post-hidden' : ''}" data-filename="${safeFilename}">
          <div class="post-card-header">
            <div style="flex: 1;">
              <h3 class="post-card-title">${post.title || '无标题'}</h3>
              <div class="post-card-meta">
                <span><i class="far fa-calendar"></i> ${date}</span>
                <span><i class="far fa-folder"></i> ${categories.map(c => {
                  if (c === 'frontend') return '🎨 前端';
                  if (c === 'backend') return '⚙️ 后端';
                  if (c === 'design') return '✨ 设计';
                  return c;
                }).join(', ')}</span>
              </div>
              ${tags.length > 0 ? `
                <div class="tags mt-2">
                  ${tags.slice(0, 3).map(tag => `<span class="tag is-small">${tag}</span>`).join('')}
                  ${tags.length > 3 ? `<span class="tag is-small">+${tags.length - 3}</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          ${post.excerpt ? `<p style="color: #9CA3AF; font-size: 0.9rem; margin-bottom: 0.75rem;">${post.excerpt}</p>` : ''}
          <div class="post-card-actions">
            <button class="button is-info is-small preview-post-btn" data-filename="${safeFilename}">
              <span class="icon"><i class="fas fa-eye"></i></span>
              <span>预览</span>
            </button>
            <button class="button is-primary is-small edit-post-btn" data-filename="${safeFilename}">
              <span class="icon"><i class="fas fa-edit"></i></span>
              <span>编辑</span>
            </button>
            <button class="button is-small ${isPublished ? 'is-warning' : 'is-success'} toggle-publish-btn" data-filename="${safeFilename}" data-published="${isPublished}">
              <span class="icon"><i class="fas fa-${isPublished ? 'eye-slash' : 'eye'}"></i></span>
              <span>${isPublished ? '隐藏' : '显示'}</span>
            </button>
            <button class="button is-small is-danger delete-post-btn" data-filename="${safeFilename}">
              <span class="icon"><i class="fas fa-trash"></i></span>
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // 重新绑定文章按钮事件
  container.querySelectorAll('.preview-post-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const filename = btn.dataset.filename;
      previewPost(filename);
    });
  });
  
  container.querySelectorAll('.edit-post-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const filename = btn.dataset.filename;
      editPost(filename);
    });
  });
  
  container.querySelectorAll('.toggle-publish-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const filename = btn.dataset.filename;
      const currentPublished = btn.dataset.published === 'true';
      await togglePublishStatus(filename, !currentPublished);
    });
  });
  
  container.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const filename = btn.dataset.filename;
      deletePost(filename);
    });
  });
  
  // 点击文章卡片也可以预览
  container.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // 如果点击的是按钮，不触发预览
      if (e.target.closest('button')) {
        return;
      }
      const filename = card.dataset.filename;
      if (filename) {
        previewPost(filename);
      }
    });
  });
}

// 打开编辑模态框
function openEditModal(post = null) {
  currentPost = post;
  const modal = document.getElementById('edit-modal');
  const title = document.getElementById('modal-title');
  
  if (!modal) {
    console.error('Modal not found');
    return;
  }
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  if (post) {
    title.innerHTML = '<i class="fas fa-file-alt"></i><span class="ml-2">编辑文章</span>';
    loadPostData(post);
  } else {
    title.innerHTML = '<i class="fas fa-file-alt"></i><span class="ml-2">新建文章</span>';
    resetForm();
  }
  
  // 切换到编辑标签页
  switchTab('edit');
  
  // 重新绑定常用标签事件（因为模态框可能被重新创建）
  setTimeout(() => {
    const commonTags = document.querySelectorAll('#common-tags .tag');
    commonTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const tagText = tag.dataset.tag;
        if (tagText && !currentTags.includes(tagText)) {
          addTagToArray(tagText);
          updateTagsDisplay();
          const input = document.getElementById('tag-input');
          if (input) input.value = '';
        }
      });
    });
  }, 100);
}

// 加载文章数据
async function loadPostData(filename) {
  try {
    const response = await fetch(`${API_BASE}/posts/${filename}`);
    const post = await response.json();
    
    document.getElementById('post-title').value = post.frontMatter.title || '';
    document.getElementById('post-date').value = post.frontMatter.date ? new Date(post.frontMatter.date).toISOString().slice(0, 16) : '';
    
    const categories = Array.isArray(post.frontMatter.categories) ? post.frontMatter.categories : [post.frontMatter.categories];
    document.getElementById('post-categories').value = categories[0] || 'frontend';
    
    currentTags = Array.isArray(post.frontMatter.tags) ? post.frontMatter.tags : (post.frontMatter.tags ? [post.frontMatter.tags] : []);
    updateTagsDisplay();
    
    document.getElementById('post-author').value = post.frontMatter.author || '技术社团';
    document.getElementById('post-layout').value = post.frontMatter.layout || 'post';
    document.getElementById('post-excerpt').value = post.frontMatter.excerpt || '';
    document.getElementById('post-body').value = post.body || '';
    document.getElementById('post-published').checked = post.frontMatter.published !== false;
    
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
  document.getElementById('post-published').checked = true;
  currentTags = [];
  updateTagsDisplay();
  updatePreview();
}

// 更新预览
function updatePreview() {
  const body = document.getElementById('post-body').value;
  const preview = document.getElementById('preview');
  
  if (typeof marked !== 'undefined') {
    preview.innerHTML = marked.parse(body);
  } else {
    // 简单的 Markdown 预览（fallback）
    preview.innerHTML = body
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>');
  }
}

// 保存文章
async function savePost(push = false) {
  try {
    const publishedCheckbox = document.getElementById('post-published');
    const formData = {
      title: document.getElementById('post-title').value,
      date: document.getElementById('post-date').value,
      categories: document.getElementById('post-categories').value,
      tags: currentTags,
      author: document.getElementById('post-author').value,
      layout: document.getElementById('post-layout').value,
      excerpt: document.getElementById('post-excerpt').value,
      body: document.getElementById('post-body').value,
      published: publishedCheckbox ? publishedCheckbox.checked : true,
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
      alert('保存失败：' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('Save post error:', error);
    alert('保存失败：' + error.message);
  }
}

// 预览文章
async function previewPost(filename) {
  if (!filename) {
    console.error('Filename is required');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/posts/${filename}`);
    const post = await response.json();
    
    // 创建预览模态框
    const previewModal = document.createElement('div');
    previewModal.className = 'modal';
    previewModal.id = 'preview-modal';
    previewModal.innerHTML = `
      <div class="modal-background" id="preview-modal-background"></div>
      <div class="modal-card" style="max-width: 900px;">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fas fa-eye"></i>
            <span class="ml-2">文章预览</span>
          </p>
          <button class="delete" aria-label="close" id="preview-modal-close"></button>
        </header>
        <section class="modal-card-body">
          <article class="preview-article">
            <h1 class="title is-2" style="color: #F9FAFB; margin-bottom: 1rem;">${post.frontMatter.title || '无标题'}</h1>
            <div class="preview-meta" style="margin-bottom: 2rem; color: #9CA3AF; font-size: 0.9rem;">
              <span><i class="far fa-calendar"></i> ${post.frontMatter.date ? new Date(post.frontMatter.date).toLocaleDateString('zh-CN') : '未设置'}</span>
              ${post.frontMatter.author ? `<span class="ml-3"><i class="far fa-user"></i> ${post.frontMatter.author}</span>` : ''}
              ${post.frontMatter.categories ? `<span class="ml-3"><i class="far fa-folder"></i> ${Array.isArray(post.frontMatter.categories) ? post.frontMatter.categories.join(', ') : post.frontMatter.categories}</span>` : ''}
            </div>
            <div class="preview-content" style="color: #D1D5DB; line-height: 1.8;">
              ${typeof marked !== 'undefined' ? marked.parse(post.body || '') : (post.body || '').replace(/\n/g, '<br>')}
            </div>
          </article>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" id="edit-from-preview-btn" data-filename="${filename.replace(/'/g, "&#39;").replace(/"/g, "&quot;")}">
            <span class="icon"><i class="fas fa-edit"></i></span>
            <span>编辑文章</span>
          </button>
          <button class="button is-light" id="close-preview-btn">关闭</button>
        </footer>
      </div>
    `;
    
    document.body.appendChild(previewModal);
    previewModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // 绑定关闭事件
    document.getElementById('preview-modal-background').addEventListener('click', closePreviewModal);
    document.getElementById('preview-modal-close').addEventListener('click', closePreviewModal);
    document.getElementById('close-preview-btn').addEventListener('click', closePreviewModal);
    document.getElementById('edit-from-preview-btn').addEventListener('click', () => {
      const editFilename = document.getElementById('edit-from-preview-btn').dataset.filename;
      closePreviewModal();
      setTimeout(() => editPost(editFilename), 100);
    });
    
  } catch (error) {
    console.error('Preview post error:', error);
    alert('预览失败：' + error.message);
  }
}

// 关闭预览模态框
function closePreviewModal() {
  const modal = document.getElementById('preview-modal');
  if (modal) {
    modal.remove();
  }
  document.body.style.overflow = '';
}

// 切换发布状态
async function togglePublishStatus(filename, published) {
  try {
    // 先获取文章数据
    const response = await fetch(`${API_BASE}/posts/${filename}`);
    const post = await response.json();
    
    // 更新发布状态
    const formData = {
      title: post.frontMatter.title,
      date: post.frontMatter.date,
      categories: Array.isArray(post.frontMatter.categories) ? post.frontMatter.categories[0] : post.frontMatter.categories,
      tags: Array.isArray(post.frontMatter.tags) ? post.frontMatter.tags : (post.frontMatter.tags ? [post.frontMatter.tags] : []),
      author: post.frontMatter.author || '技术社团',
      layout: post.frontMatter.layout || 'post',
      excerpt: post.frontMatter.excerpt || '',
      body: post.body || '',
      published: published,
    };
    
    const updateResponse = await fetch(`${API_BASE}/posts/${filename}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    const result = await updateResponse.json();
    
    if (result.success) {
      await loadPosts();
      alert(published ? '文章已显示' : '文章已隐藏');
    } else {
      alert('操作失败：' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('Toggle publish error:', error);
    alert('操作失败：' + error.message);
  }
}

// 编辑文章
async function editPost(filename) {
  if (!filename) {
    console.error('Filename is required');
    return;
  }
  openEditModal(filename);
}

// 删除文章
async function deletePost(filename) {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复！')) {
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
      alert('删除失败：' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('Delete post error:', error);
    alert('删除失败：' + error.message);
  }
}

// 关闭模态框
function closeModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  document.body.style.overflow = '';
  currentPost = null;
  // 不重置表单，让用户保留输入
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
      alert('拉取失败：' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('Pull error:', error);
    alert('拉取失败：' + error.message);
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
      alert('推送失败：' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('Commit error:', error);
    alert('推送失败：' + error.message);
  }
}

// 加载分类列表
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/tags/categories`);
    const data = await response.json();
    
    const select = document.getElementById('filter-category');
    if (select && data.categories) {
      select.innerHTML = '<option value="all">全部分类</option>';
      data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Load categories error:', error);
  }
}

// 标签管理相关变量
let allTags = [];
let popularTags = [];
let categories = [];

// 打开标签管理模态框
async function openTagsModal() {
  const modal = document.getElementById('tags-modal');
  if (!modal) return;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  await loadTagsData();
  renderTagsModal();
  setupTagsModalEvents();
}

// 加载标签数据
async function loadTagsData() {
  try {
    const [categoriesRes, allTagsRes, popularRes] = await Promise.all([
      fetch(`${API_BASE}/tags/categories`),
      fetch(`${API_BASE}/tags/all`),
      fetch(`${API_BASE}/tags/popular`)
    ]);
    
    const categoriesData = await categoriesRes.json();
    const allTagsData = await allTagsRes.json();
    const popularData = await popularRes.json();
    
    categories = categoriesData.categories || [];
    allTags = allTagsData.tags || [];
    popularTags = popularData.tags || [];
  } catch (error) {
    console.error('Load tags data error:', error);
    alert('加载标签数据失败');
  }
}

// 渲染标签管理界面
function renderTagsModal() {
  const categoriesList = document.getElementById('categories-list');
  if (categoriesList) {
    categoriesList.innerHTML = categories.length > 0 ? categories.map(category => {
      const safe = category.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      return `<span class="tag-item">${category}<button class="delete" onclick="deleteCategory('${safe}')"></button></span>`;
    }).join('') : '<p style="color: #9CA3AF;">暂无分类</p>';
  }
  
  const allTagsList = document.getElementById('all-tags-list');
  if (allTagsList) {
    allTagsList.innerHTML = allTags.length > 0 ? allTags.map(tag => {
      const isSelected = popularTags.includes(tag);
      const safe = tag.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      return `<span class="tag-item ${isSelected ? 'selected' : ''}" data-tag="${safe}" onclick="togglePopularTag('${safe}')">${tag}</span>`;
    }).join('') : '<p style="color: #9CA3AF;">暂无标签</p>';
  }
  
  const popularTagsList = document.getElementById('popular-tags-list');
  if (popularTagsList) {
    popularTagsList.innerHTML = popularTags.length > 0 ? popularTags.map(tag => {
      const safe = tag.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      return `<span class="tag-item selected">${tag}<button class="delete" onclick="removePopularTag('${safe}')"></button></span>`;
    }).join('') : '<p style="color: #9CA3AF;">未选择热门标签</p>';
  }
}

// 设置标签管理模态框事件
function setupTagsModalEvents() {
  const addCategoryBtn = document.getElementById('add-category-btn');
  const newCategoryInput = document.getElementById('new-category-input');
  const saveTagsBtn = document.getElementById('save-tags-btn');
  
  if (addCategoryBtn && newCategoryInput) {
    addCategoryBtn.onclick = async () => {
      const name = newCategoryInput.value.trim();
      if (name) {
        await addCategory(name);
        newCategoryInput.value = '';
      }
    };
    newCategoryInput.onkeypress = async (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        await addCategory(e.target.value.trim());
        e.target.value = '';
      }
    };
  }
  
  if (saveTagsBtn) {
    saveTagsBtn.onclick = saveTags;
  }
  
  const closeTagsModal = () => {
    const modal = document.getElementById('tags-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };
  
  const cancelBtn = document.getElementById('cancel-tags-btn');
  const bg = document.getElementById('tags-modal-background');
  const closeBtn = document.getElementById('tags-modal-close');
  
  if (cancelBtn) cancelBtn.onclick = closeTagsModal;
  if (bg) bg.onclick = closeTagsModal;
  if (closeBtn) closeBtn.onclick = closeTagsModal;
}

// 添加分类
async function addCategory(name) {
  try {
    const response = await fetch(`${API_BASE}/tags/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    
    const result = await response.json();
    if (result.success) {
      categories = result.categories;
      renderTagsModal();
      await loadCategories();
    } else {
      alert('添加失败：' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('Add category error:', error);
    alert('添加失败：' + error.message);
  }
}

// 删除分类
async function deleteCategory(name) {
  if (!confirm(`确定要删除分类"${name}"吗？`)) return;
  
  try {
    const response = await fetch(`${API_BASE}/tags/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    if (result.success) {
      categories = result.categories;
      renderTagsModal();
      await loadCategories();
    } else {
      alert('删除失败：' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('Delete category error:', error);
    alert('删除失败：' + error.message);
  }
}

// 切换热门标签
function togglePopularTag(tag) {
  if (popularTags.includes(tag)) {
    popularTags = popularTags.filter(t => t !== tag);
  } else {
    popularTags.push(tag);
  }
  renderTagsModal();
}

// 移除热门标签
function removePopularTag(tag) {
  popularTags = popularTags.filter(t => t !== tag);
  renderTagsModal();
}

// 保存标签配置
async function saveTags() {
  try {
    const response = await fetch(`${API_BASE}/tags/popular`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: popularTags }),
    });
    
    const result = await response.json();
    if (result.success) {
      alert('保存成功！');
      const modal = document.getElementById('tags-modal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    } else {
      alert('保存失败：' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('Save tags error:', error);
    alert('保存失败：' + error.message);
  }
}
