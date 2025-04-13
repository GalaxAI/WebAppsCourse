import express from 'express';
import multer from 'multer';
import NoteController from '../../controllers/NoteController';  // Zmiana importu

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

// Web routes (rendering views)
router.get('/', NoteController.getAllNotes);              // GET /notes
router.post('/', upload.single('file'), NoteController.createNote); // POST /notes
router.post('/:id/delete', NoteController.deleteNote);   // POST /notes/:id/delete

export default router;