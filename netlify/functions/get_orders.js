const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        // Read the token from the incoming request header
        const token = event.headers['x-visitor-token'];

        // If a visitor doesn't have a token header, return an empty array immediately 
        // without even querying the database!
        if (!token) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([])
            };
        }

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

        // Standard Node.js filtering: Strictly fetch rows WHERE visitor_token equals the token
        const { data, error } = await supabase
            .from('order_ledger')
            .select('name, message, genre, created_at')
            .eq('visitor_token', token) // <-- Hardcoded backend enforcement!
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};