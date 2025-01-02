// ******************
// BACK TO TOP BUTTON
// ******************

// Initialize variables to keep track of the scroll position and direction
let lastScrollTop = 0;

// Function to show or hide the Back to Top button based on scroll direction
window.onscroll = function () {
	var backToTopButton = document.getElementById("back-to-top");
	let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

	// Check if the user is scrolling up
	if (currentScrollTop < lastScrollTop && currentScrollTop > 200) {
		// User is scrolling up, show the button
		backToTopButton.classList.add("visible");
	} else {
		// User is scrolling down or hasn't scrolled enough, hide the button
		backToTopButton.classList.remove("visible");
	}

	// Update the last scroll position
	lastScrollTop = currentScrollTop;
};

// Smooth scrolling for the Back to Top button
document.querySelector("#back-to-top").addEventListener("click", function (e) {
	e.preventDefault();
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
});
