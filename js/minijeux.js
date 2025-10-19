// Mini Jeux JavaScript
console.log('Mini Jeux module loaded');

// Animation d'apparition au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Animation du titre et sous-titre
    const revealElements = document.querySelectorAll('.reveal-text');
    
    setTimeout(() => {
        revealElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 200);
        });
    }, 100);

    // Animation de l'icône coming soon
    const comingSoonIcon = document.querySelector('.coming-soon-icon');
    if (comingSoonIcon) {
        gsap.from(comingSoonIcon, {
            scale: 0,
            rotation: -180,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: 0.5
        });
    }

    // Animation du contenu coming soon
    const comingSoonContent = document.querySelector('.coming-soon h2, .coming-soon p');
    if (comingSoonContent) {
        gsap.from('.coming-soon h2, .coming-soon p', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
            delay: 0.8
        });
    }
});

// Fonction pour charger les jeux (à implémenter plus tard)
function loadGames() {
    // Cette fonction sera utilisée pour charger dynamiquement les jeux
    console.log('Loading games...');
}

// Fonction pour initialiser un jeu spécifique (à implémenter plus tard)
function initGame(gameId) {
    console.log(`Initializing game: ${gameId}`);
}

