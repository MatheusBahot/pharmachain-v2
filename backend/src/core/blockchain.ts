import { ethers }      from "ethers";
import { readFileSync } from "fs";
import { join }        from "path";

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
  private provider:  ethers.JsonRpcProvider;
  private signer:    ethers.Wallet;
  private drugBatch: ethers.Contract | null = null;
  private recallMgr: ethers.Contract | null = null;
  private ready:     boolean = false;

  constructor() {
    const rpc = process.env.RPC_URL ?? "http://127.0.0.1:8545";
    const pk  = process.env.DEPLOYER_PRIVATE_KEY!;

    this.provider = new ethers.JsonRpcProvider(rpc);
    this.signer   = new ethers.Wallet(pk, this.provider);

    const addr = loadAddresses();
    if (addr.DrugBatch && addr.RecallManager) {
      this.drugBatch = new ethers.Contract(addr.DrugBatch,     DRUG_BATCH_ABI, this.signer);
      this.recallMgr = new ethers.Contract(addr.RecallManager, RECALL_ABI,     this.signer);
      this.ready = true;
      console.log("[Blockchain] Contratos carregados com sucesso");
    } else {
      console.warn("[Blockchain] Contratos nao disponiveis — funcoes on-chain desabilitadas");
    }
  }

  private checkReady() {
    if (!this.ready || !this.drugBatch || !this.recallMgr) {
      throw new Error("Contratos nao deployados. Execute o deploy primeiro.");
    }
  }

  async registerBatch(params: {
    id: string; gtin: string; lot: string;
    expiryTs: number; quantity: number; dataHash: string;
  }): Promise<string> {
    this.checkReady();
    const tx = await this.drugBatch!.registerBatch(
      params.id, params.gtin, params.lot,
      params.expiryTs, params.quantity,
      ethers.hexlify(ethers.toUtf8Bytes(params.dataHash)).padEnd(66, "0")
    );
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async transferBatch(params: {
    batchId: string; to: string; quantity: number; nfeHash: string;
  }): Promise<string> {
    this.checkReady();
    const nfeBytes32 = ethers.zeroPadValue(
      ethers.toUtf8Bytes(params.nfeHash.slice(0, 32)), 32
    );
    const tx = await this.drugBatch!.transferBatch(
      params.batchId, params.to, params.quantity, nfeBytes32
    );
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async initiateRecall(batchId: string, reason: string, gtins: string[]): Promise<string> {
    this.checkReady();
    const tx = await this.recallMgr!.initiateRecall(batchId, reason, gtins);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getBatchHistory(batchId: string) {
    if (!this.ready || !this.drugBatch) return [];
    return this.drugBatch.getBatchHistory(batchId);
  }

  async sign(data: string): Promise<string> {
    return this.signer.signMessage(data);
  }

  verifySignature(data: string, signature: string): string {
    return ethers.verifyMessage(data, signature);
  }
}

export const blockchainService = new BlockchainService();
