import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const processCommand = async (command: string) => {
  try {
    const response = await API.post('/jarvis/process', { command });
    return response.data;
  } catch (error) {
    console.error('Error processing command:', error);
    return { response: "Sorry, I couldn't process that command", action: null };
  }
};
