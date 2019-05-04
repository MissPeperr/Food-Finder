import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'

export default class NavBar extends Component {
  state = {}

  handleItemClick(e, { name }){
    this.setState({ activeItem: name })
  }

  render() {
    const { activeItem } = this.state

    return (
      <Menu>
        <Menu.Item
          name="Meals"
          content="Meals"
          href="/"
          active={activeItem === "Meals"}
          onClick={this.handleItemClick}
        />

        {this.props.user ?
          <Menu.Item
            name="Log Out"
            content="Log Out"
            active={activeItem === "Log Out"}
            onClick={this.handleItemClick}
          />
          :
          <Menu.Item
            name="Log In"
            content="Log In"
            active={activeItem === "Log In"}
            onClick={this.handleItemClick}
          />
      }
      </Menu>
    )
  }
}