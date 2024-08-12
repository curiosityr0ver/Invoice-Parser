const { GoogleGenerativeAI } = require('@google/generative-ai');
const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');


const ItemSchema = z.array(z.object({
    item: z.string(),
    price: z.number(),
    quantity: z.number(),
    total_amount: z.number()
}));

const schema = zodToJsonSchema(ItemSchema, 'Invoice');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        "responseMimeType": "application/json"
    }
});


const generateContent = async (invoice) => {

    try {
        const result = await model.generateContent(`The following is an invoice. Strictly parse it in JSON with the following entities: customer-details, items and final_amount. ${invoice}`);
        console.log(result.response);
        const response = result.response.text();
        return JSON.parse(response);
    } catch (error) {
        console.error(error);
    }
};

module.exports = { generateContent };