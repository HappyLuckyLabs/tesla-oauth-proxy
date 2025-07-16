const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0vx8nDMGHfEbMNVQCEqJ
OgGHmGhiVQfMjKhcnL5fFhPQzRf/J4tPKXqhKJ+xJP0XqzNP3u1uQ+/JKKGzJ1nB
8wNqfZqHzZzFJJlFJQrGxIoqJoQcYxuVVOCBUvhSKM4d1PsP4fMgXQxJ2oEv5wgN
V2nGNvOYRILCkKAGJmYNJgPjCCdDYJ3TdGNEGhXaD4hCGdMuXpM6ZVOITdgZCXH2
JH5EpjzKmQzfIYxOmQvGhAHTxRRjsEDzIUfLJNsWBYGnJpNIqtQxdJqRqBQHnJhI
LgqNBYAyGkKgwKRN9qNqkJQNLnDqZAGHJgvjE0vGdXJM0qCHpXaJqiSXOUMGLUqC
MBMLtVxLOQNhNPfLPxcYRUZSFQIDAQAB
-----END PUBLIC KEY-----`;

// Health check
app.get('/', (req, res) => {
  res.send('Tesla OAuth Proxy is running!');
});

// Public key endpoint (required by Tesla)
app.get('/.well-known/appspecific/com.tesla.3p.public-key.pem', (req, res) => {
  console.log('Public key requested');
  res.set('Content-Type', 'application/x-pem-file');
  res.send(PUBLIC_KEY);
});

// Tesla OAuth callback endpoint
app.get('/auth/tesla/callback', (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.send(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
          <h1>Authentication Error</h1>
          <p>${error}</p>
          <script>
            setTimeout(() => {
              window.location.href = 'teslahealth://oauth?error=${encodeURIComponent(error)}';
            }, 2000);
          </script>
        </body>
      </html>
    `);
  }

  if (code) {
    res.send(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
          <h1>✅ Tesla Authentication Successful!</h1>
          <p>Redirecting back to your app...</p>
          <p><strong>If the app doesn't open automatically, tap the button below:</strong></p>
          <button onclick="openApp()" style="background: #007AFF; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; margin-top: 20px;">
            Open Tesla Vehicle Health App
          </button>
          
          <script>
            function openApp() {
              window.location.href = 'teslahealth://oauth?code=${code}';
            }
            
            // Auto-redirect after 2 seconds
            setTimeout(openApp, 2000);
          </script>
        </body>
      </html>
    `);
  } else {
    res.send('<h1>No code or error received</h1>');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OAuth proxy running on port ${PORT}`);
});