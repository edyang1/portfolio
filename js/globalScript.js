const globalCopyrightMessage = "&copy; 2025 Eddie Yang. All rights reserved.";

document.addEventListener("DOMContentLoaded", () => {
    const yearElements = document.querySelectorAll(".copyrightMessage");
    yearElements.forEach(element => {
        element.textContent = globalCopyrightMessage;
    });
});