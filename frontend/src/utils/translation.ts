export async function multiLingual(language:string, text:string): Promise<string> {
  try {
    const response = await fetch(`https://database-tval.onrender.com/${language.toLowerCase()}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    });
    const data = await response.json();
    return data["Translation"];
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original text
  }
}