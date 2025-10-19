/**
 * Navigation Mobile - Menu Burger
 * Gestion du menu burger pour toutes les pages
 * Cache-busting pour forcer le rechargement
 */

// Vider le cache au chargement
if (localStorage.getItem('navCacheVersion') !== 'v2.0') {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('navCacheVersion', 'v2.0');
    console.log('Cache navigation vidé');
}

// Forcer le rechargement des ressources
const timestamp = Date.now();
const links = document.querySelectorAll('link[rel="stylesheet"]');
links.forEach(link => {
    if (link.href.includes('navigation.css')) {
        link.href = link.href.split('?')[0] + `?v=${timestamp}`;
    }
});

class MobileNavigation {
    constructor() {
        this.menuToggle = document.getElementById('nav-menu-toggle');
        this.mobileMenu = document.getElementById('nav-mobile');
        
        if (this.mobileMenu) {
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Ouvrir le menu mobile
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                this.openMobileMenu();
            });
        }
        
        // Fermer le menu mobile en cliquant sur un lien
        const mobileLinks = document.querySelectorAll('.nav__mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
        
        
        // Bouton de fermeture
        const closeBtn = document.getElementById('nav-mobile-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Fermer le menu avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }


    openMobileMenu() {
        // Animation liquide du bouton
        if (this.menuToggle) {
            this.menuToggle.classList.add('menu-opening');
            setTimeout(() => {
                this.menuToggle.classList.remove('menu-opening');
            }, 800);
        }
        
        this.mobileMenu.classList.add('active');
        document.body.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
    }
}

// Fonctions globales pour le cache
window.clearAllCache = function() {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Tout le cache vidé');
    window.location.reload();
};

window.forceReload = function() {
    const timestamp = Date.now();
    window.location.href = window.location.href.split('?')[0] + `?v=${timestamp}`;
};

window.clearNavigationCache = function() {
    localStorage.removeItem('navCacheVersion');
    console.log('Cache navigation vidé, rechargement...');
    window.location.reload();
};

// Initialiser la navigation mobile quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new MobileNavigation();
});
