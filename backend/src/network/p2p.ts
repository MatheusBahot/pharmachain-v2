import WebSocket, { WebSocketServer } from "ws";


export enum MSG {
  CHAIN_REQUEST    = "CHAIN_REQUEST",
  CHAIN_RESPONSE   = "CHAIN_RESPONSE",
  NEW_BLOCK        = "NEW_BLOCK",
  NEW_TX           = "NEW_TX",
  RECALL_BROADCAST = "RECALL_BROADCAST",
}


export class P2PServer {
  private peers = new Set<WebSocket>();


  constructor(port: number) {
    const wss = new WebSocketServer({ port });
    wss.on("connection", (ws) => this.handlePeer(ws));
    console.log(`[P2P] Servidor escutando na porta ${port}`);
  }


  // Conectar a um nó par (peer)
  connect(url: string) {
    const ws = new WebSocket(url);
    ws.on("open",    ()  => { this.peers.add(ws); this.requestChain(ws); });
    ws.on("message", (d) => this.onMessage(ws, d.toString()));
    ws.on("close",   ()  => this.peers.delete(ws));
    ws.on("error",   (e) => console.error("[P2P] erro:", e.message));
  }


  // Broadcast para todos os pares
  broadcast(type: MSG, data: unknown) {
    const msg = JSON.stringify({ type, data });
    this.peers.forEach(p => {
      if (p.readyState === WebSocket.OPEN) p.send(msg);
    });
  }


  // Broadcast de recall urgente
  broadcastRecall(batchId: string, reason: string) {
    this.broadcast(MSG.RECALL_BROADCAST, {
      batchId, reason, timestamp: Date.now()
    });
    console.log(`[P2P] Recall broadcast: ${batchId}`);
  }


  private requestChain(ws: WebSocket) {
    ws.send(JSON.stringify({ type: MSG.CHAIN_REQUEST }));
  }


  private onMessage(ws: WebSocket, raw: string) {
    try {
      const { type, data } = JSON.parse(raw);
      switch (type as MSG) {
        case MSG.RECALL_BROADCAST:
          console.log(`[P2P] Recall recebido: ${data.batchId} — ${data.reason}`);
          this.broadcast(MSG.RECALL_BROADCAST, data); // re-propagate
          break;
        case MSG.NEW_TX:
          console.log("[P2P] Nova transação recebida de par");
          break;
        default:
          break;
      }
    } catch (e) {
      console.error("[P2P] mensagem inválida");
    }
  }


  private handlePeer(ws: WebSocket) {
    this.peers.add(ws);
    ws.on("message", (d) => this.onMessage(ws, d.toString()));
    ws.on("close",   ()  => this.peers.delete(ws));
    console.log(`[P2P] Novo par conectado. Total: ${this.peers.size}`);
  }


  getPeerCount() { return this.peers.size; }
}


export const p2pServer = new P2PServer(Number(process.env.P2P_PORT ?? 6001));

