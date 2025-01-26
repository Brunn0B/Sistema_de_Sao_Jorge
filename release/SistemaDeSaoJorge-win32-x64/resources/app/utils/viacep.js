const axios = require("axios");

async function getAddressFromCEP(cep) {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (response.data.erro) throw new Error("CEP não encontrado");
    return response.data;
  } catch (error) {
    console.error("Erro na busca do CEP:", error);
    return null;
  }
}

module.exports = { getAddressFromCEP };
