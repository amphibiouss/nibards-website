// Suika Boobs - Version finale stable
// Cache-busting pour forcer le rechargement des ressources

// Vider le cache du localStorage si nécessaire
if (localStorage.getItem('cacheVersion') !== 'v1.0') {
    localStorage.clear();
    localStorage.setItem('cacheVersion', 'v1.0');
}

// Forcer le rechargement des scripts
const script = document.currentScript;
if (script) {
    const timestamp = Date.now();
    const newSrc = script.src.split('?')[0] + `?v=${timestamp}`;
    if (script.src !== newSrc) {
        script.src = newSrc;
    }
}

const { Engine, Render, World, Bodies, Body, Events, Runner } = Matter;

const BOOB_TYPES = [
    { size: 15, color: '#FFB3BA', points: 1, emoji: '🍒' },
    { size: 22, color: '#FFDFBA', points: 3, emoji: '🍑' },
    { size: 28, color: '#FFFFBA', points: 6, emoji: '🍋' },
    { size: 35, color: '#BAFFC9', points: 10, emoji: '🍈' },
    { size: 42, color: '#BAE1FF', points: 15, emoji: '🫐' },
    { size: 50, color: '#FFB3FF', points: 21, emoji: '🍇' },
    { size: 58, color: '#FF9999', points: 28, emoji: '🍓' },
    { size: 67, color: '#FFD700', points: 36, emoji: '🍊' },
    { size: 76, color: '#FF69B4', points: 45, emoji: '🍉' },
    { size: 86, color: '#9370DB', points: 55, emoji: '🍆' },
    { size: 96, color: '#FF1493', points: 100, emoji: '👑' }
];

class SuikaBoobsGame {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.canvas = document.getElementById(this.isMobile ? 'gameCanvas' : 'gameCanvasDesktop');
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('suikaBoobsBest')) || 0;
        this.gameOver = false;
        this.currentBall = null;
        this.canDrop = true;
        
        this.width = this.isMobile ? 300 : 350;
        this.height = this.isMobile ? 400 : 500;
        
        // Vérifier si le canvas est disponible
        if (!this.canvas) {
            console.error('Canvas non trouvé, rechargement de la page...');
            this.forceReload();
            return;
        }
        
        this.init();
    }
    
    // Fonction pour forcer le rechargement de la page
    forceReload() {
        const timestamp = Date.now();
        window.location.href = window.location.href.split('?')[0] + `?v=${timestamp}`;
    }
    
    setupMobileIntegration() {
        // Connecter les événements mobile
        if (this.mobileGame) {
            console.log('Intégration mobile configurée');
            
            // Connecter les événements
            this.mobileGame.dropBtn.addEventListener('click', () => {
                console.log('Bouton drop cliqué');
                this.mobileDrop();
            });
        }
    }
    
    mobileDrop() {
        if (!this.canDrop || this.gameOver || !this.currentBall) return;
        
        console.log('Mobile drop déclenché');
        
        // Utiliser la position du gyroscope
        const x = this.mobileGame.currentPosition * this.width;
        const y = 50;
        
        console.log(`Position de drop: x=${x}, y=${y}`);
        
        // Rendre la balle dynamique
        Body.setStatic(this.currentBall, false);
        
        // Positionner la balle
        Body.setPosition(this.currentBall, { x, y });
        
        this.canDrop = false;
        this.currentBall = null;
        
        // Générer le prochain ball
        setTimeout(() => {
            this.spawnBall();
            this.canDrop = true;
        }, 1000);
    }

    init() {
        // Créer le moteur
        this.engine = Engine.create();
        this.world = this.engine.world;
        this.world.gravity.y = 1;

        // Créer le rendu
        this.render = Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width: this.width,
                height: this.height,
                wireframes: false,
                background: '#2C1810'
            }
        });
        
        // Intégration mobile
        if (this.isMobile && window.suikaMobileGame) {
            this.mobileGame = window.suikaMobileGame;
            this.setupMobileIntegration();
        }

        // Créer les murs
        const walls = [
            Bodies.rectangle(this.width / 2, this.height, this.width, 20, {
                isStatic: true,
                label: 'ground',
                render: { fillStyle: '#8B6F47' }
            }),
            Bodies.rectangle(0, this.height / 2, 20, this.height, {
                isStatic: true,
                label: 'wall',
                render: { fillStyle: '#8B6F47' }
            }),
            Bodies.rectangle(this.width, this.height / 2, 20, this.height, {
                isStatic: true,
                label: 'wall',
                render: { fillStyle: '#8B6F47' }
            })
        ];
        World.add(this.world, walls);

        // Démarrer le rendu
        Render.run(this.render);
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);

        // Gérer les collisions
        Events.on(this.engine, 'collisionStart', (e) => this.handleCollision(e));

        // Rendu custom
        Events.on(this.render, 'afterRender', () => this.drawEmojis());

        // Initialiser
        this.nextType = Math.floor(Math.random() * 5);
        this.updateUI();
        this.spawnBall();
        
        // Event listeners - seulement sur desktop
        if (!this.isMobile) {
            this.canvas.addEventListener('click', () => this.drop());
            this.canvas.addEventListener('mousemove', (e) => this.move(e));
        } else {
            // Sur mobile, désactiver les événements de clic/touch
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // Ne rien faire - laisser l'interface mobile gérer
            });
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                // Ne rien faire - laisser l'interface mobile gérer
            });
        }

        // Ligne de danger visible - plus haute pour être plus permissif
        this.dangerLine = 60;
        
        // Variables pour la détection de game over
        this.gameOverWarningTime = 0;
        this.gameOverDelay = 3000; // 3 secondes avant game over
        
        // Game over check toutes les secondes
        this.gameOverInterval = setInterval(() => this.checkGameOver(), 1000);
    }

    spawnBall() {
        if (this.gameOver) return;

        const type = this.nextType;
        const ball = BOOB_TYPES[type];

        this.currentBall = Bodies.circle(this.width / 2, 30, ball.size, {
            isStatic: true,
            restitution: 0.2,
            friction: 0.3,
            density: 0.001,
            label: 'ball',
            ballType: type,
            render: { fillStyle: ball.color }
        });

        World.add(this.world, this.currentBall);
        this.nextType = Math.floor(Math.random() * 5);
        this.updateUI();
        
        // Mettre à jour l'interface mobile
        if (this.isMobile && this.mobileGame) {
            this.mobileGame.setCurrentBall(BOOB_TYPES[type]);
        }
    }

    move(e) {
        // Ne fonctionne que sur desktop
        if (this.isMobile) return;
        
        if (!this.currentBall || !this.currentBall.isStatic) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ball = BOOB_TYPES[this.currentBall.ballType];
        const clampedX = Math.max(ball.size + 10, Math.min(this.width - ball.size - 10, x));
        
        Body.setPosition(this.currentBall, { x: clampedX, y: 30 });
    }

    drop() {
        // Ne fonctionne que sur desktop
        if (this.isMobile) return;
        
        if (!this.canDrop || !this.currentBall || this.gameOver) return;

        this.canDrop = false;
        Body.setStatic(this.currentBall, false);
        this.currentBall = null;

        setTimeout(() => {
            this.spawnBall();
            this.canDrop = true;
        }, 400);
    }

    handleCollision(event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            
            if (bodyA.label !== 'ball' || bodyB.label !== 'ball') return;
            if (bodyA.ballType !== bodyB.ballType) return;
            if (bodyA.ballType >= BOOB_TYPES.length - 1) return;
            if (bodyA.merged || bodyB.merged) return;

            bodyA.merged = true;
            bodyB.merged = true;

            setTimeout(() => this.merge(bodyA, bodyB), 50);
        });
    }

    merge(a, b) {
        if (!this.world.bodies.includes(a) || !this.world.bodies.includes(b)) return;

        const x = (a.position.x + b.position.x) / 2;
        const y = (a.position.y + b.position.y) / 2;
        const newType = a.ballType + 1;
        const ball = BOOB_TYPES[newType];

        World.remove(this.world, [a, b]);

        const newBall = Bodies.circle(x, y, ball.size, {
            restitution: 0.2,
            friction: 0.3,
            density: 0.001,
            label: 'ball',
            ballType: newType,
            render: { fillStyle: ball.color }
        });

        World.add(this.world, newBall);
        
        this.score += ball.points;
        this.updateUI();
        
        // Mettre à jour l'interface mobile avec animation
        if (this.isMobile && this.mobileGame) {
            this.mobileGame.updateScore(ball.points);
        }
    }

    drawEmojis() {
        const ctx = this.render.context;
        
        // Dessiner la ligne de danger avec animation si warning
        ctx.save();
        if (this.gameOverWarningTime > 0) {
            // Ligne rouge clignotante si danger
            const elapsed = Date.now() - this.gameOverWarningTime;
            const progress = elapsed / this.gameOverDelay;
            const pulse = Math.sin(elapsed / 200) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(255, 107, 107, ${0.5 + pulse * 0.5})`;
            ctx.lineWidth = 3;
        } else {
            // Ligne normale
            ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
            ctx.lineWidth = 2;
        }
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(10, this.dangerLine);
        ctx.lineTo(this.width - 10, this.dangerLine);
        ctx.stroke();
        ctx.restore();
        
        // Dessiner les emojis
        this.world.bodies.forEach(body => {
            if (body.label === 'ball' && body.ballType !== undefined) {
                const ball = BOOB_TYPES[body.ballType];
                ctx.save();
                ctx.translate(body.position.x, body.position.y);
                ctx.rotate(body.angle);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `${ball.size * 1.3}px Arial`;
                ctx.fillText(ball.emoji, 0, 0);
                ctx.restore();
            }
        });
    }

    updateUI() {
        const scoreElement = this.isMobile ? 'score' : 'scoreDesktop';
        const bestScoreElement = this.isMobile ? 'bestScore' : 'bestScoreDesktop';
        
        document.getElementById(scoreElement).textContent = this.score;
        document.getElementById(bestScoreElement).textContent = this.bestScore;
        
        // Mettre à jour l'interface mobile
        if (this.isMobile && this.mobileGame) {
            this.mobileGame.updateScore(0); // Mise à jour sans ajout de points
        }
        
        const next = BOOB_TYPES[this.nextType];
        const preview = document.getElementById('nextPreview');
        preview.style.width = (next.size * 2) + 'px';
        preview.style.height = (next.size * 2) + 'px';
        preview.style.backgroundColor = next.color;
        preview.innerHTML = `<span style="font-size: ${next.size * 1.2}px">${next.emoji}</span>`;

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('suikaBoobsBest', this.bestScore);
        }
    }

    checkGameOver() {
        if (this.gameOver) return;
        
        // Chercher des balles qui sont vraiment coincées au-dessus de la ligne
        let hasStuckBall = false;
        
        for (let body of this.world.bodies) {
            if (body.label === 'ball' && !body.isStatic) {
                const topOfBall = body.position.y - body.circleRadius;
                
                // Vérifier si la balle est au-dessus de la ligne
                if (topOfBall < this.dangerLine) {
                    // La balle doit être VRAIMENT immobile
                    const isReallyStuck = 
                        Math.abs(body.velocity.y) < 0.2 && 
                        Math.abs(body.velocity.x) < 0.2 &&
                        Math.abs(body.angularVelocity) < 0.01;
                    
                    if (isReallyStuck) {
                        hasStuckBall = true;
                        break;
                    }
                }
            }
        }
        
        // Système de délai : la balle doit rester coincée pendant 3 secondes
        if (hasStuckBall) {
            if (this.gameOverWarningTime === 0) {
                // Première détection, démarrer le compteur
                this.gameOverWarningTime = Date.now();
            } else {
                // Vérifier si le délai est écoulé
                const elapsed = Date.now() - this.gameOverWarningTime;
                if (elapsed >= this.gameOverDelay) {
                    this.endGame();
                }
            }
        } else {
            // Réinitialiser le compteur si plus de balle coincée
            this.gameOverWarningTime = 0;
        }
    }

    endGame() {
        this.gameOver = true;
        clearInterval(this.gameOverInterval);
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverOverlay').classList.add('active');
        
        // Notifier l'interface mobile
        if (this.isMobile && this.mobileGame) {
            this.mobileGame.onGameOver(this.score);
        }
    }

    restart() {
        World.clear(this.world);
        Engine.clear(this.engine);
        Render.stop(this.render);
        Runner.stop(this.runner);
        clearInterval(this.gameOverInterval);

        this.score = 0;
        this.gameOver = false;
        this.currentBall = null;
        this.canDrop = true;
        this.gameOverWarningTime = 0;
        
        document.getElementById('gameOverOverlay').classList.remove('active');
        
        // Réinitialiser l'interface mobile
        if (this.isMobile && this.mobileGame) {
            this.mobileGame.resetGame();
        }
        
        this.init();
    }
}

// Fonctions globales pour le cache et le debug
window.clearGameCache = function() {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Cache vidé, rechargement de la page...');
    window.location.reload();
};

window.forceReload = function() {
    const timestamp = Date.now();
    window.location.href = window.location.href.split('?')[0] + `?v=${timestamp}`;
};

window.resetGame = function() {
    if (game) {
        game.reset();
    }
};

// Initialisation
let game;
window.addEventListener('load', () => {
    try {
        game = new SuikaBoobsGame();
        window.suikaGame = game; // Exposer l'instance globalement
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du jeu:', error);
        console.log('Tentative de rechargement...');
        window.forceReload();
    }
    
    // Evolution display - version minimaliste
    const display = document.getElementById('evolutionDisplay');
    display.innerHTML = '';
    
    // Créer une liste simple et épurée
    BOOB_TYPES.forEach((type, i) => {
        const item = document.createElement('div');
        item.className = 'evolution-item';
        item.innerHTML = `
            <div class="evolution-emoji">${type.emoji}</div>
            <div class="evolution-info">
                <div class="evolution-level">${i + 1}</div>
                <div class="evolution-points">${type.points}pts</div>
            </div>
        `;
        display.appendChild(item);
    });

    // Boutons
    document.getElementById('replayBtn').onclick = () => game.restart();
    document.getElementById('infoBtn').onclick = () => {
        document.getElementById('infoModal').classList.add('active');
    };
    document.getElementById('infoClose').onclick = () => {
        document.getElementById('infoModal').classList.remove('active');
    };
    document.getElementById('startGameBtn').onclick = () => {
        document.getElementById('infoModal').classList.remove('active');
    };
});
