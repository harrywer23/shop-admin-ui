export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('token').value;

  if (!token) {
    // 如果没有 token，重定向到登录页面
    return navigateTo('/login');
  }
}); 