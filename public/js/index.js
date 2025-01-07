import '@babel/polyfill';
import {login, logout} from './login';
import {displayMap} from './mapbox';

// DOM elements
const mapBox = JSON.parse(document.getElementById('map'));
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');



// delegations
if(mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if(loginForm) {
    loginForm.addEventListener('submit', e => {
        // values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        e.preventDefault();
        login(email, password);
    });
}

if(logOutBtn) logOutBtn.addEventListener('click', logout);