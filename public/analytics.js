(function () {
  'use strict';
  if (window.__portfolioAnalytics) return;
  window.__portfolioAnalytics = true;
  var ID = 'G-0WLF6XRZTH', KEY = 'portfolio-analytics-consent-v1';
  var allowed = false, started = false;
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (_) {}
  function en() { return document.documentElement.lang === 'en'; }
  function cleanUrl(value) {
    try { var u = new URL(value); return u.origin + u.pathname; } catch (_) { return ''; }
  }
  function send(name, params) {
    if (!allowed || typeof window.gtag !== 'function') return;
    window.gtag('event', name, Object.assign({
      send_to: ID, page_location: location.origin + location.pathname,
      page_referrer: cleanUrl(document.referrer), language: document.documentElement.lang
    }, params || {}));
  }
  function start() {
    allowed = true;
    window['ga-disable-' + ID] = false;
    if (started) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', ID, {
      send_page_view: false, allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname,
      page_referrer: cleanUrl(document.referrer)
    });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
    send('page_view', { page_title: document.title });
  }
  function stop() {
    allowed = false;
    window['ga-disable-' + ID] = true;
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    document.cookie.split(';').forEach(function (item) {
      var name = item.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      var domains = ['', location.hostname, '.' + location.hostname];
      var parts = location.hostname.split('.');
      for (var i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
      });
    });
  }
  function choose(value) {
    choice = value;
    try { localStorage.setItem(KEY, value); } catch (_) {}
    if (value === 'granted') start(); else stop();
    panel.hidden = true;
  }
  var style = document.createElement('style');
  style.textContent = '#portfolio-consent{position:fixed;bottom:20px;left:20px;z-index:9999;max-width:420px;padding:22px;background:#182333;color:#f0f4fb;border:1px solid #46617f;border-radius:8px;font:13px/1.6 Arial,sans-serif;box-shadow:0 8px 40px #0005}#portfolio-consent[hidden]{display:none}#portfolio-consent p{margin:0 0 16px}#portfolio-consent button{padding:10px 16px;margin-right:10px;border:1px solid #82b5ff;border-radius:4px;background:transparent;color:#dceaff;font:inherit;cursor:pointer}#portfolio-consent button:first-of-type{background:#82b5ff;color:#102038}#portfolio-privacy{position:fixed;bottom:12px;right:12px;z-index:9998;background:#17212e;color:#c4d8f4;border:1px solid #46617f;border-radius:5px;padding:7px 10px;font:11px Arial,sans-serif;cursor:pointer}#portfolio-consent button:focus-visible,#portfolio-privacy:focus-visible{outline:2px solid #82b5ff;outline-offset:3px}@media(max-width:500px){#portfolio-consent{left:12px;right:12px;bottom:55px;max-width:none}}';
  document.head.appendChild(style);
  var panel = document.createElement('section'); panel.id = 'portfolio-consent';
  panel.setAttribute('aria-label', 'Analytics preferences');
  var message = document.createElement('p');
  var accept = document.createElement('button'); accept.type = 'button';
  var decline = document.createElement('button'); decline.type = 'button';
  panel.appendChild(message); panel.appendChild(accept); panel.appendChild(decline);
  var settings = document.createElement('button'); settings.id = 'portfolio-privacy'; settings.type = 'button';
  function translate() {
    message.textContent = en()
      ? 'Allow Google Analytics to measure visits, CV downloads and contact clicks? It uses analytics cookies. You can decline or change your choice here at any time.'
      : 'Разрешить Google Analytics собирать статистику посещений, скачиваний CV и кликов по контактам? Для этого используются аналитические cookies. Можно отказаться или изменить выбор здесь в любой момент.';
    accept.textContent = en() ? 'Allow' : 'Разрешить';
    decline.textContent = en() ? 'Decline' : 'Отказаться';
    settings.textContent = en() ? 'Analytics settings' : 'Настройки аналитики';
  }
  translate();
  accept.addEventListener('click', function () { choose('granted'); });
  decline.addEventListener('click', function () { choose('denied'); });
  settings.addEventListener('click', function () { panel.hidden = !panel.hidden; if (!panel.hidden) accept.focus(); });
  document.body.appendChild(panel); document.body.appendChild(settings);
  panel.hidden = choice === 'granted' || choice === 'denied';
  if (choice === 'granted') start();
  else window['ga-disable-' + ID] = true;
  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target.closest('a') : null;
    if (!target) return;
    var href = target.getAttribute('href') || '';
    if (/\.pdf(?:[?#]|$)/i.test(href)) { send('cv_download', { asset: 'resume_pdf' }); return; }
    var channel = /^mailto:/i.test(href) ? 'email' : /linkedin\.com\//i.test(href) ? 'linkedin' : /github\.com\//i.test(href) ? 'github' : /t\.me\//i.test(href) ? 'telegram' : null;
    if (channel) send('contact_click', { contact_channel: channel });
  });
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
