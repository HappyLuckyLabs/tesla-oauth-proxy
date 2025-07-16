const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Tesla OAuth Proxy is running!');
});

// Tesla OAuth callback endpoint
app.get('/auth/tesla/callback', (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.send(`
      <html>
        <body>
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
        <body>
          <h1>✅ Tesla Authentication Successful!</h1>
          <p>Redirecting back to your app...</p>
          <script>
            setTimeout(() => {
              window.location.href = 'teslahealth://oauth?code=${code}';
            }, 2000);
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