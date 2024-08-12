const express = require("express");
require('dotenv').config();
const path = require("path");
const cors = require("cors");
const pdfParse = require('pdf-parse');
const { generateContent: generateLlamaContent } = require('./utils/llama_model');
const { generateContent: generateGeminiContent } = require('./utils/gemini_model');
const { generateContent: generateOpenAIContent } = require('./utils/open_ai_model');
const sampleInvoiceJSON = require('./data/invoice.json');
const multer = require('multer');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
const upload = multer({
    storage: multer.memoryStorage()
});

app.use(express.json());

app.get('/ping', (req, res) => {
    res.json(sampleInvoiceJSON);
});

app.post('/upload', upload.single('invoice'), async (req, res) => {

    // return setTimeout(() => {
    //     res.json(sampleInvoiceJSON);
    // }, 1000);

    try {
        const dataBuffer = req?.file?.buffer;
        if (dataBuffer) {
            const pdfData = await pdfParse(dataBuffer);
            let pdfText = pdfData.text;
            // return res.json({ text: pdfText });
            const rawResponse = await generateGeminiContent(pdfText);
            if (rawResponse) {
                const response = await generateLlamaContent(rawResponse);
                response.model = 'parsed by Gemini, processed by Llama';
                res.json(response);
            } else {
                const response = await generateLlamaContent(pdfText);
                response.model = 'parsed and processed by Llama';
                res.json(response);
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});


app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
    console.clear();
    console.log(`Server running on port ${PORT}`);
});
