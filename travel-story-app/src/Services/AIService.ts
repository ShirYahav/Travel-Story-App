import axios from 'axios';
import config from '../Utils/Config';

export async function generateFacebookPost(prompt: string): Promise<string> {
  try {
    const response = await axios.post(config.generateStoryPost, {
      prompt,
    });
    return response.data.post; 
  } catch (error) {
    console.error("Failed to generate post content:", error);
    throw new Error("Failed to generate post content.");
  }
}

