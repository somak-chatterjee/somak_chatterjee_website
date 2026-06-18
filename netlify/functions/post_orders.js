const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    // Only allow POST requests to submit data
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
        
        // Parse incoming data sent from frontend form
        const { name, message, genre, visitor_token} = JSON.parse(event.body);

        // Basic validation check
        if (!name || !message) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Name and message are required.' }) };
        }

        // Insert row into database
        const { data, error } = await supabase
            .from('order_ledger')
            .insert([{ name, message, genre, visitor_token: visitor_token}]);

        if (error) throw error;

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Station log updated successfully!' }),
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};