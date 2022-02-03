import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { MoralisProvider } from "react-moralis";
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/antd.css';
import "./App.scss"

ReactDOM.render(
  <MoralisProvider appId="E0r61x8b162oI1ATFniIYqGYFqWfAvlO0cu56D4R" serverUrl="https://mfailhtfpfer.usemoralis.com:2053/server">
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </MoralisProvider>,
  document.getElementById('root')
);