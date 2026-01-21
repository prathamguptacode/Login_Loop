import './App.css';
import Navbar from './components/Navbar';
function App() {

    return (
        <>
            <Navbar />
            <div className="parent">
                <div className="inbox">
                    <input
                        type="text"
                        className="message"
                    />
                </div>
            </div>
        </>
    );
}

export default App;
