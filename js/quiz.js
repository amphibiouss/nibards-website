class QuizGame {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.totalQuestions = 8;
        this.gameState = 'loading'; // loading, playing, revealing, finished
        this.selectedAnswer = null;
        this.correctAnswer = null;
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadQuestions();
            this.setupEventListeners();
            this.startGame();
        } catch (error) {
            console.error('Erreur lors du chargement du quiz:', error);
            this.showError();
        }
    }
    
    async loadQuestions() {
        const response = await fetch('quiz.json');
        const allQuestions = await response.json();
        
        // Mélanger et sélectionner 8 questions aléatoires
        this.questions = this.shuffleArray(allQuestions).slice(0, this.totalQuestions);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    setupEventListeners() {
        // Bouton info
        const infoBtn = document.getElementById('infoBtn');
        if (infoBtn) {
            infoBtn.addEventListener('click', () => this.showInstructions());
        }
        
        // Bouton suivant
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        // Bouton recommencer
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.currentQuestion = 0;
        this.score = 0;
        this.render();
    }
    
    render() {
        const container = document.getElementById('quizContainer');
        if (!container) return;
        
        if (this.gameState === 'loading') {
            container.innerHTML = this.renderLoading();
        } else if (this.gameState === 'playing') {
            container.innerHTML = this.renderQuestion();
        } else if (this.gameState === 'revealing') {
            container.innerHTML = this.renderReveal();
        } else if (this.gameState === 'finished') {
            container.innerHTML = this.renderResults();
        }
        
        this.setupEventListeners();
        
        // Ajouter les listeners pour les réponses si on est en mode playing
        if (this.gameState === 'playing') {
            setTimeout(() => {
                this.addAnswerListeners();
            }, 100);
        }
    }
    
    renderLoading() {
        return `
            <div class="quiz-loading">
                <div class="loading-spinner"></div>
                <h2>Chargement du quiz...</h2>
                <p>Préparation de vos questions anatomiques</p>
            </div>
        `;
    }
    
    renderQuestion() {
        const question = this.questions[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
        
        // Mélanger les réponses : nom_en_francais + les 3 autres_choix
        const allAnswers = [question.nom_en_francais, ...question.autres_choix];
        const shuffledAnswers = this.shuffleArray(allAnswers);
        
        return `
            <div class="quiz-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${this.currentQuestion + 1}/${this.totalQuestions}</span>
            </div>
            
            <div class="quiz-score">
                <div class="score-item">
                    <div class="score-value">${this.score}</div>
                    <div class="score-label">Score</div>
                </div>
                <div class="score-item">
                    <div class="score-value">${Math.round((this.score / (this.currentQuestion + 1)) * 100)}%</div>
                    <div class="score-label">Précision</div>
                </div>
            </div>
            
            <div class="quiz-question">
                <div class="question-image">
                    <img src="${question.image_croppee}" alt="Image du quiz" loading="lazy">
                </div>
                <h2 class="question-text">À qui appartient ce téton ?</h2>
            </div>
            
            <div class="quiz-answers">
                ${shuffledAnswers.map((answer, index) => `
                    <div class="answer-option" data-answer="${answer}" data-index="${index}">
                        <div class="answer-text">${answer}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderReveal() {
        const question = this.questions[this.currentQuestion];
        const isCorrect = this.selectedAnswer === question.nom_en_francais;
        
        if (isCorrect) {
            this.score++;
        }
        
        return `
            <div class="quiz-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((this.currentQuestion + 1) / this.totalQuestions) * 100}%"></div>
                </div>
                <span class="progress-text">${this.currentQuestion + 1}/${this.totalQuestions}</span>
            </div>
            
            <div class="quiz-score">
                <div class="score-item">
                    <div class="score-value">${this.score}</div>
                    <div class="score-label">Score</div>
                </div>
                <div class="score-item">
                    <div class="score-value">${Math.round((this.score / (this.currentQuestion + 1)) * 100)}%</div>
                    <div class="score-label">Précision</div>
                </div>
            </div>
            
            <div class="quiz-reveal show">
                <div class="reveal-image">
                    <img src="${question.image_complete}" alt="Image complète" loading="lazy">
                </div>
                <h2 class="reveal-title">${question.nom_en_francais}</h2>
                <p class="reveal-context">${question.contexte}</p>
                
                <div class="quiz-actions">
                    <button class="btn btn-primary" id="nextBtn">
                        ${this.currentQuestion < this.totalQuestions - 1 ? 'Question suivante' : 'Voir les résultats'}
                    </button>
                </div>
            </div>
        `;
    }
    
    renderResults() {
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        let message = '';
        
        if (percentage === 100) {
            message = 'Parfait ! Vous êtes un expert en anatomie artistique ! 🎉';
        } else if (percentage >= 80) {
            message = 'Excellent ! Vous connaissez bien vos tétons ! 👏';
        } else if (percentage >= 60) {
            message = 'Pas mal ! Quelques révisions et vous serez au top ! 👍';
        } else {
            message = 'Il y a encore du travail, mais c\'est un bon début ! 💪';
        }
        
        return `
            <div class="quiz-results">
                <h2 class="results-title">Quiz terminé !</h2>
                <div class="results-score">${this.score}/${this.totalQuestions}</div>
                <div class="results-message">${message}</div>
                
                <div class="quiz-actions">
                    <button class="btn btn-primary" id="restartBtn">Recommencer</button>
                    <a href="minijeux.html" class="btn btn-secondary">Retour aux jeux</a>
                </div>
            </div>
        `;
    }
    
    showError() {
        const container = document.getElementById('quizContainer');
        if (container) {
            container.innerHTML = `
                <div class="quiz-loading">
                    <h2>Erreur de chargement</h2>
                    <p>Impossible de charger les questions du quiz.</p>
                    <a href="minijeux.html" class="btn btn-primary">Retour aux jeux</a>
                </div>
            `;
        }
    }
    
    showInstructions() {
        alert(`Comment jouer à "À qui le téton ?" :

🎯 Objectif : Deviner à qui appartient le téton affiché

📸 Image : Une photo croppée d'un téton vous est présentée

🎲 Réponses : 4 choix possibles, mélangés à chaque question

✅ Score : +1 point par bonne réponse

📊 Total : 8 questions aléatoires

Bonne chance ! 🍀`);
    }
    
    selectAnswer(answer) {
        if (this.gameState !== 'playing') return;
        
        this.selectedAnswer = answer;
        this.gameState = 'revealing';
        
        // Marquer les réponses
        const options = document.querySelectorAll('.answer-option');
        options.forEach(option => {
            const answerText = option.dataset.answer;
            option.classList.add('disabled');
            
            if (answerText === this.questions[this.currentQuestion].nom_en_francais) {
                option.classList.add('correct');
            } else if (answerText === answer) {
                option.classList.add('incorrect');
            }
        });
        
        // Attendre un peu avant de révéler
        setTimeout(() => {
            this.render();
        }, 1500);
    }
    
    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            this.gameState = 'playing';
            this.render();
        } else {
            this.gameState = 'finished';
            this.render();
        }
    }
    
    restartGame() {
        this.startGame();
    }
    
    // Méthode pour gérer les clics sur les réponses
    handleAnswerClick(event) {
        const option = event.currentTarget;
        const answer = option.dataset.answer;
        
        if (this.gameState === 'playing') {
            this.selectAnswer(answer);
        }
    }
    
    // Méthode pour ajouter les événements aux réponses
    addAnswerListeners() {
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach(option => {
            option.addEventListener('click', (event) => {
                this.handleAnswerClick(event);
            });
        });
    }
}

// Initialisation du quiz quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    // Remplacer le contenu de la page par le quiz
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div id="quizContainer"></div>
        `;
        
        // Initialiser le quiz
        quizGame = new QuizGame();
    }
});

// Initialiser le quiz global
let quizGame = null;
