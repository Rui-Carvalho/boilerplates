import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {MemoryRouter, Route} from 'react-router';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter><App/></MemoryRouter>, div);
});
