const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// @route   POST /api/ai/symptom-checker
// @desc    Process patient symptoms offline via local Llama3
// @access  Private (Patient only)
const checkSymptoms = catchAsync(async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return sendError(res, 400, 'Please provide symptom descriptions.');
  }

  const prompt = `
You are a highly capable AI assistant utilized strictly for non-diagnostic medical screening. 
The patient reports the following symptoms: "${symptoms}"

Analyze the symptoms safely and provide localized possible conditions and basic recommendations.
You MUST format your ONLY response strictly as valid, raw JSON exactly matching the following schema.
Do NOT wrap the JSON in Markdown code blocks (like \`\`\`json). Provide ONLY the raw curly braces and strings.

{
  "conditions": ["Condition A", "Condition B"],
  "recommendation": "Your string of advice...",
  "disclaimer": "This is not a medical diagnosis. Please consult a doctor."
}
`;

  try {
    // Connect directly to local Ollama inference server mapping port 11434
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!response.ok) {
       return sendError(res, 503, 'Internal LLM inference engine offline or unreachable (Ollama).');
    }

    const data = await response.json();
    let rawJsonText = data.response.trim();

    // Fallback cleaner for Markdown blocks often injected by AI models incorrectly
    if (rawJsonText.startsWith('\`\`\`json')) {
      rawJsonText = rawJsonText.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '').trim();
    } else if (rawJsonText.startsWith('\`\`\`')) {
      rawJsonText = rawJsonText.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '').trim();
    }

    const aiResult = JSON.parse(rawJsonText);
    
    // Safety verification check enforcing requested payload string
    if (!aiResult.disclaimer || aiResult.disclaimer.length < 5) {
        aiResult.disclaimer = "This is not a medical diagnosis. Please consult a doctor.";
    }

    sendSuccess(res, 200, 'AI symptom analysis generated successfully', aiResult);
  } catch (err) {
    return sendError(res, 500, 'Local Llama3 engine fault: ' + err.message);
  }
});

module.exports = {
  checkSymptoms
};
