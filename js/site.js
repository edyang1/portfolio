/* ==========================================================================
   Shared behaviour for every page. No dependencies.
   Pages opt in through markup: [data-nav], [data-footer], [data-reveal],
   [data-stagger], [data-copy], [data-filters], [data-theme-toggle].
   <body data-root="../"> tells this script how deep the page lives.
   ========================================================================== */

(() => {
	"use strict";

	const root = document.documentElement;
	const body = document.body;
	const base = body.dataset.root || "";
	const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
	const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

	const EMAIL = "edwardyang609@gmail.com";
	const RESUME = `${base}extras/Edward_Yang_resume.pdf`;
	const BLOG = "https://eddiereviewseverything.wordpress.com";
	const SOCIAL = [
		{ label: "GitHub", href: "https://github.com/edyang1", icon: "github" },
		{ label: "LinkedIn", href: "https://www.linkedin.com/in/edward-yang-nc/", icon: "linkedin" },
		{ label: "YouTube", href: "https://www.youtube.com/@mantra_hd", icon: "youtube" },
		{ label: "Twitch", href: "https://twitch.tv/mantrahd", icon: "twitch" },
	];
	const PAGES = [
		{ label: "Home", href: `${base}index.html` },
		{ label: "Projects", href: `${base}projects/projects.html` },
		{ label: "Skills", href: `${base}skills/skills.html` },
		{ label: "Writing", href: `${base}writing/writing.html` },
		{ label: "Reviews", href: BLOG, external: true },
		{ label: "Résumé", href: RESUME, external: true },
	];

	const icon = (id, cls = "") =>
		`<svg class="icon i-${id} ${cls}" aria-hidden="true"><use href="${base}images/icons.svg#${id}"/></svg>`;
	const ext = (external) => (external ? ' target="_blank" rel="noopener"' : "");

	/* ---------- Toast ---------- */

	let toastEl;
	let toastTimer;
	function toast(message) {
		if (!toastEl) {
			toastEl = document.createElement("div");
			toastEl.className = "toast";
			toastEl.setAttribute("role", "status");
			body.append(toastEl);
		}
		toastEl.textContent = message;
		requestAnimationFrame(() => toastEl.classList.add("is-visible"));
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
	}

	/* ---------- Theme (with a circular reveal where supported) ---------- */

	function applyTheme(theme) {
		root.dataset.theme = theme;
		try {
			localStorage.setItem("theme", theme);
		} catch {
			/* storage unavailable: the choice just won't persist */
		}
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.content = theme === "light" ? "#f7f2ec" : "#0a0b10";
		document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
			btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
		});
	}

	applyTheme(root.dataset.theme === "light" ? "light" : "dark");

	document.addEventListener("click", (event) => {
		const btn = event.target.closest("[data-theme-toggle]");
		if (!btn) return;
		const next = root.dataset.theme === "light" ? "dark" : "light";

		if (!document.startViewTransition || reduceMotion.matches) {
			applyTheme(next);
			return;
		}

		const { left, top, width, height } = btn.getBoundingClientRect();
		const x = left + width / 2;
		const y = top + height / 2;
		const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

		root.classList.add("vt-local");
		const transition = document.startViewTransition(() => applyTheme(next));
		transition.ready.then(() => {
			root.animate(
				{ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
				{ duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
			);
		});
		transition.finished.finally(() => root.classList.remove("vt-local"));
	});

	/* ---------- Mobile menu (injected; it needs JS to open anyway) ---------- */

	const nav = document.querySelector("[data-nav]");
	const menuBtn = document.querySelector("[data-menu-toggle]");

	if (menuBtn) {
		const panel = document.createElement("div");
		panel.className = "menu-panel";
		panel.id = "menu-panel";
		panel.inert = true;
		panel.innerHTML = `
			<nav aria-label="Mobile">
				${PAGES.map(
					(p, i) =>
						`<a href="${p.href}" style="--i:${i}"${ext(p.external)}>${p.label}<span>${String(i + 1).padStart(2, "0")}</span></a>`
				).join("")}
			</nav>
			<div class="menu-foot">
				<a class="link-arrow" href="mailto:${EMAIL}">${EMAIL}</a>
				<div class="social-row">
					${SOCIAL.map((s) => `<a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}">${icon(s.icon)}</a>`).join("")}
				</div>
			</div>`;
		body.append(panel);
		menuBtn.setAttribute("aria-controls", "menu-panel");

		const setMenu = (open) => {
			body.classList.toggle("menu-open", open);
			menuBtn.setAttribute("aria-expanded", String(open));
			menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
			panel.inert = !open;
			if (open) nav?.classList.remove("is-hidden");
		};

		menuBtn.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
		panel.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
		addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
		matchMedia("(min-width: 961px)").addEventListener("change", (e) => e.matches && setMenu(false));
	}

	/* ---------- Footer (injected so it is edited in one place) ---------- */

	const footer = document.querySelector("[data-footer]");
	if (footer) {
		footer.innerHTML = `
			<div class="container">
				<div class="footer-grid">
					<div>
						<a class="brand" href="${base}index.html"><span class="brand-mark" aria-hidden="true">ey</span>Eddie Yang</a>
						<p class="footer-blurb">CS + Business at UNC Chapel Hill. Maker, podcaster, streamer, writer, and occasional banana bandit.</p>
					</div>
					<div class="footer-col">
						<h2>Explore</h2>
						<ul>${PAGES.map((p) => `<li><a href="${p.href}"${ext(p.external)}>${p.label}${p.external ? icon("arrow-up-right", "icon-xs") : ""}</a></li>`).join("")}</ul>
					</div>
					<div class="footer-col">
						<h2>Elsewhere</h2>
						<ul>
							<li><a href="mailto:${EMAIL}">Email</a></li>
							${SOCIAL.map((s) => `<li><a href="${s.href}" target="_blank" rel="noopener">${s.label}${icon("arrow-up-right", "icon-xs")}</a></li>`).join("")}
						</ul>
					</div>
				</div>
				<div class="footer-wordmark" aria-hidden="true">Eddie Yang</div>
				<div class="footer-bottom">
					<span>© 2024–${new Date().getFullYear()} Eddie Yang. All rights reserved.</span>
					<span>Hand-coded. No frameworks were harmed.</span>
				</div>
			</div>`;
	}

	/* ---------- Back to top (with progress ring) ---------- */

	const toTop = document.createElement("button");
	toTop.type = "button";
	toTop.className = "to-top";
	toTop.setAttribute("aria-label", "Back to top");
	toTop.innerHTML = `<svg class="ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="track" cx="24" cy="24" r="22"/><circle class="bar" cx="24" cy="24" r="22"/></svg>${icon("arrow-up")}`;
	toTop.addEventListener("click", () => {
		scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
		document.querySelector(".skip-link")?.focus({ preventScroll: true });
	});
	body.append(toTop);

	/* ---------- Scroll: nav state, hide-on-scroll, progress ---------- */

	let lastY = scrollY;
	let ticking = false;

	function onScroll() {
		const y = scrollY;
		const max = root.scrollHeight - innerHeight;
		const delta = y - lastY;

		if (nav) {
			nav.classList.toggle("is-scrolled", y > 8);
			if (!body.classList.contains("menu-open") && Math.abs(delta) > 6) {
				nav.classList.toggle("is-hidden", delta > 0 && y > 320 && !nav.contains(document.activeElement));
			}
		}
		toTop.classList.toggle("is-visible", y > 700);
		toTop.style.setProperty("--progress", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);

		if (Math.abs(delta) > 6) lastY = y;
		ticking = false;
	}

	addEventListener(
		"scroll",
		() => {
			if (!ticking) {
				requestAnimationFrame(onScroll);
				ticking = true;
			}
		},
		{ passive: true }
	);
	onScroll();

	/* ---------- Reveal on scroll ---------- */

	document.querySelectorAll("[data-stagger]").forEach((group) => {
		[...group.children].forEach((child, i) => {
			child.setAttribute("data-reveal", "");
			child.style.setProperty("--i", i);
		});
	});

	const revealEls = document.querySelectorAll("[data-reveal]");
	if ("IntersectionObserver" in window) {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add("is-in");
					io.unobserve(entry.target);
				});
			},
			{ rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
		);
		revealEls.forEach((el) => io.observe(el));
	} else {
		revealEls.forEach((el) => el.classList.add("is-in"));
	}

	/* ---------- Card spotlight follows the cursor ---------- */

	if (finePointer.matches) {
		document.addEventListener(
			"pointermove",
			(e) => {
				const card = e.target.closest(".card");
				if (!card) return;
				const r = card.getBoundingClientRect();
				card.style.setProperty("--mx", `${e.clientX - r.left}px`);
				card.style.setProperty("--my", `${e.clientY - r.top}px`);
			},
			{ passive: true }
		);
	}

	/* ---------- Copy to clipboard: data-copy="text" (empty = this page's URL) ---------- */

	document.addEventListener("click", async (event) => {
		const btn = event.target.closest("[data-copy]");
		if (!btn) return;
		const text = btn.dataset.copy || location.href.split("#")[0];
		try {
			await navigator.clipboard.writeText(text);
			btn.classList.add("is-copied");
			toast(btn.dataset.copyMessage || "Copied to clipboard");
			setTimeout(() => btn.classList.remove("is-copied"), 2000);
		} catch {
			toast("Couldn't copy — select and copy it manually");
		}
	});

	/* ---------- Hub filters ---------- */

	const filterBar = document.querySelector("[data-filters]");
	if (filterBar) {
		const cards = [...document.querySelectorAll("[data-tags]")];
		filterBar.addEventListener("click", (event) => {
			const btn = event.target.closest("[data-filter]");
			if (!btn || btn.getAttribute("aria-pressed") === "true") return;
			const filter = btn.dataset.filter;
			filterBar.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));

			const apply = () =>
				cards.forEach((card) =>
					card.classList.toggle("is-filtered-out", filter !== "all" && !card.dataset.tags.split(" ").includes(filter))
				);

			if (!document.startViewTransition || reduceMotion.matches) {
				apply();
				return;
			}
			cards.forEach((card, i) => (card.style.viewTransitionName = `card-${i}`));
			root.classList.add("vt-local");
			const transition = document.startViewTransition(apply);
			transition.finished.finally(() => {
				root.classList.remove("vt-local");
				cards.forEach((card) => (card.style.viewTransitionName = ""));
			});
		});
	}

	/* ---------- Easter egg: Konami code, or just type "banana" ---------- */

	function bananaRain() {
		toast("🍌 The Banana Bandit strikes again.");
		if (reduceMotion.matches) return;
		for (let i = 0; i < 42; i++) {
			const b = document.createElement("span");
			b.className = "banana";
			b.textContent = "🍌";
			b.setAttribute("aria-hidden", "true");
			b.style.left = `${Math.random() * 100}vw`;
			b.style.setProperty("--dx", `${(Math.random() - 0.5) * 30}vw`);
			b.style.setProperty("--rot", `${(Math.random() - 0.5) * 1080}deg`);
			b.style.setProperty("--dur", `${2.2 + Math.random() * 2.4}s`);
			b.style.setProperty("--size", `${1.4 + Math.random() * 2.2}rem`);
			b.style.animationDelay = `${Math.random() * 0.9}s`;
			b.addEventListener("animationend", () => b.remove());
			body.append(b);
		}
	}

	const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
	let step = 0;
	let typed = "";
	addEventListener("keydown", (e) => {
		if (e.target.closest("input, textarea, [contenteditable]")) return;
		const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
		step = key === konami[step] ? step + 1 : key === konami[0] ? 1 : 0;
		typed = (typed + (key.length === 1 ? key : "")).slice(-6);
		if (step === konami.length || typed === "banana") {
			step = 0;
			typed = "";
			bananaRain();
		}
	});

	window.EY = { toast, bananaRain, icon };

	console.log(
		"%c👋 Hey there, curious one.",
		"font: 600 15px system-ui; padding: 4px 0; color: #8c7dff"
	);
	console.log("This site is hand-written HTML, CSS and JS. Psst: try the Konami code, or just type “banana”.");
})();
