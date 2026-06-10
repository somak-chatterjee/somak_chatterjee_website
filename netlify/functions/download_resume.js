const { createClient } = require('@supabase/supabase-js');

// This is the backend API endpoint handler
exports.handler = async (event, context) => {
    try {
        // 1. Grab your secret cloud keys securely from the Netlify environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

        // 2. Initialize your secure backend Supabase connection
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 3. Fetch the resume PDF directly from your private 'resumes' bucket
        const { data, error } = await supabase.storage
            .from('resumes')
            .download('ResumeSomak2.pdf');

        // Handle cloud bucket download issues
        if (error) {
            console.error('Supabase Storage Error:', error);
            return { statusCode: 500, body: JSON.stringify({ error: 'Failed to retrieve file from storage vault.' }) };
        }

        // 4. Convert the downloaded file binary data into a Buffer string format
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 5. Send the file straight to the user's browser with native PDF file download headers
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="ResumeSomak2.pdf"',
            },
            body: buffer.toString('base64'), // Sends file securely as a base64 data string
            isBase64Encoded: true,
        };

    } catch (err) {
        console.error('System Server Error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error occurred.' }),
        };
    }
};