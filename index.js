require('dotenv').config()

const express = require('express')
const { OpenAI } = require('openai')

const openai = new OpenAI()

const app = express()
const port = 3000
app.use(express.json())

const OPENAI_MODEL = 'gpt-3.5-turbo'
const OPENAI_TEMPERATURE = 1.0

app.post('/dinosaur', async (req, res) => {
	console.log(req.body)
	const keywords = req.body.map(x => x.toLowerCase())
	if (!Array.isArray(keywords)) {
		res.status(400).send('Pass an array of dinosaur\'s favorite food in body')
	}
	console.log('Generating dinosaur which likes:', keywords)

	// const namePrompt = `Suggest one name for a dinosaur based on ${keywords.join(', ')}`
	// const mottoPrompt = 'Also suggest a motto'
	const namePrompt = `Wymyśl jedną nazwę dla dinozaura z ${keywords.join(', ')}`
	const mottoPrompt = 'Zasugeruj także jego slogan'

	const messages = [
		// { role: 'system', content: systemMessage },
		{ role: 'user', content: namePrompt },
	];

	const nameResponse = await openai.chat.completions.create({
		model: OPENAI_MODEL,
		temperature: OPENAI_TEMPERATURE,
		max_tokens: 32,
		messages,
	})

	const name = nameResponse.choices[0].message.content;

	messages.push({
		role: 'assistant',
		content: name,
	})

	messages.push({
		role: 'user',
		content: mottoPrompt,
	})

	const mottoResponse = await openai.chat.completions.create({
		model: OPENAI_MODEL,
		temperature: OPENAI_TEMPERATURE,
		max_tokens: 256,
		messages: [
			...messages,
			{ role: 'user', content: mottoPrompt },
		],
	})

	const motto = mottoResponse.choices[0].message.content;
	messages.push({
		role: 'assistant',
		content: motto,
	})


	console.dir(messages, { depth: null })
	console.log('---')

	res.json({
		// messages,
		name: normalizeChatResponse(name).toUpperCase(),
		motto: normalizeChatResponse(motto),
	})
})

function normalizeChatResponse(inputString) {
	// Use a regular expression to match spaces and quote characters at the beginning and end of the string.
	const regex = /^[ \t\n\r'"]+|[ \t\n\r'"]+$/g;

	// Use the replace method to remove the matched characters.
	const trimmedString = inputString.replace(regex, '');

	return trimmedString.split('\n')[0];
}

app.listen(port, () => {
	console.log(`Ramax2Dino API listening on port ${port}`)
})
