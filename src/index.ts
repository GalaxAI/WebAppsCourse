// Main application entry point - src/index.ts

import express, { Express, Request, Response } from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express application
const app: Express = express();

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Define port
const port = process.env.PORT || 3000;

// Basic route with template rendering
app.get('/', (req: Request, res: Response) => {
  try {
    const viewData = {
      title: 'Homepage',
      message: 'Welcome to our application!',
      items: ['Item 1', 'Item 2', 'Item 3']
    };
    
    res.render('index', viewData);
  } catch (error) {
    console.error('Error rendering view:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Handle 404
app.use((req: Request, res: Response) => {
  res.status(404).render('404', { title: '404: Page Not Found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Views directory: ${path.join(__dirname, 'views')}`);
});