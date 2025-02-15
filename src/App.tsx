import "./App.css";

import { Outlet } from "react-router";

import MenuBar from "./components/MenuBar.tsx";

function App() {
    return (
        <>
            <div className="w-full h-screen">
                <MenuBar />
                <Outlet />
            </div>
        </>
    );
}

export default App;
