// Chargement des œuvres
let oeuvres = [];
const oeuvresContainer = document.querySelector('.oeuvres-container');
const detailModal = document.getElementById('oeuvre-detail');
const filterButtons = document.querySelectorAll('.filter-btn');

// Charger les données des œuvres
async function loadOeuvres() {
    try {
        console.log('Tentative de chargement des œuvres...');
        console.log('URL demandée:', window.location.origin + '/data/oeuvres.json');
        const response = await fetch('data/oeuvres.json');
        console.log('Réponse reçue:', response);
        console.log('Status:', response.status);
        console.log('OK:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Données reçues:', data);
        
        oeuvres = data.oeuvres;
        console.log('Œuvres chargées:', oeuvres);
        
        if (!oeuvres || oeuvres.length === 0) {
            console.error('Aucune œuvre trouvée dans les données');
            return;
        }
        
        displayOeuvres(oeuvres);
        
        // Animation initiale des cartes
        gsap.from('.oeuvre-card', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.1,
            ease: 'power3.out'
        });
    } catch (error) {
        console.error('Erreur lors du chargement des œuvres:', error);
        oeuvresContainer.innerHTML = `
            <div class="error-message">
                <p>Une erreur est survenue lors du chargement des œuvres.</p>
                <p>Erreur: ${error.message}</p>
            </div>
        `;
    }
}

// Afficher les œuvres dans la grille
function displayOeuvres(oeuvresToDisplay) {
    console.log('Affichage des œuvres:', oeuvresToDisplay);
    
    if (!oeuvresContainer) {
        console.error('Container des œuvres non trouvé');
        return;
    }
    
    oeuvresContainer.innerHTML = '';
    
    oeuvresToDisplay.forEach(oeuvre => {
        console.log('Création de la carte pour:', oeuvre.titre);
        const card = document.createElement('div');
        card.className = 'oeuvre-card';
        card.innerHTML = `
            <img src="${oeuvre.image}" alt="${oeuvre.titre}" loading="lazy">
            <div class="oeuvre-info">
                <h3>${oeuvre.titre}</h3>
                <p>${oeuvre.date}</p>
            </div>
        `;
        
        card.addEventListener('click', () => showOeuvreDetail(oeuvre));
        oeuvresContainer.appendChild(card);
    });
}

// Afficher les détails d'une œuvre
function showOeuvreDetail(oeuvre) {
    const detailContent = detailModal.querySelector('.detail-content');
    const image = detailContent.querySelector('.detail-image img');
    const title = detailContent.querySelector('h2');
    const metadata = detailContent.querySelector('.metadata');
    const description = detailContent.querySelector('.description');
    const analyse = detailContent.querySelector('.analyse');
    const funFact = detailContent.querySelector('.fun-fact');
    const audio = detailContent.querySelector('.audio-guide source');
    
    // Animation d'entrée de la modal
    gsap.from(detailContent, {
        duration: 0.5,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
    });
    
    image.src = oeuvre.image;
    image.alt = oeuvre.titre;
    title.textContent = oeuvre.titre;
    
    // Construire les métadonnées
    let metadataHTML = '';
    for (const [key, value] of Object.entries(oeuvre)) {
        if (['id', 'titre', 'description', 'analyse', 'funFact', 'audioGuide', 'image', 'categorie'].includes(key)) continue;
        metadataHTML += `<p><strong>${key}:</strong> ${value}</p>`;
    }
    metadata.innerHTML = metadataHTML;
    
    description.innerHTML = `
        <h3>Description</h3>
        <p>${oeuvre.description}</p>
    `;
    
    analyse.innerHTML = `
        <h3>Analyse</h3>
        <p>${oeuvre.analyse}</p>
    `;
    
    funFact.innerHTML = `
        <h3>Fun Fact</h3>
        <p>${oeuvre.funFact}</p>
    `;
    
    audio.src = oeuvre.audioGuide;
    detailContent.querySelector('.audio-guide').load();
    
    detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Jouer l'audioguide automatiquement
    const audioElement = detailContent.querySelector('.audio-guide');
    audioElement.play().catch(error => {
        console.log('Lecture automatique bloquée par le navigateur');
    });
}

// Fermer la modal de détail avec animation
document.querySelector('.close-btn').addEventListener('click', () => {
    const detailContent = detailModal.querySelector('.detail-content');
    
    gsap.to(detailContent, {
        duration: 0.3,
        y: 50,
        opacity: 0,
        ease: 'power3.in',
        onComplete: () => {
            detailModal.classList.remove('active');
            document.body.style.overflow = '';
            detailContent.querySelector('.audio-guide').pause();
            gsap.set(detailContent, { clearProps: 'all' });
        }
    });
});

// Gestion des filtres avec animation
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Mettre à jour l'état actif des boutons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filtrer les œuvres
        const filter = button.dataset.filter;
        const filteredOeuvres = filter === 'all' 
            ? oeuvres 
            : oeuvres.filter(oeuvre => oeuvre.categorie === filter);
        
        // Animation de transition
        gsap.to('.oeuvre-card', {
            duration: 0.3,
            opacity: 0,
            y: 20,
            stagger: 0.05,
            ease: 'power2.in',
            onComplete: () => {
                displayOeuvres(filteredOeuvres);
                gsap.from('.oeuvre-card', {
                    duration: 0.5,
                    opacity: 0,
                    y: 20,
                    stagger: 0.05,
                    ease: 'power2.out'
                });
            }
        });
    });
});

// Fermer la modal en cliquant en dehors du contenu
detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
        const detailContent = detailModal.querySelector('.detail-content');
        
        gsap.to(detailContent, {
            duration: 0.3,
            y: 50,
            opacity: 0,
            ease: 'power3.in',
            onComplete: () => {
                detailModal.classList.remove('active');
                document.body.style.overflow = '';
                detailContent.querySelector('.audio-guide').pause();
                gsap.set(detailContent, { clearProps: 'all' });
            }
        });
    }
});

// Charger les œuvres au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, recherche du conteneur...');
    console.log('Conteneur trouvé:', document.querySelector('.oeuvres-container'));
    console.log('Modal trouvée:', document.getElementById('oeuvre-detail'));
    console.log('Boutons de filtre trouvés:', document.querySelectorAll('.filter-btn').length);
    loadOeuvres();
}); 