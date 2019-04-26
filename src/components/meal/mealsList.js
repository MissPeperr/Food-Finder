import React, { Component } from 'react';

export default class mealsList extends Component {

    constructor() {
        super();
        this.state = {
            allMeals: []
        }
    }

    render() {
        return (
            <div>
                All meals listed here 👍
            </div>
        );
    }

}