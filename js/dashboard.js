const quizzes = [
  { id: 1, title: "Math Quiz 1", questions: 5 },
  { id: 2, title: "Science Quiz 1", questions: 5 }
];

document.getElementById("user-name").textContent = localStorage.getItem("currentUser");

function loadQuizzes() {
  const quizList = document.getElementById("quiz-list");
  quizList.innerHTML = "";
  quizzes.forEach(q => {
    const div = document.createElement("div");
    div.classList.add("quiz-item");
    div.innerHTML = `<h4>${q.title}</h4>
                     <p>Questions: ${q.questions}</p>
                     <button onclick="startQuiz(${q.id})">Start Quiz</button>`;
    quizList.appendChild(div);
  });
}

function startQuiz(id) {
  localStorage.setItem("currentQuiz", id);
  window.location.href = "quiz.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

loadQuizzes();
