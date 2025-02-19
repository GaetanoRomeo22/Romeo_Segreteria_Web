window.onload = () => { // esegue il service worker una volta che la pagina è caricata
    'use strict';
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service_worker.js').then(function (registration) { // service worker registered correctly
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            },
            function (err) { // troubles in registering the service worker
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
        data: JSON.stringify({matricola: matricola, password: password}),
    })
    .done(function (data) { // in caso di login corretto
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
        const loginError = document.getElementById('login-error-message');
        loginError.innerText = 'Accesso non riuscito';
        loginError.style.visibility = "visible";
        loginError.style.margin = "0.5rem";
    });
}

function togglePasswordVisibility(button, input) { // gestisce la visualizzazione della password
    let password = document.getElementById(input);
    if (password.type === "password") {
        password.type = "text";
        button.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else {
        password.type = "password";
        button.innerHTML = '<i class="fa-regular fa-eye"></i>';
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