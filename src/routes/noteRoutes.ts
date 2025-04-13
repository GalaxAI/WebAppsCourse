import express from 'express';
import multer from 'multer';
import NoteController from '../controllers/NoteController';

const router = express.Router();

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Routes
router.get('/', NoteController.getAllNotes);
router.post('/', upload.single('file'), NoteController.createNote);
router.post('/:id', NoteController.deleteNote);

export default router;