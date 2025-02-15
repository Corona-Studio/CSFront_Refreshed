import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router";

import MenuBar from "./components/MenuBar.tsx";
import Index from "./pages/Index.tsx";
import LxIndex from "./pages/LauncherX/Index.tsx";

function App() {
    return (
        <>
            <div className="w-full h-screen">
                <MenuBar />
            </div>
        </>
    );
}

export default App;
