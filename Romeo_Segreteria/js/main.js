window.onload = () => { // esegue il service worker una volta che la pagina è caricata
    'use strict';
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service_worker.js').then(function (registration) { // service worker registrato correttamente
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            },
            function (err) { // eventuali errori nella registrazione del service worker
                console.log('ServiceWorker registration failed: ', err);
            });
    }
}

function login() { // funzione di gestione del login dello studente lato client
    const matricola = document.getElementById('matricola').value.trim(), // estrae la matricola
          password = document.getElementById('password').value.trim(); // estrae la password

    $.ajax ({ // invia una richiesta HTTP al server con ajax per verificare che lo studente sia registrato
        url: 'http://localhost:3000/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ matricola: matricola, password: password }),
    })
    .done(function (data) { // in caso di login corretto
        sessionStorage.setItem('loggato', 'true'); // lo studente ha effettuato l'accesso
        sessionStorage.setItem('matricola', matricola); // memorizza la matricola
        sessionStorage.setItem('nome', data.nome); // memorizza il nome
        sessionStorage.setItem('cognome', data.cognome); // memorizza il cognome
        sessionStorage.setItem('cfu', data.cfu); // memorizza i cfu
        sessionStorage.setItem('media', data.media); // memorizza la media
        sessionStorage.setItem('corso', data.corso); // memorizza il corso
        sessionStorage.setItem('datanascita', data.nascita); // memorizza la data di nascita
        document.location.href = data.redirect; // reindirizza lo studente all'area riservata
    })
    .fail(function () { // in caso di errore
        const loginError = document.getElementById('login-error-message'); // estrae l'elemento contenente il messaggio di errore
        loginError.innerText = 'Credenziali errate'; // messaggio da visualizzare
        loginError.style.opacity = '1'; // rende visibile il messaggio
        loginError.style.visibility = 'visible';
        loginError.style.margin = "0.5rem";
        setTimeout(function() { // nasconde il messaggio dopo 3 secondi
            loginError.style.opacity = '0';
            loginError.style.visibility = 'hidden';
        }, 3000);
    })
}

function togglePasswordVisibility(button, input) { // gestisce la visualizzazione della password
    let password = document.getElementById(input); // estrae la password
    if (password.type === "password") { // se la password è nascosta
        password.type = "text"; // mostra la password
        button.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else { // se la password è visibile
        password.type = "password"; // nasconde la password
        button.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }
}

function checkIfLogged() { // funzione per gestire l'accesso controllato all'area riservata
    if (!sessionStorage.getItem('loggato')) { // se lo studente che cerca l'accesso alla pagina non è loggato
        document.location.href = './index.html'; // reindirizza lo studente alla pagina di login
    }
}

function logout() { // gestisce la disconnessione dello studente dall'area riservata
    sessionStorage.removeItem('matricola'); // rimuove la matricola
    sessionStorage.removeItem('nome'); // rimuove il nome
    sessionStorage.removeItem('cognome'); // rimuove il cognome
    sessionStorage.removeItem('cfu'); // rimuove i cfu
    sessionStorage.removeItem('media'); // rimuove la media
    sessionStorage.removeItem('corso'); // rimuove il corso
    sessionStorage.removeItem('datanascita'); // rimuove la data di nascita
    window.location.href = 'index.html'; // reindirizza l'utente alla pagina di index
}

function visualizzaEsamiPrenotabili() { // mostra allo studente gli appelli a cui può prenotarsi
    $.ajax({ // invia una richiesta HTTP al server per ottenere gli appelli a cui può prenotarsi lo studente
        url: 'http://localhost:3000/visualizzaEsamiPrenotabili',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ matricola: sessionStorage.getItem('matricola'), corso: sessionStorage.getItem('corso') }),
    })
    .done(function (data) {
        let esamiPrenotabili = '';
        data.appelli.forEach(esame => { // mostra gli appelli prenotabili
            esamiPrenotabili += `<tr>
                <td>${esame['NOMEESAME']}</td>
                <td>${new Date(esame['DATAESAME']).toLocaleDateString()}</td>
            </tr>`;
        });
        $('#appelliPrenotabili tbody').html(esamiPrenotabili);
    })
    .fail(function () {
        $('#appelliPrenotabili tbody').html('<tr><td colspan="4">Nessun appello prenotabile</td></tr>');
    })
}

function visualizzaLibretto() { // estrae gli esami superati dallo studente per visualizzarle nella pagina
    $.ajax({ // invia una richiesta HTTP al server per ottenere gli esami superati dallo studente
        url: 'http://localhost:3000/visualizzaLibretto',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ matricola: sessionStorage.getItem('matricola') }),
    })
    .done(function (data) { // se il libretto è trovato
        let libretto = '';
        data.libretto.forEach(esame => { // per ogni esame visualizza le informazioni nella tabella
            libretto += `<tr>
                <td>${esame['NOMEESAME']}</td>
                <td>${esame['NOMECORSO']}</td>
                <td>${esame['VOTO']}</td>
                <td>${new Date(esame['DATAESAME']).toLocaleDateString()}</td>
            </tr>`;
        });
        $('#libretto tbody').html(libretto);
    })
    .fail(function () {
        $('#libretto tbody').html('<tr><td colspan="4">Nessun esame superato</td></tr>');
    })
}