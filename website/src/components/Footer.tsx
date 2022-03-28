import { FooterContainer } from "./Footer.styles";

const Footer = () => {
    return (
        <FooterContainer>
            <p>
                Created by{" "}
                <strong>
                    <a href="https://twitter.com/haltakov" target="_blank">
                        @haltakov
                    </a>
                </strong>{" "}
                art by{" "}
                <strong>
                    <a href="https://twitter.com/ianbydesign" target="_blank">
                        @ianbydesign
                    </a>
                </strong>
                .
            </p>

            <p>
                All code of the website and the smart contract is{" "}
                <a href="https://github.com/haltakov/rescue-toadz" target="_blank">
                    open source
                </a>
                .
            </p>
        </FooterContainer>
    );
};

export default Footer;
