// Note controller - src/controllers/NoteController.ts

import { Request, Response } from 'express';
import Note from '../models/Note';
import FileService from '../services/FileService';
import { ApiResponse, NoteData } from '../types/api';

class NoteController {  // Usunięto export class
  // API Methods
  public getAllNotesApi = async (req: Request, res: Response<ApiResponse<Note[]>>) => {
    try {
      const notes = await Note.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.json({ success: true, data: notes });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch notes' });
    }
  }

  public getNoteByIdApi = async (req: Request, res: Response<ApiResponse<Note>>) => {
    try {
      const note = await Note.findByPk(req.params.id);
      if (!note) {
        return res.status(404).json({ success: false, error: 'Note not found' });
      }
      res.json({ success: true, data: note });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch note' });
    }
  }

  public createNoteApi = async (req: Request, res: Response<ApiResponse<Note>>) => {
    try {
      const noteData: NoteData = {
        title: req.body.title,
        content: req.body.content
      };

      if (req.file) {
        noteData.filePath = await FileService.saveFile(
          `${Date.now()}-${req.file.originalname}`,
          req.file.buffer
        );
      }

      const note = await Note.create(noteData);
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create note' });
    }
  }

  public updateNoteApi = async (req: Request, res: Response<ApiResponse<Note>>) => {
    try {
      const note = await Note.findByPk(req.params.id);
      if (!note) {
        return res.status(404).json({ success: false, error: 'Note not found' });
      }

      const noteData: NoteData = {
        title: req.body.title,
        content: req.body.content,
        filePath: note.filePath
      };

      if (req.file) {
        if (noteData.filePath) {
          await FileService.deleteFile(noteData.filePath);
        }
        noteData.filePath = await FileService.saveFile(
          `${Date.now()}-${req.file.originalname}`,
          req.file.buffer
        );
      }

      await note.update(noteData);
      res.json({ success: true, data: note });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update note' });
    }
  }

  public deleteNoteApi = async (req: Request, res: Response<ApiResponse<null>>) => {
    try {
      const note = await Note.findByPk(req.params.id);
      if (!note) {
        return res.status(404).json({ success: false, error: 'Note not found' });
      }

      if (note.filePath) {
        await FileService.deleteFile(note.filePath);
      }

      await note.destroy();
      res.status(204).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete note' });
    }
  }

  // Web Methods
  public getAllNotes = async (req: Request, res: Response) => {
    try {
      const notes = await Note.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.render('notes/index', { 
        title: 'Notes',
        notes 
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).send('Error fetching notes');
    }
  }

  public createNote = async (req: Request, res: Response) => {
    try {
      console.log('Request body:', req.body);
      console.log('File:', req.file);

      const { title, content } = req.body;

      if (!title || !content) {
        console.log('Missing required fields');
        return res.status(400).send('Title and content are required');
      }

      let filePath: string | undefined;

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

      console.log('Created note:', note.toJSON());

      res.redirect('/notes');
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).send('Error creating note');
    }
  }

  public deleteNote = async (req: Request, res: Response) => {
    try {
      const note = await Note.findByPk(req.params.id);
      if (!note) {
        return res.status(404).send('Note not found');
      }

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

const noteController = new NoteController();
export default noteController;