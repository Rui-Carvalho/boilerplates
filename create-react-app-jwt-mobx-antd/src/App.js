import React, { Component } from "react";
import logo from "./logo.svg";
import "./app.css";

import Login from "./features/user/components/login";

import { Router, Route } from "react-router";
import { Provider } from "mobx-react";
import { userStore } from "./features/user/stores";
import DevTools from "mobx-react-devtools";
import { useStrict } from "mobx";
import { Layout, Menu, Breadcrumb, Icon } from "antd";
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

useStrict(true);

const stores = {
  userStore
};

class App extends Component {
  handleMenu = (item) => {
    const {key} = item;
    this.props.history.push(key);
  };

  render() {
    return (
      <Layout>
        <Header className="header">
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['/']}
            style={{ lineHeight: "64px" }}
            onSelect={this.handleMenu}
          >
            <Menu.Item key="/">Home</Menu.Item>
            <Menu.Item key="/controls">Other</Menu.Item>
          </Menu>
        </Header>

        <Provider {...stores}>
          <div className="App">
            <Route exact path="/" component={Login} />
          </div>
        </Provider>
        <DevTools />
      </Layout>
    );
  }
}

export default App;
