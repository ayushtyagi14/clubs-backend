const dotenv = require("dotenv");
// db.js
const { createClient } = require("@supabase/supabase-js");

dotenv.config();
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get a single document from a specified table
async function getDocument(tableName, id) {
  try {
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

    return document;
  } catch (error) {
    console.error("Error fetching document:", error.message);
    throw new Error("Failed to fetch document");
  }
}

module.exports = {
  getDocument,
  // Add other database operations functions here
};
