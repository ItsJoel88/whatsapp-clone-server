const WebSocket = require('ws');

const { WebSocketServer } = WebSocket;

const wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  }
});

const generateRandomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';
  for (let i=0; i<10; i++) {
    const randomNum = Math.floor(Math.random() * characters.length);
    randomId += characters.charAt(randomNum);
  }
  return randomId;
};

const clientStore = new Map();

wss.on('connection', function connection(ws) {
  const clientId = generateRandomId();
  console.log(`OPEN CONNECTION ${clientId}`);

  ws.on('error', console.error);

  clientStore.set(clientId, ws);

  ws.send(JSON.stringify({ clientId, message: `${clientId}`, type: 'REPORT' }));

  ws.on('message', function message(data) {
    // in here clientId, is the target clientId (receiver)
    const { clientId: clientIdReceiver, message } = JSON.parse(data);
    const wsReceiver = clientStore.get(clientIdReceiver);
    if (wsReceiver) {
      wsReceiver.send(JSON.stringify({ originalClientId: clientId, clientId: clientIdReceiver, message, type: 'MESSAGE' }));
    } else {
      ws.send(JSON.stringify({ originalClientId: clientId, clientId: clientIdReceiver, message: 'Client ID not found.', type: 'ALERT' }));
    }
  });
});