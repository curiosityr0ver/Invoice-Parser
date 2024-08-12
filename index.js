const express = require("express");
require('dotenv').config();
const path = require("path");
const pdfParse = require('pdf-parse');
const { generateContent: generateLlamaContent } = require('./utils/llama_model');
const { generateContent: generateGeminiContent } = require('./utils/gemini_model');
const { generateContent: generateOpenAIContent } = require('./utils/open_ai_model');
const sampleInvoiceJSON = require('./data/invoice.json');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({
    storage: multer.memoryStorage()
});

app.use(express.json());

app.get('/ping', (req, res) => {
    res.json(sampleInvoiceJSON);
});

app.post('/upload', upload.single('invoice'), async (req, res) => {

    setTimeout(() => {
        return res.json(sampleInvoiceJSON);
    }, 3000);

    let pdfText;
    try {
        const dataBuffer = req?.file?.buffer;
        if (dataBuffer) {
            const pdfData = await pdfParse(dataBuffer);
            pdfText = pdfData.text;
            // return res.json({ text: pdfText });
            const rawResponse = await generateGeminiContent(pdfText);
            const response = await generateLlamaContent(rawResponse);
            res.json(response);
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


app.listen(port, () => {
    console.clear();
    console.log(`Server running on port ${port}`);
});
