import React, { Component } from 'react';
import firebase, { auth, provider } from './modules/firebase.js';
import NavBar from './components/navbar/navbar.js';
import Dropzone from 'react-dropzone';
import 'semantic-ui-css/semantic.min.css'
import { Button, Icon } from 'semantic-ui-react';
import './App.scss';

// reference to bucket
const storageRef = firebase.storage().ref();
// reference to bucketURL/images
const imageRef = storageRef.child('images');


class App extends Component {

  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: [],
      user: null,
      imageURL: null,
      title: null
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
          imageURL: items[item].imageURL,
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

  logout() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
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
      user: this.state.user.displayName || this.state.user.email,
      imageURL: this.state.imageURL
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
      username: '',
      imageURL: null
    });
  }

  // functionality for react-dropzone to add images
  onImageDrop(files) {
    this.setState({
      uploadedFile: files[0]
    });
    this.handleImageUpload(files[0]);
  }

  // functionality for react-dropzone to upload images to firebase storage
  handleImageUpload(file) {
    // grab reference to the image name -- "images/file-name.png"
    const fileName = imageRef.child(file.name);
    // send image to db
    fileName.put(file).then(function (snapshot) {
      console.log('Successfully uploaded image 👍');
    }).then(() => {
      fileName.getDownloadURL().then(url => {
        this.setState({
          imageURL: url
        });
      })
    })

  }

  render() {
    return (
      <div className="App">
        <NavBar
          user={this.state.user}
        />
        <div className="container">
          {this.state.user ?
            <div>
              <div className='user-profile'>
                <img src={this.state.user.photoURL} alt={this.state.user.displayName} style={{width: "10%", height: "auto"}}/>
              </div>
              <div className='container'>
                <section className='add-item'>
                  <form onSubmit={this.handleSubmit}>
                    <div id="dropzone-div">
                      <Dropzone
                        onDrop={this.onImageDrop.bind(this)}
                        multiple={false}>
                        {({ getRootProps, getInputProps }) => {
                          return (
                            <div id="image-drop-div"
                              {...getRootProps()}
                            >
                              <input {...getInputProps()} />
                              {
                                <Button
                                content='Upload Image'
                                icon='upload'
                                labelPosition='right' />
                              }
                            </div>
                          )
                        }}
                      </Dropzone>
                      <div>
                        <div className="FileUpload" style={{ width: "10%" }}></div>
                        <div>
                          {this.state.imageURL === '' ? null :
                            <div>
                              <p>{this.state.title}</p>
                              <img className="preview-img" alt={this.state.title} src={this.state.imageURL} />
                            </div>}
                        </div>
                      </div>
                    </div>
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
                    <div key={item.id}>
                      <h3>{item.title}</h3>
                      <img src={item.imageURL} alt={item.title} style={{width:"25%", height:"auto"}} />
                      <p>brought by: {item.user}
                        {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                          <Button
                          color="red"
                          style={{marginLeft: "1rem"}}
                          animated="fade"
                          onClick={() => this.removeItem(item.id)}>
                          <Button.Content visible>Remove Item</Button.Content>
                          <Button.Content hidden>
                            <Icon name="remove" />
                          </Button.Content>
                          </Button>
                          : null}
                      </p>
                    </div>
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