const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;


/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
    res.send("Online Quiz Backend is Running!");
});


/* =========================
   GET ALL SUBJECTS
========================= */

app.get("/api/categories", async (req, res) => {

    try {

        const response = await fetch(
            "https://opentdb.com/api_category.php"
        );

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to load subjects"
        });

    }

});


/* =========================
   GET QUESTION COUNT
========================= */

app.get("/api/count", async (req, res) => {

    try {

        const category = req.query.category;

        if (!category) {

            return res.status(400).json({
                error: "Category is required"
            });

        }

        const response = await fetch(
            `https://opentdb.com/api_count.php?category=${category}`
        );

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to get question count"
        });

    }

});


/* =========================
   GET QUESTIONS
========================= */

app.get("/api/questions", async (req, res) => {

    try {

        const category = req.query.category;
        const difficulty = req.query.difficulty;

        if (!category || !difficulty) {

            return res.status(400).json({
                error: "Category and difficulty are required"
            });

        }


        /* Get available question count */

        const countResponse = await fetch(
            `https://opentdb.com/api_count.php?category=${category}`
        );

        const countData = await countResponse.json();


        let totalQuestions = 0;


        if (difficulty === "easy") {

            totalQuestions =
                countData.category_question_count
                    .total_easy_question_count;

        }

        else if (difficulty === "medium") {

            totalQuestions =
                countData.category_question_count
                    .total_medium_question_count;

        }

        else if (difficulty === "hard") {

            totalQuestions =
                countData.category_question_count
                    .total_hard_question_count;

        }


        if (!totalQuestions || totalQuestions <= 0) {

            return res.json({
                response_code: 0,
                results: []
            });

        }


        /*
            OpenTDB allows maximum 50 questions
            per request.

            So we request in batches.
        */

        let allQuestions = [];

        let remaining = totalQuestions;


        while (remaining > 0) {

            const amount =
                Math.min(50, remaining);


            const url =
                `https://opentdb.com/api.php?` +
                `amount=${amount}` +
                `category=${category}` +
                `difficulty=${difficulty}` +
                `type=multiple`;


            const response =
                await fetch(url);


            const data =
                await response.json();


            if (
                data.response_code !== 0 ||
                !data.results ||
                data.results.length === 0
            ) {

                break;

            }


            allQuestions =
                allQuestions.concat(data.results);


            remaining -= data.results.length;


            if (
                data.results.length < amount
            ) {

                break;

            }


            /*
                Small delay between requests
                to avoid API rate limits.
            */

            await new Promise(resolve => {
                setTimeout(resolve, 500);
            });

        }


        /* Remove duplicate questions */

        const uniqueQuestions = [];

        const questionSet = new Set();


        allQuestions.forEach(question => {

            if (!questionSet.has(question.question)) {

                questionSet.add(question.question);

                uniqueQuestions.push(question);

            }

        });


        /* Random question order */

        uniqueQuestions.sort(() => {
            return Math.random() - 0.5;
        });


        res.json({

            response_code: 0,

            total_available: uniqueQuestions.length,

            results: uniqueQuestions

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Unable to load online questions"

        });

    }

});


/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {

    console.log(
        `Online Quiz Backend running at http://localhost:${PORT}`
    );

});