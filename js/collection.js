/**
 * Collection Page - JavaScript minimaliste et fonctionnel
 */

class CollectionPage {
    constructor() {
        this.artworks = [];
        this.currentFilter = 'all';
        this.container = document.getElementById('artworks-container');
        this.modal = document.getElementById('artwork-modal');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.audioGuideBtn = document.getElementById('audio-guide-btn');
        this.audioElement = document.getElementById('modal-audio');
        
        this.init();
    }

    async init() {
        try {
            await this.loadArtworks();
            this.setupEventListeners();
            this.setupCursor();
        } catch (error) {
            this.showError('Erreur lors du chargement des œuvres');
        }
    }

    async loadArtworks() {
        this.showLoading();
        
        try {
            const response = await fetch('data/oeuvres.json', {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            this.artworks = data.oeuvres || [];
            
            if (this.artworks.length === 0) {
                throw new Error('Aucune œuvre trouvée');
            }
            
            this.displayArtworks(this.artworks);
        } catch (error) {
            console.error('Erreur de chargement:', error);
            this.showError('Impossible de charger les œuvres');
        }
    }

    displayArtworks(artworks) {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        artworks.forEach((artwork, index) => {
            const card = this.createArtworkCard(artwork, index);
            this.container.appendChild(card);
        });
    }

    createArtworkCard(artwork, index) {
        const card = document.createElement('div');
        card.className = 'artwork-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Ajouter un cache-buster aux images
        const imageUrl = this.addCacheBuster(artwork.image);
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${artwork.titre}" class="artwork-card__image" loading="lazy">
            <div class="artwork-card__content">
                <h3 class="artwork-card__title">${artwork.titre}</h3>
                <p class="artwork-card__date">${artwork.date}</p>
            </div>
        `;
        
        card.addEventListener('click', () => this.openModal(artwork));
        return card;
    }

    openModal(artwork) {
        const modal = this.modal;
        if (!modal) return;
        
        // Remplir le contenu de la modal avec cache-buster
        const imageUrl = this.addCacheBuster(artwork.image);
        document.getElementById('modal-image').src = imageUrl;
        document.getElementById('modal-image').alt = artwork.titre;
        document.getElementById('modal-title').textContent = artwork.titre;
        
        // Métadonnées
        const metadata = document.getElementById('modal-metadata');
        metadata.innerHTML = this.createMetadataHTML(artwork);
        
        // Description
        const description = document.getElementById('modal-description');
        description.innerHTML = `
            <h3>Description</h3>
            <p>${artwork.description}</p>
        `;
        
        // Analyse
        const analysis = document.getElementById('modal-analysis');
        analysis.innerHTML = `
            <h3>Analyse</h3>
            <p>${artwork.analyse}</p>
        `;
        
        // Fun Fact
        const funfact = document.getElementById('modal-funfact');
        funfact.innerHTML = `
            <h3>Fun Fact</h3>
            <p>${artwork.funFact}</p>
        `;
        
        // Audio Guide
        if (artwork.audioGuide) {
            this.audioElement.querySelector('source').src = artwork.audioGuide;
            this.audioElement.load();
            this.audioGuideBtn.style.display = 'inline-flex';
        } else {
            this.audioGuideBtn.style.display = 'none';
        }
        
        // Afficher la modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    createMetadataHTML(artwork) {
        let html = '';
        for (const [key, value] of Object.entries(artwork)) {
            if (['id', 'titre', 'description', 'analyse', 'funFact', 'audioGuide', 'image', 'categorie'].includes(key)) {
                continue;
            }
            html += `<p><strong>${key}:</strong> ${value}</p>`;
        }
        return html;
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Arrêter l'audio et réinitialiser le bouton
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.updateAudioButton(false);
    }

    filterArtworks(filter) {
        this.currentFilter = filter;
        
        const filteredArtworks = filter === 'all' 
            ? this.artworks 
            : this.artworks.filter(artwork => artwork.categorie === filter);
        
        this.displayArtworks(filteredArtworks);
    }

    setupEventListeners() {
        // Filtres
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Mettre à jour l'état actif
                this.filterButtons.forEach(btn => btn.classList.remove('filter-btn--active'));
                button.classList.add('filter-btn--active');
                
                // Filtrer les œuvres
                const filter = button.dataset.filter;
                this.filterArtworks(filter);
            });
        });
        
        // Fermer la modal
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Fermer en cliquant sur l'overlay
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal || e.target.classList.contains('modal__overlay')) {
                this.closeModal();
            }
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
        
        // Audio Guide Button
        this.audioGuideBtn.addEventListener('click', () => {
            this.toggleAudio();
        });
        
        // Audio events
        this.audioElement.addEventListener('play', () => {
            this.updateAudioButton(true);
        });
        
        this.audioElement.addEventListener('pause', () => {
            this.updateAudioButton(false);
        });
        
        this.audioElement.addEventListener('ended', () => {
            this.updateAudioButton(false);
        });
    }

    setupCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        
        if (!cursor || !follower) return;
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                follower.style.left = e.clientX - 16 + 'px';
                follower.style.top = e.clientY - 16 + 'px';
            }, 100);
        });
        
        // Effet hover sur les éléments interactifs
        const interactiveElements = document.querySelectorAll('a, button, .artwork-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                follower.style.transform = 'scale(1.5)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                follower.style.transform = 'scale(1)';
            });
        });
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = '<div class="loading">Chargement des œuvres...</div>';
        }
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    toggleAudio() {
        if (this.audioElement.paused) {
            this.audioElement.play().catch(error => {
                console.log('Lecture audio bloquée:', error);
            });
        } else {
            this.audioElement.pause();
        }
    }

    updateAudioButton(isPlaying) {
        const icon = this.audioGuideBtn.querySelector('.audio-guide__icon');
        
        if (isPlaying) {
            this.audioGuideBtn.classList.add('playing');
            icon.textContent = '⏸';
        } else {
            this.audioGuideBtn.classList.remove('playing');
            icon.textContent = '▶';
        }
    }

    addCacheBuster(url) {
        if (!url) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}v=${Date.now()}`;
    }
}

// Fonctions globales pour le cache
window.clearImageCache = function() {
    // Forcer le rechargement de toutes les images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        const src = img.src;
        if (src.includes('assets/img/')) {
            const separator = src.includes('?') ? '&' : '?';
            img.src = src.split('?')[0] + `${separator}v=${Date.now()}`;
        }
    });
    console.log('Cache des images vidé');
};

window.forceImageReload = function() {
    // Recharger la page avec un cache-buster
    const timestamp = Date.now();
    window.location.href = window.location.href.split('?')[0] + `?v=${timestamp}`;
};

// Initialiser la page quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new CollectionPage();
});
