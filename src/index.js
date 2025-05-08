const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

const apiNoteRoutes = require('./routes/api/noteRoutes');
const webNoteRoutes = require('./routes/web/noteRoutes');
const sequelize = require('./config/database');

dotenv.config();

const app = express();

app.use('/p16', express.static(path.join(__dirname, 'public')));
// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');

  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' http:; " +
    "style-src 'self' 'unsafe-inline' http://fonts.googleapis.com; " +
    "font-src 'self' http://fonts.gstatic.com; " +
    "script-src 'self' 'unsafe-inline' http:; " +
    "img-src 'self' data: http:; " +
    "connect-src 'self' http:; " +
    "form-action 'self' http:;"
  );
  next();
});

let inlineCSS = '';
try {
  inlineCSS = fs.readFileSync(path.join(__dirname, '../public/css/style.css'), 'utf8');
} catch (error) {
  console.error('Error reading CSS file:', error);
  inlineCSS = '/* CSS could not be loaded */';
}

app.use((req, res, next) => {
  res.locals.inlineCSS = inlineCSS;
  res.locals.title = 'Notes App';
  next();
});

app.use('/notes', webNoteRoutes);
app.use('/api/notes', apiNoteRoutes);

// Root route
app.get('/', (req, res) => {
  res.redirect('/p16/notes');
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
    hostname: req.hostname,
    ip: req.ip,
    headers: req.headers,
    env: process.env
  });
});

// Routes debug endpoint
app.get('/routes-debug', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            baseUrl: middleware.regexp.toString(),
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Something broke!');
});

app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).render('404', { title: '404: Page Not Found' });
});

const initializeApp = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Warning: Database connection failed:', error);
    console.log('The application will continue without database functionality.');
  }

  // Get port from environment variable
  const port = process.env.PORT || 3000;
  
  // Start server
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Views directory: ${path.join(__dirname, 'views')}`);
  });
};

initializeApp();
