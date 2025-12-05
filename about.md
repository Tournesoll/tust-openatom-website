---
layout: default
title: 联系我们
permalink: /about/
---

<section class="apple-gradient-bg" style="min-height: 100vh; padding: 6rem 0;">
  <div class="container">
    
    <!-- 页面标题 -->
    <div class="has-text-centered" style="margin-bottom: 5rem;">
      <h1 style="font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 700; color: #F9FAFB; margin-bottom: 1rem; letter-spacing: -0.02em;">
        联系我们
      </h1>
      <p style="font-size: 1.25rem; color: #9CA3AF;">
        期待与你交流
      </p>
    </div>
    
    <div class="columns">
      <div class="column is-8 is-offset-2">
        
        <!-- 联系方式 -->
        <div class="apple-card" style="margin-bottom: 2rem; padding: 3rem;">
          <h2 style="font-size: 2rem; font-weight: 600; color: #F9FAFB; margin-bottom: 2rem; text-align: center;">
            联系方式
          </h2>
          
          <div style="display: grid; gap: 2rem; max-width: 500px; margin: 0 auto 3rem;">
            
            <div style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.03); border-radius: 12px;">
              <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(107, 114, 128, 0.2); border-radius: 50%;">
                <i class="fas fa-envelope" style="color: #9CA3AF; font-size: 1.25rem;"></i>
              </div>
              <div>
                <div style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">邮箱</div>
                <div style="color: #F9FAFB; font-size: 1.125rem;">{{ site.email_contact }}</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.03); border-radius: 12px;">
              <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(107, 114, 128, 0.2); border-radius: 50%;">
                <i class="fab fa-github" style="color: #9CA3AF; font-size: 1.25rem;"></i>
              </div>
              <div>
                <div style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">GitHub</div>
                <a href="https://github.com/{{ site.github_username }}" target="_blank" style="color: #F9FAFB; font-size: 1.125rem; text-decoration: none; transition: color 0.3s;" onmouseover="this.style.color='#9CA3AF'" onmouseout="this.style.color='#F9FAFB'">
                  @{{ site.github_username }}
                </a>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.03); border-radius: 12px;">
              <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(107, 114, 128, 0.2); border-radius: 50%;">
                <i class="fas fa-university" style="color: #9CA3AF; font-size: 1.25rem;"></i>
              </div>
              <div>
                <div style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">指导单位</div>
                <div style="color: #F9FAFB; font-size: 1.125rem;">{{ site.guide_unit }}</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.03); border-radius: 12px;">
              <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(107, 114, 128, 0.2); border-radius: 50%;">
                <i class="fas fa-user-tie" style="color: #9CA3AF; font-size: 1.25rem;"></i>
              </div>
              <div>
                <div style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">指导教师</div>
                <div style="color: #F9FAFB; font-size: 1.125rem;">{{ site.guide_teacher }}</div>
                <div style="color: #6B7280; font-size: 0.875rem; margin-top: 0.25rem;">{{ site.guide_teacher_title }}</div>
              </div>
            </div>
            
          </div>
          
          <div style="text-align: center; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #9CA3AF; margin-bottom: 1.5rem; line-height: 1.6;">
              我们期待与你交流技术、分享经验<br>
              无论是技术问题、合作咨询还是加入协会，都欢迎联系我们
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
              <a href="/" class="apple-button apple-button-primary">
                <i class="fas fa-home"></i>
                <span>返回首页</span>
              </a>
              <a href="/intro" class="apple-button apple-button-secondary">
                <span>了解协会</span>
              </a>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</section>
