document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const quizContainer = document.getElementById('quizContainer');
  const categoryTitle = document.getElementById('categoryTitle');
  const quizIcon = document.getElementById('quizIcon');
  const questionNumber = document.getElementById('questionNumber');
  const questionText = document.getElementById('questionText');
  const optionsList = document.getElementById('optionsList');
  const progressBar = document.getElementById('progressBar');
  const nextBtn = document.getElementById('nextBtn');
  const timerCountEl = document.getElementById('timerCount');
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsScore = document.getElementById('resultsScore');
  const resultsDetail = document.getElementById('resultsDetail');
  const retryBtn = document.getElementById('retryBtn');
  const backBtn = document.getElementById('backBtn');

  const lastModified = document.getElementById('lastModified');
  if (lastModified) lastModified.textContent = 'Last modified: ' + document.lastModified;

  // Simple question sets for demo
  const quizData = {
    'Geography': [
      {
        q: 'What is the largest continent by land area?',
        options: ['Africa', 'Europe', 'Asia', 'North America'],
        answer: 2
      },
      {
        q: 'Which country has the longest coastline?',
        options: ['Australia', 'Canada', 'Russia', 'Indonesia'],
        answer: 1
      },
      {
        q: 'What is the smallest continent by land area?',
        options: ['Europe', 'Oceania', 'Antarctica', 'South America'],
        answer: 1
      }
    ],
    'General Knowledge': [
      { q: 'Which planet is known as the Red Planet?', options: ['Earth','Mars','Jupiter','Venus'], answer: 1 }
    ],
    'Movies & Entertainment': [
      { q: 'Who directed "Jurassic Park"?', options: ['Spielberg','Cameron','Nolan','Scorsese'], answer: 0 }
    ],
    'Technology': [
      { q: 'HTML stands for?', options: ['Hyperlinks and Text Markup Language','Hyper Text Markup Language','Home Tool Markup Language','Hyperlinking Text Mark Language'], answer: 1 }
    ],
    'History': [
      { q: 'The French Revolution began in which year?', options: ['1789','1776','1804','1799'], answer: 0 }
    ]
  };

  let state = {
    category: null,
    questions: [],
    current: 0,
    userAnswers: []
  };

  // Timer
  const QUESTION_SECONDS = 15;
  let timerInterval = null;
  let secondsLeft = QUESTION_SECONDS;

  function startTimer() {
    // reset
    clearInterval(timerInterval);
    secondsLeft = QUESTION_SECONDS;
    if (timerCountEl) timerCountEl.textContent = secondsLeft;
    timerInterval = setInterval(() => {
      secondsLeft -= 1;
      if (timerCountEl) timerCountEl.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function handleTimeout() {
    // record no answer (null) and advance
    state.userAnswers[state.current] = null;
    state.current += 1;
    if (state.current >= state.questions.length) {
      finishQuiz();
      return;
    }
    renderQuestion();
    startTimer();
  }

  function renderQuestion() {
    const q = state.questions[state.current];
    if (!q) return;
    questionNumber.textContent = `QUESTION ${state.current + 1}`;
    questionText.textContent = q.q;
    optionsList.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const id = `opt-${idx}`;
      const label = document.createElement('label');
      label.className = 'option-item';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'answer';
      input.value = idx;
      input.id = id;
      const radio = document.createElement('span');
      radio.className = 'radio';
      const text = document.createElement('span');
      text.className = 'option-text';
      text.textContent = opt;

      label.appendChild(input);
      label.appendChild(radio);
      label.appendChild(text);
      // clicking label should check input
      label.addEventListener('click', () => {
        input.checked = true;
      });

      optionsList.appendChild(label);
    });

    updateProgress();
    // restart timer on render
    startTimer();
  }

  function updateProgress() {
    const total = state.questions.length;
    const completed = state.current;
    const pct = Math.round((completed / total) * 100);
    progressBar.style.width = pct + '%';
  }

  nextBtn.addEventListener('click', () => {
    const checked = document.querySelector('input[name="answer"]:checked');
    if (!checked) {
      alert('Please select an answer to continue.');
      return;
    }
    stopTimer();
    state.userAnswers[state.current] = Number(checked.value);
    state.current += 1;

    if (state.current >= state.questions.length) {
      finishQuiz();
      return;
    }

    renderQuestion();
  });

  function finishQuiz() {
    stopTimer();
    const total = state.questions.length;
    let score = 0;
    state.questions.forEach((qq, i) => {
      if (state.userAnswers[i] === qq.answer) score += 1;
    });
    // show results screen
    resultsScore.textContent = `Score: ${score} / ${total}`;
    resultsDetail.textContent = `You answered ${score} out of ${total} correctly.`;
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    resultsContainer.setAttribute('aria-hidden', 'false');
  }

  function hideCategoryView() {
    const welcome = document.querySelector('.welcome.choose');
    const catList = document.querySelector('.category-list');
    const pick = document.querySelector('.pick');
    const start = document.querySelector('.subtitle.start');
    if (welcome) welcome.style.display = 'none';
    if (catList) catList.style.display = 'none';
    if (pick) pick.style.display = 'none';
    if (start) start.style.display = 'none';
  }

  function showCategoryView() {
    const welcome = document.querySelector('.welcome.choose');
    const catList = document.querySelector('.category-list');
    const pick = document.querySelector('.pick');
    const start = document.querySelector('.subtitle.start');
    if (welcome) welcome.style.display = '';
    if (catList) catList.style.display = '';
    if (pick) pick.style.display = '';
    if (start) start.style.display = '';
  }

  startBtn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="category"]:checked');
    if (!selected) {
      alert('Please pick a category to start the quiz.');
      return;
    }
    const cat = selected.value;
    state.category = cat;
    state.questions = quizData[cat] || [];
    state.current = 0;
    state.userAnswers = [];

    // set header title and icon
    categoryTitle.textContent = cat.toUpperCase();
    const label = selected.closest('.category-option');
    if (label) {
      const icon = label.querySelector('.icon');
      if (icon) quizIcon.textContent = icon.textContent || '';
    }

    // hide categories and show quiz (hide only category elements)
    hideCategoryView();
    quizContainer.style.display = 'block';
    quizContainer.setAttribute('aria-hidden', 'false');
    renderQuestion();
  });

  // Results actions
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      // restart same category
      resultsContainer.style.display = 'none';
      resultsContainer.setAttribute('aria-hidden', 'true');
      quizContainer.style.display = 'block';
      quizContainer.setAttribute('aria-hidden', 'false');
      state.current = 0;
      state.userAnswers = [];
      progressBar.style.width = '0%';
      renderQuestion();
    });
  }
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // go back to categories
      resultsContainer.style.display = 'none';
      resultsContainer.setAttribute('aria-hidden', 'true');
      // show the category view again
      showCategoryView();
      quizContainer.style.display = 'none';
    });
  }
});
