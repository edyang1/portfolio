// ***************************************
// DYNAMICALLY GENERATED TABLE OF CONTENTS
// ***************************************

document.addEventListener("DOMContentLoaded", function() {
    const tocList = document.getElementById("toc-list");
    const headers = document.querySelectorAll(".article h2, .article h3"); // Select all h2 and h3 elements

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