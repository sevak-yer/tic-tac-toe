import React from 'react';
import {Link} from 'react-router-dom';
import history from '../history';
import {socket} from '../index'

class UserLogin extends React.Component {

    state = {
        username:'',
        password:'',
        errorMessage: '',
    }

    componentDidMount() {
        socket.on('errordata', (err) => {
            this.setState({errorMessage: err})
        });
    }

    componentWillUnmount() {
        socket.off('errordata');
    }

    onFormSubmit = async (e) => {
        e.preventDefault();
        this.setState({errorMessage: ''})
        
        socket.emit('loginData', {
            "name" : this.state.username,
            "password" : this.state.password
        } );
        
        socket.on('usersList', async (pureIoUsers) => {
            if (pureIoUsers && pureIoUsers.findIndex(user => user.socketid === socket.id)!==-1) {
                await socket.emit('verifiedList', pureIoUsers);
                history.push('/userlist')
            }
        })
    }

    render () {
        return (
            <div>
                <h3><Link to="/">main page</Link></h3>
                <form className="ui form" onSubmit={this.onFormSubmit}>
                    <h2><label>login</label></h2>
                    <input style={{width:200}} placeholder='username' value={this.state.username} onChange={(e)=>{
                        this.setState({username: e.target.value});
                        this.setState({errorMessage:''})
                        }}></input>
                    <br/>
                    <input type='password' style={{marginTop:10, width:200}} placeholder='password' value={this.state.password} onChange={(e)=>{this.setState({password: e.target.value})}}></input>
                    <br/>
                    <button style={{marginTop:10}} className="ui primary button">submit</button>
                    <h2>{this.state.errorMessage}</h2>
                </form>
            </div>
        )
    } 
}

export default UserLogin;