// Function to toggle the side panel open or closed
function toggleSidePanel() {
    const sidePanel = document.getElementById('sidePanel');
    sidePanel.classList.toggle('open');

    // Store the open state in localStorage
    if (sidePanel.classList.contains('open')) {
        localStorage.setItem('sidePanelOpen', 'true');
    } else {
        localStorage.setItem('sidePanelOpen', 'false');
    }
}

// Restore side panel state on page load
document.addEventListener('DOMContentLoaded', () => {
    const sidePanel = document.getElementById('sidePanel');
    if (localStorage.getItem('sidePanelOpen') === 'true') {
        sidePanel.classList.add('open');
    }
});

// Prevent the side panel from closing on link click
document.querySelectorAll('.side-panel ul li a').forEach(link => {
    link.addEventListener('click', () => {
        localStorage.setItem('sidePanelOpen', 'true'); // Ensure open state persists
    });
});

// Close the side panel when the close button is clicked
document.querySelector('.close-btn').addEventListener('click', () => {
    const sidePanel = document.getElementById('sidePanel');
    sidePanel.classList.remove('open');
    localStorage.setItem('sidePanelOpen', 'false');
});


// Event Listener for only showing one selected side-panel link active
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.side-panel ul li a');
    const currentPath = window.location.pathname.split('/').pop(); // Get the current page filename
    
    links.forEach(link => {
        // Extract just the filename from the link's href
        const linkPath = link.getAttribute('href').split('/').pop();
        
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});


