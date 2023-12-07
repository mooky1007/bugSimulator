document.querySelectorAll('aside ul li').forEach((el) => {
    if(!el.querySelector('a')) return;
    if (el.querySelector('a').href === window.location.href) {
        el.classList.add('active');
    }
});