import "./App.css";
import "tdesign-react/es/style/index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./pages/Index.tsx";

function App() {
    // const [count, setCount] = useState(0);

    return (
        <>
            <div className="w-full h-screen">
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </>
    );
}

export default App;
