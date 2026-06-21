import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));

// Allow all origins in development
app.use(cors({ origin: '*', credentials: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart Faculty Navigation API',
    university: 'Kwara State University, Malete',
    faculty: 'Faculty of Engineering & Technology',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'KWASU Smart Nav Live Service',
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'location_update') {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'peer_location',
              payload: msg.payload,
            }));
          }
        });
      }
      ws.send(JSON.stringify({ type: 'ack', ts: Date.now() }));
    } catch (e) {
      console.error('WS error:', e);
    }
  });

  ws.on('close', () => console.log('🔌 Client disconnected'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🎓 Smart Faculty Navigation API — KWASU');
  console.log(`   API:       http://localhost:${PORT}/api/v1`);
  console.log(`   Health:    http://localhost:${PORT}/health`);
  console.log(`   WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`   Network:   http://0.0.0.0:${PORT} (accepts all)\n`);
});

export default app;
