// LinguaSpark — simple language learning SPA (vanilla JS)
(() => {
  const PATH_LESSONS = 'data/lessons.json';
  let lessons = {};
  let currentList = [];
  let currentIndex = 0;
  let flipped = false;

  // UI elements
  const languageSelect = document.getElementById('languageSelect');
  const categoriesEl = document.getElementById('categories');
  const frontText = document.getElementById('frontText');
  const backText = document.getElementById('backText');
  const flashcard = document.getElementById('flashcard');
  const flipCardBtn = document.getElementById('flipCard');
  const prevCardBtn = document.getElementById('prevCard');
  const nextCardBtn = document.getElementById('nextCard');
  const speakBtn = document.getElementById('speakBtn');
  const markKnownBtn = document.getElementById('markKnown');
  const dailyBtn = document.getElementById('dailyBtn');
  const dailyArea = document.getElementById('dailyArea');
  const dailyList = document.getElementById('dailyList');
  const startPracticeBtn = document.getElementById('startPractice');
  const quizArea = document.getElementById('quizArea');
  const flashcardArea = document.getElementById('flashcardArea');
  const progressBtn = document.getElementById('progressBtn');
  const progressArea = document.getElementById('progressArea');
  const progressStats = document.getElementById('progressStats');

  // state in localStorage
  const STORAGE_KEY = 'lingua_spark_v1';
  let state = {known: {}, quizScores: []};

  // init
  fetch(PATH_LESSONS).then(r => r.json()).then(data => {
    lessons = data;
    loadState();
    renderCategories();
    setListFromCategory('vocabulary');
    renderFlashcard();
    prepareDailyLesson();
  }).catch(err => {
    console.error('Failed to load lessons', err);
  });

  // load/save state
  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) state = JSON.parse(raw);
    }catch(e){console.warn('state load failed', e)}
  }
  function saveState(){
    try{localStorage.setItem(STORAGE_KEY, JSON.stringify(state));}catch(e){console.warn('save failed', e)}
  }

  function renderCategories(){
    categoriesEl.innerHTML = '';
    for(const k of Object.keys(lessons)){
      const li = document.createElement('li');
      li.textContent = lessons[k].title || k;
      li.dataset.key = k;
      li.addEventListener('click', () => {setListFromCategory(k)});
      categoriesEl.appendChild(li);
    }
  }

  function setListFromCategory(key){
    currentList = (lessons[key] && lessons[key].items) ? lessons[key].items.slice() : [];
    currentIndex = 0;
    document.getElementById('lessonTitle').textContent = lessons[key].title || key;
    showPanel(flashcardArea);
    renderFlashcard();
  }

  function renderFlashcard(){
    if(!currentList.length){frontText.textContent='No items';backText.textContent=''}
    else{
      const item = currentList[currentIndex];
      frontText.textContent = item.term;
      backText.textContent = item.translation;
    }
    flashcard.classList.toggle('flipped', flipped);
  }

  flipCardBtn.addEventListener('click', () => {flipped = !flipped; renderFlashcard();});
  prevCardBtn.addEventListener('click', () => {if(currentIndex>0) currentIndex--; renderFlashcard();});
  nextCardBtn.addEventListener('click', () => {if(currentIndex<currentList.length-1) currentIndex++; renderFlashcard();});

  speakBtn.addEventListener('click', () => {
    if(!currentList.length) return;
    const item = currentList[currentIndex];
    speak(item.term, languageSelect.value);
  });

  markKnownBtn.addEventListener('click', () => {
    if(!currentList.length) return;
    const item = currentList[currentIndex];
    state.known[item.id] = true;
    saveState();
    alert('Marked known');
  });

  // simple TTS
  function speak(text, lang){
    if(!('speechSynthesis' in window)) {alert('TTS not supported');return}
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = mapLangCode(lang);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }
  function mapLangCode(code){
    if(code==='es') return 'es-ES';
    if(code==='fr') return 'fr-FR';
    if(code==='de') return 'de-DE';
    return code;
  }

  // daily lesson: pick 3 random items
  function prepareDailyLesson(){
    const all = [];
    for(const k of Object.keys(lessons)){
      for(const it of lessons[k].items) all.push(it);
    }
    const shuffled = all.sort(() => Math.random()-0.5);
    const daily = shuffled.slice(0,3);
    dailyList.innerHTML = '';
    daily.forEach(it => {
      const div = document.createElement('div');
      div.textContent = `${it.term} — ${it.translation}`;
      dailyList.appendChild(div);
    });

    document.getElementById('dailyBtn').addEventListener('click', () => {showPanel(dailyArea)});
    startPracticeBtn.addEventListener('click', () => {
      currentList = daily.slice(); currentIndex=0; showPanel(flashcardArea); renderFlashcard();
    });
  }

  // panels
  function showPanel(panel){
    [flashcardArea, quizArea, dailyArea, progressArea].forEach(p=>p.classList.add('hidden'));
    panel.classList.remove('hidden');
  }

  // quizzes
  const startQuizBtn = document.getElementById('startQuiz');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizChoices = document.getElementById('quizChoices');
  const nextQuestionBtn = document.getElementById('nextQuestion');
  const quizResult = document.getElementById('quizResult');

  startQuizBtn.addEventListener('click', () => {
    buildQuiz();
    showPanel(quizArea);
  });

  let quiz = {questions: [], idx:0, correct:0};

  function buildQuiz(){
    const pool = [];
    for(const k of Object.keys(lessons)) for(const it of lessons[k].items) pool.push(it);
    const qcount = Math.min(5, pool.length);
    const shuffled = pool.sort(()=>Math.random()-0.5).slice(0,qcount);
    quiz = {questions: shuffled, idx:0, correct:0};
    renderQuizQuestion();
  }

  function renderQuizQuestion(){
    const q = quiz.questions[quiz.idx];
    quizQuestion.textContent = `Translate: ${q.term}`;
    quizChoices.innerHTML='';
    const choices = [q.translation];
    // add 3 distractors
    const pool = [];
    for(const k of Object.keys(lessons)) for(const it of lessons[k].items) if(it.id!==q.id) pool.push(it.translation);
    const shuffled = pool.sort(()=>Math.random()-0.5).slice(0,3);
    shuffled.forEach(s=>choices.push(s));
    choices.sort(()=>Math.random()-0.5);
    choices.forEach(ch=>{
      const btn = document.createElement('button'); btn.textContent=ch;
      btn.addEventListener('click', ()=>{handleChoice(ch,q.translation)});
      quizChoices.appendChild(btn);
    });
    nextQuestionBtn.classList.add('hidden');
    quizResult.textContent='';
  }

  function handleChoice(choice, correct){
    const ok = choice===correct;
    if(ok) quiz.correct++;
    quizResult.textContent = ok ? 'Correct!' : `Wrong — correct: ${correct}`;
    nextQuestionBtn.classList.remove('hidden');
  }

  nextQuestionBtn.addEventListener('click', () => {
    quiz.idx++;
    if(quiz.idx>=quiz.questions.length){
      finishQuiz();
    }else renderQuizQuestion();
  });

  function finishQuiz(){
    quizResult.textContent = `You scored ${quiz.correct} / ${quiz.questions.length}`;
    state.quizScores.push({date:Date.now(), score:quiz.correct, total:quiz.questions.length});
    saveState();
    nextQuestionBtn.classList.add('hidden');
  }

  // progress
  progressBtn.addEventListener('click', ()=>{renderProgress(); showPanel(progressArea)});
  function renderProgress(){
    const knownCount = Object.keys(state.known).length;
    const totalCount = Object.keys(lessons).reduce((s,k)=>s+lessons[k].items.length,0);
    progressStats.innerHTML = `<div>Known: ${knownCount} / ${totalCount}</div>`;
    if(state.quizScores.length){
      const last = state.quizScores[state.quizScores.length-1];
      const d = new Date(last.date).toLocaleString();
      progressStats.innerHTML += `<div>Last quiz: ${last.score}/${last.total} — ${d}</div>`;
    }
  }

})();
