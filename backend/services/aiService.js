const promptBuilder = require("../utils/promptBuilder");
const modelConfig = require("../config/modelConfig");

exports.processCode = async (code, action, language) => {
  const prompt = promptBuilder.buildPrompt(code, action, language);

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: modelConfig.model,
      prompt: prompt,
      stream: false
    })
  });

  const data = await response.json();
  return data.response;
};