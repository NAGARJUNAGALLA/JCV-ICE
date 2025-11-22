// Replace your Google Sheet ID here
const SHEET_ID = "YOUR_SHEET_ID_HERE"; 
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let quizzes = []; // All quizzes
let questions = [];
let current = 0;
let answers = [];
let submitted = false;
let timeLeft = 0;
let timerInterval = null;

// Load quiz names from Google Sheets
async function loadTestNames() {
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    quizzes = json.table.rows.map(r => ({ name: r.c[0].v, sheet: r.c[1].v }));
    const select = document.getElementById("testSelect");
    quizzes.forEach((q,i)=>{
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = q.name;
      select.appendChild(opt);
    });
  } catch(err) {
    alert("Failed to load quizzes from Google Sheets.");
    console.error(err);
  }
}

// Load questions for selected quiz
async function startQuiz() {
  const userName = document.getElementById("userName").value.trim();
  if(!userName){alert("Enter your name");return;}
  const testIndex = document.getElementById("testSelect").value;
  const testSheet = quizzes[testIndex].sheet;

  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${testSheet}`);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    questions = json.table.rows.map(r=>({
      q: r.c[0]?.v,
      options: [r.c[1]?.v,r.c[2]?.v,r.c[3]?.v,r.c[4]?.v].filter(o=>o!==undefined),
      answerId: r.c[5]?.v
    }));
    answers = Array(questions.length).fill(null);
    current=0;submitted=false;
    timeLeft = questions.length*60;

    document.getElementById("user-form").style.display="none";
    document.getElementById("quiz-container").style.display="block";
    document.getElementById("quiz-title").textContent = quizzes[testIndex].name;

    renderQuestion();
    renderNav();
    startTimer();
  } catch(err){
    alert("Failed to load questions from selected quiz");
    console.error(err);
  }
}

// Render question
function renderQuestion() {
  const q = questions[current];
  document.getElementById("question-text").innerHTML = `Q${current+1}. ${q.q}`;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options.forEach((opt,i)=>{
    let cls="";
    if(submitted){
      if(i===q.answerId) cls="correct";
      else if(answers[current]===i && i!==q.answerId) cls="wrong";
    }
    const label = document.createElement("label");
    label.className = cls;
    label.innerHTML = `<input type="radio" name="opt" value="${i}" ${answers[current]===i?'checked':''} ${submitted?'disabled':''} onchange="selectOpt(${i})"> ${opt}`;
    optionsDiv.appendChild(label);
  });
  renderNav();
  if(window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([optionsDiv]);
}

// Select option
function selectOpt(i){
  if(submitted) return;
  answers[current]=i;
  renderNav();
}

// Navigation buttons
function nextQuestion(){if(current<questions.length-1){current++; renderQuestion();}}
function prevQuestion(){if(current>0){current--; renderQuestion();}}

// Question nav buttons
function renderNav(){
  const nav = document.getElementById("question-nav");
  nav.innerHTML = "";
  questions.forEach((_,i)=>{
    const btn = document.createElement("button");
    btn.textContent = i+1;
    btn.className = (i===current?"active ":"")+(answers[i]!=null?"answered":"");
    btn.onclick = ()=>{current=i; renderQuestion();};
    nav.appendChild(btn);
  });
}

// Timer
function startTimer(){
  updateTimer();
  timerInterval=setInterval(()=>{
    timeLeft--;
    updateTimer();
    if(timeLeft<=0){clearInterval(timerInterval);submitQuiz();}
  },1000);
}
function updateTimer(){
  const m=Math.floor(timeLeft/60), s=timeLeft%60;
  document.getElementById("timer").textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// Submit quiz
function submitQuiz(){
  if(submitted) return;
  submitted=true;
  clearInterval(timerInterval);
  let correct=0, wrong=0;
  questions.forEach((q,i)=>{
    if(answers[i]!=null){
      if(answers[i]===q.answerId) correct++;
      else wrong++;
    }
  });
  const skipped = questions.length-(correct+wrong);
  const total = questions.length;
  const score = Math.round((correct/total)*100);
  const name = document.getElementById("userName").value;

  const result = {name,total,correct,wrong,skipped,score};
  localStorage.setItem("quizResult",JSON.stringify(result));

  const resultDiv = document.getElementById("result-section");
  resultDiv.style.display="block";
  resultDiv.innerHTML=`<h3>Result Summary</h3>
  <p><b>Name:</b> ${name}</p>
  <p><b>Total Questions:</b> ${total}</p>
  <p><b>Correct:</b> ${correct}</p>
  <p><b>Wrong:</b> ${wrong}</p>
  <p><b>Skipped:</b> ${skipped}</p>
  <p><b>Score:</b> ${score}%</p>`;
  renderQuestion();
}

// Fullscreen
function toggleFullscreen(){
  if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e=>alert(e.message));
  else document.exitFullscreen();
}

// Initialize
loadTestNames();
