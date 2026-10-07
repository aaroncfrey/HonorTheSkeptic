/* Honor the Skeptic: interactions (theme, text size, clip player, presenter mode) */
(function () {
  var root = document.documentElement;
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- theme & size ---------- */
  function toggleTheme() {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store('hts-theme', root.dataset.theme);
  }
  var sizes = ['', 'l', 'xl'];
  function cycleSize(dir) {
    var i = sizes.indexOf(root.dataset.size || '');
    i = Math.max(0, Math.min(sizes.length - 1, dir ? i + dir : (i + 1) % sizes.length));
    if (sizes[i]) root.dataset.size = sizes[i]; else delete root.dataset.size;
    store('hts-size', sizes[i] || null);
  }

  /* ---------- clip player ---------- */
  var modal = document.getElementById('clip-modal');
  var lastFocus = null;
  function playClip(btn) {
    var id = btn.dataset.yt, start = btn.dataset.start || 0, end = btn.dataset.end;
    var src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1&start=' + start + (end ? '&end=' + end : '');
    modal.querySelector('#clip-modal-title').textContent = btn.dataset.title || '';
    modal.querySelector('.modal-yt').href = btn.dataset.url || ('https://www.youtube.com/watch?v=' + id + '&t=' + start + 's');
    modal.querySelector('.modal-video').innerHTML =
      '<iframe src="' + src + '" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" ' +
      'allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.querySelector('[data-action="close"].tool').focus();
  }
  function closeClip() {
    if (!modal || modal.hidden) return false;
    modal.querySelector('.modal-video').innerHTML = '';
    modal.hidden = true;
    if (lastFocus) lastFocus.focus();
    return true;
  }

  /* ---------- presenter mode ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
  var bar = document.querySelector('.presenter-bar');
  var cur = 0, presenting = false;
  function show(i) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, j) { s.classList.toggle('current', j === cur); });
    if (bar) bar.querySelector('.pcount').textContent = (cur + 1) + ' / ' + slides.length;
    slides[cur].scrollTop = 0;
    if (slides[cur].id) history.replaceState(null, '', '#' + slides[cur].id);
  }
  function present(on) {
    presenting = on;
    document.body.classList.toggle('presenting', on);
    if (bar) bar.hidden = !on;
    if (on) {
      var start = 0, h = location.hash.slice(1);
      slides.forEach(function (s, j) { if (h && s.id === h) start = j; });
      show(start);
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
    } else {
      slides.forEach(function (s) { s.classList.remove('current'); });
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
      var target = slides[cur];
      if (target) target.scrollIntoView();
    }
  }

  /* ---------- clicks ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (t) {
      var a = t.dataset.action;
      if (a === 'theme') toggleTheme();
      else if (a === 'size') cycleSize();
      else if (a === 'play') playClip(t);
      else if (a === 'close') closeClip();
      else if (a === 'present') present(true);
      else if (a === 'exit') present(false);
      else if (a === 'next') show(cur + 1);
      else if (a === 'prev') show(cur - 1);
      return;
    }
    var q = e.target.closest('.qlist li');
    if (q && !e.target.closest('a')) toggleQuestion(q);
  });
  function toggleQuestion(q) {
    var list = q.parentNode, was = q.classList.contains('on');
    Array.prototype.forEach.call(list.children, function (li) { li.classList.remove('on'); });
    if (!was) q.classList.add('on');
    list.classList.toggle('focus', !was);
  }

  /* ---------- keyboard (works with presentation clickers) ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === 'Escape') { if (closeClip()) return; if (presenting) present(false); return; }
    if (!modal.hidden) return;
    if (e.target.matches('.qlist li') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleQuestion(e.target); return; }
    if (e.key === '+' || e.key === '=') { cycleSize(1); return; }
    if (e.key === '-' || e.key === '_') { cycleSize(-1); return; }
    if (!presenting) {
      if ((e.key === 'p' || e.key === 'P') && slides.length > 1) present(true);
      return;
    }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].indexOf(e.key) > -1) { e.preventDefault(); show(cur + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].indexOf(e.key) > -1) { e.preventDefault(); show(cur - 1); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(slides.length - 1);
    else if (e.key === 'v' || e.key === 'V') {
      var b = slides[cur].querySelector('[data-action="play"]'); if (b) playClip(b);
    }
  });
})();
