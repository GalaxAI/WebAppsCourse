const Note = require('../models/Note');

// In-memory fallback for when database is unavailable
let inMemoryNotes = [];
let dbAvailable = true;

// Check database connection
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

// Initial check
checkDbConnection();

const NoteController = {
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
      console.log('Creating note with data:', req.body);
      
      const title = req.body.title;
      const content = req.body.content;
      
      if (!title || !content) {
        return res.status(400).send('Title and content are required');
      }
      
      let note;
      
      if (dbAvailable) {
        try {
          note = await Note.create({ title, content });
        } catch (error) {
          console.error('Database error when creating note:', error);
          await checkDbConnection();
          
          // Fallback to in-memory if database fails
          note = { 
            id: Date.now(),
            title, 
            content,
            createdAt: new Date()
          };
          inMemoryNotes.unshift(note);
        }
      } else {
        // Use in-memory storage
        note = { 
          id: Date.now(),
          title, 
          content,
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
      console.log(`Deleting note with ID: ${noteId}`);
      
      if (dbAvailable) {
        try {
          // Find the note by ID
          const note = await Note.findByPk(noteId);
          
          if (note) {
            // Delete the note
            await note.destroy();
          }
        } catch (error) {
          console.error('Database error when deleting note:', error);
          await checkDbConnection();
          // Fallback to in-memory if database fails
          inMemoryNotes = inMemoryNotes.filter(note => note.id !== parseInt(noteId));
        }
      } else {
        // Use in-memory storage
        inMemoryNotes = inMemoryNotes.filter(note => note.id !== parseInt(noteId));
      }
      
      return res.redirect('/p16/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      return res.status(500).send('Error deleting note');
    }
  }
};

module.exports = NoteController;