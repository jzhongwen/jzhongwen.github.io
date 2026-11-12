(function () {
  'use strict';
  function matchesPhoto(data, group, place, year) {
    return (!group || (data.groups || '').split(' ').indexOf(group) !== -1) &&
      (!place || data.place === place) && (!year || data.year === year);
  }
  if (typeof module === 'object' && module.exports) { module.exports = matchesPhoto; return; }
  document.querySelectorAll('[data-species-browser]').forEach(function (browser) {
    browser.querySelectorAll('[data-photo-filters], [data-photo-controls]').forEach(function (el) { el.hidden = false; });
    var cards = Array.from(browser.querySelectorAll('[data-species-card]')).map(function (el) { return { el: el, records: JSON.parse(el.dataset.records) }; });
    var place = browser.querySelector('[data-filter-place]'), year = browser.querySelector('[data-filter-year]');
    var search = browser.querySelector('[data-species-search]'), buttons = Array.from(browser.querySelectorAll('[data-group]'));
    var params = new URLSearchParams(window.location.search), group = params.get('group') || '';
    if (!buttons.some(function (b) { return b.dataset.group === group; })) group = '';
    [ ['place', place], ['year', year] ].forEach(function (item) { if (Array.from(item[1].options).some(function (o) { return o.value === params.get(item[0]); })) item[1].value = params.get(item[0]); });
    var emptyToggle = browser.querySelector('[data-show-empty-orders]');
    var active = buttons.find(function (b) { return b.dataset.group === group; });
    if (active) {
      emptyToggle.checked = !!active.closest('[data-empty-order]');
      var parent = active.parentElement;
      while (parent && parent !== browser) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
    }
    browser.classList.toggle('show-empty-orders', emptyToggle.checked);
    emptyToggle.addEventListener('change', function () { browser.classList.toggle('show-empty-orders', emptyToggle.checked); });
    function update() {
      var confirmed = 0, pending = 0, photos = 0, query = search.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var matches = card.records.filter(function (r) { return matchesPhoto(r, group, place.value, year.value); });
        card.el.hidden = !matches.length || !card.el.dataset.name.toLowerCase().includes(query);
        if (card.el.hidden) return;
        if (card.el.dataset.status === 'identified') confirmed++; else pending++;
        photos += matches.length;
        card.el.querySelector('[data-species-photo-count]').textContent = matches.length + (matches.length === 1 ? ' photograph' : ' photographs');
        card.el.querySelector('[data-species-places]').textContent = Array.from(new Set(matches.map(function (r) { return r.place; }))).join(' · ');
        card.el.querySelector('img').src = matches[0].thumbnail;
        var target = new URL(card.el.href);
        ['place','year'].forEach(function (key) { var value = key === 'place' ? place.value : year.value; if (value) target.searchParams.set(key, value); else target.searchParams.delete(key); });
        card.el.href = target.href;
      });
      var summary = confirmed + (confirmed === 1 ? ' species' : ' species') + ' · ' + photos + ' photographs' + (pending ? ' · ' + pending + ' pending identification' : '');
      browser.querySelector('[data-species-results]').textContent = summary;
      browser.querySelector('[data-species-summary]').textContent = confirmed + ' species · 物种 / ' + photos + ' photographs · 照片' + (pending ? ' / ' + pending + ' pending · 待确认记录' : '');
      browser.querySelector('[data-photo-empty]').hidden = confirmed + pending > 0;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.group === group)); });
      browser.querySelectorAll('[data-group-count]').forEach(function (el) {
        el.textContent = cards.filter(function (card) { return card.el.dataset.status === 'identified' && card.el.dataset.name.toLowerCase().includes(query) && card.records.some(function (r) { return matchesPhoto(r, el.dataset.groupCount, place.value, year.value); }); }).length;
      });
      var url = new URL(window.location.href);
      [['group',group],['place',place.value],['year',year.value]].forEach(function (pair) { if (pair[1]) url.searchParams.set(pair[0],pair[1]); else url.searchParams.delete(pair[0]); });
      window.history.replaceState(null, '', url);
    }
    buttons.forEach(function (b) { b.addEventListener('click', function (event) { event.preventDefault(); group = b.dataset.group; var details = b.closest('details'); if (details) details.open = true; update(); }); });
    place.addEventListener('change',update); year.addEventListener('change',update); search.addEventListener('input',update);
    browser.querySelector('[data-reset-filters]').addEventListener('click',function () { group=''; place.value=''; year.value=''; search.value=''; update(); });
    update();
  });
  var filters = document.querySelector('[data-album-filters]');
  if (filters) {
    filters.hidden = false;
    var place = document.getElementById('gallery-place');
    var year = document.getElementById('gallery-year');
    function filterAlbums() {
      var count = 0;
      document.querySelectorAll('.album-card').forEach(function (card) {
        card.hidden = !!((place.value && card.dataset.place !== place.value) || (year.value && (card.dataset.years || '').split(' ').indexOf(year.value) === -1));
        if (!card.hidden) count++;
      });
      document.querySelectorAll('[data-album-year]').forEach(function (section) {
        section.hidden = !section.querySelector('.album-card:not([hidden])');
      });
      document.querySelector('.album-empty').hidden = count > 0;
      document.querySelector('.album-filters__count').textContent = count + (count === 1 ? ' album' : ' albums');
    }
    place.addEventListener('change', filterAlbums);
    year.addEventListener('change', filterAlbums);
  }
  document.querySelectorAll('[data-photo-browser]').forEach(function (browser) {
    browser.querySelectorAll('[data-photo-filters], [data-photo-controls]').forEach(function (el) { el.hidden = false; });
    var cards = Array.from(browser.querySelectorAll('[data-photo-card]'));
    var groupSelect = browser.querySelector('[data-filter-group]');
    var placeSelect = browser.querySelector('[data-filter-place]');
    var yearSelect = browser.querySelector('[data-filter-year]');
    var params = new URLSearchParams(window.location.search);
    [['place',placeSelect],['year',yearSelect]].forEach(function (item) { if (item[1] && Array.from(item[1].options).some(function (o) { return o.value === params.get(item[0]); })) item[1].value = params.get(item[0]); });
    var groupButtons = Array.from(browser.querySelectorAll('[data-group]'));
    var requested = new URLSearchParams(window.location.search).get('group') || '';
    var known = groupSelect ? Array.from(groupSelect.options).some(function (o) { return o.value === requested; }) : groupButtons.some(function (b) { return b.dataset.group === requested; });
    var selectedGroup = known ? requested : '';
    if (groupSelect) groupSelect.value = selectedGroup;
    var emptyToggle = browser.querySelector('[data-show-empty-orders]');
    var selectedButton = groupButtons.find(function (button) { return button.dataset.group === selectedGroup; });
    if (emptyToggle) {
      emptyToggle.checked = !!(selectedButton && selectedButton.closest('[data-empty-order]'));
      browser.classList.toggle('show-empty-orders', emptyToggle.checked);
      emptyToggle.addEventListener('change', function () { browser.classList.toggle('show-empty-orders', emptyToggle.checked); });
    }
    if (selectedButton) {
      var ancestor = selectedButton.parentElement;
      while (ancestor && ancestor !== browser) {
        if (ancestor.tagName === 'DETAILS') ancestor.open = true;
        ancestor = ancestor.parentElement;
      }
    }
    function updatePhotos() {
      var group = groupSelect ? groupSelect.value : selectedGroup;
      var place = placeSelect ? placeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var count = 0;
      cards.forEach(function (card) { card.hidden = !matchesPhoto(card.dataset, group, place, year); if (!card.hidden) count++; });
      browser.querySelectorAll('[data-photo-results]').forEach(function (el) { el.textContent = count + (count === 1 ? ' photograph' : ' photographs'); });
      browser.querySelector('[data-photo-empty]').hidden = count > 0;
      groupButtons.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.group === group)); });
      browser.querySelectorAll('[data-group-count]').forEach(function (el) {
        el.textContent = cards.filter(function (card) { return matchesPhoto(card.dataset, el.dataset.groupCount, place, year); }).length;
      });
      browser.querySelectorAll('[data-photo-section]').forEach(function (section) {
        var n = section.querySelectorAll('[data-photo-card]:not([hidden])').length;
        section.hidden = n === 0;
        section.querySelector('[data-section-count]').textContent = n + (n === 1 ? ' photograph' : ' photographs');
        var link = browser.querySelector('[data-day-link="' + section.dataset.photoSection + '"]');
        if (link) link.hidden = n === 0;
      });
    }
    groupButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        selectedGroup = button.dataset.group;
        var details = button.closest('details'); if (details) details.open = true;
        var url = new URL(window.location.href);
        if (selectedGroup) url.searchParams.set('group', selectedGroup); else url.searchParams.delete('group');
        window.history.replaceState(null, '', url);
        updatePhotos();
      });
    });
    [groupSelect, placeSelect, yearSelect].forEach(function (select) { if (select) select.addEventListener('change', updatePhotos); });
    var reset = browser.querySelector('[data-reset-filters]');
    if (reset) reset.addEventListener('click', function () {
      selectedGroup = ''; if (groupSelect) groupSelect.value = ''; if (placeSelect) placeSelect.value = ''; if (yearSelect) yearSelect.value = '';
      var url = new URL(window.location.href); ['group','place','year'].forEach(function (key) { url.searchParams.delete(key); }); window.history.replaceState(null, '', url); updatePhotos();
    });
    updatePhotos();
  });
  var dialog = document.querySelector('.photo-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var links = Array.from(document.querySelectorAll('[data-photo]'));
  var activeLinks = links;
  var current = 0;
  var opener;
  var previousOverflow;
  var image = dialog.querySelector('.photo-lightbox__image');
  var counter = dialog.querySelector('.photo-lightbox__counter');
  var caption = dialog.querySelector('.photo-lightbox__caption');
  function show(index) {
    current = (index + activeLinks.length) % activeLinks.length;
    var link = activeLinks[current];
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    counter.textContent = link.dataset.photoId + ' · ' + (current + 1) + ' / ' + activeLinks.length;
    caption.textContent = link.dataset.caption;
  }
  links.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      activeLinks = links.filter(function (item) { var card = item.closest('[data-photo-card]'); return !card || !card.hidden; });
      show(activeLinks.indexOf(link));
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
    });
  });
  dialog.querySelector('.photo-lightbox__close').addEventListener('click', function () { dialog.close(); });
  dialog.querySelector('.photo-lightbox__previous').addEventListener('click', function () { show(current - 1); });
  dialog.querySelector('.photo-lightbox__next').addEventListener('click', function () { show(current + 1); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('close', function () {
    document.documentElement.style.overflow = previousOverflow;
    if (opener) opener.focus();
  });
})();
