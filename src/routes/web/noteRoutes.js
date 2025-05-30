const express = require('express');
const NoteController = require('../../controllers/NoteController');
const router = express.Router();

router.use((req, res, next) => {
  console.log(`Note route: ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/', NoteController.getAllNotes);

// Apply the upload middleware to the create route
router.post('/', NoteController.uploadMiddleware, NoteController.createNote);

router.post('/:id/delete', NoteController.deleteNote);

module.exports = router;