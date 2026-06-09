//Chat service fro OpenAi
// talking to openAi
// questions -> send to openai -> openAI answers-> send back to user



const getMockResponse = (userQuestion) => {
    // LOWERCASE question convertion
    const question = userQuestion.toLowerCase();
    if (question.includes('balance')) {
        return "your current balance is 1,000.00 Euros";
    }
    if (question.includes('hello') || question.includes('hi') ||
        question.includes('hey')) {
        return "Hey i am your assistant , what can i help you? "
            ;
    }
    // default response for not found
    return "I received : " + userQuestion + "' .Please set up your OPENAI_Key in your .env file to get real AI answers";



}

//CORE QUESTION FUCTION sETUP
const askAi = async (systemPrompt, userQuestion) => {
    //read the secret key from the environment

    const apiKey = process.env.OPENAI_API_KEY;

    //saftey checkfor the key thata doesnt exist

    if (!apiKey) {
        console.warn("OPENAI_API_KEY is missing, Using simulator ")
        return getMockResponse(userQuestion)
    }

    try {
        // 1. The target URL Address we found in Stage 1
        const url = "https://api.openai.com/v1/chat/completions";

        // 2. Send the envelope over the internet using fetch
        const response = await fetch(url, {
            method: 'POST', // The HTTP method we found in Stage 1
            headers: {
                'Content-Type': 'application/json',          // We tell the server we are sending JSON text
                'Authorization': `Bearer ${apiKey}`        // 🔑 We pass our key safely in the headers
            },
            // 3. Translate our JavaScript payload object into a text string
            body: JSON.stringify({
                model: "gpt-4o-mini", // The model name we researched in Stage 1
                messages: [
                    { role: "system", content: systemPrompt }, // The bank context data
                    { role: "user", content: userQuestion }    // The user's typed chat question
                ]
            })
        });

        // 4. If the server returned an error code (like 401 or 500), throw an error to trigger our catch safety block
        if (!response.ok) {
            throw new Error(`OpenAI API returned status code: ${response.status}`);
        }

        // 5. Translate the returned raw text back into a JavaScript Object
        const data = await response.json();

        // 6. Return the text reply from inside OpenAI's specific nested JSON path
        return data.choices[0].message.content;

    }
    catch (error) {
    // if any thing indide try to block
    console.error("API Call failed:", error);
    return getMockResponse(userQuestion);
}

}


module.exports = { askAi };