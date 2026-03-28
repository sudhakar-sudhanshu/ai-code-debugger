const historyStore = require("../memory/historyStore");

exports.buildPrompt = (code, action, language) => {
  const history = historyStore.get().join("\n");

  return `
You are a senior ${language} developer.

Task: ${action}

Instructions:
- Explain clearly
- Detect errors
- Provide fixed code
- Suggest improvements

Code:
${code}

Previous context:
${history}

Output format:
1. Explanation
2. Errors
3. Fixed Code
4. Suggestions
`;
};