//---------------------------------------------- Moduli JavaScript --------------------------------------
const mysql = require('mysql2'), // pacchetto per connessione a database mysql
      express = require('express'), // framework di gestione del server
      cors = require('cors'), // pacchetto per la comunicazione client-server su domini diversi
      passwordValidator = require('password-validator'), // pacchetto di gestione sicura delle password
      crypto = require('crypto-js') // pacchetto per la crittografia e l'hashing dei dati
//---------------------------------------------- Moduli JavaScript --------------------------------------

const app = express(), // crea un'istanza di express per la gestione del server
      port = 3000; // imposta la porta su cui il server è in ascolto

app.use(express.json()); // permette di analizzare i dati in formato JSON
app.use(cors()); // permette la comunicazione client-server su domini diversi
app.use(express.urlencoded({ extended: false })); // permette la gestione di dati in formato complesso

const connection = mysql.createConnection({ // crea la connessione al database
    host: 'localhost', // indirizzo del database
    user: 'root', // nome utente
    password: 'Gaetano22', // password
    database: 'Segreteria' // nome del database
});

connection.connect((err) => { // connessione al database
    if (err) { // gestione di eventuali errori
        console.error('Errore di connessione al database:', err);
        return;
    }
    console.log('Connesso al database MySQL!');
});

app.listen(port, () => { // esegue il server e lo mette in ascolto sulla porta specificata
    console.log(`Server in ascolto sulla porta ${port}`);
});

app.post('/login', (req, res) => { // funzione di gestione del login
    const matricola = req.body.matricola, // estrae la matricola dalla richiesta
          password = req.body.password; // estrae la password dalla richiesta

    connection.query('SELECT NOMESTUDENTE, COGNOMESTUDENTE, CFUSTUDENTE, DATANASCITA, MEDIA, CORSOSTUDENTE FROM STUDENTI WHERE MATRICOLA = ? AND PASSWORD = ?', [matricola, password], (error, results) => { // query di ricerca dello studente
        if (results.length > 0) { // se lo studente è trovato nel database
            const user = results[0]; // salva le sue informazioni
            res.json ({ // invia una risposta HTTP al client contenente le informazioni dello studente
                nome: user.NOMESTUDENTE, // nome dello studente
                cognome: user.COGNOMESTUDENTE, // cognome dello studente
                cfu: user.CFUSTUDENTE, // cfu dello studente
                media: user.MEDIA, // media dello studente
                corso: user.CORSOSTUDENTE, // corso dello studente
                nascita: user.DATANASCITA, // data di nascita dello studente
                redirect: 'account.html' // pagina alla quale lo studente è reindirizzato
            });
        } else { // gestione dell'errore
            res.status(400).json({ error: 'Credenziali errate' });
        }
    });
});