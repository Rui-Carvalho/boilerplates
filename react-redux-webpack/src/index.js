import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import MainApp from 'Apps/app';

import rootReducer from 'Apps/reducers';

const createStoreWithMiddleware = applyMiddleware()(createStore);

if(document.querySelector('#container')) {
    ReactDOM.render(
        <Provider store={createStoreWithMiddleware(rootReducer)}>
            <MainApp/>
        </Provider>
        , document.querySelector('#container').parentNode
    );
}

if(document.querySelector('#container-footer')) {
    ReactDOM.render(
        <Provider store={createStoreWithMiddleware(rootReducer)}>
            <MainApp/>
        </Provider>
        , document.querySelector('#container-footer')
    );
}