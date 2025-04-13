export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  export interface NoteData {
    title: string;
    content: string;
    filePath?: string;
  }