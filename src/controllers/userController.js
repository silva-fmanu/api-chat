const SECRET = "1234";
const jwt = require('jsonwebtoken');
const { registrarUser, deletarUser } = require('../models/userModel');

const entrar = async (req, res) => {
  const { nick } = req.body;

  if (!nick) {
    return res.status(400).json({ message: 'O campo nick é obrigatório.' });
  }

  try {
    // Registrar o usuário
    await registrarUser(req.body);

    // Gerar o token JWT
    const token = jwt.sign({ nick }, SECRET, { expiresIn: '48h' });

    // Enviar o nick e o token na resposta
    res.json({ nick, token });
  } catch (error) {
    console.error('Erro ao entrar:', error);
    res.status(500).json({ message: 'Erro ao registrar o usuário.' });
  }
};

const sair = async (req, res) => {
  try {
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Token não fornecido ou mal formatado.');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, SECRET);
    const { nick } = decoded;

    await deletarUser(nick);

    res.json({
      status: 200,
      msg: "OK"
    });
  } catch (error) {
    console.error('Erro durante o logout:', error);
    res.status(401).send('Token inválido ou erro durante o logout.');
  }
};

module.exports = {
  entrar,
  sair
};
