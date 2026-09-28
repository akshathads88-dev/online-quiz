let currentQuestion = 0;
let questions = [];
let selectedAnswers = [];

let studentName = "";
let rollNumber = "";
let selectedSubject = "";
let selectedDifficulty = "";

let timeLeft = 60;
let timer;

let categories = [];

const BACKEND_URL = "http://localhost:3000";


/* =========================
   LOAD SUBJECTS
========================= */

window.addEventListener("load", async function () {

    const subjectSelect =
        document.getElementById("subject");

    try {

        const response =
            await fetch(
                `${BACKEND_URL}/api/categories`
            );

        const data =
            await response.json();

        categories =
            data.trivia_categories;

        subjectSelect.innerHTML =
            '<option value="">Select Subject</option>';

        categories.forEach(function (category) {

            const option =
                document.createElement("option");

            option.value = category.id;

            option.textContent = category.name;

            subjectSelect.appendChild(option);

        });

    } catch (error) {

        console.error(error);

        subjectSelect.innerHTML =
            '<option value="">Unable to load subjects</option>';

        alert(
            "Unable to connect to backend. Please make sure server.js is running."
        );

    }

});


/* =========================
   START QUIZ
========================= */

document.getElementById("startBtn")
    .addEventListener("click", async function () {

        studentName =
            document.getElementById("studentName")
                .value.trim();

        rollNumber =
            document.getElementById("rollNumber")
                .value.trim();

        selectedSubject =
            document.getElementById("subject")
                .value;

        selectedDifficulty =
            document.getElementById("difficulty")
                .value;


        if (studentName === "") {

            alert("Please enter your Name.");
            return;

        }


        if (rollNumber === "") {

            alert("Please enter your Roll Number.");
            return;

        }


        if (selectedSubject === "") {

            alert("Please select a Subject.");
            return;

        }


        if (selectedDifficulty === "") {

            alert("Please select Difficulty.");
            return;

        }


        const startButton =
            document.getElementById("startBtn");

        startButton.disabled = true;

        startButton.innerText =
            "Loading Questions...";


        try {

            const category =
                categories.find(function (item) {

                    return String(item.id) ===
                        String(selectedSubject);

                });


            if (!category) {

                throw new Error(
                    "Subject not found"
                );

            }


            /* Get questions from backend */

            const response =
                await fetch(
                    `${BACKEND_URL}/api/questions?category=${selectedSubject}&difficulty=${selectedDifficulty}`
                );


            const data =
                await response.json();


            if (
                !data.results ||
                data.results.length === 0
            ) {

                alert(
                    "No questions available for this subject and difficulty."
                );

                startButton.disabled = false;

                startButton.innerText =
                    "🚀 Start Quiz";

                return;

            }


            /* Prepare questions */

            questions =
                data.results.map(function (item) {

                    let options = [

                        ...item.incorrect_answers,

                        item.correct_answer

                    ];


                    /* Randomize options */

                    options.sort(function () {

                        return Math.random() - 0.5;

                    });


                    return {

                        question:
                            decodeHTML(
                                item.question
                            ),

                        options:
                            options.map(
                                decodeHTML
                            ),

                        answer:
                            options.indexOf(
                                item.correct_answer
                            )

                    };

                });


            /* Randomize questions */

            questions.sort(function () {

                return Math.random() - 0.5;

            });


            currentQuestion = 0;

            selectedAnswers = [];


            /* Hide login */

            document.getElementById("login")
                .style.display = "none";


            /* Show quiz */

            document.getElementById("quizArea")
                .style.display = "block";


            /* Student information */

            document.getElementById("studentInfo")
                .innerText =
                "Student: " +
                studentName +
                " | Roll No: " +
                rollNumber;


            /* Subject */

            document.getElementById("subjectInfo")
                .innerText =
                "📚 " +
                category.name;


            /* Difficulty */

            document.getElementById("difficultyInfo")
                .innerText =
                "🎯 " +
                selectedDifficulty
                    .charAt(0)
                    .toUpperCase()
                +
                selectedDifficulty
                    .slice(1);


            loadQuestion();

            startTimer();

        }

        catch (error) {

            console.error(error);

            alert(
                "Unable to load questions. Make sure backend is running and internet is connected."
            );

            startButton.disabled = false;

            startButton.innerText =
                "🚀 Start Quiz";

        }

    });


/* =========================
   DECODE HTML
========================= */

function decodeHTML(text) {

    const textarea =
        document.createElement("textarea");

    textarea.innerHTML = text;

    return textarea.value;

}


/* =========================
   LOAD QUESTION
========================= */

function loadQuestion() {

    document.getElementById("questionNumber")
        .innerText =
        "Question " +
        (currentQuestion + 1) +
        " of " +
        questions.length;


    document.getElementById("question")
        .innerText =
        questions[currentQuestion]
            .question;


    const optionsDiv =
        document.getElementById("options");


    optionsDiv.innerHTML = "";


    questions[currentQuestion]
        .options
        .forEach(function (option, index) {

            const button =
                document.createElement("button");

            button.innerText =
                option;

            button.className =
                "option";


            button.addEventListener(
                "click",
                function () {

                    selectAnswer(index);

                }
            );


            optionsDiv.appendChild(button);

        });


    /* Show previous answer */

    if (
        selectedAnswers[currentQuestion]
        !== undefined
    ) {

        showAnswer(
            selectedAnswers[currentQuestion]
        );

    }

}


/* =========================
   SELECT ANSWER
========================= */

function selectAnswer(selected) {

    selectedAnswers[currentQuestion] =
        selected;

    showAnswer(selected);

}


/* =========================
   SHOW ANSWER
========================= */

function showAnswer(selected) {

    const correctAnswer =
        questions[currentQuestion]
            .answer;


    const buttons =
        document.querySelectorAll(".option");


    buttons.forEach(function (button) {

        button.disabled = true;

        button.style.background =
            "white";

        button.style.color =
            "#333";

    });


    if (selected === correctAnswer) {

        buttons[selected]
            .style.background =
            "lightgreen";

    }

    else {

        buttons[selected]
            .style.background =
            "lightcoral";

        buttons[correctAnswer]
            .style.background =
            "lightgreen";

    }

}


/* =========================
   NEXT BUTTON
========================= */

document.getElementById("nextBtn")
    .addEventListener("click", function () {

        if (
            selectedAnswers[currentQuestion]
            === undefined
        ) {

            alert(
                "Please select an answer first."
            );

            return;

        }


        if (
            currentQuestion <
            questions.length - 1
        ) {

            currentQuestion++;

            loadQuestion();

        }

        else {

            showResult();

        }

    });


/* =========================
   PREVIOUS BUTTON
========================= */

document.getElementById("previousBtn")
    .addEventListener("click", function () {

        if (currentQuestion > 0) {

            currentQuestion--;

            loadQuestion();

        }

        else {

            alert(
                "This is the first question."
            );

        }

    });


/* =========================
   SUBMIT BUTTON
========================= */

document.getElementById("submitBtn")
    .addEventListener("click", function () {

        if (
            selectedAnswers[currentQuestion]
            === undefined
        ) {

            alert(
                "Please select an answer first."
            );

            return;

        }


        const confirmSubmit =
            confirm(
                "Are you sure you want to submit the quiz?"
            );


        if (confirmSubmit) {

            showResult();

        }

    });


/* =========================
   RESULT PAGE
========================= */

function showResult() {

    clearInterval(timer);


    let score = 0;

    let unanswered = 0;


    questions.forEach(
        function (question, index) {

            if (
                selectedAnswers[index]
                === undefined
            ) {

                unanswered++;

            }

            else if (
                selectedAnswers[index]
                === question.answer
            ) {

                score++;

            }

        }
    );


    const total =
        questions.length;


    const wrong =
        total - score - unanswered;


    const percentage =
        Math.round(
            (score / total) * 100
        );


    let resultMessage;

    let resultClass;


    if (percentage >= 40) {

        resultMessage =
            "🎉 PASS";

        resultClass =
            "pass";

    }

    else {

        resultMessage =
            "📚 FAIL";

        resultClass =
            "fail";

    }


    const subjectName =
        getSubjectName();


    document.querySelector(".app-container")
        .innerHTML = `

        <div class="result">

            <div class="app-logo">
                🏆
            </div>


            <h1>
                Quiz Completed!
            </h1>


            <p>
                Great job, ${studentName}! 🎉
            </p>


            <div class="result-score">

                <h2>
                    ${score} / ${total}
                </h2>

                <h3>
                    Your Score
                </h3>

                <hr>


                <p>
                    👤 Student:
                    <b>${studentName}</b>
                </p>


                <p>
                    🎓 Roll No:
                    <b>${rollNumber}</b>
                </p>


                <p>
                    📚 Subject:
                    <b>${subjectName}</b>
                </p>


                <p>
                    🎯 Difficulty:
                    <b>
                        ${selectedDifficulty
                            .charAt(0)
                            .toUpperCase()
                        +
                        selectedDifficulty
                            .slice(1)}
                    </b>
                </p>


                <hr>


                <p>
                    ✅ Correct Answers:
                    <b>${score}</b>
                </p>


                <p>
                    ❌ Wrong Answers:
                    <b>${wrong}</b>
                </p>


                <p>
                    ⭕ Unanswered:
                    <b>${unanswered}</b>
                </p>


                <p>
                    📊 Percentage:
                    <b>${percentage}%</b>
                </p>

            </div>


            <h2 class="${resultClass}">
                ${resultMessage}
            </h2>


            <button
                class="start-button"
                onclick="location.reload()">

                🔄 Start New Quiz

            </button>

        </div>

    `;

}


/* =========================
   GET SUBJECT NAME
========================= */

function getSubjectName() {

    const category =
        categories.find(function (item) {

            return String(item.id) ===
                String(selectedSubject);

        });


    return category
        ? category.name
        : "Selected Subject";

}


/* =========================
   TIMER
========================= */

function startTimer() {

    clearInterval(timer);

    timeLeft = 60;


    document.getElementById("timer")
        .innerText =
        "⏱️ Time Left: " +
        timeLeft +
        " seconds";


    timer = setInterval(function () {

        timeLeft--;


        document.getElementById("timer")
            .innerText =
            "⏱️ Time Left: " +
            timeLeft +
            " seconds";


        if (timeLeft <= 0) {

            clearInterval(timer);

            alert("Time's up!");

            showResult();

        }

    }, 1000);

}