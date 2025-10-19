document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const heroTitle = document.getElementById('hero-title');
    const heroMeta = document.getElementById('hero-meta');
    const heroCover = document.getElementById('hero-cover');
    const heroDescription = document.getElementById('hero-description');
    const heroPlay = document.getElementById('hero-play');
    const heroSeek = document.getElementById('hero-seek');
    const heroCurrent = document.getElementById('hero-current');
    const heroDuration = document.getElementById('hero-duration');
    const episodesList = document.getElementById('episodes-list');
    const mainAudio = document.getElementById('main-audio');

    let episodes = [];
    let currentEpisodeIndex = 0;

    // Helpers
    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    };

    // Load episode into hero
    const loadEpisode = (episode, index) => {
        currentEpisodeIndex = index;
        
        heroTitle.textContent = episode.title;
        heroCover.src = episode.cover;
        heroCover.alt = `Pochette ${episode.title}`;
        heroDescription.textContent = episode.description || '';
        
        const date = formatDate(episode.date);
        heroMeta.textContent = date;
        
        mainAudio.src = episode.audio;
        heroSeek.value = 0;
        heroCurrent.textContent = '0:00';
        heroDuration.textContent = '0:00';
        
        // Mettre à jour les métadonnées avec la durée une fois l'audio chargé
        mainAudio.addEventListener('loadedmetadata', function updateMeta() {
            const durationMin = Math.floor(mainAudio.duration / 60);
            heroMeta.textContent = `${durationMin} min • ${date}`;
            mainAudio.removeEventListener('loadedmetadata', updateMeta);
        }, { once: true });
        
        // Mettre à jour la liste pour exclure l'épisode en cours
        renderEpisodesList(episodesList, episodes, currentEpisodeIndex);
        
        // Animation
        gsap.from('.hero-episode-content', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            ease: 'power2.out'
        });
    };

    // Play/Pause Toggle
    const togglePlay = () => {
        const playIcon = heroPlay.querySelector('.play-icon');
        const pauseIcon = heroPlay.querySelector('.pause-icon');
        
        if (mainAudio.paused) {
            mainAudio.play().then(() => {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            }).catch(err => {
                console.error('Erreur lecture:', err);
            });
        } else {
            mainAudio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    };

    heroPlay.addEventListener('click', togglePlay);

    // Audio events
    mainAudio.addEventListener('timeupdate', () => {
        heroCurrent.textContent = formatTime(mainAudio.currentTime);
        if (mainAudio.duration) {
            const progress = (mainAudio.currentTime / mainAudio.duration) * 100;
            heroSeek.value = progress;
        }
    });

    mainAudio.addEventListener('loadedmetadata', () => {
        heroDuration.textContent = formatTime(mainAudio.duration);
    });

    mainAudio.addEventListener('ended', () => {
        const playIcon = heroPlay.querySelector('.play-icon');
        const pauseIcon = heroPlay.querySelector('.pause-icon');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        
        // Auto-play next episode
        if (currentEpisodeIndex < episodes.length - 1) {
            loadEpisode(episodes[currentEpisodeIndex + 1], currentEpisodeIndex + 1);
            mainAudio.play();
        }
    });

    // Seek control
    heroSeek.addEventListener('input', () => {
        if (mainAudio.duration) {
            const time = (heroSeek.value / 100) * mainAudio.duration;
            mainAudio.currentTime = time;
        }
    });

    // Render previous episodes list
    const renderEpisodesList = (episodesList, allEpisodes, currentPlayingIndex = -1) => {
        episodesList.innerHTML = '';
        
        // Filter out the currently playing episode
        const otherEpisodes = allEpisodes.filter((_, idx) => idx !== currentPlayingIndex);
        
        if (otherEpisodes.length === 0) {
            episodesList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.5);">
                    <p>Aucun autre épisode</p>
                </div>
            `;
            return;
        }
        
        otherEpisodes.forEach((episode) => {
            const actualIndex = allEpisodes.indexOf(episode); // Trouver l'index réel dans le tableau complet
            const item = document.createElement('div');
            item.className = 'episode-item';
            
            // Créer un audio temporaire pour obtenir la durée
            const tempAudio = new Audio(episode.audio);
            let duration = '-- min';
            
            tempAudio.addEventListener('loadedmetadata', () => {
                const durationMin = Math.floor(tempAudio.duration / 60);
                const durationSpan = item.querySelector('.episode-item-duration');
                if (durationSpan) {
                    durationSpan.textContent = `${durationMin} min`;
                }
            });
            
            item.innerHTML = `
                <h3 class="episode-item-title">${episode.title}</h3>
                <span class="episode-item-duration">${duration}</span>
                <button class="episode-item-play" aria-label="Lire ${episode.title}">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
            `;
            
            // Click on item or play button
            const playBtn = item.querySelector('.episode-item-play');
            const playEpisode = (e) => {
                e.stopPropagation();
                loadEpisode(episode, actualIndex);
                mainAudio.play();
                
                // Smooth scroll to hero
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            };
            
            playBtn.addEventListener('click', playEpisode);
            item.addEventListener('click', playEpisode);
            
            episodesList.appendChild(item);
        });
    };

    // Load episodes data
    const loadData = async () => {
        try {
            const res = await fetch('assets/podcast/episodes.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            
            const data = await res.json();
            episodes = data?.episodes || [];
            
            // Sort by date desc
            episodes.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (episodes.length > 0) {
                // Load latest episode into hero (renderEpisodesList sera appelé dans loadEpisode)
                loadEpisode(episodes[0], 0);
            } else {
                heroTitle.textContent = 'Aucun épisode disponible';
                heroMeta.textContent = 'Les épisodes seront ajoutés prochainement';
                heroCover.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23222" width="400" height="400"/%3E%3C/svg%3E';
                heroDescription.textContent = '';
            }
        } catch (err) {
            console.error('Erreur chargement épisodes:', err);
            heroTitle.textContent = 'Erreur de chargement';
            heroMeta.textContent = 'Impossible de charger les épisodes';
            heroCover.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23222" width="400" height="400"/%3E%3C/svg%3E';
        }
    };

    // Initialize
    loadData();
    
    // GSAP Animations on scroll (optional)
    const previousEpisodes = document.querySelector('.previous-episodes');
    if (previousEpisodes && typeof gsap !== 'undefined') {
        gsap.from('.previous-episodes', {
            scrollTrigger: {
                trigger: '.previous-episodes',
                start: 'top 80%',
            },
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: 'power2.out'
        });
    }
});
