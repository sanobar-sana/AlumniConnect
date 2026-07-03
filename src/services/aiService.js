import { getGeminiModel } from '../config/gemini';

export const aiService = {
  /**
   * Generates career advice for a student based on their profile and an alumnus profile.
   */
  async generateCareerAdvice(studentProfile, alumniProfile) {
    const model = getGeminiModel('gemini-1.5-flash');
    if (!model) throw new Error('AI service is currently unavailable.');

    const prompt = `
      You are a professional career mentoring assistant for AlumniConnect, an alumni-student networking platform.
      
      Student Profile:
      - Name: ${studentProfile.name}
      - Major/Field: ${studentProfile.major}
      - Skills: ${studentProfile.skills?.join(', ') || 'Not specified'}
      - Goals: ${studentProfile.goals || 'Not specified'}
      
      Alumni Profile:
      - Name: ${alumniProfile.name}
      - Industry: ${alumniProfile.industry}
      - Job Title: ${alumniProfile.jobTitle}
      - Company: ${alumniProfile.company}
      - Skills: ${alumniProfile.skills?.join(', ') || 'Not specified'}
      
      Based on the profiles above, generate a personalized, actionable mentoring strategy and connection introduction message that the student can use to reach out to the alumnus. Highlight overlapping skills or fields, and suggest 3 smart questions the student could ask. Format the output with clear headings using markdown.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini career advice generation failed:', error);
      throw error;
    }
  },

  /**
   * Evaluates a resume text against a target job description.
   */
  async getResumeFeedback(resumeText, jobDescription) {
    const model = getGeminiModel('gemini-1.5-flash');
    if (!model) throw new Error('AI service is currently unavailable.');

    const prompt = `
      You are an expert ATS (Applicant Tracking System) optimizer and career coach.
      
      Target Job Description:
      ${jobDescription}
      
      Resume Content:
      ${resumeText}
      
      Please analyze the resume against the job description. Provide:
      1. An overall match percentage (estimate based on skills and experience matches).
      2. Missing keywords or skills that are prominent in the job description but not in the resume.
      3. Actionable improvements to wording or bullet points to make the resume stand out.
      4. Formatting or structure advice.
      
      Respond with structured, clean markdown.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini resume review failed:', error);
      throw error;
    }
  },

  /**
   * Custom assistant chat function to support user mentoring chat.
   */
  async sendMessageToAssistant(message, chatHistory = []) {
    const model = getGeminiModel('gemini-1.5-flash');
    if (!model) throw new Error('AI service is currently unavailable.');

    try {
      // Format chat history to Gemini SDK specifications
      const formattedHistory = chatHistory.map(item => ({
        role: item.sender === 'user' ? 'user' : 'model',
        parts: [{ text: item.text }]
      }));

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini assistant chat failed:', error);
      throw error;
    }
  }
};

export default aiService;
