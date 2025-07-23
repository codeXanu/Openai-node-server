import { createServer } from 'node:http'
import { OpenAI } from 'openai'
import { config } from 'dotenv';

config();


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const allowedOrigins = [
    'http://localhost:5173',
    'https://pollyglot-translator.vercel.app'
  ];

const server = createServer( async(req, res) => {
    const origin = req.headers.origin;

    if(allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // res.setHeader('Access-Control-Allow-Origin', '*');
        // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.writeHead(204);
        res.end();
        return;
    }
    if (req.url === "/api/chat" && req.method === "POST"){
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
        
        try {
            const prompt = JSON.parse(body);
            // console.log(prompt);

            const completion = await client.chat.completions.create({
                model: "o3-mini",
                messages: [
                    {role: "system", content: `You are an advanced language translation assistant. Your primary functions are:

                        1. Detect the source language of the user's input text
                        2. Translate the input text to the target language specified by the user
                        3. If no target language is specified, identify the source language and ask for the desired target language

                        When responding:
                        - Provide an accurate translation to the requested target language
                        - Maintain the original meaning, tone, and context of the message
                        - Do not give which language it was in response
                        - Give only translated text in reply.
                        `},

                    {role:"user", content: `" ${prompt.message} " to ${prompt.language}`}
                ],
                
            })

            const reply = completion.choices[0].message.content ;
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200;
            res.end(JSON.stringify({reply}))

        } catch (error) {
            console.error("Error:", error.message)
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Something went wrong." }));
        } 
    })
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
    }
})




const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});