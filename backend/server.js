require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

//  Debug API key
console.log("API KEY:", process.env.OPENAI_API_KEY);

//  OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//  Chat memory
let history = [];

//  RAG documents storage
let documents = [];

//  Health check
app.get("/", (req, res) => {
  res.send(" Backend is working");
});

//  TEST API
app.get("/api/test-ai", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Fix this code: let a = '5' + 5;" }
      ],
    });

    res.send(response.choices[0].message.content);

  } catch (err) {
    console.error("TEST ERROR:", err.message);
    res.send(" OpenAI error: " + err.message);
  }
});

//  Upload Document (RAG)
app.post("/api/upload-doc", (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.send(" No document content received");
  }

  documents.push(content);

  if (documents.length > 5) {
    documents.shift();
  }

  res.send(" Document uploaded successfully");
});

//  MAIN API (EXECUTION + AI + MEMORY + RAG)
app.post("/api/analyze", async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).send(" Code is required");
  }

  //  RAG context
  const docContext = documents.join("\n\n");

  //  CODE EXECUTION (only JS)
  if (language === "JavaScript") {
    const filePath = "temp.js";

    try {
      fs.writeFileSync(filePath, code);

      exec(`node ${filePath}`, async (error, stdout, stderr) => {
        fs.unlinkSync(filePath);

        //  If code runs fine
        if (!error) {
          return res.send(`
 Output:
${stdout}
          `);
        }

        //  If error → AI Fix
        const errorMessage = stderr;

        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a senior JavaScript debugger.",
              },
              {
                role: "user",
                content: `
Fix this code.

Code:
${code}

Error:
${errorMessage}

Document Context:
${docContext}

Give:
1. Fixed code
2. Explanation
                `,
              },
            ],
          });

          const aiFix = response.choices[0].message.content;

          //  Save memory
          history.push({ role: "user", content: code });
          history.push({ role: "assistant", content: aiFix });

          if (history.length > 20) {
            history = history.slice(-20);
          }

          return res.send(`
   Error:
${errorMessage}

 AI Fix:
${aiFix}
          `);

        } catch (err) {
          return res.send(" AI Error: " + err.message);
        }
      });

    } catch (err) {
      return res.send(" Execution error: " + err.message);
    }

  } else {
    //  Normal AI (non-JS)
    const messages = [
      {
        role: "system",
        content: `You are a senior ${language} developer.
Explain code, find errors, fix code, and suggest improvements.
Use document context if available.`,
      },
      ...history,
      {
        role: "user",
        content: `
Code:
${code}

Document Context:
${docContext}
`,
      },
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });

      const text = response.choices[0].message.content;

      history.push({ role: "user", content: code });
      history.push({ role: "assistant", content: text });

      if (history.length > 20) {
        history = history.slice(-20);
      }

      res.send(text);

    } catch (err) {
      res.send(" OpenAI error: " + err.message);
    }
  }
});

// Clear chat history
app.post("/api/clear-history", (req, res) => {
  history = [];
  res.send(" Chat history cleared");
});

//  Get history
app.get("/api/history", (req, res) => {
  res.json(history);
});

//  Start server
app.listen(5000, () => {
  console.log(" Server running at http://localhost:5000");
});