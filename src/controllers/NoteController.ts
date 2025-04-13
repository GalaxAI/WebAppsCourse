// Note controller - src/controllers/NoteController.ts

import { Request, Response } from 'express';
import Note from '../models/Note';
import FileService from '../services/FileService.ts';
import path from 'path';

export class NoteController {
  async getAllNotes(req: Request, res: Response) {
    try {
      const notes = await Note.findAll();
      res.render('notes/index', { 
        title: 'Notes',
        notes 
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).send('Error fetching notes');
    }
  }

  async createNote(req: Request, res: Response) {
    try {
      console.log('Request body:', req.body); // Debugging
      console.log('File:', req.file); // Debugging

      const { title, content } = req.body;

      // Validation
      if (!title || !content) {
        console.log('Missing required fields');
        return res.status(400).send('Title and content are required');
      }

      let filePath: string | undefined;

      // Handle file upload if exists
      if (req.file) {
        filePath = await FileService.saveFile(
          `${Date.now()}-${req.file.originalname}`,
          req.file.buffer
        );
      }

      const note = await Note.create({
        title: title.trim(),
        content: content.trim(),
        filePath
      });

      console.log('Created note:', note.toJSON()); // Debugging

      res.redirect('/notes');
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).send('Error creating note');
    }
  }

  async deleteNote(req: Request, res: Response) {
    try {
      const note = await Note.findByPk(req.params.id);
      if (!note) {
        return res.status(404).send('Note not found');
      }

      // Delete associated file if exists
      if (note.filePath) {
        await FileService.deleteFile(note.filePath);
      }

      await note.destroy();
      res.redirect('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).send('Error deleting note');
    }
  }
}

export default new NoteController();