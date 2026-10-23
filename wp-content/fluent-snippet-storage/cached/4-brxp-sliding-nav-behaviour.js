/* @since 1.3.4 */
/**
 * BRXP Sliding Nav: behaviour.
 *
 * Pairs with the "BRXP Sliding Nav: global class" PHP snippet, which creates
 * the brxp-nav global class holding all the CSS. Turns the accordion mobile
 * menu of any Nav Menu element carrying that class into a sliding drill-down.
 *
 * Runs on every front-end page (Fluent Snippets, Site Wide Footer) and does
 * nothing unless a .brxp-nav Nav Menu is on the page. Never in the builder:
 * its canvas keeps Bricks' expanded menu so every item stays editable.
 *
 * Optional attributes on the Nav Menu element (Style → Attributes):
 *   data-brxp-logo-src   Image URL shown at the top of the open mobile menu.
 *   data-brxp-logo-alt   Alt text for that image.
 *   data-brxp-logo-href  Makes the logo a link (e.g. your home URL).
 *   data-brxp-back-text  Back button text. Default "Back".
 */
(function () {
    'use strict';

    // .bricks-is-frontend is Bricks' own body class on the front end; the
    // builder's windows do not carry it.
    if (!document.body || !document.body.classList.contains('bricks-is-frontend')) return;

    var BACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
        '<path d="M7.5 2.5L3.5 6l4 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
        '<path d="M2.5 2.5l7 7M9.5 2.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

    function itemLabel(li) {
        var label = li.querySelector(':scope > .brx-submenu-toggle > a, :scope > .brx-submenu-toggle > span');
        return label ? label.textContent.trim() : '';
    }

    function toggleButton(li) {
        return li.querySelector(':scope > .brx-submenu-toggle > button');
    }

    function isTransparent(color) {
        return !color || color === 'transparent' || /^rgba\(.*,\s*0\)$/.test(color);
    }

    function init(root) {
        if (root.hasAttribute('data-brxp-nav-ready')) return;
        var wrapper = root.querySelector('.bricks-mobile-menu-wrapper');
        var track = wrapper && wrapper.querySelector(':scope > .bricks-mobile-menu');
        var menuToggle = root.querySelector('.bricks-mobile-menu-toggle');
        if (!track || !menuToggle) return;
        root.setAttribute('data-brxp-nav-ready', '');

        // Keeps a link only if it resolves to http(s); a relative URL takes
        // the page's scheme and passes. `javascript:` would run on click.
        function safeHref(value) {
            if (!value) return '';
            var a = document.createElement('a');
            a.href = value;
            return a.protocol === 'http:' || a.protocol === 'https:' ? value : '';
        }

        // Bricks renders a Nav Menu's custom attributes on the mobile
        // wrapper <nav>; fall back to the element root.
        function setting(name) {
            return wrapper.getAttribute(name) || root.getAttribute(name);
        }

        // Panels must be opaque to cover the level below. The menu's fill is
        // painted on wrapper::before, by this skin or by the element's own
        // background control, so borrow whatever is there. The text colour
        // comes from a top-level link, the only place Bricks' typography
        // control reaches. Cleared first so a stale copy is never read back,
        // and re-read on every open: a colour-scheme switch can change both.
        var firstLink = track.querySelector(':scope > li > a, :scope > li > .brx-submenu-toggle > a');
        function syncColours() {
            root.style.removeProperty('--_brxp-nav-bg');
            root.style.removeProperty('--_brxp-nav-fg');
            var bg = getComputedStyle(wrapper, '::before').backgroundColor;
            if (isTransparent(bg)) bg = getComputedStyle(wrapper).backgroundColor;
            if (!isTransparent(bg)) root.style.setProperty('--_brxp-nav-bg', bg);
            if (firstLink) {
                // The skin transitions link colour, so a read straight after
                // the clear above returns the START of that transition: the
                // stale colour. Read with transitions off.
                firstLink.style.transition = 'none';
                root.style.setProperty('--_brxp-nav-fg', getComputedStyle(firstLink).color);
                firstLink.style.transition = '';
            }
        }

        // Bricks positions sub-menus to keep desktop dropdowns on screen and
        // flags nested ones brx-sub-submenu-overflow-right, whose
        // left/right rules are !important (and layered when CSS layers are
        // on). data-static is Bricks' own opt-out from that positioning.
        var parents = track.querySelectorAll('li.menu-item-has-children, li:has(> .brx-megamenu)');
        for (var p = 0; p < parents.length; p++) parents[p].setAttribute('data-static', '');
        var panels = track.querySelectorAll('.sub-menu, .brx-megamenu');
        for (var q = 0; q < panels.length; q++) {
            panels[q].classList.remove('brx-submenu-overflow-right', 'brx-sub-submenu-overflow-right', 'brx-multilevel-overflow-right');
            panels[q].style.removeProperty('left');
            panels[q].style.removeProperty('min-width');
        }

        // Header row: logo and close
        var head = document.createElement('div');
        head.className = 'brxp-nav__head';

        var logoSrc = setting('data-brxp-logo-src');
        if (logoSrc) {
            var figure = document.createElement('figure');
            figure.className = 'brxp-nav__logo';
            var img = document.createElement('img');
            img.src = logoSrc;
            img.decoding = 'async';
            var href = safeHref(setting('data-brxp-logo-href'));
            img.alt = setting('data-brxp-logo-alt') || (href ? 'Home' : '');
            if (href) {
                var link = document.createElement('a');
                link.href = href;
                link.appendChild(img);
                figure.appendChild(link);
            } else {
                figure.appendChild(img);
            }
            head.appendChild(figure);
        }

        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'brxp-nav__close';
        close.innerHTML = CLOSE_ICON;
        var i18n = window.bricksData && window.bricksData.i18n;
        close.setAttribute('aria-label', (i18n && i18n.closeMobileMenu) || 'Close menu');
        // Close through Bricks' own toggle so its state and focus return stay
        // consistent; it lands focus back on the hamburger.
        close.addEventListener('click', function () { menuToggle.click(); });
        head.appendChild(close);
        wrapper.insertBefore(head, track);

        // Back row
        var bar = document.createElement('div');
        bar.className = 'brxp-nav__bar';
        bar.hidden = true;
        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'brxp-nav__back';
        back.innerHTML = BACK_ICON + '<span class="brxp-nav__back-text"></span>';
        back.lastChild.textContent = setting('data-brxp-back-text') || 'Back';
        var title = document.createElement('span');
        title.className = 'brxp-nav__title';
        bar.appendChild(back);
        bar.appendChild(title);
        wrapper.insertBefore(bar, track);

        function deepestOpen() {
            var open = track.querySelectorAll('li.open');
            return open.length ? open[open.length - 1] : null;
        }

        function update() {
            var current = deepestOpen();
            bar.hidden = !current;
            title.textContent = current ? itemLabel(current) : '';
        }

        // Close through Bricks' own toggle so its state stays consistent,
        // then return focus to the item we came from.
        function goBack() {
            var current = deepestOpen();
            if (!current) return;
            var button = toggleButton(current);
            if (!button) return;
            button.click();
            requestAnimationFrame(function () { button.focus({ preventScroll: true }); });
        }

        var pendingFocus = null;

        // Before Bricks opens a sub-menu: line the panel up with the parent's
        // scroll position and remember to move focus into it.
        track.addEventListener('click', function (e) {
            var button = e.target.closest('.brx-submenu-toggle > button');
            if (!button || !track.contains(button)) return;
            var li = button.closest('li');
            var panel = li && li.querySelector(':scope > .sub-menu, :scope > .brx-megamenu');
            if (!panel || li.classList.contains('open')) return;
            panel.style.setProperty('--_brxp-nav-offset', li.parentElement.scrollTop + 'px');
            panel.scrollTop = 0;
            pendingFocus = panel;
        }, true);

        // Bricks marks any clicked in-page link (an href with #) as the
        // current page. A parent item's link opens its sub-menu instead of
        // going anywhere, so undo that for it. For links that do navigate,
        // keep Bricks' marking but clear the previous one, as Bricks does on
        // desktop; its clearing never looks inside the mobile menu, so
        // every link clicked there stayed marked.
        var clickedWasCurrent = false;
        track.addEventListener('click', function (e) {
            var link = e.target.closest('a[data-brx-anchor]');
            clickedWasCurrent = !!link && link.closest('li').classList.contains('current-menu-item');
        }, true);
        track.addEventListener('click', function (e) {
            var link = e.target.closest('a[data-brx-anchor]');
            if (!link || !track.contains(link)) return;
            var li = link.closest('li');
            if (link.parentElement.classList.contains('brx-submenu-toggle')) {
                if (!clickedWasCurrent) {
                    li.classList.remove('current-menu-item');
                    link.removeAttribute('aria-current');
                }
                return;
            }
            var marked = track.querySelectorAll('li.current-menu-item');
            for (var m = 0; m < marked.length; m++) {
                if (marked[m] === li) continue;
                marked[m].classList.remove('current-menu-item');
                var markedLink = marked[m].querySelector(':scope > a, :scope > .brx-submenu-toggle > a');
                if (markedLink) markedLink.removeAttribute('aria-current');
            }
        });

        new MutationObserver(function () {
            update();
            if (pendingFocus && pendingFocus.parentElement.classList.contains('open')) {
                var first = pendingFocus.querySelector('a[href], button');
                pendingFocus = null;
                // A mega menu template may hold nothing focusable; focus would
                // otherwise stay on the arrow, now hidden behind the panel.
                (first || back).focus({ preventScroll: true });
            }
        }).observe(track, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] });

        // Bricks closes every open sub-menu on a click outside them, and the
        // Back button sits outside them all; keep that click to ourselves.
        back.addEventListener('click', function (e) {
            e.stopPropagation();
            goBack();
        });

        // Escape steps back one level before it closes the whole menu. Bricks
        // closes the menu on a document keyup, so swallow both events while
        // a sub-menu is open and act on keyup.
        wrapper.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && deepestOpen()) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        wrapper.addEventListener('keyup', function (e) {
            if (e.key === 'Escape' && deepestOpen()) {
                e.stopPropagation();
                goBack();
            }
        });

        // On open, refresh the panel fill; once closed, start again at the
        // top level next time. Waits out a close animation still playing
        // (brxp-nav--closing, set by the GSAP effects snippet) so the panels
        // do not jump while the drawer is still on screen.
        function resetWhenClosed() {
            if (root.classList.contains('show-mobile-menu')) return;
            if (root.classList.contains('brxp-nav--closing')) {
                setTimeout(resetWhenClosed, 100);
                return;
            }
            var open = track.querySelectorAll('li.open');
            for (var i = open.length - 1; i >= 0; i--) {
                open[i].classList.remove('open', 'active');
                var button = toggleButton(open[i]);
                if (button) button.setAttribute('aria-expanded', 'false');
            }
            track.scrollTop = 0;
        }
        new MutationObserver(function () {
            if (root.classList.contains('show-mobile-menu')) {
                syncColours();
                return;
            }
            setTimeout(resetWhenClosed, 400);
        }).observe(root, { attributes: true, attributeFilter: ['class'] });

        // A light/dark switch while the menu is open (Bricks' Toggle Mode
        // element flips data-brx-theme on <html>; other frameworks use a
        // class) changes both colours under the panels. The CSS defaults
        // follow on their own; the two copied colours need re-reading.
        new MutationObserver(function () {
            if (root.classList.contains('show-mobile-menu')) syncColours();
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-brx-theme', 'class'] });

        syncColours();
        update();
    }

    function initAll() {
        var roots = document.querySelectorAll('.brxe-nav-menu.brxp-nav');
        for (var i = 0; i < roots.length; i++) init(roots[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
