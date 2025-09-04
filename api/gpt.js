const axios = require("axios");
const OpenAI = require("openai");
const openai = new OpenAI();

async function getMovieDetails(beschreibung) {
  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Du bist ein spezialisierter Assistent, der nur dazu da ist, Nutzern zu helfen, Filminformationen zu finden, basierend auf Titeln oder Beschreibungen. Bitte beschränke deine Antworten auf das Finden und Bestätigen von Filmtiteln und das Liefern spezifischer Film-Details. Es ist ganz wichtig, dass du den Filmtitel in Anführungsstrichen zurückgibst und nichts anderes in Anführungsstrichen. Es ist auch wichtig, dass du nicht einfach die Beschreibung wiederholst, sondern den Titel des Films nennst, den der Nutzer suchen könnte.",
      },
      {
        role: "user",
        content: `Es wird ein Filmtitel gesucht, der Anhand einer Nutzerbeschreibung gefunden werden muss. Die Beschreibung des Films oder möglicher Titel lautet: ${beschreibung}. Wenn du den Titel kennst, halte die Antwort kurz und gebe es in dem Format "Titel" an.`,
      },
    ],
    temperature: 0.2,
  });

  const botResponse = chatResponse.choices[0].message.content.trim();
  const titleRegex = /"([^"]+)"/;
  const titleMatch = botResponse.match(titleRegex);

  if (titleMatch && titleMatch[1]) {
    const filmTitle = titleMatch[1].trim();
    const movieResponse = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${
        process.env.TMDB_API_KEY
      }&language=de-DE&query=${encodeURIComponent(filmTitle)}`
    );
    if (movieResponse.data.results.length > 0) {
      const movieData = movieResponse.data.results[0];
      return { movieData };
    } else {
      return {
        movieData: { title: "Es gibt keinen Film zu diesem Titel." },
      };
    }
  }
}

async function getMovieDetailsByTitle(titel) {
  const titleRegex = /"([^"]+)"/;
  const titleMatch = titel.match(titleRegex);

  if (titleMatch && titleMatch[1]) {
    const filmTitle = titleMatch[1].trim();
    const movieResponse = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${
        process.env.TMDB_API_KEY
      }&language=de-DE&query=${encodeURIComponent(filmTitle)}`
    );
    if (movieResponse.data.results.length > 0) {
      const movieData = movieResponse.data.results[0];
      return { movieData };
    } else {
      return {
        movieData: { title: "Es gibt keinen Film zu diesem Titel." },
      };
    }
  }
}

async function getMovieRecommendations(genre) {
  const message = genre
    ? `Ich hätte gerne Filmempfehlungen im Genre ${genre}.`
    : "Ich hätte gerne Filmempfehlungen.";

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Du bist ein spezialisierter Assistent, der nur dazu da ist, Nutzern zu helfen, Filmempfehlungen zu finden. Bitte beschränke deine Antworten auf das Finden von Filmempfehlungen. Optional kann der Nutzer ein Genre angeben, welches du berücksichtigen kannst. Wenn kein Genre angegeben wurde, gib eine allgemeine Liste an Filmen zurück. Halte deine Antwort kurz und knackig.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.7, // Höhere Temperatur für mehr Vielfalt in den Empfehlungen
  });

  return chatResponse.choices[0].message.content;
}

async function getJoke() {
  const jokeResponse = await axios.get(
    "https://witzapi.de/api/joke/?limit=1&category=flachwitze&language=de"
  );
  return jokeResponse.data[0].text;
}

async function runConversation(userInput) {
  const messages = [
    {
      role: "system",
      content:
        "Sie sind ein Film-Assistent namens Matchy, der darauf spezialisiert ist, Informationen basierend auf der Beschreibungen des Nutzers zu identifizieren und dadurch den richtigen Filmtitel herauszufinden. Zusätzlich sollst du Filmempfehlungen zur Verfügung stellen. Bitte beschränken Sie Ihre Antworten auf das Finden und Bestätigen von Filmtiteln und das Liefern von Filmempfehlungen. Verwende keine Sternchen (**) für fettgedruckten Text. Wenn ein gesuchter Film gefunden wurde, geben Sie das Poster nicht mit an. Zur Unterhaltung kannst du auch Witze erzählen.",
    },
    ...userInput,
  ];

  const tools = [
    {
      type: "function",
      function: {
        name: "get_movie_title",
        description:
          "Finde den Filmtitel basierend auf der Beschreibung des Nutzers heraus. Es gibt auch weitere Anhaltspunkte, wie das Genre, Schauspieler, Veröffentlichungsjahr oder Zeitraum.",
        parameters: {
          type: "object",
          properties: {
            beschreibung: {
              type: "string",
              description:
                "Die Beschreibung des Nutzers über den Film welcher gesucht wird.",
            },
          },
          required: ["beschreibung"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_movie_recommendations",
        description:
          "Gebe dem Nutzer eine Liste an Filmempfehlungen zurück. Der Nutzer kann optional nach einem bestimmten Genre fragen.",
        parameters: {
          type: "object",
          properties: {
            genre: {
              type: "string",
              description:
                "Das Genre, was der Nutzer in seiner Anfrage angegeben hat. Wenn kein Genre angegeben wurde, wird eine allgemeine Liste an Filmen zurückgegeben.",
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_joke",
        description: "Erhalte einen Witz, um den Nutzer zu unterhalten.",
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools,
    temperature: 0.1,
    tool_choice: "auto",
  });

  const responseMessage = response.choices[0].message;
  let finalResponse = {};

  if (responseMessage.tool_calls) {
    const toolCalls = responseMessage.tool_calls;
    const availableFunctions = {
      get_movie_title: getMovieDetails,
      get_movie_recommendations: getMovieRecommendations,
      get_joke: getJoke,
    };

    let lastMovieData = null;
    let beschreibung = "";
    let functionNameGlobal = "";

    messages.push(responseMessage);
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);

      let functionResponse = {};
      functionNameGlobal = functionName;
      if (functionName === "get_movie_title") {
        beschreibung = functionArgs.beschreibung; // Speichern der Beschreibung für erneute Versuche
        titel = functionArgs.titel;
        functionResponse = await getMovieDetails(beschreibung, titel);
      } else if (functionName === "get_movie_recommendations") {
        functionResponse = await functionToCall(functionArgs.genre);
      } else if (functionName === "get_joke") {
        functionResponse = await getJoke();
      }

      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: JSON.stringify(functionResponse),
      });

      if (functionName === "get_movie_title") {
        lastMovieData = functionResponse.movieData;
      }
    }

    // Überprüfung, ob der Benutzer die gefundenen Informationen ablehnt
    const secondResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
    });

    if (functionNameGlobal === "get_movie_title" && !lastMovieData.id) {
      const chatResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein spezialisierter Assistent, der nur dazu da ist, Nutzern zu helfen, Filminformationen zu finden, basierend auf Titeln oder Beschreibungen. Du erhälst eine Beschreibung eines Films und sollst den Titel herausfiltern. Es ist ganz wichtig, dass du den Filmtitel in Anführungsstrichen zurückgibst und nichts anderes in Anführungsstrichen. ",
          },
          {
            role: "user",
            content: `Es wird ein Filmtitel gesucht, der Anhand einer Nutzerbeschreibung gefunden werden muss. Die Beschreibung des Films oder möglicher Titel lautet: ${secondResponse.choices[0].message.content}. Wenn du den Titel kennst, halte die Antwort kurz und gebe es in dem Format "Titel" an.`,
          },
        ],
        temperature: 0.2,
      });
      functionResponse = await getMovieDetailsByTitle(
        chatResponse.choices[0].message.content.trim()
      );
      lastMovieData = functionResponse.movieData;
    }

    finalResponse.messages = secondResponse.choices[0].message.content;
    finalResponse.movieData = lastMovieData;
    return finalResponse;
  } else {
    return { messages: response.choices[0].message.content };
  }
}

module.exports = runConversation;
