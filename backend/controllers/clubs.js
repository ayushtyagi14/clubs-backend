// controllers/documentController.js
const { supabase } = require("../db");

async function fetchClubs(req, res) {
  try {
    const { data: document, error } = await supabase
      .from("Clubs") // Use table instead of tableName
      .select("*")

    if (error) {
      throw error;
    }
    res.json(document);
  } catch (error) {
    console.error("Error fetching Clubs:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function fetchDetails(req, res) {
  try {
    const { type, id } = req.params; // Correct variable name from tableName to table
    const { data: document, error } = await supabase
      .from("Clubs") // Use table instead of tableName
      .select("*")
      .filter('type', 'eq', type)
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

module.exports = { fetchDetails, fetchClubs };
