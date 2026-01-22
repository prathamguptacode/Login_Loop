import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import api from './axios/api';
import Markdown from 'react-markdown';
function App() {
    type messageType = {
        user: string;
        comp: string;
    };

    const [message, setMessage] = useState<messageType[]>([]);
    const messageAreaR = useRef<HTMLDivElement>(null);
    const [thinking, setThinking] = useState(0);

    function handleEnter(e: React.KeyboardEvent) {
        if (e.code == 'Enter') {
            const val = (e.target as HTMLInputElement).value;
            setMessage((prev) => [...prev, { user: val, comp: '' }]);
            (e.target as HTMLInputElement).value = '';
        }
    }

    useEffect(() => {
        (async () => {
            if (messageAreaR.current) {
                messageAreaR.current.scrollTop =
                    messageAreaR.current?.scrollHeight;
            }

            if (message[message.length - 1]?.user) {
                const body = {
                    question: message[message.length - 1].user,
                };
                try {
                    setThinking(1);
                    const res = await api.post('/ask', body);
                    console.log(res);
                    setMessage((prev) => [
                        ...prev,
                        { user: '', comp: res.data.result },
                    ]);
                    setThinking(0);
                } catch (error) {
                    console.log(error);
                    console.log('Something went wrong');
                }
            }
        })();
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
                                  return (
                                      <div className="compM">
                                          <Markdown>{e.comp}</Markdown>
                                      </div>
                                  );
                              }
                          })}
                    {thinking ? <div className="loader"></div> : null}
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
