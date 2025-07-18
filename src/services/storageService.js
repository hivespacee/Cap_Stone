import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

export const uploadImage = async (file, userId) => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `images/${userId}/${fileName}`;
  
  return await uploadFile(file, path);
};

export const uploadDocument = async (file, userId) => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `documents/${userId}/${fileName}`;
  
  return await uploadFile(file, path);
};