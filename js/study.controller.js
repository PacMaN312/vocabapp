/**
 * Study page — full MVC
 *
 * Model      : word list, progress state, quiz logic
 * View       : renders word card, quiz options, results
 * Controller : wires DOM events to Model, updates View
 */

// ─────────────────────────────────────────────────────────────────────────────
// MODEL
// ─────────────────────────────────────────────────────────────────────────────
class VocabModel {
  constructor() {
    this.PROGRESS_KEY = 'vocabapp_progress';

    this.words = [
      { id: 1, word: 'Apple',       translation: 'Яблуко',    example: 'I eat an apple every morning.' },
      { id: 2, word: 'Book',        translation: 'Книга',     example: 'She reads a book before bed.' },
      { id: 3, word: 'Car',         translation: 'Автомобіль',example: 'He drives a red car to work.' },
      { id: 4, word: 'Dog',         translation: 'Собака',    example: 'The dog barked at the stranger.' },
      { id: 5, word: 'Earth',       translation: 'Земля',     example: 'The Earth orbits the Sun.' },
      { id: 6, word: 'Flower',      translation: 'Квітка',    example: 'She gave me a beautiful flower.' },
      { id: 7, word: 'Garden',      translation: 'Сад',       example: 'We planted tomatoes in the garden.' },
      { id: 8, word: 'House',       translation: 'Будинок',   example: 'They built a new house last year.' },
      { id: 9, word: 'Island',      translation: 'Острів',    example: 'We spent a week on a tropical island.' },
      { id: 10, word: 'Journey',    translation: 'Подорож',   example: 'The journey took three days.' },
    ];

    this.currentIndex = 0;
    this.knownIds = new Set(this._loadProgress().knownIds || []);

    // quiz state
    this.quiz = {
      questionIndex: 0,
      correctCount: 0,
      answered: false,
      selectedOption: null,
      questions: [],
    };
  }

  // ── persistence ────────────────────────────────────────────────────────────
  _loadProgress() {
    return JSON.parse(localStorage.getItem(this.PROGRESS_KEY) || '{}');
  }

  _saveProgress() {
    localStorage.setItem(
      this.PROGRESS_KEY,
      JSON.stringify({ knownIds: [...this.knownIds] }),
    );
  }

  // ── study mode ─────────────────────────────────────────────────────────────
  getCurrentWord() {
    return this.words[this.currentIndex];
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.words.length;
    return this.getCurrentWord();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.words.length) % this.words.length;
    return this.getCurrentWord();
  }

  markKnown(id) {
    this.knownIds.add(id);
    this._saveProgress();
  }

  markUnknown(id) {
    this.knownIds.delete(id);
    this._saveProgress();
  }

  isKnown(id) {
    return this.knownIds.has(id);
  }

  getProgress() {
    return {
      total: this.words.length,
      known: this.knownIds.size,
      current: this.currentIndex + 1,
    };
  }

  // ── quiz mode ──────────────────────────────────────────────────────────────
  _shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  _buildQuestion(word) {
    const wrongPool = this.words
      .filter((w) => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.translation);

    const options = this._shuffle([word.translation, ...wrongPool]);

    return {
      word: word.word,
      correctAnswer: word.translation,
      options,
    };
  }

  startQuiz() {
    const shuffled = this._shuffle(this.words);
    this.quiz = {
      questionIndex: 0,
      correctCount: 0,
      answered: false,
      selectedOption: null,
      questions: shuffled.map((w) => this._buildQuestion(w)),
    };
    return this.getCurrentQuestion();
  }

  getCurrentQuestion() {
    return this.quiz.questions[this.quiz.questionIndex] || null;
  }

  answerQuestion(selectedOption) {
    if (this.quiz.answered) return null;

    const q = this.getCurrentQuestion();
    this.quiz.answered = true;
    this.quiz.selectedOption = selectedOption;

    const correct = selectedOption === q.correctAnswer;
    if (correct) this.quiz.correctCount += 1;

    return {
      correct,
      correctAnswer: q.correctAnswer,
      selectedOption,
    };
  }

  nextQuestion() {
    this.quiz.questionIndex += 1;
    this.quiz.answered = false;
    this.quiz.selectedOption = null;
    return this.getCurrentQuestion();
  }

  getQuizResult() {
    return {
      correct: this.quiz.correctCount,
      total: this.quiz.questions.length,
    };
  }

  isQuizFinished() {
    return this.quiz.questionIndex >= this.quiz.questions.length;
  }

  getQuizProgress() {
    return {
      current: this.quiz.questionIndex + 1,
      total: this.quiz.questions.length,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW
// ─────────────────────────────────────────────────────────────────────────────
const VocabView = {
  // ── panels ─────────────────────────────────────────────────────────────────
  studyPanel: document.getElementById('study-panel'),
  quizPanel: document.getElementById('quiz-panel'),
  resultPanel: document.getElementById('result-panel'),

  // ── study elements ──────────────────────────────────────────────────────────
  wordEl: document.getElementById('word-main'),
  translationEl: document.getElementById('word-translation'),
  exampleEl: document.getElementById('word-example'),
  knownBtn: document.getElementById('btn-known'),
  unknownBtn: document.getElementById('btn-unknown'),
  studyProgressFill: document.getElementById('study-progress-fill'),
  studyProgressText: document.getElementById('study-progress-text'),
  knownCountEl: document.getElementById('known-count'),

  // ── quiz elements ───────────────────────────────────────────────────────────
  quizWordEl: document.getElementById('quiz-word'),
  quizOptionsEl: document.getElementById('quiz-options'),
  quizProgressFill: document.getElementById('quiz-progress-fill'),
  quizProgressText: document.getElementById('quiz-progress-text'),
  checkBtn: document.getElementById('btn-check'),
  nextQBtn: document.getElementById('btn-next-q'),

  // ── result elements ─────────────────────────────────────────────────────────
  resultCorrect: document.getElementById('result-correct'),
  resultTotal: document.getElementById('result-total'),
  resultMsg: document.getElementById('result-msg'),

  // ── tab buttons ─────────────────────────────────────────────────────────────
  tabStudy: document.getElementById('tab-study'),
  tabQuiz: document.getElementById('tab-quiz'),

  // ── methods ─────────────────────────────────────────────────────────────────
  showPanel(name) {
    this.studyPanel.style.display = name === 'study' ? 'block' : 'none';
    this.quizPanel.style.display  = name === 'quiz'  ? 'block' : 'none';
    this.resultPanel.style.display = name === 'result' ? 'block' : 'none';

    this.tabStudy.classList.toggle('active', name === 'study');
    this.tabQuiz.classList.toggle('active',  name === 'quiz' || name === 'result');
  },

  renderWord(word, isKnown) {
    this.wordEl.textContent = word.word;
    this.translationEl.textContent = `${word.translation}`;
    this.exampleEl.textContent = `"${word.example}"`;

    this.knownBtn.style.opacity   = isKnown ? '0.4' : '1';
    this.unknownBtn.style.opacity = !isKnown ? '0.4' : '1';
  },

  renderStudyProgress(progress) {
    const pct = Math.round((progress.current / progress.total) * 100);
    this.studyProgressFill.style.width = `${pct}%`;
    this.studyProgressText.textContent = `Слово ${progress.current} з ${progress.total}`;
    this.knownCountEl.textContent = progress.known;
  },

  renderQuestion(question, questionNum, totalNum) {
    this.quizWordEl.textContent = question.word;
    this.quizOptionsEl.innerHTML = '';

    question.options.forEach((opt) => {
      const div = document.createElement('div');
      div.className = 'quiz-option';
      div.dataset.option = opt;
      div.innerHTML = `<div class="quiz-dot"></div><span>${opt}</span>`;
      this.quizOptionsEl.appendChild(div);
    });

    const pct = Math.round((questionNum / totalNum) * 100);
    this.quizProgressFill.style.width = `${pct}%`;
    this.quizProgressText.textContent = `Питання ${questionNum} з ${totalNum}`;

    this.checkBtn.style.display = 'block';
    this.nextQBtn.style.display = 'none';
    this.checkBtn.disabled = true;
  },

  selectOption(optionEl) {
    document.querySelectorAll('.quiz-option').forEach((o) => o.classList.remove('selected'));
    optionEl.classList.add('selected');
    this.checkBtn.disabled = false;
  },

  getSelectedOption() {
    const selected = document.querySelector('.quiz-option.selected');
    return selected ? selected.dataset.option : null;
  },

  renderAnswerResult(result) {
    document.querySelectorAll('.quiz-option').forEach((o) => {
      if (o.dataset.option === result.correctAnswer) o.classList.add('correct');
      else if (o.dataset.option === result.selectedOption && !result.correct) o.classList.add('wrong');
    });

    this.checkBtn.style.display = 'none';
    this.nextQBtn.style.display = 'block';
  },

  renderResult(result) {
    const pct = Math.round((result.correct / result.total) * 100);
    this.resultCorrect.textContent = result.correct;
    this.resultTotal.textContent = result.total;

    let msg = '';
    if (pct >= 90) msg = '🏆 Чудово! Ти справжній знавець слів!';
    else if (pct >= 60) msg = '👍 Непогано! Ще трохи практики — і буде відмінно.';
    else msg = '📚 Продовжуй вчити слова — все вийде!';

    this.resultMsg.textContent = msg;
    this.showPanel('result');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────
const VocabController = {
  model: new VocabModel(),

  init() {
    this._renderCurrentWord();

    // ── tab switching ──────────────────────────────────────────────────────
    VocabView.tabStudy.addEventListener('click', () => {
      VocabView.showPanel('study');
    });

    VocabView.tabQuiz.addEventListener('click', () => {
      this._startQuiz();
    });

    // ── study navigation ───────────────────────────────────────────────────
    document.getElementById('btn-prev').addEventListener('click', () => {
      this.model.prev();
      this._renderCurrentWord();
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      this.model.next();
      this._renderCurrentWord();
    });

    // ── known / unknown ────────────────────────────────────────────────────
    VocabView.knownBtn.addEventListener('click', () => {
      const word = this.model.getCurrentWord();
      this.model.markKnown(word.id);
      this._renderCurrentWord();
    });

    VocabView.unknownBtn.addEventListener('click', () => {
      const word = this.model.getCurrentWord();
      this.model.markUnknown(word.id);
      this._renderCurrentWord();
    });

    // ── quiz: select option ────────────────────────────────────────────────
    VocabView.quizOptionsEl.addEventListener('click', (e) => {
      const optionEl = e.target.closest('.quiz-option');
      if (!optionEl || this.model.quiz.answered) return;
      VocabView.selectOption(optionEl);
    });

    // ── quiz: check answer ─────────────────────────────────────────────────
    VocabView.checkBtn.addEventListener('click', () => {
      const selected = VocabView.getSelectedOption();
      if (!selected) return;

      const result = this.model.answerQuestion(selected);
      VocabView.renderAnswerResult(result);
    });

    // ── quiz: next question ────────────────────────────────────────────────
    VocabView.nextQBtn.addEventListener('click', () => {
      const q = this.model.nextQuestion();

      if (this.model.isQuizFinished()) {
        VocabView.renderResult(this.model.getQuizResult());
        return;
      }

      const progress = this.model.getQuizProgress();
      VocabView.renderQuestion(q, progress.current, progress.total);
    });

    // ── result: restart ────────────────────────────────────────────────────
    document.getElementById('btn-restart').addEventListener('click', () => {
      this._startQuiz();
    });

    document.getElementById('btn-back-study').addEventListener('click', () => {
      VocabView.showPanel('study');
    });
  },

  _renderCurrentWord() {
    const word = this.model.getCurrentWord();
    const isKnown = this.model.isKnown(word.id);
    VocabView.renderWord(word, isKnown);
    VocabView.renderStudyProgress(this.model.getProgress());
  },

  _startQuiz() {
    const q = this.model.startQuiz();
    const progress = this.model.getQuizProgress();
    VocabView.showPanel('quiz');
    VocabView.renderQuestion(q, progress.current, progress.total);
  },
};

VocabController.init();
