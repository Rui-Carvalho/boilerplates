import React, { Component } from 'react';
import { slide as Menu } from 'react-burger-menu';
import SignUp from "../components/signup";

export default class HamburguerMenu extends React.Component {
  showSettings (event) {
    event.preventDefault();
  }

  render () {
    let styles = {
        bmBurgerButton: {
          position: 'absolute',
          width: '36px',
          height: '30px',
          left: '36px',
          top: '21px'
        },
        bmBurgerBars: {
          background: '#ffffff'
        },
        bmCrossButton: {
          height: '24px',
          width: '24px'
        },
        bmCross: {
          background: '#bdc3c7'
        },
        bmMenu: {
          background: '#4E5150',
          padding: '2.5em 1.5em 0',
          fontSize: '1.15em'
        },
        bmMorphShape: {
          fill: '#373a47'
        },
        bmItemList: {
          color: '#b8b7ad',
          padding: '0.8em'
        },
        bmOverlay: {
          background: 'rgba(0, 0, 0, 0.3)'
        }
    };

    return (
      <div>
        <Menu pageWrapId={ "page-wrap" } styles={ styles } >
          <div class="nav__logo">
              <a href="/"><img src={'images/light.svg'} alt="" /></a>
          </div>
          <a id="home" className="menu-item" href="/">Home</a>
          <a id="about" className="menu-item" href="/about">About</a>
          <a id="contact" className="menu-item" href="/contact">Contact</a>
          <a onClick={ this.showSettings } className="menu-item--small" href="">Settings</a>
          <SignUp/>
        </Menu>
      </div>
    );
  }
}