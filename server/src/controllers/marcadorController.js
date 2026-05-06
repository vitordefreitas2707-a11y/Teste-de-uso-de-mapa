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
    res.status(500).send(getErrorMessage(err));
  }
};

export const criarMarcador = async (req, res) => {
  try {
    const { nome, descricao, latitude, longitude } = req.body;
    const novo = await createMarcador(nome, descricao, latitude, longitude);
    res.json(novo);
  } catch (err) {
    res.status(500).send(getErrorMessage(err));
  }
};

export const deletarMarcador = async (req, res) => {
  try {
    // Garante que o id recebido realmente pode ser usado na consulta.
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).send("ID invalido");
    }

    // O model devolve quantas linhas foram apagadas de verdade.
    const deletedRows = await deleteMarcador(id);
    if (deletedRows === 0) {
      return res.status(404).send("Marcador nao encontrado");
    }

    // 204 significa que o banco apagou o registro com sucesso.
    res.status(204).end();
  } catch (err) {
    res.status(500).send(getErrorMessage(err));
  }
};
