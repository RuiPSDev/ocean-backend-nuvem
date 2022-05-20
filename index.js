//require('dotenv').config()
const express = require("express");
//const { MongoClient, ObjectId } = require("mongodb");
const mongodb = require("mongodb"); // youtube Mensagens
const ObjectId = mongodb.ObjectId;

//const connectionString = "mongodb+srv://admin:Aq9MK0UnQLYlOO7c@cluster0.qf7mo.mongodb.net/dbherois?retryWrites=true&w=majority";
const connectionString = "mongodb+srv://admin:Aq9MK0UnQLYIOO7c@cluster0.qf7mo.mongodb.net/";
const dbName = "dbherois"; // aula do Ocean - herois


main();


async function main() {
  console.info("Conectando com o banco de dados MongoDB...");

  const options = {
    useUnifiedTopology: true
  };

  // Aplicação se conecta ao gerenciador de banco de dados MongoDB
  const client = await mongodb.MongoClient.connect(connectionString);
  // Pega uma conexão válida ao banco 'dbherois'
  const db = client.db(dbName); // aula do Ocean - herois
  // Cria uma variável collection linkada à coleção 'herois' do banco 'dbHerois'
  const collection = db.collection("herois");

  console.log("Conexão com o banco de dados realizada com sucesso.");

  const app = express();

  // Indica para o Express que estamos utilizando JSON na requisições
  app.use(express.json());



  // ***************** [GET] Criação do endpoint principal - "Hello World" *****************
  app.get("/", function (req, res) {
    res.send("Hello World");
  });



  // ********************************* HERÓIS E HEROINAS ***********************************

  // ************ [GET] Read All (Ler todos os itens) ************
  app.get("/herois", async function (req, res) {
    const documentos = await collection.find({}).toArray();
    res.send(documentos);
  });

  // ************ [GET with ID] Read by ID (Visualizar um item pelo ID) ************
  app.get("/herois/:id", async function (req, res) {
    // Recebemos o ID que iremos buscar
    const id = req.params.id;

    // Buscamos o item dentro da lista, utilizando o ID
    const item = await collection.findOne({ _id: ObjectId(id) });

    if (!item) {
      // Envia uma resposta de não encontrado
      res.status(404).send("Item não encontrado.");

      // Encerra a função
      return;
    }

    res.send(item);
  });

  // ************  Create (Criar um item)  ************
  app.post("/herois", async function (req, res) {
    // Obtemos o nome que foi enviado no body da requisição
    const item = req.body;

    if (!item) {
      res
        .status(400)
        .send(
          "Você deve informar a propriedade 'nome' no corpo da requisição."
        );

      // Encerra a função
      return;
    }

    // Adicionamos esse item obtido dentro da lista de heróis
    // { insertedCount } -> desconstrução de objeto... pegando apenas 'insertedCount'
    // do objeto retornado pela função insertOne() e colocando dentro de uma variável
    // criada com o mesmo nome
    
    // const { insertedCount } = await collection.insertOne(item);
    const resultado = await collection.insertOne(item);

    console.info(resultado);

    if (resultado.insertedCount !== 1) {
      res.send('Ocorreu um erro ao criar o item.')
      
      return;
    }
    
    res.send(item);
  });

  // ************  Update (Editar um item)  ************
  app.put("/herois/:id", async function (req, res) {
    // Obtemos o ID do item a ser atualizado
    const id = req.params.id;

    const novoItem = req.body;

    if (!novoItem || !novoItem.name) {
      // Envia uma resposta de não encontrado
      res.status(404).send("Item inválido.");

      // Encerra a função
      return;
    }
  
    const quantidade_itens = await collection.countDocuments({ _id: ObjectId(id) });

    if (quantidade_itens !== 1) {
      res.send('Item não encontrada.');

      return;
    }

    // Pegamos a nova informação que está sendo enviada
    // const item = req.body;

    // Atualizamos a informação no DB
    await collection.updateOne(
      { _id: ObjectId(id) },
      {
        $set: novoItem,
      }
    );

    res.send(novoItem);
  });

  // ************  Delete (Remover um item)  ************
  app.delete("/herois/:id", async function (req, res) {
    // Obtemos o ID do registro que será excluído
    const id = req.params.id;

    const itemEncontrado = await collection.findOne({ _id: new ObjectId(id) });

    if (!itemEncontrado) {
      // Envia uma resposta de não encontrado
      res.status(404).send("Item não encontrado.");

      // Encerra a função
      return;
    }

    // Removemos o item do DB
    await collection.deleteOne({ _id: new ObjectId(id) });

    res.send("Item removido com sucesso!");
  });


  // Garantir que a porta 3000 vai ser obtida
  app.listen(process.env.PORT || 3000, () =>
    console.log("Aplicação rodando em http://localhost:3000")
  );
}

