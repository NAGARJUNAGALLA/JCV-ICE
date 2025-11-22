// At the start of quiz.js
function getQueryParam(param){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Modified startQuiz()
async function startQuiz(){
    let userName = document.getElementById("userName").value.trim();
    // If name is in URL param, auto-fill
    const nameParam = getQueryParam("name");
    if(nameParam) userName = nameParam;

    if(!userName){alert("Enter your name"); return;}

    const testSheet = getQueryParam("sheet");
    if(!testSheet){alert("Quiz sheet not specified."); return;}

    try{
        const rows = await fetchSheet(testSheet);
        questions = rows.map(r=>({
            q: r.c[0]?.v,
            options: [r.c[1]?.v,r.c[2]?.v,r.c[3]?.v,r.c[4]?.v].filter(o=>o!==undefined),
            answerId: r.c[5]?.v
        }));
        answers = Array(questions.length).fill(null);
        current=0; submitted=false;
        timeLeft = questions.length*60;

        document.getElementById("user-form").style.display="none";
        document.getElementById("quiz-container").style.display="block";
        document.getElementById("quiz-title").textContent = nameParam || "Quiz";

        renderQuestion(); renderNav(); startTimer();
    }catch(err){
        console.error(err);
        alert("Failed to load questions.");
    }
}
