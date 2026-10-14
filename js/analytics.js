/* Google Analytics (gtag.js). Change the measurement ID here and every page follows. */
(() => {
	const id = "G-4VTTVJNS9Q";

	// Keep local previews out of the stats
	if (location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;

	const script = document.createElement("script");
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
	document.head.append(script);

	window.dataLayer = window.dataLayer || [];
	window.gtag = function gtag() {
		window.dataLayer.push(arguments);
	};
	window.gtag("js", new Date());
	window.gtag("config", id);
})();
