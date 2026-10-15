/* ==========================================================================
   Command menu: ⌘K / Ctrl+K (or "/") to jump anywhere or run an action.
   Add a page here when you add one to the site.
   ========================================================================== */

(() => {
	"use strict";

	const root = document.documentElement;
	const base = document.body.dataset.root || "";
	const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
	const sprite = window.EY?.asset?.("images/icons.svg") ?? `${base}images/icons.svg`;
	const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="${sprite}#${id}"/></svg>`;
	const go = (path) => () => (location.href = base + path);
	const open = (url) => () => window.open(url, "_blank", "noopener");

	const ITEMS = [
		{ group: "Go to", label: "Home", icon: "home", run: go("index.html"), keys: "start index landing" },
		{ group: "Go to", label: "Projects", icon: "grid", run: go("projects/projects.html"), keys: "work portfolio" },
		{ group: "Go to", label: "Skills", icon: "trophy", run: go("skills/skills.html"), keys: "hobbies" },
		{ group: "Go to", label: "Writing", icon: "pen", run: go("writing/writing.html"), keys: "fiction stories novel" },
		{ group: "Projects", label: "Everdusk Sector", hint: "Visual novel · 2024", icon: "gamepad", run: go("projects/everduskSector.html"), keys: "game jam renpy brackeys" },
		{ group: "Projects", label: "Reverie Engravings", hint: "Small business · 2023", icon: "sparkle", run: go("projects/reverie.html"), keys: "laser cutting etsy lights" },
		{ group: "Projects", label: "Hyperdash", hint: "Podcast · 2023", icon: "mic", run: go("projects/hyperdash.html"), keys: "podcast josh audio" },
		{ group: "Projects", label: "Mantra", hint: "Content creation · 2025", icon: "youtube", run: go("projects/mantra.html"), keys: "youtube twitch streaming" },
		{ group: "Projects", label: "Worm Bin", hint: "Sustainability · 2024", icon: "sparkle", run: go("projects/wormBin.html"), keys: "vermicomposting worms compost" },
		{ group: "Projects", label: "Custom Cutting Board", hint: "Woodworking · 2024", icon: "hammer", run: go("projects/cuttingBoard.html"), keys: "shaper origin cnc wood" },
		{ group: "Skills", label: "Weightlifting", hint: "Lifting heavy rocks", icon: "trophy", run: go("skills/weightlifting.html"), keys: "gym fitness" },
		{ group: "Skills", label: "Photography", hint: "Kenya safari", icon: "sparkle", run: go("skills/photography.html"), keys: "camera wildlife nikon" },
		{ group: "Skills", label: "Reviewing", hint: "Books & games", icon: "book", run: go("skills/reviewing.html"), keys: "reviews maltese falcon" },
		{ group: "Writing", label: "Running out of Teardrops", hint: "Short story", icon: "drop", run: go("writing/runningTeardrops.html"), keys: "mystery motel" },
		{ group: "Writing", label: "Top 10 Moons that Cried Blood", hint: "Novel in progress", icon: "moon", run: go("writing/top10Moons.html"), keys: "sci-fi romance book" },
		{ group: "Actions", label: "Toggle light / dark theme", icon: "sun", run: () => document.querySelector("[data-theme-toggle]")?.click(), keys: "mode appearance" },
		{ group: "Actions", label: "Copy email address", icon: "copy", run: () => copyEmail(), keys: "contact mail" },
		{ group: "Actions", label: "Open résumé", icon: "file", run: open(base + "extras/Edward_Yang_resume.pdf"), keys: "resume cv pdf" },
		{ group: "Actions", label: "Make it rain bananas", hint: "🍌", icon: "sparkle", run: () => window.EY?.bananaRain(), keys: "banana bandit easter egg" },
		{ group: "Actions", label: "Back to top", icon: "arrow-up", run: () => scrollTo({ top: 0, behavior: "smooth" }), keys: "scroll up" },
		{ group: "Elsewhere", label: "GitHub", hint: "edyang1", icon: "github", run: open("https://github.com/edyang1") },
		{ group: "Elsewhere", label: "LinkedIn", icon: "linkedin", run: open("https://www.linkedin.com/in/edward-yang-nc/") },
		{ group: "Elsewhere", label: "YouTube", hint: "@mantra_hd", icon: "youtube", run: open("https://www.youtube.com/@mantra_hd") },
		{ group: "Elsewhere", label: "Twitch", hint: "mantrahd", icon: "twitch", run: open("https://twitch.tv/mantrahd") },
		{ group: "Elsewhere", label: "Review blog", hint: "eddie reviews everything", icon: "pen", run: open("https://eddiereviewseverything.wordpress.com") },
	];

	function copyEmail() {
		navigator.clipboard
			?.writeText("edwardyang609@gmail.com")
			.then(() => window.EY?.toast("Email copied. Talk soon!"))
			.catch(() => (location.href = "mailto:edwardyang609@gmail.com"));
	}

	// Prefix > substring > in-order letters, so "evd" finds Everdusk
	function score(query, text) {
		if (!query) return 1;
		const i = text.indexOf(query);
		if (i === 0) return 100;
		if (i > 0) return 80 - Math.min(i, 40);
		let from = 0;
		let s = 0;
		for (const ch of query) {
			const f = text.indexOf(ch, from);
			if (f === -1) return 0;
			s += f === from ? 3 : 1;
			from = f + 1;
		}
		return s;
	}

	const dialog = document.createElement("dialog");
	dialog.className = "palette";
	dialog.setAttribute("aria-label", "Command menu");
	dialog.innerHTML = `
		<div class="palette-box">
			<div class="palette-search">
				${icon("search")}
				<input type="text" placeholder="Search pages, projects, actions…" autocomplete="off" spellcheck="false"
					role="combobox" aria-expanded="true" aria-controls="palette-list" aria-label="Search the site" />
				<kbd>esc</kbd>
			</div>
			<ul class="palette-list" id="palette-list" role="listbox" aria-label="Results"></ul>
			<div class="palette-foot">
				<span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
				<span><kbd>↵</kbd> to open</span>
				<span class="palette-tip">psst: try “bananas”</span>
			</div>
		</div>`;
	document.body.append(dialog);

	const input = dialog.querySelector("input");
	const list = dialog.querySelector(".palette-list");
	let results = [];
	let active = 0;

	function render() {
		const q = input.value.trim().toLowerCase();
		results = ITEMS.map((item) => ({ item, s: Math.max(score(q, item.label.toLowerCase()), score(q, (item.keys || "").toLowerCase()) * 0.8) }))
			.filter((r) => r.s > 0)
			.sort((a, b) => (q ? b.s - a.s : 0))
			.map((r) => r.item);
		active = Math.min(active, Math.max(0, results.length - 1));

		if (!results.length) {
			list.innerHTML = `<li class="palette-empty">Nothing matches “${q.replace(/[<>&"]/g, "")}”. Try “projects” or “bananas”.</li>`;
			input.removeAttribute("aria-activedescendant");
			return;
		}
		let group = null;
		list.innerHTML = results
			.map((item, i) => {
				const head = !q && item.group !== group ? `<li class="palette-group" role="presentation">${item.group}</li>` : "";
				group = item.group;
				return `${head}<li class="palette-item${i === active ? " is-active" : ""}" id="pal-${i}" role="option" aria-selected="${i === active}" data-i="${i}">
					${icon(item.icon)}<span class="palette-label">${item.label}</span>${item.hint ? `<span class="palette-hint">${item.hint}</span>` : ""}
					<span class="palette-enter">${icon("enter")}</span></li>`;
			})
			.join("");
		input.setAttribute("aria-activedescendant", `pal-${active}`);
		list.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
	}

	function setActive(i) {
		if (!results.length) return;
		active = (i + results.length) % results.length;
		list.querySelectorAll(".palette-item").forEach((el) => {
			const on = Number(el.dataset.i) === active;
			el.classList.toggle("is-active", on);
			el.setAttribute("aria-selected", String(on));
			if (on) el.scrollIntoView({ block: "nearest" });
		});
		input.setAttribute("aria-activedescendant", `pal-${active}`);
	}

	function run(i) {
		const item = results[i];
		if (!item) return;
		dialog.close();
		item.run();
	}

	function show() {
		if (dialog.open) return;
		input.value = "";
		active = 0;
		render();
		dialog.showModal();
		input.focus();
	}

	input.addEventListener("input", () => {
		active = 0;
		render();
	});
	input.addEventListener("keydown", (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive(active + 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive(active - 1);
		} else if (e.key === "Enter") {
			e.preventDefault();
			run(active);
		}
	});
	list.addEventListener("pointermove", (e) => {
		const el = e.target.closest(".palette-item");
		if (el && Number(el.dataset.i) !== active) setActive(Number(el.dataset.i));
	});
	list.addEventListener("click", (e) => {
		const el = e.target.closest(".palette-item");
		if (el) run(Number(el.dataset.i));
	});
	dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());

	addEventListener("keydown", (e) => {
		const typing = e.target.closest?.("input, textarea, [contenteditable]");
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
			e.preventDefault();
			dialog.open ? dialog.close() : show();
		} else if (e.key === "/" && !typing && !dialog.open) {
			e.preventDefault();
			show();
		}
	});

	document.querySelectorAll("[data-palette-open]").forEach((btn) => {
		btn.addEventListener("click", show);
		const kbd = btn.querySelector("kbd");
		if (kbd) kbd.textContent = isMac ? "⌘K" : "Ctrl K";
	});

	// Let other scripts open it (e.g. the mobile menu)
	window.EY = Object.assign(window.EY || {}, { openPalette: show });
	root.classList.add("has-palette");
})();
