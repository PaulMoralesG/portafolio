/* Sara Sánchez · Fotografía — comportamiento de la página */
(function () {
  'use strict';

  /* ---------- Configuración (único lugar con el número) ---------- */
  var WA_NUMBER = '593939001348';
  var WA_MESSAGES = {
    general: 'Hola Sara! ✨ Vi tu página y quisiera contratar tus servicios. ¿Cuál es tu disponibilidad?',
    boda: 'Hola Sara! 💍 Estoy planeando mi boda y me encantaría conocer tus paquetes y disponibilidad. ¿Podemos conversar?',
    xv: 'Hola Sara! 👑 Quiero información sobre la sesión y cobertura de XV Años. ¿Cuál es tu disponibilidad?',
    comunion: 'Hola Sara! 🕊️ Me interesa tu servicio de Primera Comunión. ¿Podrías enviarme info?',
    sesion: 'Hola Sara! 📸 Quiero una sesión de fotos. ¿Cuáles son tus precios y paquetes?',
    cumple: 'Hola Sara! 🎂 ¿Haces sesiones de cumpleaños? Me interesa contratarte. ¿Precios?',
    revelacion: 'Hola Sara! 🎀 Quiero info sobre revelación de género. ¿Tienes disponibilidad?',
    evento: 'Hola Sara! 🎭 Me interesa contratarte para un evento. ¿Podemos conversar sobre precios?'
  };
  var CAT_INFO = {
    bodas: { title: 'Bodas', desc: 'La fotografía es romántica' },
    xv: { title: 'XV Años', desc: 'Los 15 años son recuerdos que brillan para siempre. Es la mejor manera de guardar esa etapa mágica, capturando sonrisas, emociones y recuerdos que durarán toda la vida.' },
    comunion: { title: 'Primera Comunión', desc: 'Más que una celebración, la primera comunión es un paso importante en la vida espiritual de un niño. Mis fotografías buscan inmortalizar la esencia de ese día: la alegría, la emoción y la unión familiar que lo hacen único.' },
    sesiones: { title: 'Sesiones Fotográficas', desc: 'Historias contadas con pura luz' },
    cumple: { title: 'Cumpleaños', desc: 'Busco capturar toda la diversión, la emoción y la magia de un día que solo se vive una vez al año. ¡Feliz cumpleaños!' },
    revelacion: { title: 'Revelación de Género', desc: 'Amor, alegría y esperanza en cada fotografía' },
    arte: { title: 'Eventos Artísticos', desc: 'Cobertura de eventos culturales en Guayaquil' }
  };

  function waUrl(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  document.documentElement.classList.add('js');

  /* ---------- Enlaces de WhatsApp: <a data-wa="boda"> ---------- */
  $$('[data-wa]').forEach(function (a) {
    var msg = WA_MESSAGES[a.getAttribute('data-wa')] || WA_MESSAGES.general;
    a.href = waUrl(msg);
    if (!a.target && a.hostname !== location.hostname) { a.target = '_blank'; a.rel = 'noopener'; }
  });

  /* ---------- Navegación ---------- */
  var nav = $('#nav');
  var ham = $('#ham');
  var mmenu = $('#mmenu');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    mmenu.classList.toggle('open', open);
    ham.classList.toggle('active', open);
    ham.setAttribute('aria-expanded', String(open));
    ham.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { $('a', mmenu).focus(); } else { ham.focus({ preventScroll: true }); }
  }
  ham.addEventListener('click', function () { setMenu(!mmenu.classList.contains('open')); });
  $$('a', mmenu).forEach(function (a) {
    a.addEventListener('click', function () {
      mmenu.classList.remove('open');
      ham.classList.remove('active');
      ham.setAttribute('aria-expanded', 'false');
      ham.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Filtro de galería ---------- */
  var items = $$('.item');
  var tabs = $$('.tab');
  var catHeader = $('#catHeader');

  function filter(cat) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-cat') === cat;
      t.classList.toggle('active', on);
      t.setAttribute('aria-pressed', String(on));
    });
    items.forEach(function (it) { it.hidden = cat !== 'all' && it.getAttribute('data-cat') !== cat; });
    var shown = items.filter(function (it) { return !it.hidden; }).length;
    var gs = $('#galStatus');
    if (gs) { gs.textContent = shown + ' fotos'; }
    var info = CAT_INFO[cat];
    catHeader.classList.toggle('on', !!info);
    if (info) { $('#catTitle').textContent = info.title; $('#catDesc').textContent = info.desc; }
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { filter(t.getAttribute('data-cat')); });
  });

  /* ---------- Lightbox ---------- */
  var lb = $('#lb');
  var lbImg = $('#lbImg');
  var lbCount = $('#lbCount');
  var lbClose = $('#lbClose');
  var lbList = [];
  var lbIdx = 0;
  var lbOpener = null;
  var lbBusy = false;
  var preloaded = {};

  function full(img) { return img.getAttribute('data-full') || img.currentSrc || img.src; }
  function lbShow(i) {
    var src = full(lbList[i]);
    var alt = lbList[i].alt;
    lbIdx = i;
    lbImg.alt = alt;
    lbImg.src = src;
    lbCount.textContent = (i + 1) + ' / ' + lbList.length;
    [1, -1, 2].forEach(function (o) {
      var s = full(lbList[(i + o + lbList.length) % lbList.length]);
      if (!preloaded[s]) { preloaded[s] = true; new Image().src = s; }
    });
  }
  function lbOpen(item) {
    lbOpener = item;
    try { history.pushState({ lb: true }, ''); } catch (e) { /* sin historial */ }
    lbList = items.filter(function (it) { return !it.hidden; }).map(function (it) { return $('img', it); });
    var idx = lbList.indexOf($('img', item));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbShow(idx < 0 ? 0 : idx);
    lbClose.focus();
  }
  function lbHide() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lbOpener) { lbOpener.focus({ preventScroll: true }); }
  }
  function lbExit() {
    if (history.state && history.state.lb) { history.back(); } else { lbHide(); }
  }
  window.addEventListener('popstate', function () {
    if (lb.classList.contains('open')) { lbHide(); }
  });
  function lbStep(dir) {
    if (lbBusy) { return; }
    lbBusy = true;
    lbImg.classList.add('fade');
    var next = (lbIdx + dir + lbList.length) % lbList.length;
    var probe = new Image();
    var done = function () {
      lbShow(next);
      lbImg.classList.remove('fade');
      lbBusy = false;
    };
    probe.onload = probe.onerror = function () { setTimeout(done, 120); };
    probe.src = full(lbList[next]);
  }

  $('#masonry').addEventListener('click', function (e) {
    var it = e.target.closest('.item');
    if (it) { lbOpen(it); }
  });
  $('#masonry').addEventListener('keydown', function (e) {
    var it = e.target.closest('.item');
    if (it && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); lbOpen(it); }
  });
  lbClose.addEventListener('click', lbExit);
  $('#lbPrev').addEventListener('click', function () { lbStep(-1); });
  $('#lbNext').addEventListener('click', function () { lbStep(1); });
  lbImg.addEventListener('click', function () { lbStep(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) { lbExit(); } });

  document.addEventListener('keydown', function (e) {
    if (mmenu.classList.contains('open') && e.key === 'Escape') { setMenu(false); return; }
    if (!lb.classList.contains('open')) { return; }
    if (e.key === 'Escape') { lbExit(); }
    else if (e.key === 'ArrowLeft') { lbStep(-1); }
    else if (e.key === 'ArrowRight') { lbStep(1); }
    else if (e.key === 'Tab') {
      var f = $$('button', lb);
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) { lbStep(dx < 0 ? 1 : -1); }
  }, { passive: true });

  /* ---------- Formulario → WhatsApp (nada se envía a un servidor) ---------- */
  var form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = (d.get('nombre') || '').toString().trim().slice(0, 60);
      var type = (d.get('evento') || '').toString();
      var date = (d.get('fecha') || '').toString();
      var note = (d.get('mensaje') || '').toString().trim().slice(0, 500);
      var lines = ['Hola Sara! ✨ Soy ' + name + '.', 'Me interesa: ' + type + '.'];
      if (date) {
        var p = date.split('-');
        lines.push('Fecha aproximada: ' + p[2] + '/' + p[1] + '/' + p[0] + '.');
      }
      if (note) { lines.push(note); }
      lines.push('¿Tienes disponibilidad?');
      var url = waUrl(lines.join(' '));
      var btn = $('button[type="submit"]', form);
      var label = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Abriendo WhatsApp…';
      var win = null;
      try { win = window.open(url, '_blank'); } catch (err) { win = null; }
      if (win) { try { win.opener = null; } catch (err2) { /* mismo origen no aplica */ } }
      else { window.location.href = url; }
      setTimeout(function () { btn.disabled = false; btn.innerHTML = label; }, 2500);
    });
    var dateInput = $('#fecha');
    if (dateInput) {
      var now = new Date();
      dateInput.min = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    }
  }

  /* ---------- Sección activa en el menú ---------- */
  var spyLinks = $$('.nav-links a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window && spyLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        spyLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + en.target.id) { a.setAttribute('aria-current', 'true'); }
          else { a.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyLinks.forEach(function (a) {
      var sec = $(a.getAttribute('href'));
      if (sec) { spy.observe(sec); }
    });
  }

  /* ---------- Revelado al hacer scroll ---------- */
  var targets = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }

  /* ---------- Año del pie de página ---------- */
  var y = $('#year');
  if (y) { y.textContent = new Date().getFullYear(); }
})();
