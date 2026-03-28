// Code File Upload (fills textarea)
document.getElementById("fileInput").addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    document.getElementById("code").value = e.target.result;
  };

  if (file) {
    reader.readAsText(file);
  }
});

// Document Upload (RAG)
document.getElementById("docUpload")?.addEventListener("change", async function () {
  const file = this.files[0];
  const reader = new FileReader();

  reader.onload = async function (e) {
    await fetch("http://localhost:5000/api/upload-doc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: e.target.result })
    });

    alert("Document uploaded for AI context");
  };

  if (file) {
    reader.readAsText(file);
  }
});

// Run AI
async function runAI() {
  try {
    const code = document.getElementById("code").value;
    const language = document.getElementById("language").value;

    if (!code) {
      alert("Please enter or upload code");
      return;
    }

    // Loading UI
    document.getElementById("output").innerHTML = `
      <pre style="color:yellow;">Processing request...</pre>
    `;

    const res = await fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code, language })
    });

    const data = await res.text();

    // Typing effect
    typeWriterEffect(data);

    loadHistory();

  } catch (error) {
    console.error("Error:", error);

    document.getElementById("output").innerHTML = `
      <pre style="color:red;">Error connecting to backend</pre>
    `;
  }
}

// Typing Effect
function typeWriterEffect(text) {
  let i = 0;
  const speed = 10;

  document.getElementById("output").innerHTML = `
    <pre id="typing" style="
      background:#0f172a;
      color:#00ffcc;
      padding:15px;
      border-radius:10px;
      font-family:monospace;
      white-space:pre-wrap;
    "></pre>
  `;

  const typingEl = document.getElementById("typing");

  function typing() {
    if (i < text.length) {
      typingEl.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}

// Load Chat History
async function loadHistory() {
  try {
    const res = await fetch("http://localhost:5000/api/history");
    const data = await res.json();

    document.getElementById("history").innerHTML = `
      <pre style="
        background:#111;
        color:#ccc;
        padding:10px;
        border-radius:8px;
        font-size:12px;
        max-height:200px;
        overflow:auto;
      ">
${data.map(h => `${h.role}: ${h.content}`).join("\n\n")}
      </pre>
    `;
  } catch (error) {
    console.error("History Error:", error);
  }
}

// Clear Chat History
async function clearHistory() {
  await fetch("http://localhost:5000/api/clear-history", {
    method: "POST"
  });

  document.getElementById("history").innerHTML = `
    <pre style="color:gray;">History cleared</pre>
  `;
}

// Auto-load history on page load
window.onload = loadHistory;