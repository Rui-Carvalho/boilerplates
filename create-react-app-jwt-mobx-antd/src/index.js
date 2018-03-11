import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';

//@TODO change this
import {httpProvider} from 'barbarojs-http';

// setting middlewares
httpProvider.use(req => {
    return new Promise((resolve, reject) => {
        if (req.status >= 400) {
            reject(req);
        } else {
            resolve(req);
        }
    });
});

ReactDOM.render((
    <BrowserRouter>
        <Route path="/" component={App}></Route>
    </BrowserRouter>
), document.getElementById('root'));
registerServiceWorker();
