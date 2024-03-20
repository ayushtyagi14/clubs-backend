// controllers/documentController.js
const { getDocument } = require("../db");

async function fetchDocument(req, res) {
  try {
    const { table, id } = req.params;
    const document = await getDocument(table, id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(document);
  } catch (error) {
    console.error("Error fetching document:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { fetchDocument };
