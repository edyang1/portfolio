/* ==========================================================================
   Home page: WebGL hero, typing headline, hero spotlight + card-stack tilt,
   stat counters, scroll-lit quote, scroll-reactive marquee.
   ========================================================================== */

(() => {
	"use strict";

	const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

	/* ---------- Liquid aurora: a domain-warped noise shader in the brand colours ---------- */

	const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
	const FRAG = `
		precision mediump float;
		uniform vec2 u_res;
		uniform vec2 u_mouse;
		uniform float u_time;
		uniform float u_light;
		uniform vec3 u_bg;
		float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
		float noise(vec2 p){
			vec2 i = floor(p), f = fract(p);
			vec2 u = f * f * (3.0 - 2.0 * f);
			return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
		}
		float fbm(vec2 p){
			float v = 0.0, a = 0.5;
			mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
			for (int i = 0; i < 4; i++){ v += a * noise(p); p = m * p; a *= 0.5; }
			return v;
		}
		void main(){
			vec2 uv = gl_FragCoord.xy / u_res;
			float aspect = u_res.x / u_res.y;
			vec2 p = vec2(uv.x * aspect, uv.y);
			vec2 m = vec2(u_mouse.x * aspect, u_mouse.y);
			float t = u_time * 0.04;
			float pull = exp(-dot(p - m, p - m) * 2.6);
			vec2 q = vec2(fbm(p * 1.05 + t), fbm(p * 1.05 - t + 5.2));
			vec2 r = vec2(fbm(p * 1.25 + 2.8 * q + vec2(1.7, 9.2) + t * 1.3 + pull * 0.9),
			              fbm(p * 1.25 + 2.8 * q + vec2(8.3, 2.8) - t * 0.9));
			float f = fbm(p * 1.1 + 2.4 * r);
			vec3 red = vec3(1.0, 0.16, 0.22), cyan = vec3(0.13, 0.83, 0.93);
			// Two independent fields of light: red leads, cyan supports, and where they cross they add to white
			float calm = mix(0.5, 1.0, smoothstep(0.05, 0.7, uv.x)); // quieter behind the headline
			float gr = pow(smoothstep(0.44, 0.9, f), 1.5) * (0.85 + 0.7 * pull) * calm;
			float gc = pow(smoothstep(0.4, 0.74, 1.0 - q.y), 1.4) * calm * (1.0 - 0.6 * gr);
			vec3 outc;
			if (u_light > 0.5) {
				outc = mix(u_bg, red, clamp(gr * 0.34, 0.0, 1.0));
				outc = mix(outc, cyan, clamp(gc * 0.26, 0.0, 1.0));
			} else {
				outc = u_bg + red * gr * 0.5 + cyan * gc * 0.4;
				outc += vec3(1.0) * gr * gc * 0.4; // hot white where the two meet
			}
			gl_FragColor = vec4(min(outc, vec3(1.0)), 1.0);
		}`;

	function liquidAurora(host) {
		const canvas = document.createElement("canvas");
		const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
		if (!gl) return;

		const shader = (type, src) => {
			const s = gl.createShader(type);
			gl.shaderSource(s, src);
			gl.compileShader(s);
			return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
		};
		const vs = shader(gl.VERTEX_SHADER, VERT);
		const fs = shader(gl.FRAGMENT_SHADER, FRAG);
		if (!vs || !fs) return;
		const prog = gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
		gl.useProgram(prog);

		// One triangle that covers the whole viewport
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const loc = gl.getAttribLocation(prog, "p");
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

		const u = (name) => gl.getUniformLocation(prog, name);
		const uRes = u("u_res"), uMouse = u("u_mouse"), uTime = u("u_time"), uLight = u("u_light"), uBg = u("u_bg");

		canvas.className = "hero-gl";
		canvas.setAttribute("aria-hidden", "true");
		host.prepend(canvas);
		host.classList.add("has-gl");

		const coarse = !finePointer;
		const scale = coarse ? 0.35 : 0.5; // the field is soft, so low resolution is invisible and cheap
		const frameGap = coarse ? 1000 / 30 : 0;

		const setTheme = () => {
			const light = document.documentElement.dataset.theme === "light";
			gl.uniform1f(uLight, light ? 1 : 0);
			const bg = light ? [1, 1, 1] : [0.039, 0.039, 0.039];
			gl.uniform3f(uBg, bg[0], bg[1], bg[2]);
		};
		const resize = () => {
			canvas.width = Math.max(1, Math.round(host.clientWidth * scale));
			canvas.height = Math.max(1, Math.round(host.clientHeight * scale));
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.uniform2f(uRes, canvas.width, canvas.height);
		};
		setTheme();
		resize();
		new MutationObserver(() => {
			setTheme();
			if (reduceMotion) draw(0);
		}).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
		addEventListener("resize", resize, { passive: true });

		const mouse = { x: 0.72, y: 0.62, tx: 0.72, ty: 0.62 };
		host.addEventListener("pointermove", (e) => {
			const r = host.getBoundingClientRect();
			mouse.tx = (e.clientX - r.left) / r.width;
			mouse.ty = 1 - (e.clientY - r.top) / r.height;
		});

		let time = 8;
		let last = performance.now();
		let visible = true;
		const draw = (dt) => {
			time += dt;
			mouse.x += (mouse.tx - mouse.x) * 0.05;
			mouse.y += (mouse.ty - mouse.y) * 0.05;
			gl.uniform1f(uTime, time);
			gl.uniform2f(uMouse, mouse.x, mouse.y);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		};

		if (reduceMotion) {
			draw(0); // one still frame: all of the colour, none of the motion
			return;
		}

		new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(host);
		const loop = (now) => {
			requestAnimationFrame(loop);
			if (!visible || document.hidden || now - last < frameGap) return;
			draw(Math.min(0.05, (now - last) / 1000));
			last = now;
		};
		requestAnimationFrame(loop);
	}

	const heroEl = document.querySelector(".hero");
	if (heroEl) {
		try {
			liquidAurora(heroEl);
		} catch {
			/* WebGL unavailable: the CSS aurora stays */
		}
	}

	/* ---------- Scroll-lit quote: words brighten as it passes through the viewport ---------- */

	const lit = document.querySelector("[data-scroll-lit]");
	if (lit && !reduceMotion) {
		const walker = document.createTreeWalker(lit, NodeFilter.SHOW_TEXT);
		const texts = [];
		while (walker.nextNode()) if (!walker.currentNode.parentElement.closest("cite")) texts.push(walker.currentNode);
		let n = 0;
		texts.forEach((node) => {
			const frag = document.createDocumentFragment();
			node.textContent.split(/(\s+)/).forEach((part) => {
				if (!part.trim()) return frag.append(part);
				const w = document.createElement("span");
				w.className = "lit-word";
				w.style.setProperty("--i", n++);
				w.textContent = part;
				frag.append(w);
			});
			node.replaceWith(frag);
		});
		lit.style.setProperty("--n", n);
		const update = () => {
			const r = lit.getBoundingClientRect();
			const p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
			lit.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(3));
		};
		addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
		update();
	}

	/* ---------- Marquee reacts to scroll speed: faster, and leaning into it ---------- */

	const marquee = document.querySelector(".marquee");
	const track = marquee?.querySelector(".marquee-track");
	const marqueeAnim = track?.getAnimations?.()[0];
	if (marquee && marqueeAnim && !reduceMotion) {
		let lastY = scrollY;
		let velocity = 0;
		let running = false;
		const tick = () => {
			const y = scrollY;
			velocity += (y - lastY - velocity) * 0.2;
			lastY = y;
			velocity *= 0.92;
			marqueeAnim.playbackRate = 1 + Math.min(6, Math.abs(velocity) * 0.25);
			marquee.style.setProperty("--skew", `${Math.max(-12, Math.min(12, -velocity * 0.35)).toFixed(2)}deg`);
			if (Math.abs(velocity) > 0.05) {
				requestAnimationFrame(tick);
			} else {
				running = false;
				marqueeAnim.playbackRate = 1;
				marquee.style.setProperty("--skew", "0deg");
			}
		};
		addEventListener(
			"scroll",
			() => {
				if (!running) {
					running = true;
					lastY = scrollY;
					requestAnimationFrame(tick);
				}
			},
			{ passive: true }
		);
	}

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
