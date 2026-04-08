import { ethers }      from "ethers";
import { readFileSync } from "fs";
import { join }        from "path";


// Carrega endereços dos contratos gerados pelo deploy
function loadAddresses() {
  try {
    const raw = readFileSync(
      join(__dirname, "contract-addresses.json"), "utf-8"
    );
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    console.warn("[Blockchain] contract-addresses.json nao encontrado — rode o deploy primeiro");
    return {} as Record<string, string>;
  }
}


// ABI mínimo — apenas as funções usadas pelo backend
const DRUG_BATCH_ABI = [
  "function registerBatch(string,string,string,uint256,uint256,bytes32) external",
  "function transferBatch(string,address,uint256,bytes32) external",
  "function recallBatch(string) external",
  "function dispenseBatch(string,string,uint256) external",
  "function getBatchHistory(string) external view returns (tuple(address,address,uint256,uint256,bytes32)[])",
  "function batches(string) external view returns (tuple(string,string,string,uint256,uint256,address,bool,bytes32))",
  "event BatchRegistered(string indexed,string,address)",
  "event BatchRecalled(string indexed,address,uint256)",
];


const RECALL_ABI = [
  "function initiateRecall(string,string,string[]) external",
  "function resolveRecall(string) external",
  "function getActiveRecalls() external view returns (string[])",
  "event RecallInitiated(string indexed,string,address,uint256)",
];


export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private signer:   ethers.Wallet;
  private drugBatch: ethers.Contract;
  private recallMgr: ethers.Contract;


  constructor() {
    const rpc  = process.env.RPC_URL  ?? "http://127.0.0.1:8545";
    const pk   = process.env.DEPLOYER_PRIVATE_KEY!;
    const addr = loadAddresses();


    this.provider  = new ethers.JsonRpcProvider(rpc);
    this.signer    = new ethers.Wallet(pk, this.provider);
    this.drugBatch = new ethers.Contract(addr.DrugBatch,     DRUG_BATCH_ABI, this.signer);
    this.recallMgr = new ethers.Contract(addr.RecallManager, RECALL_ABI,     this.signer);
  }


  // ── Registrar lote ─────────────────────────────────────────────────
  async registerBatch(params: {
    id: string; gtin: string; lot: string;
    expiryTs: number; quantity: number; dataHash: string;
  }): Promise<string> {
    const tx = await this.drugBatch.registerBatch(
      params.id, params.gtin, params.lot,
      params.expiryTs, params.quantity,
      ethers.hexlify(ethers.toUtf8Bytes(params.dataHash)).padEnd(66,"0")
    );
    const receipt = await tx.wait();
    return receipt.hash;
  }


  // ── Transferir lote ────────────────────────────────────────────────
  async transferBatch(params: {
    batchId: string; to: string; quantity: number; nfeHash: string;
  }): Promise<string> {
    const nfeBytes32 = ethers.zeroPadValue(
      ethers.toUtf8Bytes(params.nfeHash.slice(0,32)), 32
    );
    const tx = await this.drugBatch.transferBatch(
      params.batchId, params.to, params.quantity, nfeBytes32
    );
    const receipt = await tx.wait();
    return receipt.hash;
  }


  // ── Recall ────────────────────────────────────────────────────────
  async initiateRecall(batchId: string, reason: string, gtins: string[]): Promise<string> {
    const tx = await this.recallMgr.initiateRecall(batchId, reason, gtins);
    const receipt = await tx.wait();
    return receipt.hash;
  }


  // ── Histórico on-chain ────────────────────────────────────────────
  async getBatchHistory(batchId: string) {
    return this.drugBatch.getBatchHistory(batchId);
  }


  // ── Assinar dado sensível (ECDSA) ─────────────────────────────────
  async sign(data: string): Promise<string> {
    return this.signer.signMessage(data);
  }


  // ── Verificar assinatura ─────────────────────────────────────────
  verifySignature(data: string, signature: string): string {
    return ethers.verifyMessage(data, signature);
  }
}


export const blockchainService = new BlockchainService();

