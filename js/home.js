/* ==========================================================================
   Home page: typing headline, hero spotlight + card-stack tilt, stat counters.
   ========================================================================== */

(() => {
	"use strict";

	const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

	/* ---------- Typing effect ---------- */

	const titles = [
		"a doer.",
		"a maker.",
		"an entrepreneur.",
		"a banana bandit.",
		"a podcaster.",
		"a youtuber.",
		"a streamer.",
		"a content creator.",
		"a gamer.",
		"a designer.",
		"a programmer.",
		"a weightlifter.",
		"a guitarist.",
		"a musician.",
		"a student.",
		"a problem solver.",
		"a dreamer.",
	];

	const output = document.getElementById("dynamic-text");
	const rotator = document.querySelector(".rotator");

	function shuffle(list) {
		for (let i = list.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[list[i], list[j]] = [list[j], list[i]];
		}
	}

	if (output) {
		const TYPE_MS = 95;
		const DELETE_MS = 45;
		const HOLD_MS = 1700;
		let index = 0;
		let chars = 0;
		let deleting = false;
		let timer;

		shuffle(titles);
		// Start mid-word so the headline is never empty on first paint
		chars = titles[0].length;
		output.textContent = titles[0];

		const tick = () => {
			const current = titles[index];
			if (deleting) {
				chars--;
				output.textContent = current.slice(0, chars);
				if (chars > 0) {
					timer = setTimeout(tick, DELETE_MS);
				} else {
					deleting = false;
					index = (index + 1) % titles.length;
					if (index === 0) shuffle(titles);
					timer = setTimeout(tick, 380);
				}
			} else if (chars < current.length) {
				chars++;
				output.textContent = current.slice(0, chars);
				timer = setTimeout(tick, TYPE_MS);
			} else {
				deleting = true;
				timer = setTimeout(tick, HOLD_MS);
			}
		};

		const swap = () => {
			index = (index + 1) % titles.length;
			output.textContent = titles[index];
		};

		if (reduceMotion) {
			timer = setInterval(swap, 2600);
		} else {
			timer = setTimeout(tick, HOLD_MS);
		}

		// Click the word: skip ahead (and the bandit gets a little celebration)
		rotator?.addEventListener("click", () => {
			if (titles[index].includes("banana") && output.textContent.length > 4) window.EY?.bananaRain();
			if (reduceMotion) return swap();
			clearTimeout(timer);
			deleting = true;
			tick();
		});
	}

	/* ---------- Hero spotlight + 3D tilt on the project stack ---------- */

	const hero = document.querySelector(".hero");
	const stack = document.querySelector(".stack-inner");

	if (hero && finePointer && !reduceMotion) {
		let frame = 0;
		hero.addEventListener("pointermove", (e) => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const r = hero.getBoundingClientRect();
				hero.style.setProperty("--hx", `${e.clientX - r.left}px`);
				hero.style.setProperty("--hy", `${e.clientY - r.top}px`);
				if (!stack) return;
				const s = stack.getBoundingClientRect();
				const dx = (e.clientX - (s.left + s.width / 2)) / innerWidth;
				const dy = (e.clientY - (s.top + s.height / 2)) / innerHeight;
				stack.style.setProperty("--tilt-x", `${(dx * 16).toFixed(2)}deg`);
				stack.style.setProperty("--tilt-y", `${(-dy * 12).toFixed(2)}deg`);
			});
		});
		hero.addEventListener("pointerleave", () => {
			stack?.style.setProperty("--tilt-x", "0deg");
			stack?.style.setProperty("--tilt-y", "0deg");
		});
	}

	/* ---------- Count-up stats ---------- */

	const counters = document.querySelectorAll("[data-count]");
	if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
		const format = (n) => n.toLocaleString("en-US");
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					io.unobserve(entry.target);
					const el = entry.target;
					const end = Number(el.dataset.count);
					const start = performance.now();
					const duration = 1700;
					const frame = (now) => {
						const t = Math.min(1, (now - start) / duration);
						el.textContent = format(Math.round(end * (1 - Math.pow(1 - t, 4))));
						if (t < 1) requestAnimationFrame(frame);
					};
					requestAnimationFrame(frame);
				});
			},
			{ threshold: 0.6 }
		);
		counters.forEach((el) => {
			el.textContent = "0";
			io.observe(el);
		});
	}
})();
