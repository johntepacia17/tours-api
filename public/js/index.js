import '@babel/polyfill';
import {login, logout} from './login';
import {displayMap} from './mapbox';
import {updateData} from './updateSettings';

// DOM elements
const mapBox = JSON.parse(document.getElementById('map'));
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');


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

if(userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        updateData(name, email);
    });
}
