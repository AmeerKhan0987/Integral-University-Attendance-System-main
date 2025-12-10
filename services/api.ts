import axios from 'axios';

export const api = axios.create({
  baseURL: "http://localhost/zaphira-backend/api",
  headers: { "Content-Type": "application/json" }
});


export const uploadImage = async (imageBase64: string) => {
  try {
    // Validate base64 string
    if (!imageBase64.match(/^data:image\/(jpeg|png);base64,/)) {
      throw new Error('Invalid image format');
    }

    return imageBase64.split(',')[1];
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};