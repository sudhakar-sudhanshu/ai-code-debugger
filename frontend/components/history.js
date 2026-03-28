async function loadHistory() {
  try {
    const res = await fetch("http://localhost:3000/api/history");
    const data = await res.text();
    document.getElementById("history").innerText = data;
  } catch {
    console.log("History load failed");
  }
}