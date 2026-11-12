(function () {
  'use strict';
  var filters = document.querySelector('[data-album-filters]');
  if (filters) {
    filters.hidden = false;
    var place = document.getElementById('gallery-place');
    var year = document.getElementById('gallery-year');
    function filterAlbums() {
      var count = 0;
      document.querySelectorAll('.album-card').forEach(function (card) {
        card.hidden = !!((place.value && card.dataset.place !== place.value) || (year.value && card.dataset.year !== year.value));
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
  var dialog = document.querySelector('.photo-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var links = Array.from(document.querySelectorAll('[data-photo]'));
  var current = 0;
  var opener;
  var previousOverflow;
  var image = dialog.querySelector('.photo-lightbox__image');
  var counter = dialog.querySelector('.photo-lightbox__counter');
  var caption = dialog.querySelector('.photo-lightbox__caption');
  function show(index) {
    current = (index + links.length) % links.length;
    var link = links[current];
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    counter.textContent = link.dataset.photoId + ' · ' + (current + 1) + ' / ' + links.length;
    caption.textContent = link.dataset.caption;
  }
  links.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      show(index);
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
