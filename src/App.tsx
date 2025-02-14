import "./App.css";
import "tdesign-react/es/style/index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./pages/Index.tsx";
import LxIndex from "./pages/LauncherX/Index.tsx";
import MenuBar from "./components/MenuBar.tsx";

function App() {
    // const [count, setCount] = useState(0);

    return (
        <>
            <div className="w-full h-screen">
                <BrowserRouter>
                    <MenuBar />

                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="lx">
                            <Route index element={<LxIndex />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </div>
        </>
    );
}

export default App;
