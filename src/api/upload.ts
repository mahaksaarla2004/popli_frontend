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

    // 3. Upload directly to Cloudinary using Axios
    const resourceType = mediaType === 'raw' ? 'raw' : mediaType === 'video' ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const axios = require('axios').default;
    
    console.log(`[UPLOAD] Starting Cloudinary upload to ${uploadUrl}`);
    console.log(`[UPLOAD] Appending file: uri=${fileUri}, type=${type}, name=${filename}`);

    const uploadRes = await axios.post(uploadUrl, formData, {
      timeout: 30000, // 30 second timeout
      headers: {
        Accept: 'application/json',
        // Do NOT set Content-Type to multipart/form-data manually, let axios auto-generate the boundary
      },
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`[UPLOAD] Progress: ${percentCompleted}%`);
        }
      }
    });

    const data = uploadRes.data;
    if (!data || !data.secure_url) {
      throw new Error('Cloudinary upload failed: Missing secure_url in response');
    }

    console.log(`[UPLOAD] Success! URL: ${data.secure_url}`);
    return data.secure_url;
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error?.response?.data || error.message || error);
    throw new Error(error?.response?.data?.error?.message || error.message || 'Failed to upload file');
  }
};
