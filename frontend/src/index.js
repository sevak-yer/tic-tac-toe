import React from 'react';
import io from 'socket.io-client';
import ReactDOM from 'react-dom';
import App from './components/App';

const endpoint = "http://localhost:3001"; 

export const socket = io(endpoint);

ReactDOM.render(
    <App />,
    document.querySelector('#root')
)
