import * as FileSystem from 'expo-file-system';

/**
 * Converts an image URI to a base64 string
 * @param uri The local URI of the image
 * @returns A Promise that resolves to the base64 string of the image
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    // Check if the URI is valid
    if (!uri || !uri.startsWith('file://')) {
      throw new Error('Invalid image URI');
    }

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Get the file extension
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Return the base64 string with the appropriate data URI prefix
    return `data:image/${extension === 'jpg' ? 'jpeg' : extension};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};
