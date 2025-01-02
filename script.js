// *************
// TYPING EFFECT
// *************

document.addEventListener("DOMContentLoaded", function () {
	let titles = [
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

	let titleIndex = 0;
	let charIndex = 0;
	let isDeleting = false;
	const typingSpeed = 100;
	const deletingSpeed = 50;
	const delayBetweenTitles = 1500;
	const dynamicText = document.getElementById("dynamic-text");

	// Function to shuffle the titles array
	function shuffleTitles() {
		for (let i = titles.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[titles[i], titles[j]] = [titles[j], titles[i]];
		}
	}

	// Initial shuffle
	shuffleTitles();

	function type() {
		const currentTitle = titles[titleIndex];
		if (isDeleting) {
			if (charIndex > 0) {
				charIndex--;
				dynamicText.textContent = currentTitle.substring(0, charIndex);
				setTimeout(type, deletingSpeed);
			} else {
				isDeleting = false;
				titleIndex++;
				if (titleIndex >= titles.length) {
					titleIndex = 0;
					shuffleTitles(); // Shuffle again after going through all titles
				}
				setTimeout(type, 500); // Pause before typing next title
			}
		} else {
			if (charIndex < currentTitle.length) {
				dynamicText.textContent = currentTitle.substring(0, charIndex + 1);
				charIndex++;
				setTimeout(type, typingSpeed);
			} else {
				setTimeout(() => {
					isDeleting = true;
					setTimeout(type, deletingSpeed);
				}, delayBetweenTitles);
			}
		}
	}

	// Start the typing effect
	type();
});
