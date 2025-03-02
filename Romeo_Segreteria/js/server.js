//---------------------------------------------- Moduli JavaScript --------------------------------------
const mysql = require('mysql2'), // pacchetto per connessione a database mysql
      express = require('express'), // framework di gestione del server
      cors = require('cors'), // pacchetto per la comunicazione client-server su domini diversi
      bcrypt = require('bcrypt') // pacchetto per la crittografia e l'hashing dei dati
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
    connection.query('SELECT NOMESTUDENTE, PASSWORD, COGNOMESTUDENTE, CFUSTUDENTE, DATANASCITA, MEDIA, CORSOSTUDENTE FROM STUDENTI WHERE MATRICOLA = ?', [matricola], (error, results) => { // query di ricerca dello studente
        if (results.length > 0) { // se lo studente è trovato nel database
            const user = results[0]; // salva le sue informazioni
            bcrypt.compare(password, user['PASSWORD'], (err, isMatch) => { // confronto tra la password inserita hashata e quella memorizzata nel database
                if (isMatch) { // se le password corrispondono
                    res.json ({ // invia una risposta HTTP al client contenente le informazioni dello studente
                        nome: user['NOMESTUDENTE'], // nome dello studente
                        cognome: user['COGNOMESTUDENTE'], // cognome dello studente
                        cfu: user['CFUSTUDENTE'], // cfu dello studente
                        media: user['MEDIA'], // media dello studente
                        corso: user['CORSOSTUDENTE'], // corso dello studente
                        nascita: user['DATANASCITA'], // data di nascita dello studente
                        redirect: 'account.html' // pagina alla quale lo studente è reindirizzato
                    });
                } else { // altrimenti comunica che la password è sbagliata
                    res.status(400).json({ error: 'Password errata' });
                }
            });
        } else { // gestione dell'errore in caso di credenziali errate
            res.status(400).json({ error: 'Credenziali errate' });
        }
    });
});

app.post('/visualizzaAppelliPrenotati', (req, res) => { // funzione di visualizzazione degli appelli prenotati dallo studente
    const matricola = req.body.matricola; // estrae la matricola dalla richiesta
    connection.query(`SELECT A.NOMEESAME, A.DATAESAME, P.DATAPRENOTAZIONE
                      FROM APPELLI A JOIN PRENOTA P ON A.NOMEESAME = P.NOMEESAME AND A.NOMECORSO = P.NOMECORSO
                      WHERE P.MATRICOLA = ? AND A.DATAESAME > CURRENT_DATE`, [matricola], (error, results) => { // query di ricerca degli appelli prenotati dallo studente
        if (results.length > 0) { // invia una risposta HTTP al client contenente gli appelli prenotati
            res.json ({ appelli: results })
        } else { // nel caso non ci siano appelli prenotati
            res.status(400).json({ error: 'Nessun appello prenotato' });
        }
    })
})

app.post('/visualizzaAppelliPrenotabili', (req, res) => { // funzione di visualizzazione degli esami superati dallo studente
    const matricola = req.body.matricola, // estrae la matricola dalla richiesta
          corso = req.body.corso; // estrae il corso dello studente
    connection.query(`SELECT A.NOMEESAME, A.DATAESAME
                      FROM APPELLI A
                      WHERE A.NOMECORSO = ? AND A.DATAESAME > CURRENT_DATE
                      AND A.NOMEESAME NOT IN (SELECT P.NOMEESAME FROM PRENOTA P WHERE P.MATRICOLA = ? AND P.NOMECORSO = ?)`, [corso, matricola, corso], (error, results) => { // query di ricerca degli esami superati dallo studente
        if (results.length > 0) { // invia una risposta HTTP al client contenente gli appelli disponibili
            res.json ({ appelli: results })
        } else { // nel caso non ci siano appelli disponibili
            res.status(400).json({ error: 'Nessun appello disponibile' });
        }
    })
})

app.post('/visualizzaLibretto', (req, res) => { // funzione di visualizzazione degli esami superati dallo studente
    const matricola = req.body.matricola; // estrae la matricola dalla richiesta
    connection.query(`SELECT A.NOMEESAME, A.NOMECORSO, S.VOTO, A.DATAESAME
         FROM SUPERA S JOIN APPELLI A 
         ON S.NOMEESAME = A.NOMEESAME 
         AND S.NOMECORSO = A.NOMECORSO 
         AND A.DATAESAME <= CURRENT_DATE 
         WHERE S.MATRICOLA = ?`, [matricola], (error, results) => { // query di ricerca degli esami superati dallo studente
        if (results.length > 0) { // invia una risposta HTTP al client contenente il libretto dello studente
            res.json ({ libretto: results })
        } else { // nel caso lo studente non abbia ancora superato alcun esame
            res.status(400).json({ error: 'Nessun esame superato' });
        }
    })
});