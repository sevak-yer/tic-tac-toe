import React from 'react';
import backend from '../server/backend';
import {Link} from 'react-router-dom';
import history from '../history';

class UserSignup extends React.Component {

    state = {
        username:'',
        password:'',
        errorMessage: ''
    }

    onFormSubmit = async (e) => {
        e.preventDefault();
        if (this.state.username === '') {
            return this.setState({errorMessage: 'provide a username'})
        }
        if (this.state.password.length < 6) {
            return this.setState({errorMessage: 'password must be atleast 6 characters'})
        }
        this.setState({errorMessage: ''})
        await backend.post('/user', {
            "name" : this.state.username,
            "password" : this.state.password,
            "win":0,
            "lose":0,
            "draw":0
        }).then((response) => {
            if (response.data==='user with this name already exists, try other name') {
                this.setState({errorMessage: response.data})
            } else {
                history.push('/login')
            }
        }).catch((e) => {
            console.log(e)
        })
    }

    render () {
        return (
            <div>
                <h3><Link to="/">main page</Link></h3>
                <form className="ui form" onSubmit={this.onFormSubmit}>
                    <h2><label>sign up</label></h2>
                    <input style={{width:200}} placeholder='username' value={this.state.username} onChange={(e)=>{this.setState({username: e.target.value}); this.setState({errorMessage:''})}}></input>
                    <br/>
                    <input type='password' style={{marginTop:10, width:200}} placeholder='password' value={this.state.password} onChange={(e)=>{this.setState({password: e.target.value})}}></input>
                    <br/>
                    <button style={{marginTop:10}} className="ui primary button">submit</button>
                    <h3>{this.state.errorMessage}</h3>
                </form>
                
            </div>
        )
    } 
}

export default UserSignup;