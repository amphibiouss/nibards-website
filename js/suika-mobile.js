// Suika Boobs - Interface Mobile avec Gyroscope
// Version: 1.0 - Interface mobile repensée

class SuikaMobileGame {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.gyroEnabled = false;
        this.gyroPermission = false;
        this.currentPosition = 0.5; // Position normalisée (0-1)
        this.rotation = 0;
        this.isDropping = false;
        
        // Éléments DOM
        this.canvas = document.getElementById('gameCanvas');
        this.dropBtn = document.getElementById('dropBtn');
        this.rotateBtn = document.getElementById('rotateBtn');
        this.gyroIndicator = document.getElementById('gyroIndicator');
        this.gyroGuide = document.getElementById('gyroGuide');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('bestScore');
        this.nextPreview = document.getElementById('nextPreview');
        
        // Game state
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('suikaBoobsBest')) || 0;
        this.gameOver = false;
        this.currentBall = null;
        this.canDrop = true;
        
        console.log('SuikaMobileGame initialisé');
        console.log('Éléments trouvés:', {
            canvas: !!this.canvas,
            dropBtn: !!this.dropBtn,
            rotateBtn: !!this.rotateBtn,
            gyroIndicator: !!this.gyroIndicator
        });
        
        if (this.isMobile) {
            this.init();
        }
    }
    
    async init() {
        this.setupEventListeners();
        this.updateUI();
        this.showGyroGuide();
        await this.requestGyroPermission();
        
        // Synchroniser l'état du bouton en temps réel
        setInterval(() => {
            this.updateButtonState();
            this.forceSyncWithGame();
        }, 100);
        
        // Mettre à jour la position du fruit en temps réel
        setInterval(() => {
            if (this.isTouching) {
                this.updateFruitPosition();
            }
        }, 16); // 60fps
    }
    
    setupEventListeners() {
        console.log('Configuration des événements mobiles');
        
        // Bouton de drop
        if (this.dropBtn) {
            this.dropBtn.addEventListener('click', () => {
                console.log('Bouton drop cliqué');
                this.dropBall();
            });
        }
        
        // Bouton de rotation
        if (this.rotateBtn) {
            this.rotateBtn.addEventListener('click', () => {
                this.rotateBall();
            });
        }
        
        // Touch events pour positionner le fruit
        if (this.canvas) {
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleTouchStart(e);
            });
            
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.handleTouchMove(e);
            });
            
            this.canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleTouchEnd(e);
            });
        }
        
        // Gyroscope
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                this.handleGyroscope(event);
            });
        }
        
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateCanvasSize();
            }, 100);
        });
        
        // Resize
        window.addEventListener('resize', () => {
            this.updateCanvasSize();
        });
    }
    
    handleTouchStart(e) {
        console.log('Touch start');
        this.touchStartX = e.touches[0].clientX;
        this.isTouching = true;
        
        // Mettre à jour la position immédiatement
        this.updatePositionFromTouch(e.touches[0]);
    }
    
    handleTouchMove(e) {
        if (!this.isTouching) return;
        
        console.log('Touch move');
        this.updatePositionFromTouch(e.touches[0]);
    }
    
    handleTouchEnd(e) {
        console.log('Touch end');
        this.isTouching = false;
    }
    
    updatePositionFromTouch(touch) {
        if (!this.canvas) return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        const relativeX = touch.clientX - canvasRect.left;
        const normalizedX = Math.max(0, Math.min(1, relativeX / canvasRect.width));
        
        console.log('Position mise à jour:', {
            clientX: touch.clientX,
            canvasLeft: canvasRect.left,
            relativeX: relativeX,
            canvasWidth: canvasRect.width,
            normalizedX: normalizedX
        });
        
        this.currentPosition = normalizedX;
        this.updateFruitPosition();
        this.updateGyroIndicator();
    }
    
    async requestGyroPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                this.gyroPermission = permission === 'granted';
                if (this.gyroPermission) {
                    this.enableGyro();
                }
            } catch (error) {
                console.log('Permission gyroscope refusée:', error);
                this.showFallbackControls();
            }
        } else {
            // Pas de permission nécessaire sur certains navigateurs
            this.enableGyro();
        }
    }
    
    enableGyro() {
        this.gyroEnabled = true;
        this.gyroIndicator.classList.add('active');
        this.hideGyroGuide();
        console.log('Gyroscope activé');
    }
    
    showFallbackControls() {
        // Afficher des contrôles alternatifs si le gyroscope n'est pas disponible
        console.log('Contrôles alternatifs activés');
    }
    
    handleGyroscope(event) {
        if (!this.gyroEnabled || this.isDropping) return;
        
        // Utiliser l'inclinaison gamma (gauche-droite) pour la position
        const gamma = event.gamma; // -90 à 90
        const normalizedPosition = (gamma + 90) / 180; // 0 à 1
        const clampedPosition = Math.max(0, Math.min(1, normalizedPosition));
        
        this.currentPosition = clampedPosition;
        this.updateGyroIndicator();
        
        // Mettre à jour la position du fruit dans le jeu principal
        this.updateFruitPosition();
    }
    
    updateFruitPosition() {
        if (window.suikaGame && window.suikaGame.currentBall) {
            const x = this.currentPosition * window.suikaGame.width;
            console.log('Mise à jour position fruit:', { 
                x, 
                y: 30, 
                position: this.currentPosition,
                ballExists: !!window.suikaGame.currentBall,
                isStatic: window.suikaGame.currentBall.isStatic
            });
            
            // Mettre à jour la position même si la balle n'est pas statique
            Body.setPosition(window.suikaGame.currentBall, { x, y: 30 });
        } else {
            console.log('Impossible de mettre à jour la position:', {
                gameExists: !!window.suikaGame,
                currentBall: !!window.suikaGame?.currentBall
            });
        }
    }
    
    updateGyroIndicator() {
        if (!this.gyroIndicator) return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        const indicatorX = canvasRect.left + (this.currentPosition * canvasRect.width);
        
        this.gyroIndicator.style.left = `${indicatorX}px`;
        this.gyroIndicator.style.top = `${canvasRect.top + 20}px`;
    }
    
    dropBall() {
        console.log('dropBall appelé', {
            canDrop: this.canDrop,
            isDropping: this.isDropping,
            gameExists: !!window.suikaGame,
            gameCanDrop: window.suikaGame?.canDrop,
            gameCurrentBall: !!window.suikaGame?.currentBall
        });
        
        if (!this.canDrop || this.isDropping) return;
        
        console.log('Bouton drop mobile cliqué');
        
        this.isDropping = true;
        if (this.dropBtn) {
            this.dropBtn.disabled = true;
            this.dropBtn.classList.add('dropping');
            this.dropBtn.style.transform = 'scale(0.95)';
        }
        
        // Déclencher le drop directement dans le jeu principal
        if (window.suikaGame && window.suikaGame.currentBall) {
            console.log('Drop direct du fruit');
            
            // Rendre la balle dynamique
            Body.setStatic(window.suikaGame.currentBall, false);
            
            // Positionner la balle selon la position actuelle
            const x = this.currentPosition * window.suikaGame.width;
            Body.setPosition(window.suikaGame.currentBall, { x, y: 50 });
            
            // Marquer comme lâchée
            window.suikaGame.canDrop = false;
            window.suikaGame.currentBall = null;
            
            // Générer le prochain ball
            setTimeout(() => {
                window.suikaGame.spawnBall();
                window.suikaGame.canDrop = true;
            }, 1000);
        } else {
            console.log('Jeu principal ou balle non trouvés');
        }
        
        // Réinitialiser l'état
        setTimeout(() => {
            this.isDropping = false;
            if (this.dropBtn) {
                this.dropBtn.disabled = false;
                this.dropBtn.classList.remove('dropping');
                this.dropBtn.style.transform = 'scale(1)';
            }
        }, 1000);
    }
    
    rotateBall() {
        this.rotation = (this.rotation + 45) % 360;
        this.rotateBtn.style.transform = `rotate(${this.rotation}deg)`;
        
        // Animation de rotation
        this.rotateBtn.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            this.rotateBtn.style.transition = '';
        }, 300);
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    updateScore(points) {
        this.score += points;
        this.updateUI();
        
        // Animation de score
        this.scoreElement.style.transform = 'scale(1.1)';
        this.scoreElement.style.color = '#4ade80';
        setTimeout(() => {
            this.scoreElement.style.transform = 'scale(1)';
            this.scoreElement.style.color = '';
        }, 300);
    }
    
    updateCanvasSize() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Adapter la taille du canvas
        const maxWidth = containerRect.width - 40; // Marge
        const maxHeight = containerRect.height - 40;
        
        this.canvas.width = Math.min(maxWidth, 350);
        this.canvas.height = Math.min(maxHeight, 500);
        
        // Redessiner le jeu si nécessaire
        this.redrawGame();
    }
    
    redrawGame() {
        // Redessiner le jeu après redimensionnement
        // À intégrer avec le moteur de jeu principal
    }
    
    showGyroGuide() {
        this.gyroGuide.classList.add('show');
        
        // Masquer automatiquement après 3 secondes
        setTimeout(() => {
            this.hideGyroGuide();
        }, 3000);
    }
    
    hideGyroGuide() {
        this.gyroGuide.classList.remove('show');
    }
    
    // Méthodes d'intégration avec le jeu principal
    setCurrentBall(ball) {
        this.currentBall = ball;
        this.updateNextPreview();
    }
    
    updateNextPreview() {
        if (!this.currentBall || !this.nextPreview) return;
        
        this.nextPreview.textContent = this.currentBall.emoji;
        this.nextPreview.style.background = this.currentBall.color;
    }
    
    onGameOver(finalScore) {
        this.gameOver = true;
        this.dropBtn.disabled = true;
        
        if (finalScore > this.bestScore) {
            this.bestScore = finalScore;
            localStorage.setItem('suikaBoobsBest', finalScore.toString());
            this.updateUI();
        }
    }
    
    resetGame() {
        this.score = 0;
        this.gameOver = false;
        this.isDropping = false;
        this.dropBtn.disabled = false;
        this.dropBtn.classList.remove('dropping');
        this.updateUI();
    }
    
    // Synchroniser avec le jeu principal
    syncWithMainGame() {
        if (window.suikaGame) {
            this.score = window.suikaGame.score;
            this.bestScore = window.suikaGame.bestScore;
            this.gameOver = window.suikaGame.gameOver;
            this.canDrop = window.suikaGame.canDrop;
            this.updateUI();
            
            // Mettre à jour l'état du bouton
            this.dropBtn.disabled = !this.canDrop || this.gameOver;
        }
    }
    
    // Mettre à jour l'état du bouton en temps réel
    updateButtonState() {
        if (window.suikaGame) {
            this.canDrop = window.suikaGame.canDrop;
            this.gameOver = window.suikaGame.gameOver;
            if (this.dropBtn) {
                this.dropBtn.disabled = !this.canDrop || this.gameOver;
            }
        }
    }
    
    // Forcer la synchronisation avec le jeu principal
    forceSyncWithGame() {
        if (window.suikaGame) {
            console.log('Synchronisation forcée avec le jeu principal');
            this.canDrop = window.suikaGame.canDrop;
            this.gameOver = window.suikaGame.gameOver;
            this.score = window.suikaGame.score;
            this.bestScore = window.suikaGame.bestScore;
            this.updateUI();
            this.updateButtonState();
        }
    }
    
    // Tester la connexion avec le jeu principal
    testConnection() {
        console.log('Test de connexion avec le jeu principal:', {
            gameExists: !!window.suikaGame,
            gameCanDrop: window.suikaGame?.canDrop,
            gameCurrentBall: !!window.suikaGame?.currentBall,
            gameScore: window.suikaGame?.score,
            gameGameOver: window.suikaGame?.gameOver
        });
        
        if (window.suikaGame) {
            console.log('Jeu principal trouvé, test de drop direct');
            // Test direct du drop
            if (window.suikaGame.currentBall) {
                console.log('Balle trouvée, test de drop');
                Body.setStatic(window.suikaGame.currentBall, false);
                window.suikaGame.canDrop = false;
                window.suikaGame.currentBall = null;
            }
        }
    }
    
    // Tester le positionnement
    testPositioning() {
        console.log('Test de positionnement');
        this.currentPosition = 0.5; // Position centrale
        this.updateFruitPosition();
        
        setTimeout(() => {
            this.currentPosition = 0.2; // Position gauche
            this.updateFruitPosition();
        }, 1000);
        
        setTimeout(() => {
            this.currentPosition = 0.8; // Position droite
            this.updateFruitPosition();
        }, 2000);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, vérification mobile:', window.innerWidth <= 768);
    
    // Vérifier si on est sur mobile
    if (window.innerWidth <= 768) {
        console.log('Mode mobile détecté, initialisation de l\'interface mobile');
        
        // Attendre que le jeu principal soit initialisé
        const waitForMainGame = () => {
            if (window.suikaGame) {
                console.log('Jeu principal trouvé, initialisation de l\'interface mobile');
                window.suikaMobileGame = new SuikaMobileGame();
            } else {
                console.log('Attente du jeu principal...');
                setTimeout(waitForMainGame, 100);
            }
        };
        
        waitForMainGame();
    } else {
        console.log('Mode desktop détecté, interface mobile non initialisée');
    }
});

// Fonctions globales pour l'intégration
window.SuikaMobileGame = SuikaMobileGame;

// Fonction de test globale
window.testMobileConnection = function() {
    if (window.suikaMobileGame) {
        window.suikaMobileGame.testConnection();
    } else {
        console.log('Interface mobile non initialisée');
    }
};

// Fonction de test de positionnement
window.testMobilePositioning = function() {
    if (window.suikaMobileGame) {
        window.suikaMobileGame.testPositioning();
    } else {
        console.log('Interface mobile non initialisée');
    }
};

// Export pour utilisation dans le jeu principal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuikaMobileGame;
}
