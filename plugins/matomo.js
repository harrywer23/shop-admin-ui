// plugins/matomo.js
export default defineNuxtPlugin((nuxtApp) => {
    var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    (function() {
        var u = "//matomo.51k.uk/";
        _paq.push(['setTrackerUrl', u + 'matomo.php']);
        _paq.push(['setSiteId', '1']);
        var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
        g.async = true; g.src = u + 'matomo.js'; s.parentNode.insertBefore(g, s);
    })();

    // 路由变化时追踪页面视图
    nuxtApp.hook('page:finish', () => {
        _paq.push(['setCustomUrl', window.location.pathname]);
        _paq.push(['trackPageView']);
    });
});
