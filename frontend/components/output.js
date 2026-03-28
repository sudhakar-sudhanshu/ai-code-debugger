function setOutput(text) {
  document.getElementById("output").innerText = text;
}

document.getElementById("copyBtn").addEventListener("click", () => {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text);
  alert("Copied!");
});