import React, { Component } from 'react';
import Route from 'react-dom';
import firebase, { auth, provider } from './data/firebase';
import NavBar from './components/navbar/navbar';
import MealList from './components/meal/mealsList';
import './App.scss';

// reference to bucket
const storageRef = firebase.storage().ref();
// reference to bucketURL/images
const imageRef = storageRef.child('images');


class App extends Component {

    constructor() {
        super();
        this.state = {
            username: '',
            meals: [],
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
                {/* <Route exact path="/" render={(props) => {
                    return <MealList />
                }} /> */}
                <div className="container">
                    <MealList />
                </div>
            </div>
        );
    }
}

export default App;