const SHEET_ID = "YOUR_SHEET_ID_HERE"; // Replace with your Google Sheet ID

let questions = [];
let current = 0;
let answers = [];
let submitted = false;
let timeLeft = 0;
let timerInterval = null;

// Helper to get URL param
function getQueryParam(param){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fetch Google Sheet
async function fetchSheet(sheetName){
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0,-2));
    return json.table.rows;
}

// Start Quiz
async function startQuiz(){
    let userName = document.getElementById("userName").value.trim();
    const nameParam = getQueryParam("name");
    const sheetParam = getQueryParam("sheet");
    if(nameParam) userName = nameParam;
    if(!userName){alert("Enter your name"); return;}
    if(!sheetParam){alert("Quiz sheet not specified."); return;}

    try{
        const rows = await fetchSheet(sheetParam);
        questions = rows.map(r=>{
            return {
                q: r.c[0]?.v,
                options: [r.c[1]?.v,r.c[2]?.v,r.c[3]?.v,r.c[4]?.v].filter(o=>o!==undefined),
                answerId: r.c[5]?.v
            }
        });
        answers = Array(questions.length).fill(null);
        current=0; submitted=false;
        timeLeft = questions.length*60;

        document.getElementById("user-form").style.display="none";
        document.getElementById("quiz-container").style.display="block";
        document.getElementById("quiz-title").textContent = getQueryParam("name") || "Quiz";

        renderQuestion(); renderNav(); startTimer();
    }catch(err){
        console.error(err);
        alert("Failed to load quiz questions.");
    }
}

// Render question
function renderQuestion(){
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
function selectOpt(i){if(submitted) return; answers[current]=i; renderNav();}

// Navigation
function nextQuestion(){if(current<questions.length-1){current++; renderQuestion();}}
function prevQuestion(){if(current>0){current--; renderQuestion();}}

// Question nav
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
    timerInterval = setInterval(()=>{
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
    submitted = true; clearInterval(timerInterval);
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

    const resultDiv = document.getElementById("result-section");
    resultDiv.style.display="block";
    resultDiv.innerHTML=`<h3>Result Summary</h3>
    <p><b>Name:</b> ${name}</p>
    <p><b>Total Questions:</b> ${total}</p>
    <p><b>Correct:</b> ${correct}</p>
    <p><b>Wrong:</b> ${wrong}</p>
    <p><b>Skipped:</b> ${skipped}</p>
    <p><b>Score:</b> ${score}%</p>`;
}

// Fullscreen
function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen().catch(e=>alert(e.message));else document.exitFullscreen();}
