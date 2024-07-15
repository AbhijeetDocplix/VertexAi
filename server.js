const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const vertexAI = new VertexAI({ project: 'medllm-test', location: 'us-central1' });
const model = 'gemini-1.5-flash-001';

const generativeModel = vertexAI.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 1,
    topP: 0.95,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
});

app.post('/generate-content', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const streamingResp = await generativeModel.generateContentStream(requestBody);
    let responseText = '';

    for await (const item of streamingResp.stream) {
      responseText += JSON.stringify(item);
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
