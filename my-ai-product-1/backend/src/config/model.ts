import { ollama } from 'ai-sdk-ollama';
//const MODEL_NAME = 'llama3.2:1b'; 
const MODEL_NAME = 'llama3.2:3b'

export const model = ollama(MODEL_NAME);