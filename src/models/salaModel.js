const db = require("./db");

let listarSalas = async () => {
  try {
    const database = await db.connect();
    const salas = await database.collection('salas').find({}, { projection: { mensagens: 0 } }).toArray();
    return salas;
  } catch (error) {
    console.error('Erro ao listar salas:', error);
    throw error; 
  }
}

let criarSalas = async (salaData) => {
  try {
    console.log(salaData);
    const database = await db.connect();
    const result = await database.collection('salas').insertOne(salaData);
    return result;
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    throw error;
  }
}

const { ObjectId } = require('mongodb');

let criarMensagem = async (mensagemData) => {
  try {
    const database = await db.connect();
    const salas = database.collection('salas');

    mensagemData.timestamp = new Date();

    const result = await salas.updateOne(
      { _id: new ObjectId(mensagemData.nomegrupo) },
      { $push: { mensagens: mensagemData } }
    );

    if (result.matchedCount === 0) {
      throw new Error('Sala não encontrada.');
    }
    return result;
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    throw error;
  }
}

const buscarNomeSala = async (idSala) => {
  try {
    const database = await db.connect();
    const salas = database.collection('salas');
    const sala = await salas.findOne({ _id: new ObjectId(idSala) });

    return sala ? sala.nome : null; 
  } catch (error) {
    console.error('Erro ao buscar o nome da sala:', error);
    throw new Error('Erro ao buscar o nome da sala');
  }
};




module.exports = {
  listarSalas,
  criarSalas,
  criarMensagem, 
  buscarNomeSala
}