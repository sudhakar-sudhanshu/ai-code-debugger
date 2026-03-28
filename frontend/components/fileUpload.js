document.getElementById("fileInput").addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    setCode(e.target.result);
  };

  reader.readAsText(file);
});