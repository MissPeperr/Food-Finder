import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'

export default class NavBar extends Component {
  state = {}

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      <Menu>
        <Menu.Item
          name='Meals'
          active={activeItem === 'Meals'}
          onClick={this.handleItemClick}
        >
          Editorials
        </Menu.Item>

        {this.props.user ?
          <Menu.Item
            name='Log Out'
            active={activeItem === 'Log Out'}
            onClick={this.handleItemClick}>
            Log Out
          </Menu.Item>
          :
          <Menu.Item
            name="Log In"
            active={activeItem === "Log In"}
            onClick={this.handleItemClick}>
            Log In
          </Menu.Item>
      }
      </Menu>
    )
  }
}