const { OpenAI } = require('openai');

const openai = new OpenAI(
    {
        apiKey: process.env.OPEN_AI_API_KEY,
    }
);

const generateContent = async (invoice) => {

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "The following is an invoice. Parse it in JSON format. I only want the items array, no other information."
                },
                {
                    role: "user",
                    content: invoice
                }
            ],
        });
        return response.data.choices[0].message.content;

    } catch (error) {
        console.error(error);
    }
};

module.exports = { generateContent };