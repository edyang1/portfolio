// Initialize variables to keep track of the scroll position and direction
let lastScrollTop = 0;

// Function to show or hide the Back to Top button based on scroll direction
window.onscroll = function() {
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
document.querySelector('#back-to-top').addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


document.addEventListener("DOMContentLoaded", function() {
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
        "a dreamer."
    ];
    
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenTitles = 1500;
    const dynamicText = document.getElementById("dynamic-text");

    function type() {
        const currentTitle = titles[titleIndex];
        if (isDeleting) {
            if (charIndex > 0) {
                charIndex--;
                dynamicText.textContent = currentTitle.substring(0, charIndex);
                setTimeout(type, deletingSpeed);
            } else {
                isDeleting = false;
                titleIndex = (titleIndex + 1) % titles.length;
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