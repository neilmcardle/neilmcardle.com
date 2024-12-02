// Function to toggle the side panel open or closed
function toggleSidePanel() {
    const sidePanel = document.getElementById('sidePanel');
    sidePanel.classList.toggle('open');

    // Store the open state in localStorage
    localStorage.setItem('sidePanelOpen', sidePanel.classList.contains('open') ? 'true' : 'false');
}

// Close side panel when clicking outside of it or on the close button
document.addEventListener('click', (event) => {
    const sidePanel = document.getElementById('sidePanel');
    const hamburger = document.querySelector('.hamburger');
    const closeButton = document.querySelector('.close-btn');
    
    if (!sidePanel.contains(event.target) && !hamburger.contains(event.target)) {
        sidePanel.classList.remove('open');
        localStorage.setItem('sidePanelOpen', 'false');
    }

    if (closeButton && closeButton.contains(event.target)) {
        sidePanel.classList.remove('open');
        localStorage.setItem('sidePanelOpen', 'false');
    }
});

// Ensure side panel state persists across page loads
document.addEventListener('DOMContentLoaded', () => {
    const sidePanel = document.getElementById('sidePanel');
    if (localStorage.getItem('sidePanelOpen') === 'true') {
        sidePanel.classList.add('open');
    }

    // Highlight the active link in the side panel
    const links = document.querySelectorAll('.side-panel ul li a');
    const currentPath = window.location.pathname.split('/').pop(); // Get the current page filename

    links.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Close side panel when a link is clicked
document.querySelectorAll('.side-panel ul li a').forEach(link => {
    link.addEventListener('click', () => {
        localStorage.setItem('sidePanelOpen', 'true'); // Ensure open state persists
        document.getElementById('sidePanel').classList.remove('open');
    });
});

// Scroll to Top Button
const scrollToTopButton = document.getElementById('scrollToTop');

// Show or hide the button based on scroll position
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const viewportHeight = window.innerHeight;

    // Show button if scrolled down by more than half the viewport height
    if (scrollPosition > viewportHeight * 0.5) {
        scrollToTopButton.classList.add('show');
        scrollToTopButton.classList.remove('hide');
    } else {
        scrollToTopButton.classList.add('hide');
        scrollToTopButton.classList.remove('show');
    }
});

// Smooth scroll to top when button is clicked
scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});



