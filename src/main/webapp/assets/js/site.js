const parallaxNodes = document.querySelectorAll("[data-parallax]");
const revealNodes = document.querySelectorAll(".reveal");

const updateParallax = () => {
    const scrollY = window.scrollY;
    parallaxNodes.forEach((node) => {
        node.style.backgroundPositionY = `${scrollY * 0.22}px`;
    });
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

revealNodes.forEach((node) => observer.observe(node));
window.addEventListener("scroll", updateParallax, { passive: true });
updateParallax();

