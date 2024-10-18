import React from 'react';
import {Router, Route, Switch} from 'react-router-dom';
import UserSignup from './UserSignup';
import UserLogin from './UserLogin';
import Gameboard from './gameboard';
import Main from './Main';
import history from '../history';
import UserList from './UserList';
import Profile from './profile';    

class App extends React.Component {
    state = {
        user:{},
        usersList:[],
        tableList:[]
    }

    userFromUserList = (user) => {
        this.setState({user:user})
    }

    usersFromUserList = (users) => {
        this.setState({usersList:users})
    }

    tableListFromUserList = (tables) => {
        this.setState({tableList:tables})
    }

    render() {
        return (
            <div style={{marginLeft:'10px'}}>
                <Router history={history}>
                    <h1>x-o App</h1>
                    <Switch>
                        <Route path="/" exact component={Main}/>
                        <Route path="/signup" exact component={UserSignup}/>
                        <Route path="/login" exact  component={UserLogin}/>
                        <Route path="/gameboard" exact component={Gameboard}/>
                        <Route path="/userlist" exact render={(props) => (
                            <UserList 
                                {...props} 
                                user={this.state.user} 
                                usersList={this.state.usersList} 
                                tableList={this.state.tableList}
                                userFromUserList={this.userFromUserList} 
                                usersFromUserList={this.usersFromUserList} 
                                tableListFromUserList={this.tableListFromUserList}
                            />)}
                        />
                        <Route path="/profile" exact component={Profile}/>                    
                    </Switch>
                </Router>
            </div>
        )
    }
}

export default App;