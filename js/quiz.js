const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzfr2Al0_zoFfMdcT6_fsxOaSDO-a3F9Io5lkkUyl-1ewVZUWIz80nSJRqhqv3QF3KR/exec"; // Replace with your URL
const QUIZ_TITLE = "వాక్యాలు రకాలు";

let questions = [], current = 0, answers = [], submitted = false, timeLeft = 0, timerInterval;

// Load quiz from Google Sheets
async function loadQuiz() {
  const name = document.getElementById("userName").value.trim();
  if (!name) { alert("Please enter your name first."); return; }

  document.getElementById("user-form").style.display = "none";
  document.getElementById("quiz-area").style.display = "block";
  document.getElementById("quiz-title-text").textContent = QUIZ_TITLE;

  try {
    const res = await fetch(GOOGLE_SHEET_URL);
    questions = await res.json();
    answers = Array(questions.length).fill(null);
    timeLeft = questions.length * 60; // 1 min per question
    renderNav();
    renderQuestion();
    startTimer();
  } catch (err) {
    alert("Failed to load questions from Google Sheets");
    console.error(err);
  }
}

// Question navigation
function toggleNav() { document.getElementById("question-nav").classList.toggle("hidden"); }

function renderNav() {
  const nav = document.getElementById("question-nav");
  nav.innerHTML = "";
  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.className = (i === current ? "active " : "") + (answers[i] !== null ? "answered" : "");
    btn.onclick = () => { current = i; renderQuestion(); };
    nav.appendChild(btn);
  });
  updateStats();
}

// Display current question
function renderQuestion() {
  const q = questions[current];
  const container = document.getElementById("question-container");
  let html = `<h4>Question ${current + 1} of ${questions.length}</h4><p>${q.q}</p><div class="options">`;
  q.options.forEach((o, i) => {
    let cls = "";
    if (submitted) {
      if (i === q.answerId) cls = "correct";
      else if (answers[current] === i && i !== q.answerId) cls = "wrong";
    }
    html += `<label class="${cls}">
               <input type="radio" name="opt" value="${i}" ${answers[current] === i ? "checked" : ""} 
               ${submitted ? "disabled" : ""} onchange="selectOpt(${i})"> ${o}
             </label>`;
  });
  html += "</div>";
  container.innerHTML = html;
  renderNav();

  if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([container]);
}

// Select option
function selectOpt(i) {
  if (submitted) return;
  answers[current] = i;
  renderNav();
}

// Navigate questions
function nextQuestion() { if (current < questions.length - 1) { current++; renderQuestion(); } }
function prevQuestion() { if (current > 0) { current--; renderQuestion(); } }

// Stats
function updateStats() {
  const answered = answers.filter(a => a !== null).length;
  document.getElementById("answered").textContent = "Answered: " + answered;
  document.getElementById("not-answered").textContent = "Not answered: " + (questions.length - answered);
}

// Timer
function startTimer() {
  updateTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) { clearInterval(timerInterval); submitQuiz(); }
  }, 1000);
}

function updateTimer() {
  const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
  document.getElementById("timer").textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// Submit quiz
function submitQuiz() {
  if (submitted) return;
  submitted = true;
  clearInterval(timerInterval);

  let correct = 0, wrong = 0;
  questions.forEach((q, i) => {
    if (answers[i] !== null) {
      if (answers[i] === q.answerId) correct++;
      else wrong++;
    }
  });
  const skipped = questions.length - (correct + wrong);
  const total = questions.length;
  const score = Math.round((correct / total) * 100);
  const name = document.getElementById("userName").value;

  const html = `<h3>Result Summary</h3>
                <p><b>Name:</b> ${name}</p>
                <p><b>Total Questions:</b> ${total}</p>
                <p><b>Correct:</b> ${correct}</p>
                <p><b>Wrong:</b> ${wrong}</p>
                <p><b>Skipped:</b> ${skipped}</p>
                <p><b>Score:</b> ${score}%</p>`;
  document.getElementById("result-section").innerHTML = html;
  document.getElementById("result-section").classList.remove("hidden");
  renderQuestion();
}

// Fullscreen toggle
function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => alert(e.message));
  else document.exitFullscreen();
}
