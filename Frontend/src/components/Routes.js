import React from "react";
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main.js";
import NotFound from "./pages/NotFound.js";


function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Main />} />
        </Routes>

    )
}

export default AppRoutes;