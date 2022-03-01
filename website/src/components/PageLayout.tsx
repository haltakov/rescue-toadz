import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import { PageContainer } from "./PageLayout.styles";

const PageLayout = () => {
    return (
        <PageContainer>
            <Header />
            <Outlet />
            <Footer />
        </PageContainer>
    );
};

export default PageLayout;
