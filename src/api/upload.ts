import { Platform } from 'react-native';
import { apiClient } from './client';

export const uploadToCloudinary = async (fileUri: string, mediaType: 'image' | 'video' | 'raw', folder: string = 'general'): Promise<string> => {
  try {
    // 1. Get signature from backend
    const sigRes = await apiClient.get(`/upload/signature?folder=${folder}`);
    const { timestamp, signature, cloudName, apiKey } = sigRes.data;

    // 2. Prepare FormData
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || `upload_${Date.now()}`;
    const type = mediaType === 'image' ? 'image/jpeg' : mediaType === 'video' ? 'video/mp4' : 'audio/m4a';

    formData.append('file', {
      uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
      name: filename,
      type,
    } as any);

    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    // 3. Upload directly to Cloudinary
    const resourceType = mediaType === 'raw' ? 'raw' : mediaType === 'video' ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
