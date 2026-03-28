const aiService = require("../services/aiService");
const historyStore = require("../memory/historyStore");

exports.analyzeCode = async (req, res) => {
  try {
    const { code, action, language } = req.body;

    if (!code) {
      return res.status(400).send("Code is required");
    }

    const result = await aiService.processCode(code, action, language);

    // Save memory
    historyStore.add(`User: ${code}`);
    historyStore.add(`AI: ${result}`);

    res.send(result);

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getHistory = (req, res) => {
  res.send(historyStore.get());
};