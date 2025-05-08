const Note = require('../models/Note');
const upload = require('../config/upload');
const fs = require('fs');
const path = require('path');

let inMemoryNotes = [];
let dbAvailable = true;

const checkDbConnection = async () => {
  try {
    await Note.findAll({ limit: 1 });
    dbAvailable = true;
    return true;
  } catch (error) {
    dbAvailable = false;
    console.warn('Database unavailable, using in-memory storage');
    return false;
  }
};

checkDbConnection();

const NoteController = {
  uploadMiddleware: upload.single('attachment'),

  getAllNotes: async (req, res) => {
    try {
      console.log('Handling getAllNotes request');
      let notes = [];
      
      if (dbAvailable) {
        try {
          notes = await Note.findAll({
            order: [['createdAt', 'DESC']]
          });
        } catch (error) {
          console.error('Error fetching from database:', error);
          await checkDbConnection();
          notes = inMemoryNotes;
        }
      } else {
        notes = inMemoryNotes;
      }
      
      return res.render('notes/index', {
        title: 'Notes',
        notes: notes
      });
    } catch (error) {
      console.error('Error in getAllNotes:', error);
      return res.status(500).send('Error fetching notes');
    }
  },
  
  createNote: async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).send('Title and content are required');
      }
      
      const noteData = {
        title,
        content,
        filePath: req.file ? `/p16/uploads/${req.file.filename}` : null
      };

      let note;
      if (dbAvailable) {
        try {
          note = await Note.create(noteData);
        } catch (error) {
          console.error('Database error when creating note:', error);
          await checkDbConnection();
          note = { 
            id: Date.now(),
            ...noteData,
            createdAt: new Date()
          };
          inMemoryNotes.unshift(note);
        }
      } else {
        note = { 
          id: Date.now(),
          ...noteData,
          createdAt: new Date()
        };
        inMemoryNotes.unshift(note);
      }
      
      return res.redirect('/p16/notes');
    } catch (error) {
      console.error('Error creating note:', error);
      return res.status(500).send('Error creating note');
    }
  },
  
  deleteNote: async (req, res) => {
    try {
      const noteId = req.params.id;
      
      if (dbAvailable) {
        try {
          const note = await Note.findByPk(noteId);

          if (!note) {
            return res.status(404).send('Note not found');
          }

          if (note.filePath) {
            const filePath = path.join(__dirname, '../../public', note.filePath.replace('/p16', ''));
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }

          await note.destroy();
        } catch (error) {
          console.error('Database error when deleting note:', error);
          await checkDbConnection();
          inMemoryNotes = inMemoryNotes.filter(note => {
            if (note.id === parseInt(noteId) && note.filePath) {
              const filePath = path.join(__dirname, '../../public', note.filePath.replace('/p16', ''));
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
            return note.id !== parseInt(noteId);
          });
        }
      } else {
        inMemoryNotes = inMemoryNotes.filter(note => {
          if (note.id === parseInt(noteId) && note.filePath) {
            const filePath = path.join(__dirname, '../../public', note.filePath.replace('/p16', ''));
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
          return note.id !== parseInt(noteId);
        });
      }
      
      return res.redirect('/p16/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      return res.status(500).send('Error deleting note');
    }
  }
};

module.exports = NoteController;