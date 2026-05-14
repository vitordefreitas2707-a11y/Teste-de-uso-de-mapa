import { getMarcadores, createMarcador, deleteMarcador } from "../models/MarcadorModel.js";

const getErrorMessage = (err) => {
  if (err?.message) return err.message;
  if (Array.isArray(err?.errors) && err.errors.length > 0) {
    return err.errors.map((e) => e?.message).filter(Boolean).join(" | ");
  }
  return "Erro interno no servidor";
};

export const listarMarcadores = async (req, res) => {
  try {
    const dados = await getMarcadores();
    res.json(dados);
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
};

export const criarMarcador = async (req, res) => {
  try {
    const { endereco, descricao, latitude, longitude } = req.body;

    // Valida que os campos obrigatórios foram preenchidos
    if (!endereco || !latitude || !longitude) {
      return res.status(400).json({ 
        error: "Endereço, latitude e longitude são obrigatórios" 
      });
    }

    // Valida que latitude e longitude são números válidos
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ 
        error: "Latitude e longitude devem ser números válidos" 
      });
    }

    const novo = await createMarcador(endereco, descricao, lat, lng);
    res.json(novo);
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
};

export const deletarMarcador = async (req, res) => {
  try {
    // Garante que o id recebido realmente pode ser usado na consulta.
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "ID invalido" });
    }

    // O model devolve quantas linhas foram apagadas de verdade.
    const deletedRows = await deleteMarcador(id);
    if (deletedRows === 0) {
      return res.status(404).json({ error: "Marcador nao encontrado" });
    }

    // 204 significa que o banco apagou o registro com sucesso.
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
};
