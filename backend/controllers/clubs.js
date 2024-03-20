// controllers/documentController.js
const { supabase } = require("../db");

async function fetchDocument(req, res) {
  try {
    const { table, id } = req.params;
    // Fetch the document with the specified ID from the specified table
    console.log(tableName);
    const { data: document, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("clubId", id)
      .single(); // Retrieve only one document

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
