import React, { Component } from 'react';
import NavBar from './components/navbar/navbar.js';
import './App.scss';
import firebase, { auth, provider } from './modules/firebase.js';

const storage = firebase.storage();
class App extends Component {

  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: [],
      user: null
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    const itemsRef = firebase.database().ref('items');
    /*
      The callback here, which we've called snapshot, provides you with a bird's eye overview of the items ref inside of your database. From here, you can easily grab a list of all of the properties inside of that items ref, using the .val() method which you can call on the snapshot.
      This value automatically fires on two occassions:
          Any time a new item is added or removed from our items reference inside of our database
          The first time the event listener is attached
    */
    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      let newState = [];
      for (let item in items) {
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user
        });
      }
      this.setState({
        items: newState
      });
    });
    /*
      Firebase has an event listener, onAuthStateChange, that can actually check every single time the app loads to see if the user was already signed in last time they visited your app. If they were, you can automatically sign them back in.
    */
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    });
  }

  // firebase's own method to remove from the db (itemRef.remove())
  removeItem(itemId) {
    const itemRef = firebase.database().ref(`/items/${itemId}`);
    itemRef.remove();
  }

  login() {
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
      });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }

  handleSubmit(e) {
    /*
      we need to prevent the default behavior of the form, which if we don't will cause the page to refresh when you hit the submit button.
    */
    e.preventDefault();
    /*
      we need to carve out a space in our Firebase database where we'd like to store all of the items that people are bringing to the potluck. We do this by calling the ref method and passing in the destination we'd like them to be stored (items).
    */
    const itemsRef = firebase.database().ref('items');
    /*
      here we grab the item the user typed in (as well as their username) from the state, and package it into an object so we ship it off to our Firebase database.
    */
    const item = {
      title: this.state.currentItem,
      user: this.state.user.displayName || this.state.user.email
    }
    /*
      this sends a copy of our object so that it can be stored in Firebase.
    */
    itemsRef.push(item);
    /*
      we clear out the inputs so that an additional item can be added.
    */
    this.setState({
      currentItem: '',
      username: ''
    });
  }

  render() {
    return (
      <div className="App">
        <NavBar />
        <header className="App-header">
          <div className="wrapper">
            <h1>Fun Food Friends</h1>
            {/* Add this to navbar */}
            {this.state.user ?
              <button onClick={this.logout}>Log Out</button>
              :
              <button onClick={this.login}>Log In</button>
            }
          </div>
        </header>
        <div className="container">
          {this.state.user ?
            <div>
              <div className='user-profile'>
                <img src={this.state.user.photoURL} alt={this.state.user.displayName} />
              </div>
              <div className='container'>
                <section className='add-item'>
                  <form onSubmit={this.handleSubmit}>
                  
                    <input type="text" name="username" placeholder="What's your name?" onChange={this.handleChange} value={this.state.user.displayName || this.state.user.email} />
                    <input type="text" name="currentItem" placeholder="What are you bringing?" onChange={this.handleChange} value={this.state.currentItem} />
                    <button>Add Item</button>
                  </form>
                </section>
              </div>
            </div>
            :
            <div className='wrapper'>
              <p>You must be logged in to see the potluck list and submit to it.</p>
            </div>
          }
          <section className='display-item'>
            <div className="wrapper">
              <ul>
                {this.state.items.map((item) => {
                  return (
                    <li key={item.id}>
                      <h3>{item.title}</h3>
                      <p>brought by: {item.user}
                        {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                          <button onClick={() => this.removeItem(item.id)}>Remove Item</button> : null}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default App;