import React from 'react';
import history from '../history';
import {socket} from '../index'

class UserList extends React.Component {
    state = {
        user: {},
        users: [],
        room: '',
        roomList:[],
        error: '',
        createError: ''        
    }

    componentDidMount(){
        this.setState({user:this.props.user})
        this.setState({users:this.props.usersList})
        this.setState({roomList:this.props.tableList})

        socket.on('listFromServerToUserList', (data) => {
            this.setState({users:data})
            this.props.usersFromUserList(data)
        })

        socket.on('logoutUpdatedList', (list) => {
            this.setState({users:list})
        })

        socket.on('logedinUser', (user) => {
            this.setState({user:user})
            this.props.userFromUserList(user)
        })

        socket.on('usersListFromDisconnect', async (data) => {
            this.setState({users:data})
        })  
        
        socket.on('roomList', (roomList) => {
            this.setState({roomList:roomList})
            this.props.tableListFromUserList(roomList)
        })

        socket.on('roomWelcomeMessage', (message) => {
            console.log(message);
        })

        socket.on('createError', (error) => {
            this.setState({createError:error})
        })

        socket.on('roomCreationConfirmation', (value) => {
            history.push('/gameboard')
        })

        socket.on('roomJoiningConfirmation', (value) => {
            history.push('/gameboard')
        })
    }

    componentWillUnmount(){
        socket.off('listFromServerToUserList');
        socket.off('logoutUpdatedList');
        socket.off('logedinUser');
        socket.off('usersListFromDisconnect');
        socket.off('roomList');
        socket.off('roomWelcomeMessage');
        socket.off('createError');
    }


    onFormLogoutSubmit = () => {
        history.push('/')
        socket.emit('logout', this.state.user)
    }

    onFormCreateSubmit = (e) => {
        e.preventDefault();
        if (this.state.room.length>10 || this.state.room.length<3) {
            this.setState({createError: 'table name should be between 3-10 characters'})
        } else {
            socket.emit('createRoom', {username:this.state.user.name, room:this.state.room})
        }
    }

    onFormProfileSubmit = () => {
        history.push('/profile')
        socket.emit('profile', this.state.user.name)
    }

    render () { 
        const renderRooms = this.state.roomList.map((list) => {
            return (
                <div  key={Math.random()} style={{width:133}} className="card">
                    <div className="content">
                        <div className="header">
                            {list.room}
                        </div>
                        <div className="extra content">
                            <form>
                                <button className="ui primary button" onClick={
                                    (e)=>{this.setState({room: list.room});
                                        if (list.users.length<2) {
                                            socket.emit('join', { username: this.state.user.name, room: list.room}); 
                                        } else {
                                            this.setState({error: 'this table is full, choose other table, or create a new one'})
                                        }
                                        e.preventDefault()
                                    }
                                }>
                                    join table
                                </button>
                                <div>
                                    {this.state.error}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )
        })

        const renderedList = this.state.users.map((user) => {
            return (
                <div key={user._id} className="item">
                    <div className='content'>
                        <div className='header'>
                            {user.name}
                        </div> 
                    </div>
                </div>
            )
        })

        return (
            <div>
                <h2>
                    Lobby
                </h2>
                <h3 style={{marginTop:0}}>Users online</h3>
                <div className="ui large list" style={{marginTop:-10}}>
                    {renderedList}
                </div>
                <hr style = {{marginRight: 30}}/>
                <h3 style={{marginTop:0}}>Tables</h3>
                <div className="ui cards">
                    {renderRooms}   
                </div>
                <br/>
                <form style = {{marginBottom: 30}} className="ui form" onSubmit={this.onFormCreateSubmit}>
                    <input style={{width:118}} placeholder='table name' onChange={(e)=>{
                        this.setState({room: e.target.value});
                        this.setState({createError: ''});
                    }}></input>
                    <div>{this.state.createError}</div> 
                    <button className="ui primary button" style={{marginTop:10}}>
                        create table
                    </button>
                </form>
                <hr style = {{marginRight: 30}}/>
                <form className="ui form" onSubmit={this.onFormProfileSubmit}>
                    <button className="ui bule button">
                        profile
                    </button>
                </form>
                <form style = {{marginTop: 5}} className="ui form" onSubmit={this.onFormLogoutSubmit}>
                    <button className="ui red button">
                        logout
                    </button>
                </form>
            </div>
        )
    }
    
}

export default UserList;