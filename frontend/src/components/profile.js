import React from'react';
import {socket} from '../index.js';
import { Link } from 'react-router-dom';

class Profile extends React.Component {
    state = {
        name:'',
        win:0,
        lose:0,
        draw:0
    }

    componentDidMount() {
        socket.on('stats', ({name, win, lose, draw}) => {
            this.setState({
                name,
                win,
                lose,
                draw
            })
        })
    }

    render () {
        return (
            <div>
                <div className='ui list'>
                    <h3 className='header'>This is {this.state.name}'s stats:</h3>
                    <div className='item'>win: {this.state.win}</div>   
                    <div className='item'>lose: {this.state.lose}</div>   
                    <div className='item'>draw: {this.state.draw}</div>     
                </div>
                <Link to='/userlist'>back to lobby</Link>
            </div>
            
        )
    }     
} 

export default Profile