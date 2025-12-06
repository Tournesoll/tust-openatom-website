// Sveltia CMS GitHub OAuth 代理 - Cloudflare Workers
// 将此代码复制到 Cloudflare Workers 编辑器中

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // 处理 CORS 预检请求
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // 处理 OAuth 回调
        if (url.pathname === '/callback') {
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');

            if (!code) {
                return new Response(JSON.stringify({ error: 'Missing code parameter' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            try {
                // 交换 access token
                const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        client_id: env.GITHUB_CLIENT_ID,
                        client_secret: env.GITHUB_CLIENT_SECRET,
                        code: code,
                    }),
                });

                const tokenData = await tokenResponse.json();

                if (tokenData.error) {
                    return new Response(JSON.stringify({
                        error: tokenData.error,
                        error_description: tokenData.error_description,
                    }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    });
                }

                // 返回 token 给前端
                return new Response(JSON.stringify({
                    access_token: tokenData.access_token,
                    token_type: tokenData.token_type,
                    scope: tokenData.scope,
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            } catch (error) {
                return new Response(JSON.stringify({
                    error: 'Internal server error',
                    message: error.message,
                }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }
        }

    // 处理 OAuth 授权请求
    if (url.pathname === '/authorize' || url.pathname === '/auth') {
      const redirectUri = url.searchParams.get('redirect_uri') || `${url.origin}/callback`;
      const state = url.searchParams.get('state') || '';
      
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'repo');
      if (state) {
        authUrl.searchParams.set('state', state);
      }
      
      return Response.redirect(authUrl.toString(), 302);
    }
    
    // Decap CMS 使用的端点
    if (url.pathname === '/auth') {
      // 处理 Decap CMS 的认证请求
      const redirectUri = url.searchParams.get('redirect_uri') || `${url.origin}/callback`;
      const state = url.searchParams.get('state') || '';
      
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'repo');
      if (state) {
        authUrl.searchParams.set('state', state);
      }
      
      return Response.redirect(authUrl.toString(), 302);
    }

        // 健康检查
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({
                status: 'ok',
                service: 'Sveltia CMS OAuth Proxy',
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // 404
        return new Response(JSON.stringify({
            error: 'Not Found',
            message: 'Available endpoints: /authorize, /callback, /health',
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    },
};

