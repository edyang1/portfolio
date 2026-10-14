/* ==========================================================================
   Article pages: table of contents, reading progress, image lightbox.
   The TOC is built from the <h2>s inside .prose, so new articles get one for free.
   ========================================================================== */

(() => {
	"use strict";

	const prose = document.querySelector(".prose");
	if (!prose) return;

	const icon = window.EY?.icon ?? (() => "");
	const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---------- Table of contents ---------- */

	const slugify = (text) =>
		text
			.toLowerCase()
			.replace(/[’']/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

	const headings = [...prose.querySelectorAll("h2")];
	const tocLists = [...document.querySelectorAll("[data-toc]")];
	const mobileToc = document.querySelector(".toc-mobile");
	const mobileLabel = document.querySelector("[data-toc-current]");

	if (headings.length === 0) {
		document.querySelectorAll(".toc, .toc-mobile").forEach((el) => (el.hidden = true));
	} else {
		headings.forEach((h) => {
			if (!h.id) h.id = slugify(h.textContent);
		});
		tocLists.forEach((list) => {
			headings.forEach((h) => {
				const li = document.createElement("li");
				const a = document.createElement("a");
				a.href = `#${h.id}`;
				a.textContent = h.textContent.trim();
				li.append(a);
				list.append(li);
			});
		});
		mobileToc?.addEventListener("click", (e) => {
			if (e.target.closest("a")) mobileToc.open = false;
		});
	}

	const tocLinks = [...document.querySelectorAll("[data-toc] a")];

	/* ---------- Progress + active section ---------- */

	const bar = document.querySelector(".read-progress");
	const percent = document.querySelector("[data-toc-percent]");
	let ticking = false;
	let activeId = null;

	function update() {
		const r = prose.getBoundingClientRect();
		const p = Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / r.height));
		bar?.style.setProperty("--progress", p.toFixed(4));
		if (percent) percent.textContent = `${Math.round(p * 100)}%`;

		const line = innerHeight * 0.3;
		let current = null;
		for (const h of headings) {
			if (h.getBoundingClientRect().top < line) current = h;
		}
		const id = current?.id ?? null;
		if (id !== activeId) {
			activeId = id;
			tocLinks.forEach((a) => a.classList.toggle("is-active", id !== null && a.hash === `#${id}`));
			if (mobileLabel) mobileLabel.textContent = current ? current.textContent.trim() : "On this page";
		}
		ticking = false;
	}

	addEventListener(
		"scroll",
		() => {
			if (!ticking) {
				requestAnimationFrame(update);
				ticking = true;
			}
		},
		{ passive: true }
	);
	addEventListener("resize", update, { passive: true });
	update();

	/* ---------- Lightbox ---------- */

	const images = [...prose.querySelectorAll(".figure img")];
	if (images.length === 0) return;

	const largest = (img) => {
		const candidates = (img.getAttribute("srcset") || "").split(",").map((s) => s.trim().split(/\s+/)[0]);
		return candidates.filter(Boolean).pop() || img.currentSrc || img.src;
	};
	const captionFor = (img) => img.closest("figure")?.querySelector("figcaption")?.textContent.trim() || img.alt;

	const dialog = document.createElement("dialog");
	dialog.className = "lightbox";
	dialog.setAttribute("aria-label", "Image viewer");
	dialog.innerHTML = `
		<div class="lightbox-top">
			<span data-lb-count></span>
			<button class="icon-btn" type="button" data-lb-close aria-label="Close image viewer">${icon("x")}</button>
		</div>
		<div class="lightbox-stage">
			<img alt="" />
			<button class="icon-btn lightbox-nav lightbox-prev" type="button" data-lb-step="-1" aria-label="Previous image">${icon("chevron-left")}</button>
			<button class="icon-btn lightbox-nav lightbox-next" type="button" data-lb-step="1" aria-label="Next image">${icon("chevron-right")}</button>
		</div>
		<p class="lightbox-caption" data-lb-caption></p>`;
	document.body.append(dialog);

	const stage = dialog.querySelector(".lightbox-stage");
	const view = stage.querySelector("img");
	const count = dialog.querySelector("[data-lb-count]");
	const caption = dialog.querySelector("[data-lb-caption]");
	let index = 0;

	if (images.length === 1) dialog.querySelectorAll(".lightbox-nav").forEach((b) => (b.hidden = true));

	function show(n) {
		index = (n + images.length) % images.length;
		const img = images[index];
		view.src = largest(img);
		view.alt = img.alt;
		caption.textContent = captionFor(img);
		count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
		if (!reduceMotion) {
			view.style.animation = "none";
			void view.offsetWidth; // restart the zoom-in animation
			view.style.animation = "";
		}
	}

	function open(n) {
		show(n);
		dialog.showModal();
		document.documentElement.style.overflow = "hidden";
	}

	images.forEach((img, n) => {
		img.tabIndex = 0;
		img.setAttribute("role", "button");
		img.setAttribute("aria-label", `View larger: ${img.alt}`);
		img.addEventListener("click", () => open(n));
		img.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				open(n);
			}
		});
	});

	dialog.addEventListener("close", () => {
		document.documentElement.style.overflow = "";
		images[index]?.focus({ preventScroll: true });
	});
	let swiped = false;
	dialog.addEventListener("click", (e) => {
		if (swiped) {
			swiped = false;
			return;
		}
		const stepBtn = e.target.closest("[data-lb-step]");
		if (stepBtn) return show(index + Number(stepBtn.dataset.lbStep));
		if (e.target.closest("[data-lb-close]") || e.target === dialog || e.target === stage) dialog.close();
	});
	dialog.addEventListener("keydown", (e) => {
		if (e.key === "ArrowRight") show(index + 1);
		if (e.key === "ArrowLeft") show(index - 1);
	});

	// Swipe on touch screens
	let startX = null;
	stage.addEventListener("pointerdown", (e) => (startX = e.clientX));
	stage.addEventListener("pointerup", (e) => {
		if (startX === null || images.length < 2) return;
		const dx = e.clientX - startX;
		if (Math.abs(dx) > 50) {
			swiped = true;
			show(index + (dx < 0 ? 1 : -1));
		}
		startX = null;
	});
})();
