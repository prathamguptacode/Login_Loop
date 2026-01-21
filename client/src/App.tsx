import { useRef, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
function App() {
    const [message, setMessage] = useState([]);
    const messageUser = useRef<HTMLInputElement>(null);
    function handleEnter(e: React.KeyboardEvent) {
        if (e.code == 'Enter') {
            if (messageUser.current?.value) {
                messageUser.current.value = '';
            }
        }
    }

    return (
        <>
            <Navbar />
            <div className="parent">
                <div className="user">hello world</div>
                <div className="user">hello world</div>
                <div className="user">hello world</div>
                <div className="inbox">
                    <input
                        type="text"
                        className="message"
                        ref={messageUser}
                        onKeyDown={handleEnter}
                    />
                </div>
            </div>
        </>
    );
}

export default App;
