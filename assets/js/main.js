function toggleMenu() {
  var nav = document.getElementById('nav-links');
  if (!nav) return;
  var isOpen = nav.classList.contains('open');
  if (isOpen) {
    nav.classList.remove('open');
  } else {
    nav.classList.add('open');
  }
}

// Close mobile menu on link click
window.addEventListener('DOMContentLoaded', function () {
  var nav = document.getElementById('nav-links');
  if (!nav) return;
  nav.addEventListener('click', function (e) {
    var target = e.target;
    if (target && target.tagName === 'A' && nav.classList.contains('open')) {
      nav.classList.remove('open');
    }
  });
});
