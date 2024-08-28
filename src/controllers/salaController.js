const { criarSalas, listarSalas, criarMensagem, buscarNomeSala} = require("../models/salaModel");
const SECRET = "1234";
const jwt = require('jsonwebtoken');
const db = require("../models/db");
const { ObjectId } = require('mongodb');

const listar = async (req, res) => {
  try {
    let salas = await listarSalas();
    res.json(salas);
  } catch (err) {
    res.status(500).send("Erro ao listar salas");
  }
}

const criar = async (req, res) => {
  try {
    const novaSala = await criarSalas(req.body);
    console.log(novaSala)
    res.status(201).json(novaSala);
  } catch (error) {
    console.error("Erro no controller:", error);
    res.status(500).json({ message: 'Erro ao criar sala', error: error.message });
  }
}  
const sair = async (req, res) => { res.json({ status: 200, msg: "OK" });}

const listarmen = async (req, res) => {
  try {
    const { idSala } = req.query;

    if (!idSala) {
      return res.status(400).send('idSala é obrigatório.');
    }

    const database = await db.connect();
    const salas = database.collection('salas');

    const sala = await salas.findOne(
      { _id: new ObjectId(idSala) },
      { projection: { mensagens: 1, _id: 0 } } 
    );

    if (!sala) {
      return res.status(404).send('Sala não encontrada.');
    }

    res.status(200).json(sala.mensagens);
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).send('Erro interno do servidor.');
  }
}

const entrar = async (req, res) => {
  try {
    const { idSala, nick } = req.body;

    if (!idSala || !nick) {
      return res.status(400).json({ status: 400, msg: "idSala e nomeUsuario são obrigatórios." });
    }

    const nomeSala = await buscarNomeSala(idSala);

    if (!nomeSala) {
      return res.status(404).json({ status: 404, msg: "Sala não encontrada." });
    }

    const mensagem = `${nick} entrou na sala ${nomeSala}`;

    res.json({
      status: 200,
      msg: "OK",
      idSala: idSala,
      nomeSala: nomeSala,
      nick: nick,
      mensagem: mensagem
    });
  } catch (error) {
    console.error('Erro ao entrar na sala:', error);
    res.status(500).json({ status: 500, msg: "Erro interno do servidor." });
  }
};

const enviarmen = async (req, res) => {
  try {
    const { idSala } = req.query;
    const { msg } = req.body;

    if (!idSala || !msg) {
      return res.status(400).send('idSala e conteúdo da mensagem são obrigatórios.');
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Token não fornecido ou mal formatado.');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err) {
      return res.status(401).send('Token inválido: ' + err.message);
    }

    const { nome } = decoded;
    const mensagemData = { nome, nomegrupo: idSala, conteudo: msg };

    const resultado = await criarMensagem(mensagemData);

    res.status(201).json(mensagemData);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).send('Erro interno do servidor.');
  }
};

const sobre = async (req, res) => { res.json({ nome: "API-CHAT", versao: "0.1.0", "autor": "Manuela Silva" });}


module.exports = {
  listar,
  entrar,
  sair,
  listarmen,
  enviarmen,
  criar, 
  sobre
};