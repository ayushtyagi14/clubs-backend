// controllers/documentController.js
const { supabase } = require("../db");

async function fetchDocument(req, res) {
  try {
    const { table, id } = req.params; // Correct variable name from tableName to table
    const { data: document, error } = await supabase
      .from(table) // Use table instead of tableName
      .select("*")
      .eq("clubId", id)
      .single();

    if (error) {
      throw error;
    }
    res.json(document);
  } catch (error) {
    console.error("Error fetching document:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { fetchDocument };
