import { FooterContainer } from "./Footer.styles";

const Footer = () => {
    return (
        <FooterContainer>
            Created by{" "}
            <strong>
                <a href="https://twitter.com/haltakov" target="_blank">
                    @haltakov
                </a>
            </strong>{" "}
            , art by{" "}
            <strong>
                <a href="https://twitter.com/ianbydesign" target="_blank">
                    @ianbydesign
                </a>
            </strong>
            .
        </FooterContainer>
    );
};

export default Footer;
