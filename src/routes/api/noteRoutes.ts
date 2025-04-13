import express from 'express';
import multer from 'multer';
import noteController from '../../controllers/NoteController';  // Zmiana importu

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// REST API endpoints
router.get('/', noteController.getAllNotesApi);           
router.get('/:id', noteController.getNoteByIdApi);       
router.post('/', upload.single('file'), noteController.createNoteApi); 
router.put('/:id', upload.single('file'), noteController.updateNoteApi); 
router.delete('/:id', noteController.deleteNoteApi);     

export default router;