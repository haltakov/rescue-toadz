import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import PageLayout from "./components/PageLayout";

import Plausible from "plausible-tracker";

const { enableAutoPageviews } = Plausible({
    domain: "rescue-toadz.netlify.app",
    apiHost: "/plausible",
});

enableAutoPageviews();

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PageLayout />}>
                    <Route path="/" element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
