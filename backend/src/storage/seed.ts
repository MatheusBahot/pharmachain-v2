import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg }     from "@prisma/adapter-pg";
import pg               from "pg";
import bcrypt           from "bcryptjs";
import { ethers }       from "ethers";

async function seed() {
  const pool    = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma  = new PrismaClient({ adapter });

  console.log("Iniciando seed...");

  const mfWallet   = ethers.Wallet.createRandom();
  const disWallet  = ethers.Wallet.createRandom();
  const pharWallet = ethers.Wallet.createRandom();
  const docWallet  = ethers.Wallet.createRandom();

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  await prisma.participant.createMany({
    data: [
      {
        address:      mfWallet.address,
        cnpj:         "12345678000199",
        name:         "Farmacêutica Bahia Ltda",
        role:         "MANUFACTURER",
        passwordHash: await hash("senha123!"),
      },
      {
        address:      disWallet.address,
        cnpj:         "98765432000177",
        name:         "Distribuidora Nordeste S/A",
        role:         "DISTRIBUTOR",
        passwordHash: await hash("senha123!"),
      },
      {
        address:      pharWallet.address,
        cnpj:         "11223344000155",
        name:         "Farmácia Popular Salvador",
        role:         "PHARMACY",
        passwordHash: await hash("senha123!"),
      },
      {
        address:      docWallet.address,
        cnpj:         "33445566000133",
        name:         "Dr. João Silva — CRM-BA 12345",
        role:         "DOCTOR",
        passwordHash: await hash("senha123!"),
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed concluído!");
  console.log("Fabricante   cnpj: 12345678000199  senha: senha123!");
  console.log("Distribuidor cnpj: 98765432000177  senha: senha123!");
  console.log("Farmácia     cnpj: 11223344000155  senha: senha123!");
  console.log("Médico       cnpj: 33445566000133  senha: senha123!");
  console.log("Wallets geradas:");
  console.log("  Fabricante   :", mfWallet.address, mfWallet.privateKey);
  console.log("  Distribuidor :", disWallet.address, disWallet.privateKey);
  console.log("  Farmácia     :", pharWallet.address, pharWallet.privateKey);
  console.log("  Médico       :", docWallet.address, docWallet.privateKey);

  await prisma.$disconnect();
  await pool.end();
}

seed().catch(console.error);
