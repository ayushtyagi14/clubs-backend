const { supabase } = require("../db");

async function fetchUserDetails(req, res) {
    try {
        const { id } = req.params; // Correct variable name from tableName to table
        const { data: document, error } = await supabase
            .from("Accounts") // Use table instead of tableName
            .select("*")
            .eq("id", id)
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

module.exports = {
    fetchUserDetails
};
