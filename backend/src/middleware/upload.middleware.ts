import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

// Ensure upload directories exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const documentsDir = path.join(uploadsDir, 'documents');
const avatarsDir = path.join(uploadsDir, 'avatars');

[uploadsDir, documentsDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for documents
const documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, documentsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// File filter for documents
const documentFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
  }
};

// File filter for avatars
const avatarFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG and PNG images are allowed.'));
  }
};

// Export multer instances
export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

// Helper function to get full file URL
export const getFileUrl = (filename: string, type: 'document' | 'avatar'): string => {
  const baseUrl = process.env.API_URL || 'http://localhost:4000';
  const directory = type === 'document' ? 'documents' : 'avatars';
  return `${baseUrl}/uploads/${directory}/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filepath: string): void => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

