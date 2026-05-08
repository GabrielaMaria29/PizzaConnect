import * as XLSX from "xlsx";
import * as admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

// ajuste aqui se o nome do arquivo for outro
const FILE_PATH = "./clientes.xlsx";

// ajuste aqui se a aba tiver outro nome
const SHEET_NAME = "Respostas";

// ajuste aqui exatamente conforme os nomes das colunas da planilha
const COL_NOME = "Nome do Comprador";
const COL_TELEFONE = "Telefone do Comprador (Whatsapp)";

function normalizarTelefone(valor: unknown): string {
  if (!valor) return "";
  return String(valor).replace(/\D/g, "");
}

async function importarClientes() {
  const workbook = XLSX.readFile(FILE_PATH);
  const sheet = workbook.Sheets[SHEET_NAME];

  if (!sheet) {
    throw new Error(`A aba "${SHEET_NAME}" não foi encontrada no arquivo.`);
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const unicos = new Map<string, { nome: string; telefone: string }>();

  for (const row of rows) {
    const nome = String(row[COL_NOME] ?? "").trim();
    const telefone = normalizarTelefone(row[COL_TELEFONE]);

    if (!nome || !telefone) continue;

    if (!unicos.has(telefone)) {
      unicos.set(telefone, { nome, telefone });
    }
  }

  console.log(`Total de clientes únicos encontrados: ${unicos.size}`);

  let contador = 0;

  for (const cliente of unicos.values()) {
    await db.collection("customers").doc(cliente.telefone).set(
      {
        nome: cliente.nome,
        telefone: cliente.telefone,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    contador++;
    console.log(`Importado ${contador}: ${cliente.nome} - ${cliente.telefone}`);
  }

  console.log("Importação concluída com sucesso.");
}

importarClientes().catch((error) => {
  console.error("Erro na importação:", error);
  process.exit(1);
});
