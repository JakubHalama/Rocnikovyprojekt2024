console.log('Starting server...');

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
console.log('Serving static files...');

wss.on('connection', (ws) => {
  console.log('Nový klient připojen');
  
  ws.on('message', (message) => {
    console.log(`Přijatá zpráva: ${message}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Klient odpojen');
  });
});

server.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
