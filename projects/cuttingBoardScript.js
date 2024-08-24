// ***************************************
// DYNAMICALLY GENERATED TABLE OF CONTENTS
// ***************************************

document.addEventListener("DOMContentLoaded", function() {
    const tocList = document.getElementById("toc-list");
    const headers = document.querySelectorAll(".article h2"); // Select all h2 and h3 elements

    headers.forEach((header) => {
        const tocItem = document.createElement("li");
        const tocLink = document.createElement("a");
        
        tocLink.textContent = header.textContent;
        tocLink.href = `#${header.id}`;
        tocLink.classList.add("toc-link");

        tocItem.appendChild(tocLink);
        tocList.appendChild(tocItem);
    });

    const tocLinks = document.querySelectorAll(".toc-link");

    function changeLinkState() {
        let index = headers.length;

        while (--index && window.scrollY + 50 < headers[index].offsetTop) {}

        tocLinks.forEach((link) => link.classList.remove("active"));
        tocLinks[index].classList.add("active");
    }

    tocLinks.forEach((link) => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: "smooth"
            });
        });
    });

    window.addEventListener("scroll", changeLinkState);
});

// **********************************
// REVEAL IMAGES AND TIDBIT ON SCROLL
// **********************************

document.addEventListener("DOMContentLoaded", function() {
    const images = document.querySelectorAll('.reveal');

    function reveal() {
        for (let i = 0; i < images.length; i++) {
            let windowHeight = window.innerHeight;
            let elementTop = images[i].getBoundingClientRect().top;
            let elementBottom = images[i].getBoundingClientRect().bottom;
            let elementVisible = 150; // Adjust this value to control when the reveal happens

            // Check if the image is within the viewport
            if (elementTop < windowHeight - elementVisible && elementBottom > elementVisible) {
                images[i].classList.add('visible');
            } else {
                images[i].classList.remove('visible');
            }
        }
    }

    window.addEventListener('scroll', reveal);
    reveal(); // Reveal images on page load if they're already in view
});