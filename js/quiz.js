




'use strict';

class BioQuiz {
  constructor() {
    this.currentSystem = null;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;

    this.modal = document.getElementById('quiz-modal');
    this.quizContent = document.getElementById('quiz-content');
    this.closeBtn = document.getElementById('close-quiz-btn');
    this.startQuizBtn = document.getElementById('start-quiz-btn');

    this.bindEvents();
    this.close();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    if (this.startQuizBtn) {
      this.startQuizBtn.addEventListener('click', () => {
        this.start(window._activeBioSystem || 'skeletal');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  start(systemKey) {
    const system = BioSystemsData.systems[systemKey];
    if (!system) return;

    this.currentSystem = systemKey;
    this.questions = BioUtils.shuffleArray([...system.quiz]);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;

    this.open();
    this.renderQuestion();
  }

  open() {
    if (this.modal) {
      this.modal.classList.add('visible', 'active', 'open', 'show');
      this.modal.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (this.modal) {
      this.modal.classList.remove('visible', 'active', 'open', 'show');
      this.modal.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  renderQuestion() {
    const { questions, currentIndex, score } = this;

    if (currentIndex >= questions.length) {
      this.renderScore();
      return;
    }

    const q = questions[currentIndex];
    const total = questions.length;
    const progress = ((currentIndex) / total) * 100;

    this.answered = false;

    this.quizContent.innerHTML = `
      <div class="quiz-progress">
        <div class="quiz-progress-bar-container">
          <div class="quiz-progress-bar" style="width: ${progress}%"></div>
        </div>
        <span class="quiz-progress-text">${currentIndex + 1} / ${total}</span>
      </div>

      <div class="quiz-question">
        <p class="quiz-question-text">${q.question}</p>
        <div class="quiz-options" id="quiz-options">
          ${q.options.map((opt, i) => `
            <button
              class="quiz-option"
              id="quiz-opt-${i}"
              data-index="${i}"
              aria-label="Answer option: ${opt}"
            >
              <span class="quiz-option-letter">${String.fromCharCode(65 + i)}.</span>
              ${opt}
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback" style="display:none;"></div>
      </div>

      <div class="quiz-nav" id="quiz-nav" style="display:none;">
        ${currentIndex < total - 1
          ? `<button class="quiz-nav-btn primary" id="quiz-next-btn">Next Question →</button>`
          : `<button class="quiz-nav-btn primary" id="quiz-finish-btn">See Results 🎉</button>`
        }
      </div>
    `;

    
    const options = this.quizContent.querySelectorAll('.quiz-option');
    options.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.answered) return;
        this.answered = true;
        this.handleAnswer(parseInt(btn.dataset.index, 10), q);
      });
    });
  }

  handleAnswer(selectedIndex, question) {
    const correct = question.correct;
    const isCorrect = selectedIndex === correct;

    if (isCorrect) this.score++;

    
    const options = this.quizContent.querySelectorAll('.quiz-option');
    options.forEach((btn, i) => {
      btn.disabled = true;
      btn.style.cursor = 'default';
      if (i === correct) {
        btn.classList.add('correct');
      } else if (i === selectedIndex && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    
    const feedback = document.getElementById('quiz-feedback');
    if (feedback) {
      feedback.style.display = 'block';
      feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
      feedback.innerHTML = `
        <strong>${isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong>
        ${question.explanation}
      `;
    }

    
    const nav = document.getElementById('quiz-nav');
    if (nav) nav.style.display = 'flex';

    
    const nextBtn = document.getElementById('quiz-next-btn');
    const finishBtn = document.getElementById('quiz-finish-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentIndex++;
        this.renderQuestion();
      });
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.currentIndex++;
        this.renderScore();
      });
    }
  }

  renderScore() {
    const { score, questions } = this;
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const system = BioSystemsData.systems[this.currentSystem];

    
    if (window.bioSchool) {
      window.bioSchool.recordQuizResult(this.currentSystem, score, total);
    }

    let grade, gradeColor, emoji;
    if (percentage >= 90) { grade = 'Excellent!'; gradeColor = '#00ffa3'; emoji = '🏆'; }
    else if (percentage >= 70) { grade = 'Great Job!'; gradeColor = '#00d4ff'; emoji = '⭐'; }
    else if (percentage >= 50) { grade = 'Good Effort!'; gradeColor = '#ffd700'; emoji = '📚'; }
    else { grade = 'Keep Learning!'; gradeColor = '#ff8c42'; emoji = '💪'; }

    this.quizContent.innerHTML = `
      <div class="quiz-score">
        <div class="quiz-score-number" style="background: linear-gradient(135deg, ${gradeColor}, #7b2fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          ${percentage}%
        </div>
        <div class="quiz-score-label">
          ${emoji} ${grade} — ${score} / ${total} correct
        </div>

        <div style="
          margin: 1.5rem 0;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.7;
        ">
          You completed the <strong style="color:var(--text-primary)">${system?.name || ''}</strong> quiz.
          ${percentage < 70
            ? 'Review the system overview and key structures to improve your score.'
            : 'You have a strong understanding of this system!'
          }
        </div>

        <div class="quiz-nav" style="justify-content: center; gap: 0.75rem; margin-top: 0;">
          <button class="quiz-nav-btn secondary" id="quiz-retry-btn">Try Again</button>
          <button class="quiz-nav-btn primary" id="quiz-done-btn">Done</button>
        </div>
      </div>
    `;

    document.getElementById('quiz-retry-btn')?.addEventListener('click', () => {
      this.start(this.currentSystem);
    });

    document.getElementById('quiz-done-btn')?.addEventListener('click', () => {
      this.close();
    });
  }
}

window.BioQuiz = BioQuiz;
