import React from 'react';
import {Link} from 'react-router-dom';

const Main = () => {
    return (
        <div className="ui">
            <h3 style={{marginBottom:-15}}><Link to="/signup" >sign up</Link></h3>
            <h3><Link to="/login" >login</Link></h3>
        </div>
    )
};

export default Main;

