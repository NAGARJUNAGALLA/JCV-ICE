const users = [
  { username: "student1", password: "pass123" },
  { username: "student2", password: "pass456" }
];

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-msg");

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem("currentUser", username);
    window.location.href = "dashboard.html";
  } else {
    errorMsg.textContent = "Invalid username or password";
  }
}
