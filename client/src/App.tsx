import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import api from './axios/api';
function App() {
    type messageType = {
        user: string;
        comp: string;
    };

    const [message, setMessage] = useState<messageType[]>([]);
    const messageAreaR = useRef<HTMLDivElement>(null);

    function handleEnter(e: React.KeyboardEvent) {
        if (e.code == 'Enter') {
            const val = (e.target as HTMLInputElement).value;
            setMessage((prev) => [...prev, { user: val, comp: '' }]);
            (e.target as HTMLInputElement).value = '';
        }
    }

    useEffect(() => {
        if (messageAreaR.current) {
            messageAreaR.current.scrollTop = messageAreaR.current?.scrollHeight;
        }
        if(message[message.length - 1].user){
            api.post('/ask')
        }
    }, [message]);

    return (
        <>
            <Navbar />
            <div className="parent">
                <div className="messageArea" ref={messageAreaR}>
                    {message.length == 0
                        ? null
                        : message.map((e) => {
                              if (e.user) {
                                  return <div className="userM">{e.user}</div>;
                              }
                              if (e.comp) {
                                  return <div className="compM">{e.comp}</div>;
                              }
                          })}
                </div>
                <div className="inbox">
                    <input
                        type="text"
                        className="message"
                        onKeyDown={handleEnter}
                    />
                </div>
            </div>
        </>
    );
}

export default App;
