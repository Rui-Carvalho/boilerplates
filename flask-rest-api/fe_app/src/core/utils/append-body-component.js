//[Rui] Taken from: https://blog.komand.com/how-to-render-components-outside-the-main-react-app

import React from 'react';
import { render } from 'react-dom';

const appenedElements = {};
const appendElementContainer = document.querySelector('.append-element-container');

function getAppendedElements() {
    const elements = [];

    const keys = Object.keys(appenedElements);
    const length = keys.length;

    if (length > 0) {
        keys.forEach((key) => {
            elements.push(appenedElements[key]);
        });
    }

    return elements;
}

class AppendBodyComponent extends React.Component {
    constructor(props) {
        super(props);

        this.appendElementContainer = appendElementContainer;
    }

    setAppendElementId(id) {
        this.appendElementId = id;
    }

    updateAppendElement(content) {
        appenedElements[this.appendElementId] = content;

        this.updateAppendElements();
    }

    updateAppendElements() {
        render(<span>{getAppendedElements()}</span>, appendElementContainer);
    }

    removeAppendElement() {
        delete appenedElements[this.appendElementId];

        this.updateAppendElements();
    }
}

export default AppendBodyComponent;
