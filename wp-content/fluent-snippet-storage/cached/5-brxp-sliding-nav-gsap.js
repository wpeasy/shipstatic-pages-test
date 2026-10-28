/* @since 1.3.4 */
/**
 * BRXP Sliding Nav: GSAP effects.
 *
 * REQUIRES GSAP. Enable BRXProd's "GSAP Loader" snippet (Code Snippets tab)
 * in your site header. GSAP core covers every effect except `scramble`,
 * which also needs ScrambleTextPlugin: uncomment its line in the loader
 * (ScrambleTextPlugin.min.js). Without GSAP, or for visitors who prefer
 * reduced motion, this does nothing and the menu keeps its CSS transitions.
 * `scramble` without its plugin runs as `glide`.
 *
 * Optional third snippet of the brxp-sliding-nav bundle. Needs the other two
 * enabled ("global class" and "behaviour"); it replaces only the animations:
 * the drawer opening and closing, panels drilling in and back, and a
 * staggered entrance for the items.
 *
 * Choose an effect per menu with an attribute on the Nav Menu element
 * (Style → Attributes):
 *
 *   data-brxp-nav-effect="glide"   Drawer glides in and settles; the panel
 *                                  you leave drifts back behind the new one.
 *                                  The default when the attribute is unset.
 *   data-brxp-nav-effect="spring"  Drawer springs in with an elastic settle;
 *                                  items pop up with a small bounce.
 *   data-brxp-nav-effect="reveal"  Drawer and panels are wiped open with a
 *                                  clip-path; items rise behind the wipe.
 *   data-brxp-nav-effect="depth"   Drawer scales up out of a blur; the panel
 *                                  you leave recedes and dims like a card
 *                                  underneath the new one.
 *   data-brxp-nav-effect="iris"    Drawer opens as a circle growing out of
 *                                  the hamburger and closes back into it;
 *                                  panels open out of the arrow you tapped.
 *   data-brxp-nav-effect="fold"    3D: the drawer swings in on a hinge at its
 *                                  outer edge like a door; panels swing in
 *                                  and away like turning pages.
 *   data-brxp-nav-effect="layers"  Coloured sheets sweep across ahead of the
 *                                  drawer, which arrives last; panels sweep
 *                                  in tinted and settle to their colour.
 *                                  Sheet colours: --brxp-nav-layer-1 and
 *                                  --brxp-nav-layer-2 (primary shades).
 *   data-brxp-nav-effect="scramble" Glide, with each label decoding from
 *                                  random characters as it appears. Needs
 *                                  ScrambleTextPlugin (see above). The real
 *                                  label stays available to screen readers.
 *
 * How it stays out of Bricks' way: Bricks moves the drawer with
 * `transform: … !important`, which no inline style can beat, so the drawer
 * is animated through properties Bricks never sets (translate and scale via
 * custom properties, filter, clip-path). Items are animated through their
 * link and arrow box, never the <li>: a transform on an <li> would make it
 * the containing block for the sub-menu panel inside it.
 */
(function () {
    'use strict';

    if (!document.body || !document.body.classList.contains('bricks-is-frontend')) return;

    var EFFECTS = {
        glide: {
            drawerOpen: { from: { dx: 1 }, to: { dx: 0 }, duration: 0.75, ease: 'expo.out' },
            drawerClose: { to: { dx: 1 }, duration: 0.45, ease: 'power3.in' },
            items: { from: { x: -28, opacity: 0 }, duration: 0.55, ease: 'power3.out', stagger: 0.045, delay: 0.12 },
            panelIn: { duration: 0.6, ease: 'expo.out' },
            panelOut: { duration: 0.45, ease: 'power3.inOut' },
            behind: { x: '-30%', opacity: 0.35 }
        },
        spring: {
            drawerOpen: { from: { dx: 1 }, to: { dx: 0 }, duration: 1.1, ease: 'elastic.out(1, 0.75)' },
            drawerClose: { to: { dx: 1 }, duration: 0.35, ease: 'power2.in' },
            items: { from: { y: 18, scale: 0.9, opacity: 0 }, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.05, delay: 0.15 },
            panelIn: { duration: 0.9, ease: 'elastic.out(1, 0.8)' },
            panelOut: { duration: 0.4, ease: 'power2.inOut' },
            behind: { scale: 0.96, opacity: 0.5 }
        },
        reveal: {
            drawerOpen: { from: { clip: 1 }, to: { clip: 0 }, duration: 0.8, ease: 'power4.inOut' },
            drawerClose: { to: { clip: 1 }, duration: 0.5, ease: 'power3.in' },
            items: { from: { y: 24, opacity: 0 }, duration: 0.6, ease: 'power3.out', stagger: 0.05, delay: 0.3 },
            panelIn: { duration: 0.7, ease: 'power4.inOut', clip: true },
            panelOut: { duration: 0.5, ease: 'power3.inOut', clip: true },
            behind: { opacity: 0.4 }
        },
        depth: {
            drawerOpen: { from: { scale: 0.92, blur: 10, fade: 0 }, to: { scale: 1, blur: 0, fade: 1 }, duration: 0.6, ease: 'power3.out' },
            drawerClose: { to: { scale: 0.94, blur: 8, fade: 0 }, duration: 0.35, ease: 'power2.in' },
            items: { from: { y: 14, opacity: 0 }, duration: 0.5, ease: 'power2.out', stagger: 0.04, delay: 0.1 },
            panelIn: { duration: 0.55, ease: 'power3.out' },
            panelOut: { duration: 0.45, ease: 'power3.inOut' },
            behind: { scale: 0.88, opacity: 0.3, recede: true }
        },
        iris: {
            drawerOpen: { from: { iris: 0 }, to: { iris: 1 }, duration: 0.8, ease: 'power3.inOut' },
            drawerClose: { to: { iris: 0 }, duration: 0.55, ease: 'power3.in' },
            items: { from: { y: 16, opacity: 0 }, duration: 0.5, ease: 'power2.out', stagger: 0.04, delay: 0.3 },
            panelIn: { duration: 0.65, ease: 'power3.inOut', iris: true },
            panelOut: { duration: 0.5, ease: 'power3.inOut', iris: true },
            behind: { opacity: 0.35 }
        },
        fold: {
            drawerOpen: { from: { rot: 1 }, to: { rot: 0 }, duration: 0.9, ease: 'power3.out' },
            drawerClose: { to: { rot: 1 }, duration: 0.5, ease: 'power2.in' },
            items: { from: { x: -20, opacity: 0 }, duration: 0.5, ease: 'power2.out', stagger: 0.04, delay: 0.25 },
            panelIn: { duration: 0.7, ease: 'power3.out', fold: true },
            panelOut: { duration: 0.5, ease: 'power2.in', fold: true },
            behind: { x: '-12%', opacity: 0.3 }
        },
        layers: {
            drawerOpen: { from: { dx: 1 }, to: { dx: 0 }, duration: 0.75, ease: 'power4.inOut', layers: true },
            drawerClose: { to: { dx: 1 }, duration: 0.45, ease: 'power3.in', layers: true },
            items: { from: { x: -24, opacity: 0 }, duration: 0.55, ease: 'power3.out', stagger: 0.045, delay: 0.45 },
            panelIn: { duration: 0.7, ease: 'power4.inOut', tint: true },
            panelOut: { duration: 0.45, ease: 'power3.inOut' },
            behind: { x: '-20%', opacity: 0.35 }
        },
        scramble: {
            drawerOpen: { from: { dx: 1 }, to: { dx: 0 }, duration: 0.75, ease: 'expo.out' },
            drawerClose: { to: { dx: 1 }, duration: 0.45, ease: 'power3.in' },
            items: { from: { x: -16, opacity: 0 }, duration: 0.45, ease: 'power3.out', stagger: 0.05, delay: 0.12, scramble: true },
            panelIn: { duration: 0.6, ease: 'expo.out' },
            panelOut: { duration: 0.45, ease: 'power3.inOut' },
            behind: { x: '-30%', opacity: 0.35 }
        }
    };

    // Swing angle of a folded drawer or panel, in degrees. Past 90 so the
    // closed pose is fully turned away.
    var FOLD_DEG = 95;

    // Switches Bricks' and the class's own CSS transitions off while GSAP
    // drives, and gives the drawer the properties the timelines animate.
    // !important: these have to beat Bricks' drawer rules and the class's
    // panel transitions; they only apply to menus this script manages.
    var CSS = [
        '.brxe-nav-menu.brxp-nav.brxp-nav--gsap .bricks-mobile-menu-wrapper {',
        '  transition: none !important;',
        '  transform: none !important;',
        '  translate: calc(var(--brxp-nav-dx, 0) * 100% * var(--brxp-nav-side, -1)) 0;',
        '  scale: var(--brxp-nav-ds, 1);',
        '}',
        // Only for the effects that use them: a filter or clip-path, even a
        // no-op one, makes the drawer a containing block and a separate layer.
        '.brxe-nav-menu.brxp-nav.brxp-nav--fx-depth .bricks-mobile-menu-wrapper {',
        '  filter: blur(calc(var(--brxp-nav-blur, 0) * 1px)) opacity(var(--brxp-nav-fade, 1));',
        '}',
        // spring overshoots past the screen edge; extend the drawer's fill
        // (Bricks paints it on ::before, where the element's own background
        // control lands too) beyond its outer edge so no gap shows.
        '.brxe-nav-menu.brxp-nav.brxp-nav--fx-spring .bricks-mobile-menu-wrapper.left::before { left: -120px; }',
        '.brxe-nav-menu.brxp-nav.brxp-nav--fx-spring .bricks-mobile-menu-wrapper.right::before { right: -120px; }',
        '.brxe-nav-menu.brxp-nav.brxp-nav--fx-reveal .bricks-mobile-menu-wrapper {',
        '  clip-path: inset(0 calc(var(--brxp-nav-clip-end, 0) * 100%) 0 calc(var(--brxp-nav-clip-start, 0) * 100%));',
        '}',
        // iris: a circle centred on the hamburger; the script sets the centre
        // and the radius that reaches the drawer's farthest corner.
        '.brxe-nav-menu.brxp-nav.brxp-nav--fx-iris .bricks-mobile-menu-wrapper {',
        '  clip-path: circle(calc(var(--brxp-nav-iris-r, 0) * 1px) at var(--brxp-nav-iris-x, 0px) var(--brxp-nav-iris-y, 0px));',
        '}',
        // fold: Bricks locks the drawer's transform, so the hinge swing goes
        // on the rotate property of what the drawer shows (its ::before fill
        // and its children), all hinged on the same outer edge, with the
        // drawer supplying the perspective.
        '.brxe-nav-menu.brxp-nav.brxp-nav--fx-fold .bricks-mobile-menu-wrapper { perspective: 1100px; }',
        '.brxe-nav-menu.brxp-nav.brxp-nav--fx-fold .bricks-mobile-menu-wrapper::before,',
        '.brxe-nav-menu.brxp-nav.brxp-nav--fx-fold .bricks-mobile-menu-wrapper > * {',
        '  rotate: y calc(var(--brxp-nav-rot, 0) * 1deg);',
        '  transform-origin: var(--brxp-nav-hinge, left) center;',
        '  backface-visibility: hidden;',
        '}',
        // layers: the sheets that sweep ahead of the drawer, sized to it by
        // the script, above Bricks' overlay and below the drawer.
        '.brxe-nav-menu.brxp-nav .brxp-nav__layer { position: fixed; z-index: 998; pointer-events: none; visibility: hidden; }',
        '.brxe-nav-menu.brxp-nav .brxp-nav__layer--1 { background: var(--brxp-nav-layer-1, var(--brxp-primary-d-3, var(--primary-d-2, #3a44c4))); }',
        '.brxe-nav-menu.brxp-nav .brxp-nav__layer--2 { background: var(--brxp-nav-layer-2, var(--brxp-primary, var(--primary, #4a55e0))); }',
        '.brxe-nav-menu.brxp-nav.brxp-nav--gsap.brxp-nav--closing .bricks-mobile-menu-wrapper {',
        '  visibility: visible !important;',
        '  pointer-events: none;',
        '}',
        // Panels: GSAP owns their position. The class parks closed panels
        // off-canvas with the translate property, but GSAP 3.12+ folds an
        // element's CSS translate into its own transform, so mixing the two
        // sent a closing panel the wrong way. Closed panels are hidden
        // (visibility) anyway, so they need no offset here.
        '.brxe-nav-menu.brxp-nav.brxp-nav--gsap .bricks-mobile-menu-wrapper :is(.sub-menu, .brx-megamenu) { transition: none !important; translate: none !important; }',
        '.brxe-nav-menu.brxp-nav.brxp-nav--gsap .bricks-mobile-menu-wrapper :is(.sub-menu > li, .brx-megamenu > *) { animation: none !important; }'
    ].join('\n');

    function injectCss() {
        if (document.getElementById('brxp-sliding-nav-gsap-css')) return;
        var style = document.createElement('style');
        style.id = 'brxp-sliding-nav-gsap-css';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    // The link and arrow box of each item directly in a panel, never the <li>.
    function itemParts(panel) {
        return panel.querySelectorAll(':scope > li > a, :scope > li > .brx-submenu-toggle');
    }

    // A sub-menu or a mega menu template (Bricks' Mega menu option), each a
    // panel of its own.
    var PANEL = ':scope > .sub-menu, :scope > .brx-megamenu';

    // What staggers in as a panel arrives: a sub-menu's items, or a mega
    // menu template's top-level elements.
    function enteringParts(panel) {
        return panel.classList.contains('brx-megamenu') ? panel.children : itemParts(panel);
    }

    function setup(root) {
        if (root.hasAttribute('data-brxp-nav-gsap')) return null;
        var wrapper = root.querySelector('.bricks-mobile-menu-wrapper');
        var track = wrapper && wrapper.querySelector(':scope > .bricks-mobile-menu');
        if (!track) return null;
        root.setAttribute('data-brxp-nav-gsap', '');

        // Bricks renders a Nav Menu's custom attributes on the mobile wrapper.
        var name = wrapper.getAttribute('data-brxp-nav-effect') || root.getAttribute('data-brxp-nav-effect') || 'glide';
        if (!EFFECTS[name]) name = 'glide';
        var fx = EFFECTS[name];
        var isRtl = getComputedStyle(root).direction === 'rtl';
        var panelDir = isRtl ? -1 : 1;
        // The drawer enters from its own side: left by default, right when
        // Bricks' "Mobile menu position" is right.
        var drawerSide = wrapper.classList.contains('right') ? 1 : -1;

        root.classList.add('brxp-nav--gsap', 'brxp-nav--fx-' + name);
        root.style.setProperty('--brxp-nav-side', String(drawerSide));

        // Items enter from the direction of travel: from the drawer's side
        // as it opens, from the far side as a panel drills in.
        function itemsFrom(sign) {
            var from = Object.assign({}, fx.items.from);
            if (from.x) from.x = from.x * sign;
            return from;
        }
        var drawerSign = drawerSide < 0 ? 1 : -1;

        // Drawer state lives in custom properties so GSAP never fights
        // Bricks' transform. clip: 1 = fully wiped shut from the far edge.
        var state = { dx: 0, scale: 1, blur: 0, fade: 1, clip: 0, iris: 1, rot: 0 };
        var irisRadius = 0;
        function paint() {
            root.style.setProperty('--brxp-nav-iris-r', String(state.iris * irisRadius));
            // A left drawer is hinged on its left edge and swings its right
            // edge away; mirrored for a right drawer.
            root.style.setProperty('--brxp-nav-rot', String(state.rot * FOLD_DEG * -drawerSide));
            root.style.setProperty('--brxp-nav-dx', String(state.dx));
            root.style.setProperty('--brxp-nav-ds', String(state.scale));
            root.style.setProperty('--brxp-nav-blur', String(state.blur));
            root.style.setProperty('--brxp-nav-fade', String(state.fade));
            // Wipe towards the inside: a left drawer opens rightwards.
            root.style.setProperty('--brxp-nav-clip-end', String(drawerSide < 0 ? state.clip : 0));
            root.style.setProperty('--brxp-nav-clip-start', String(drawerSide < 0 ? 0 : state.clip));
        }
        root.style.setProperty('--brxp-nav-hinge', drawerSide < 0 ? 'left' : 'right');

        // iris: centre the circle on the hamburger, in the drawer's own
        // coordinates, with a radius that reaches the drawer's farthest
        // corner. The drawer is never moved in this effect, so its box is
        // its open box even while hidden.
        var menuToggle = root.querySelector('.bricks-mobile-menu-toggle');
        function aimIris() {
            var w = wrapper.getBoundingClientRect();
            var t = menuToggle ? menuToggle.getBoundingClientRect() : { left: w.left, top: w.top, width: 0, height: 0 };
            var cx = t.left + t.width / 2 - w.left;
            var cy = t.top + t.height / 2 - w.top;
            irisRadius = Math.max(
                Math.hypot(cx, cy), Math.hypot(w.width - cx, cy),
                Math.hypot(cx, w.height - cy), Math.hypot(w.width - cx, w.height - cy)
            );
            root.style.setProperty('--brxp-nav-iris-x', cx + 'px');
            root.style.setProperty('--brxp-nav-iris-y', cy + 'px');
        }

        // A circle centred on an element, sized to cover the whole panel.
        function circleFrom(panel, el, open) {
            var p = panel.getBoundingClientRect();
            var e = el ? el.getBoundingClientRect() : { left: p.left, top: p.top, width: 0, height: 0 };
            var cx = e.left + e.width / 2 - p.left;
            var cy = e.top + e.height / 2 - p.top;
            var r = open ? Math.max(Math.hypot(cx, cy), Math.hypot(p.width - cx, cy),
                Math.hypot(cx, p.height - cy), Math.hypot(p.width - cx, p.height - cy)) : 0;
            return 'circle(' + r + 'px at ' + cx + 'px ' + cy + 'px)';
        }

        // layers: two sheets beside the drawer, sized to it on each open.
        var layers = [];
        if (name === 'layers') {
            for (var n = 1; n <= 2; n++) {
                var sheet = document.createElement('div');
                sheet.className = 'brxp-nav__layer brxp-nav__layer--' + n;
                sheet.setAttribute('aria-hidden', 'true');
                root.appendChild(sheet);
                layers.push(sheet);
            }
        }
        function sizeLayers() {
            var cs = getComputedStyle(wrapper);
            for (var l = 0; l < layers.length; l++) {
                var st = layers[l].style;
                st.top = cs.top;
                st.width = cs.width;
                st.height = cs.height;
                if (drawerSide < 0) { st.left = cs.left; st.right = 'auto'; }
                else { st.right = cs.right; st.left = 'auto'; }
            }
        }

        // scramble: needs ScrambleTextPlugin from the GSAP Loader.
        var canScramble = false;
        if (fx.items.scramble) {
            if (window.ScrambleTextPlugin) {
                gsap.registerPlugin(window.ScrambleTextPlugin);
                canScramble = true;
            } else if (window.console) {
                console.info('[BRXP Sliding Nav] scramble needs ScrambleTextPlugin: enable its line in the GSAP Loader. Using glide.');
            }
        }
        // The text-only label inside an item part, or null.
        function labelOf(part) {
            var label = part.tagName === 'A' ? part : part.querySelector(':scope > a, :scope > span');
            return label && label.children.length === 0 && label.textContent.trim() ? label : null;
        }
        function scramble(parts, delay) {
            if (!canScramble) return;
            for (var i = 0; i < parts.length; i++) {
                var label = labelOf(parts[i]);
                if (!label) continue;
                if (!label.hasAttribute('data-brxp-nav-label')) label.setAttribute('data-brxp-nav-label', label.textContent);
                var text = label.getAttribute('data-brxp-nav-label');
                // Screen readers get the real label while the visible text
                // is scrambled; restored however the animation ends.
                var restore = (function (el, t) {
                    return function () { el.textContent = t; el.removeAttribute('aria-label'); };
                })(label, text);
                label.setAttribute('aria-label', text);
                gsap.killTweensOf(label);
                gsap.to(label, {
                    scrambleText: { text: text, chars: 'upperAndLowerCase', speed: 0.5 },
                    duration: 0.7, delay: delay + i * fx.items.stagger, ease: 'none',
                    onComplete: restore, onInterrupt: restore
                });
            }
        }
        function allParts(panel) {
            return Array.prototype.slice.call(itemParts(panel));
        }

        paint();

        var drawerTl = null;
        var wasOpen = root.classList.contains('show-mobile-menu');

        function openDrawer() {
            if (drawerTl) drawerTl.kill();
            root.classList.remove('brxp-nav--closing');
            if (name === 'iris') aimIris();
            if (layers.length) sizeLayers();
            // From the closed pose, unless a close was interrupted mid-way:
            // then carry on from wherever it got to.
            if (!drawerTl) gsap.set(state, Object.assign({}, fx.drawerOpen.from, { onUpdate: paint }));
            paint();
            var head = wrapper.querySelectorAll(':scope > .brxp-nav__head');
            var parts = Array.prototype.slice.call(head).concat(Array.prototype.slice.call(itemParts(track)));
            drawerTl = gsap.timeline({ onComplete: function () { drawerTl = null; } });
            var drawerAt = 0;
            if (fx.drawerOpen.layers) {
                // The sheets sweep across first; the drawer arrives last and
                // covers them, after which they are hidden again.
                drawerTl.fromTo(layers, { xPercent: 100 * drawerSide, autoAlpha: 1 }, {
                    xPercent: 0, duration: 0.6, ease: 'power4.inOut', stagger: 0.09
                }, 0);
                drawerAt = 0.18;
                // Hidden only once the drawer fully covers them.
                drawerTl.set(layers, { autoAlpha: 0 }, drawerAt + fx.drawerOpen.duration);
            }
            drawerTl.to(state, Object.assign({}, fx.drawerOpen.to, {
                duration: fx.drawerOpen.duration, ease: fx.drawerOpen.ease, onUpdate: paint
            }), drawerAt);
            drawerTl.fromTo(parts, itemsFrom(drawerSign), {
                x: 0, y: 0, scale: 1, opacity: 1,
                duration: fx.items.duration, ease: fx.items.ease, stagger: fx.items.stagger,
                clearProps: 'transform,opacity'
            }, fx.items.delay);
            scramble(parts, fx.items.delay);
        }

        function closeDrawer() {
            if (drawerTl) drawerTl.kill();
            // Bricks has already hidden the drawer; keep it visible until the
            // close has played.
            root.classList.add('brxp-nav--closing');
            drawerTl = gsap.timeline({
                onComplete: function () {
                    root.classList.remove('brxp-nav--closing');
                    drawerTl = null;
                }
            });
            if (name === 'iris') aimIris();
            drawerTl.to(state, Object.assign({}, fx.drawerClose.to, {
                duration: fx.drawerClose.duration, ease: fx.drawerClose.ease, onUpdate: paint
            }));
            if (fx.drawerClose.layers) {
                // The sheets were under the drawer: show them as it leaves,
                // then sweep them away in reverse order.
                if (layers.length) sizeLayers();
                drawerTl.set(layers, { xPercent: 0, autoAlpha: 1 }, 0);
                drawerTl.to(layers.slice().reverse(), {
                    xPercent: 100 * drawerSide, duration: 0.45, ease: 'power3.in', stagger: 0.08
                }, fx.drawerClose.duration * 0.6);
                drawerTl.set(layers, { autoAlpha: 0 });
            }
        }

        // Moves the parent panel's items aside while the child covers them
        // (and back on return). They stay visible for the duration even
        // though the class's CSS hides a covered panel immediately.
        function behind(parentPanel, entering, duration, ease) {
            var parts = itemParts(parentPanel);
            if (!parts.length) return null;
            var pose = Object.assign({}, fx.behind);
            var recede = pose.recede;
            delete pose.recede;
            if (pose.x) pose.x = panelDir < 0 ? pose.x.replace('-', '') : pose.x;
            if (recede) {
                // Scale every item about the panel's centre, so the whole
                // list recedes like one card rather than each item shrinking
                // in place.
                var box = parentPanel.getBoundingClientRect();
                pose.transformOrigin = function (i, el) {
                    var r = el.getBoundingClientRect();
                    return (box.left + box.width / 2 - r.left) + 'px ' + (box.top + box.height / 2 - r.top) + 'px';
                };
            }
            gsap.set(parentPanel, { visibility: 'visible' });
            var done = function () { gsap.set(parentPanel, { clearProps: 'visibility' }); };
            if (entering) {
                return gsap.to(parts, Object.assign(pose, {
                    duration: duration, ease: ease, overwrite: 'auto',
                    onComplete: function () { gsap.set(parts, { clearProps: 'transform,opacity,transformOrigin' }); done(); }
                }));
            }
            return gsap.fromTo(parts, pose, {
                x: 0, scale: 1, opacity: 1, duration: duration, ease: ease, overwrite: 'auto',
                onComplete: function () { gsap.set(parts, { clearProps: 'transform,opacity,transformOrigin' }); done(); }
            });
        }

        function panelIn(li) {
            var panel = li.querySelector(PANEL);
            if (!panel) return;
            gsap.killTweensOf(panel);
            var d = fx.panelIn.duration, e = fx.panelIn.ease;
            if (fx.panelIn.clip) {
                // Wiped across from the far edge, in place.
                gsap.fromTo(panel, { clipPath: panelDir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, {
                    clipPath: 'inset(0 0 0 0%)', duration: d, ease: e, clearProps: 'clipPath'
                });
            } else if (fx.panelIn.iris) {
                // Opens as a circle out of the arrow that was tapped.
                var arrow = li.querySelector(':scope > .brx-submenu-toggle > button');
                gsap.fromTo(panel, { clipPath: circleFrom(panel, arrow, false) }, {
                    clipPath: circleFrom(panel, arrow, true), duration: d, ease: e, clearProps: 'clipPath'
                });
            } else if (fx.panelIn.fold) {
                // Swings in on a hinge at its far edge, out of depth.
                gsap.fromTo(panel, {
                    rotationY: -FOLD_DEG * panelDir, transformPerspective: 900,
                    transformOrigin: panelDir > 0 ? 'right center' : 'left center'
                }, { rotationY: 0, duration: d, ease: e, clearProps: 'transform,transformOrigin' });
            } else if (fx.panelIn.tint) {
                // Sweeps in in the layer colour and settles to its own.
                var from = layerColour();
                var to = getComputedStyle(root).getPropertyValue('--brxp-nav-panel-background').trim();
                gsap.fromTo(panel, { xPercent: 100 * panelDir }, { xPercent: 0, duration: d, ease: e, clearProps: 'transform' });
                if (from && to) {
                    gsap.fromTo(panel, { '--brxp-nav-panel-background': from }, {
                        '--brxp-nav-panel-background': to, duration: d * 1.3, ease: 'power2.inOut',
                        clearProps: '--brxp-nav-panel-background'
                    });
                }
            } else {
                gsap.fromTo(panel, { xPercent: 100 * panelDir }, { xPercent: 0, duration: d, ease: e, clearProps: 'transform' });
            }
            behind(li.parentElement, true, d, e);
            gsap.fromTo(enteringParts(panel), itemsFrom(-panelDir), {
                x: 0, y: 0, scale: 1, opacity: 1,
                duration: fx.items.duration, ease: fx.items.ease, stagger: fx.items.stagger,
                delay: fx.items.delay * 0.6, clearProps: 'transform,opacity'
            });
            scramble(allParts(panel), fx.items.delay * 0.6);
        }

        // The colour of the second sheet, for a panel's tint (layers).
        function layerColour() {
            var sheet = layers[1] || layers[0];
            if (!sheet) return '';
            var c = getComputedStyle(sheet).backgroundColor;
            return c && c !== 'rgba(0, 0, 0, 0)' ? c : '';
        }

        function panelOut(li) {
            var panel = li.querySelector(PANEL);
            if (!panel) return;
            gsap.killTweensOf(panel);
            var d = fx.panelOut.duration, e = fx.panelOut.ease;
            // The class's CSS has already hidden the panel; keep it visible
            // while the exit plays.
            gsap.set(panel, { visibility: 'visible' });
            var cleanup = function () { gsap.set(panel, { clearProps: 'visibility,transform,clipPath' }); };
            if (fx.panelOut.clip) {
                gsap.fromTo(panel, { clipPath: 'inset(0 0 0 0%)' }, {
                    clipPath: panelDir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
                    duration: d, ease: e, onComplete: cleanup
                });
            } else if (fx.panelOut.iris) {
                // Closes back into the arrow it came from.
                var arrow = li.querySelector(':scope > .brx-submenu-toggle > button');
                gsap.fromTo(panel, { clipPath: circleFrom(panel, arrow, true) }, {
                    clipPath: circleFrom(panel, arrow, false), duration: d, ease: e, onComplete: cleanup
                });
            } else if (fx.panelOut.fold) {
                gsap.fromTo(panel, {
                    rotationY: 0, transformPerspective: 900,
                    transformOrigin: panelDir > 0 ? 'right center' : 'left center'
                }, {
                    rotationY: -FOLD_DEG * panelDir, duration: d, ease: e,
                    onComplete: function () { cleanup(); gsap.set(panel, { clearProps: 'transformOrigin' }); }
                });
            } else {
                gsap.fromTo(panel, { xPercent: 0 }, { xPercent: 100 * panelDir, duration: d, ease: e, onComplete: cleanup });
            }
            behind(li.parentElement, false, d, e);
        }

        // Drawer open / close: Bricks toggles show-mobile-menu on the root.
        var rootObserver = new MutationObserver(function () {
            var isOpen = root.classList.contains('show-mobile-menu');
            if (isOpen === wasOpen) return;
            wasOpen = isOpen;
            if (isOpen) openDrawer();
            else closeDrawer();
        });
        rootObserver.observe(root, { attributes: true, attributeFilter: ['class'] });

        // Panels: an item gains or loses `open` (Bricks' toggle, the Back
        // button, Escape). Not while the drawer is shut: the behaviour
        // script resets every level then, which needs no animation.
        var trackObserver = new MutationObserver(function (records) {
            if (!root.classList.contains('show-mobile-menu')) return;
            for (var i = 0; i < records.length; i++) {
                var li = records[i].target;
                if (li.tagName !== 'LI' || !li.querySelector(PANEL)) continue;
                var was = (' ' + (records[i].oldValue || '') + ' ').indexOf(' open ') !== -1;
                var now = li.classList.contains('open');
                if (was === now) continue;
                if (now) panelIn(li);
                else panelOut(li);
            }
        });
        trackObserver.observe(track, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });

        // Undo everything when reduced motion switches on.
        return function () {
            rootObserver.disconnect();
            trackObserver.disconnect();
            if (drawerTl) drawerTl.kill();
            gsap.killTweensOf(state);
            root.classList.remove('brxp-nav--gsap', 'brxp-nav--closing', 'brxp-nav--fx-' + name);
            root.removeAttribute('data-brxp-nav-gsap');
            for (var l = 0; l < layers.length; l++) layers[l].remove();
            var labels = root.querySelectorAll('[data-brxp-nav-label]');
            for (var b = 0; b < labels.length; b++) {
                gsap.killTweensOf(labels[b]);
                labels[b].textContent = labels[b].getAttribute('data-brxp-nav-label');
                labels[b].removeAttribute('aria-label');
            }
            ['--brxp-nav-dx', '--brxp-nav-ds', '--brxp-nav-blur', '--brxp-nav-fade',
             '--brxp-nav-clip-end', '--brxp-nav-clip-start', '--brxp-nav-side',
             '--brxp-nav-iris-r', '--brxp-nav-iris-x', '--brxp-nav-iris-y',
             '--brxp-nav-rot', '--brxp-nav-hinge'].forEach(function (p) {
                root.style.removeProperty(p);
            });
        };
    }

    function start() {
        var roots = document.querySelectorAll('.brxe-nav-menu.brxp-nav');
        if (!roots.length) return;
        if (typeof window.gsap === 'undefined') {
            if (window.console) console.info('[BRXP Sliding Nav] GSAP not found: enable the GSAP Loader snippet for the GSAP effects. Using CSS transitions.');
            return;
        }
        injectCss();
        gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
            var teardowns = [];
            for (var i = 0; i < roots.length; i++) {
                var undo = setup(roots[i]);
                if (undo) teardowns.push(undo);
            }
            return function () {
                for (var t = 0; t < teardowns.length; t++) teardowns[t]();
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
