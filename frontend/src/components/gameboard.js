import React from 'react';
import {socket} from '../index';
import history from '../history';

class Gameboard extends React.Component {
    constructor(props) {
        super(props);
        this.ref1 = React.createRef();
        this.ref2 = React.createRef();
        this.ref3 = React.createRef();
        this.ref4 = React.createRef();
        this.ref5 = React.createRef();
        this.ref6 = React.createRef();
        this.ref7 = React.createRef();
        this.ref8 = React.createRef();
        this.ref9 = React.createRef(); 
    }

    state={
        turnIndicator:'',
        start:'',
        winX :[],
        winO :[],
        turnCounter:'',
    }

    componentDidMount(){

        socket.on('player', (data) => {
        this.setState({turnIndicator:data.text})
        })

        socket.on('start', (data) => {
            if (data.newgame) {
                this.newG();
            }
            this.setState({start:data.text})
        });

        socket.on('array', (array) => {
            if (this.state.turnCounter === 'X') {
                this.setState({winX: array});
                for (let k=0; k<array.length; k++) {    
                    if (array[k]===this.ref1.current.id) {
                        this.ref1.current.textContent='X'
                    }
                    if (array[k]===this.ref2.current.id) {
                        this.ref2.current.textContent='X'
                    }
                    if (array[k]===this.ref3.current.id) {
                        this.ref3.current.textContent='X'
                    }
                    if (array[k]===this.ref4.current.id) {
                        this.ref4.current.textContent='X'
                    }
                    if (array[k]===this.ref5.current.id) {
                        this.ref5.current.textContent='X'
                    }
                    if (array[k]===this.ref6.current.id) {
                        this.ref6.current.textContent='X'
                    }
                    if (array[k]===this.ref7.current.id) {
                        this.ref7.current.textContent='X'
                    }
                    if (array[k]===this.ref8.current.id) {
                        this.ref8.current.textContent='X'
                    }
                    if (array[k]===this.ref9.current.id) {
                        this.ref9.current.textContent='X'
                    }
                }
                this.setState({turnCounter:'O'});
            } else if (this.state.turnCounter === 'O') {
                this.setState({winO: array});
                for (let k=0; k<array.length; k++) {    
                            
                    if (array[k]===this.ref1.current.id) {
                        this.ref1.current.textContent='O'
                    }
                    if (array[k]===this.ref2.current.id) {
                        this.ref2.current.textContent='O'
                    }
                    if (array[k]===this.ref3.current.id) {
                        this.ref3.current.textContent='O'
                    }
                    if (array[k]===this.ref4.current.id) {
                        this.ref4.current.textContent='O'
                    }
                    if (array[k]===this.ref5.current.id) {
                        this.ref5.current.textContent='O'
                    }
                    if (array[k]===this.ref6.current.id) {
                        this.ref6.current.textContent='O'
                    }
                    if (array[k]===this.ref7.current.id) {
                        this.ref7.current.textContent='O'
                    }
                    if (array[k]===this.ref8.current.id) {
                        this.ref8.current.textContent='O'
                    }
                    if (array[k]===this.ref9.current.id) {
                        this.ref9.current.textContent='O'
                    }
                }
                this.setState({turnCounter:'X'});
            }
        
            if (this.winCriteria(this.state.winX) && this.state.turnIndicator === 'You are X') {
                socket.emit('result', 'You lost, Game Over!');
                this.setState({start : 'You won, Game Over!'});
            }
            else if (this.winCriteria(this.state.winO) && this.state.turnIndicator === 'You are O') {
                socket.emit('result', 'You lost, Game Over!');
                this.setState({start:'You won, Game Over!'});
            }
            else if ((this.state.winO.includes('a') || this.state.winX.includes('a')) & (this.state.winO.includes('b') || this.state.winX.includes('b')) &
                (this.state.winO.includes('c') || this.state.winX.includes('c')) & (this.state.winO.includes('d') || this.state.winX.includes('d')) &
                (this.state.winO.includes('e') || this.state.winX.includes('e')) & (this.state.winO.includes('f') || this.state.winX.includes('f')) &
                (this.state.winO.includes('g') || this.state.winX.includes('g')) & (this.state.winO.includes('h') || this.state.winX.includes('h')) &
                (this.state.winO.includes('i') || this.state.winX.includes('i'))) {
                this.setState({start:'Draw, Game Over!'});
            }
        });

        socket.on('Result', (data) => {
            this.setState({start: data});  
        });
        
        socket.on('newGData', (id) => {
            this.newG();
        });
    }

    componentWillUnmount(){
        socket.off('player');
        socket.off('start');
        socket.off('array');
        socket.off('Result');
        socket.off('newGData');
    }

    newG() {
        this.ref1.current.textContent=''
        this.ref2.current.textContent=''
        this.ref3.current.textContent=''
        this.ref4.current.textContent=''
        this.ref5.current.textContent=''
        this.ref6.current.textContent=''
        this.ref7.current.textContent=''
        this.ref8.current.textContent=''
        this.ref9.current.textContent=''
        this.setState({winX :[]});
        this.setState({winO :[]});
        if (this.state.turnIndicator === 'You are X') {
            this.setState({start:'Game underway, your turn'});
        } else {
            this.setState({start:'Game underway, opponent turn'});
        }
        this.setState({turnCounter :'X'});
    };

    mark(event) {
        event.persist();
        event.preventDefault();
        if (event.target.textContent === '' & this.state.turnCounter === 'X' & this.state.start === 'Game underway, your turn' & this.state.turnIndicator === 'You are X') {    
            this.setState({start: 'Game underway, opponent turn'});
            socket.emit('opponentTurn', {text:'Game underway, your turn'});
            this.state.winX.push(event.target.id);
            socket.emit('event', this.state.winX);
           
    
        } else if (event.target.textContent === '' & this.state.turnCounter === 'O' & this.state.start === 'Game underway, your turn' & this.state.turnIndicator === 'You are O') {
            this.setState({start: 'Game underway, opponent turn'});
            socket.emit('opponentTurn', {text:'Game underway, your turn'});
            this.state.winO.push(event.target.id); 
            socket.emit('event', this.state.winO);                  
        }
    };

    winCriteria(winArray) {
        if  ((winArray.includes('a') & winArray.includes('b') & winArray.includes('c')) ||
            (winArray.includes('a') & winArray.includes('d') & winArray.includes('g')) ||
            (winArray.includes('a') & winArray.includes('e') & winArray.includes('i')) ||
            (winArray.includes('b') & winArray.includes('e') & winArray.includes('h')) ||
            (winArray.includes('c') & winArray.includes('f') & winArray.includes('i')) ||
            (winArray.includes('c') & winArray.includes('e') & winArray.includes('g')) ||
            (winArray.includes('d') & winArray.includes('e') & winArray.includes('f')) ||
            (winArray.includes('g') & winArray.includes('h') & winArray.includes('i'))) {
            return true;
        }
        return false
    };

    emitNewG () {
        if (this.state.start === 'Game underway, your turn' || this.state.start === 'Game underway, opponent turn') {
            alert('Game in progess!')
         } else {
            socket.emit('newG', true)
     
        }
    }

    onFormLogoutSubmit = () => {
        history.push('/')
        socket.emit('logout')
    }

    backToLobby = () => {
        history.push('/userList')
        socket.emit('backToLobby')
    }
    
    render () {
        return (
            <div>
                <hr style = {{marginRight: 30}}/>
                <p id='start'>{this.state.start}</p>
                <p id='turnIndicator'>{this.state.turnIndicator}</p>
                <p id='turn'></p>   
                <br/>
                <br/>
                <table>
                    <tbody id="elems">
                        <tr>
                            <td id='a' ref={this.ref1} className='areas' align='center' height="50px" width='50px' bgcolor='lightgreen' onClick={(e) => {this.mark(e)}}></td>
                            <td id='b' ref={this.ref2} className='areas' align='center' height="50px" width='50px' bgcolor='lightblue' onClick={(e) => {this.mark(e)}}></td>
                            <td id='c' ref={this.ref3} className='areas' align='center' height="50px" width='50px' bgcolor='orange' onClick={(e) => {this.mark(e)}}></td>
                        </tr>
                        <tr>
                            <td id='d' ref={this.ref4} className='areas' align='center' height="50px" width='50px' bgcolor='lightblue' onClick={(e) => {this.mark(e)}}></td>
                            <td id='e' ref={this.ref5} className='areas' align='center' height="50px" width='50px' bgcolor='orange' onClick={(e) => {this.mark(e)}}></td>
                            <td id='f' ref={this.ref6} className='areas' align='center' height="50px" width='50px' bgcolor='lightgreen' onClick={(e) => {this.mark(e)}}></td>
                        </tr>
                        <tr>
                            <td id='g' ref={this.ref7} className='areas' align='center' height="50px" width='50px' bgcolor='orange' onClick={(e) => {this.mark(e)}}></td>
                            <td id='h' ref={this.ref8} className='areas' align='center' height="50px" width='50px' bgcolor='lightgreen' onClick={(e) => {this.mark(e)}}></td>
                            <td id='i' ref={this.ref9} className='areas' align='center' height="50px" width='50px' bgcolor='lightblue' onClick={(e) => {this.mark(e)}}></td>
                        </tr>
                    </tbody>
                </table>
                <br/>
                <button id='newGameButton' className="ui primary button" onClick={(e) => {this.emitNewG(e)}}>new game</button>
                <hr style = {{marginRight: 30}}/> 
                <button className="ui green button" onClick={(e) => {this.backToLobby(e)}}>back to lobby</button> 
                <form className="ui form" style = {{marginTop: 7}} onSubmit={this.onFormLogoutSubmit}>
                    <button className="ui red button" >
                        logout
                    </button>
                </form>
            </div>
        )
    }
}

export default Gameboard;