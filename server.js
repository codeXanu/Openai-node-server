import { createServer } from 'node:http'
import { OpenAI } from 'openai'
import { config } from 'dotenv';

config();


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const server = createServer( async(req, res) => {
    if (req.url === "/api/chat" && req.method === "POST"){
        
        try {
            const completion = await client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {role: "system", content: `You are an advanced language translation assistant. Your primary functions are:

                        1. Detect the source language of the user's input text
                        2. Translate the input text to the target language specified by the user
                        3. If no target language is specified, identify the source language and ask for the desired target language

                        When responding:
                        - First identify the source language of the provided text
                        - Provide an accurate translation to the requested target language
                        - Maintain the original meaning, tone, and context of the message
                        - Do not give which language it was in response
                        `},

                    {role:"user", content: "'¡Hola, ¿cómo estás?' to English"}
                ],
                
            })
            const reply = completion.choices[0].message.content ;
            res.writeHead(200, {"Content-Type": "application/json"})
            res.end(JSON.stringify(reply))

        } catch (error) {
            console.error("Error:", error.message)
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Something went wrong." }));
        } 
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
    }
})




const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});