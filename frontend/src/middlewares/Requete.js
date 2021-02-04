import axios from 'axios'; // Eu par npm install axios, permet de faire la requête entre front et back

export default axios.create({
    baseURL: 'http://localhost:5000',
});