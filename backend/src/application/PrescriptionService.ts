import { prisma }           from "../storage/prisma";
import { blockchainService } from "../core/blockchain";
import { sha256, encrypt }   from "../core/crypto";


export interface IssuePrescriptionInput {
  doctorId:    string;
  patientCpf:  string;  // será hasheado — LGPD
  batchId:     string;
  dosage:      string;
  quantity:    number;
  expiresAt:   string;  // ISO 8601
  signature:   string;  // Assinatura ECDSA do médico
}


export class PrescriptionService {


  async issue(input: IssuePrescriptionInput) {
    // 1. Hash do CPF (LGPD — nunca armazenar em texto plano)
    const patientHash = sha256(input.patientCpf);


    // 2. Criptografar payload completo off-chain
    const encryptedData = encrypt({
      patientCpf: input.patientCpf,
      doctorId:   input.doctorId,
      batchId:    input.batchId,
      dosage:     input.dosage,
      quantity:   input.quantity,
    });


    const rx = await prisma.prescription.create({
      data: {
        doctorId:      input.doctorId,
        batchId:       input.batchId,
        patientHash,
        encryptedData,
        dosage:        input.dosage,
        quantity:      input.quantity,
        expiresAt:     new Date(input.expiresAt),
        signature:     input.signature,
      }
    });


    return rx;
  }


  async dispense(prescriptionId: string, pharmacyId: string) {
    const rx = await prisma.prescription.findUniqueOrThrow({
      where: { id: prescriptionId },
      include: { batch: true, doctor: true }
    });


    // 1. Receita expirada?
    if (rx.expiresAt < new Date())
      throw new Error("Receita expirada");


    // 2. Já dispensada? (anti-duplo-dispense)
    if (rx.dispensedAt)
      throw new Error("Receita já foi dispensada anteriormente");


    // 3. Verificar assinatura ECDSA do médico
    const payload = sha256({ id: rx.id, patientHash: rx.patientHash, dosage: rx.dosage });
    const recovered = blockchainService.verifySignature(payload, rx.signature);
    if (recovered.toLowerCase() !== rx.doctor.address.toLowerCase())
      throw new Error("Assinatura do médico inválida");


    // 4. Dispensar on-chain
    const txHash = await blockchainService.registerBatch({
      id:       `dispense-${prescriptionId}`,
      gtin:     rx.batch.gtin,
      lot:      rx.batch.lot,
      expiryTs: Math.floor(rx.batch.expiryDate.getTime() / 1000),
      quantity: rx.quantity,
      dataHash: sha256({ prescriptionId, pharmacyId }),
    }).catch(() => "simulation");  // fallback para dev


    // 5. Marcar como dispensada
    await prisma.prescription.update({
      where: { id: prescriptionId },
      data:  { dispensedAt: new Date(), pharmacyId, txHash }
    });


    // 6. Decrementar estoque
    await prisma.drugBatch.update({
      where: { id: rx.batchId },
      data:  { quantity: { decrement: rx.quantity } }
    });


    return { prescriptionId, txHash };
  }
}


export const prescriptionService = new PrescriptionService();

