chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchGroq") {
    const { apiKey, word, pageContext } = request;

    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              "You explain words and phrases clearly and concisely. No fluff, no markdown, plain text only.",
          },
          {
            role: "user",
            content: `The user selected: "${word}" on a webpage titled "${pageContext}". Explain in 2-3 short paragraphs: what it means in plain language, any nuance or common usage, and a practical example sentence.`,
          },
        ],
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(`HTTP ${res.status}: ${t}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        const text =
          data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content;
        if (text) {
          sendResponse({ success: true, text: text });
        } else {
          sendResponse({
            success: false,
            error: "Empty: " + JSON.stringify(data).slice(0, 200),
          });
        }
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }

  if (request.action === "openSettings") {
    chrome.runtime.openOptionsPage();
  }
});
