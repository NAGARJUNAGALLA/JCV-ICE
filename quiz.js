const quizData = {
  1: [
    { q: "2 + 2 = ?", options: ["2","3","4","5"], answer: 2 },
    { q: "5 x 3 = ?", options: ["8","15","10","12"], answer: 1 }
  ],
  2: [
    { q: "Water formula?", options: ["H2O","CO2","O2","NaCl"], answer: 0 },
    { q: "Sun rises from?", options: ["West","East","North","South"], answer: 1 }
  ]
};

let currentQuiz = localStorage.getItem("currentQuiz");
let currentQIndex = 0;
let score = 0;
const questions = quizData[currentQuiz];

document.getElementById("quiz-title").textContent = quizzes.find(q => q.id == currentQuiz).title;

function showQuestion() {
  const qContainer = document.getElementById("question-container");
  const q = questions[currentQIndex];
  qContainer.innerHTML = `
    <p>${currentQIndex + 1}. ${q.q}</p>
    ${q.options.map((opt,i)=>`<button onclick="selectAnswer(${i})">${opt}</button>`).join("")}
  `;
}

function selectAnswer(i) {
  if (i === questions[currentQIndex].answer) score++;
  currentQIndex++;
  if(currentQIndex < questions.length) showQuestion();
  else showResults();
}

function nextQuestion() {
  currentQIndex++;
  if(currentQIndex < questions.length) showQuestion();
  else showResults();
}

function showResults() {
  localStorage.setItem("lastScore", score);
  window.location.href = "results.html";
}

showQuestion();
