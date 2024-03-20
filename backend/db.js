const dotenv = require("dotenv");
// db.js
const { createClient } = require("@supabase/supabase-js");

dotenv.config();
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Export Supabase client for use in other modules
module.exports = { supabase };
