/* ==========================================================================
   Extra polish, every page: variable-font "flux" letters, the cursor label,
   magnetic buttons, decoding eyebrows, and the projects list view.
   All of it is decoration: the site works the same without this file.
   ========================================================================== */

(() => {
	"use strict";

	const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
	const base = document.body.dataset.root || "";
	const lerp = (a, b, t) => a + (b - a) * t;

	/* ---------- Flux: letters thin out like a lens wherever the cursor passes ----------
	   Markup: <span data-flux data-flux-min="200" data-flux-radius="220"><span class="ch">E</span>…</span> */

	if (finePointer && !reduceMotion) {
		// Plain-text elements opt in with data-flux-split and get their letters wrapped here
		document.querySelectorAll("[data-flux-split]").forEach((el) => {
			el.innerHTML = el.textContent
				.split(" ")
				.map((word) => `<span class="w">${[...word].map((c) => `<span class="ch">${c}</span>`).join("")}</span>`)
				.join(" ");
			el.classList.add("flux", "is-split");
			el.setAttribute("data-flux", "");
		});

		document.querySelectorAll("[data-flux]").forEach((el) => {
			const chars = [...el.querySelectorAll(".ch")];
			if (!chars.length) return;
			const max = Number(getComputedStyle(el).fontWeight) || 700;
			const min = Number(el.dataset.fluxMin) || 200;
			const radius = Number(el.dataset.fluxRadius) || 220;
			let px = -1e4, py = -1e4, queued = false, active = false;

			const frame = () => {
				queued = false;
				const centres = chars.map((c) => {
					const r = c.getBoundingClientRect();
					return [r.left + r.width / 2, r.top + r.height / 2];
				});
				chars.forEach((c, i) => {
					const d = Math.hypot(px - centres[i][0], py - centres[i][1]);
					const t = Math.max(0, 1 - d / radius);
					c.style.fontWeight = Math.round(max - (max - min) * t * t * (3 - 2 * t));
				});
			};
			const queue = () => {
				if (!queued) {
					queued = true;
					requestAnimationFrame(frame);
				}
			};
			addEventListener(
				"pointermove",
				(e) => {
					const r = el.getBoundingClientRect();
					const near = e.clientY > r.top - radius && e.clientY < r.bottom + radius;
					if (!near && !active) return;
					active = near;
					px = near ? e.clientX : -1e4;
					py = near ? e.clientY : -1e4;
					queue();
				},
				{ passive: true }
			);
			document.documentElement.addEventListener("pointerleave", () => {
				px = py = -1e4;
				queue();
			});
		});
	}

	/* ---------- Cursor label: a pill that names what a click will do ---------- */

	const CURSOR_TARGETS = [
		[".figure img", "Zoom"],
		[".skill-card, .book, .writing-next", "Read"],
		[".shelf-item", "Review"],
		[".card, .stack-card, .pager-link", "View"],
	];

	if (finePointer) {
		const pill = document.createElement("div");
		pill.className = "cursor-pill";
		pill.setAttribute("aria-hidden", "true");
		pill.innerHTML = `<span></span><svg class="icon icon-sm" aria-hidden="true"><use href="${base}images/icons.svg#arrow-up-right"/></svg>`;
		document.body.append(pill);
		const label = pill.querySelector("span");
		const pos = { x: 0, y: 0, tx: 0, ty: 0 };
		let shown = false;
		let raf = 0;

		const labelFor = (target) => {
			const own = target.closest("[data-cursor]");
			if (own) return own.dataset.cursor;
			for (const [selector, text] of CURSOR_TARGETS) if (target.closest(selector)) return text;
			return null;
		};
		const animate = () => {
			pos.x = lerp(pos.x, pos.tx, reduceMotion ? 1 : 0.22);
			pos.y = lerp(pos.y, pos.ty, reduceMotion ? 1 : 0.22);
			pill.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
			raf = shown && (Math.abs(pos.x - pos.tx) > 0.1 || Math.abs(pos.y - pos.ty) > 0.1) ? requestAnimationFrame(animate) : 0;
		};

		const update = (target) => {
			const text = target instanceof Element ? labelFor(target) : null;
			if (text) {
				if (!shown) {
					pos.x = pos.tx;
					pos.y = pos.ty;
				}
				label.textContent = text;
				shown = true;
				pill.classList.add("is-on");
				document.documentElement.classList.add("cursor-labelled");
			} else if (shown) {
				shown = false;
				pill.classList.remove("is-on");
				document.documentElement.classList.remove("cursor-labelled");
			}
			if (!raf) raf = requestAnimationFrame(animate);
		};

		addEventListener(
			"pointermove",
			(e) => {
				pos.tx = e.clientX;
				pos.ty = e.clientY;
				update(e.target);
			},
			{ passive: true }
		);
		// Content scrolls under a still cursor, so re-check what it is pointing at
		addEventListener("scroll", () => shown && update(document.elementFromPoint(pos.tx, pos.ty)), { passive: true });
		document.documentElement.addEventListener("pointerleave", () => {
			shown = false;
			pill.classList.remove("is-on");
		});
	}

	/* ---------- Magnetic buttons: primary actions lean toward the cursor ---------- */

	if (finePointer && !reduceMotion) {
		document
			.querySelectorAll(".hero-ctas .btn, .copy-btn, .social-row a, .nav-resume, [data-magnetic]")
			.forEach((el) => {
				const strength = el.matches(".social-row a") ? 0.35 : 0.22;
				el.addEventListener("pointermove", (e) => {
					const r = el.getBoundingClientRect();
					const x = (e.clientX - (r.left + r.width / 2)) * strength;
					const y = (e.clientY - (r.top + r.height / 2)) * strength;
					el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
				});
				el.addEventListener("pointerleave", () => (el.style.transform = ""));
			});
	}

	/* ---------- Eyebrows decode themselves when they scroll into view ---------- */

	if (!reduceMotion && "IntersectionObserver" in window) {
		const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_#*+";
		const scramble = (el) => {
			const final = el.textContent;
			const start = performance.now();
			const duration = 700;
			const step = (now) => {
				const t = Math.min(1, (now - start) / duration);
				const settled = Math.floor(t * final.length);
				el.textContent = [...final]
					.map((ch, i) => (i < settled || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
					.join("");
				if (t < 1) requestAnimationFrame(step);
				else el.textContent = final;
			};
			requestAnimationFrame(step);
		};
		const io = new IntersectionObserver(
			(entries) =>
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					io.unobserve(entry.target);
					scramble(entry.target);
				}),
			{ threshold: 1 }
		);
		document.querySelectorAll(".section .eyebrow, .contact .eyebrow").forEach((el) => {
			if (el.children.length === 0) io.observe(el);
		});
	}

	/* ---------- Projects: a big-type list view with previews that follow the cursor ---------- */

	const toggle = document.querySelector("[data-view-toggle]");
	const grid = document.querySelector(".card-grid");
	if (toggle && grid) {
		const list = document.createElement("ol");
		list.className = "work-list";
		list.hidden = true;
		[...grid.querySelectorAll(".card")].forEach((card, i) => {
			const img = card.querySelector("img");
			const tags = [...card.querySelectorAll(".card-tags .tag")].map((t) => t.textContent).join(" · ");
			const li = document.createElement("li");
			li.dataset.tags = card.dataset.tags || "";
			li.innerHTML = `
				<a class="work-row" href="${card.getAttribute("href")}">
					<span class="work-idx">${String(i + 1).padStart(2, "0")}</span>
					<span class="work-title">${card.querySelector(".card-title").textContent}</span>
					<span class="work-tags">${tags}</span>
					<span class="work-year">${card.querySelector(".card-meta span")?.textContent ?? ""}</span>
					<img class="work-thumb" src="${img.getAttribute("src")}" alt="" loading="lazy" decoding="async" />
				</a>`;
			list.append(li);
		});
		grid.after(list);

		const setView = (view) => {
			const isList = view === "list";
			list.hidden = !isList;
			grid.hidden = isList;
			toggle.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
			try {
				localStorage.setItem("projects-view", view);
			} catch {
				/* the choice just won't be remembered */
			}
		};
		toggle.addEventListener("click", (e) => {
			const btn = e.target.closest("[data-view]");
			if (btn) setView(btn.dataset.view);
		});
		let saved = null;
		try {
			saved = localStorage.getItem("projects-view");
		} catch {
			/* no storage */
		}
		if (saved === "list") setView("list");

		if (finePointer) {
			const preview = document.createElement("div");
			preview.className = "work-preview";
			preview.setAttribute("aria-hidden", "true");
			preview.innerHTML = "<img alt='' />";
			document.body.append(preview);
			const pimg = preview.querySelector("img");
			const p = { x: 0, y: 0, tx: 0, ty: 0, rot: 0 };
			let raf = 0;
			const follow = () => {
				const dx = p.tx - p.x;
				p.x = lerp(p.x, p.tx, 0.14);
				p.y = lerp(p.y, p.ty, 0.14);
				p.rot = lerp(p.rot, Math.max(-12, Math.min(12, dx * 0.08)), 0.15);
				preview.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot.toFixed(2)}deg)`;
				raf = requestAnimationFrame(follow);
			};
			list.addEventListener("pointerover", (e) => {
				const row = e.target.closest(".work-row");
				if (!row) return;
				pimg.src = row.querySelector(".work-thumb").src;
				preview.classList.add("is-on");
				if (!raf) {
					p.x = p.tx = e.clientX;
					p.y = p.ty = e.clientY;
					raf = requestAnimationFrame(follow);
				}
			});
			list.addEventListener("pointermove", (e) => {
				p.tx = e.clientX;
				p.ty = e.clientY;
			});
			list.addEventListener("pointerleave", () => {
				preview.classList.remove("is-on");
				cancelAnimationFrame(raf);
				raf = 0;
			});
		}
	}
})();
