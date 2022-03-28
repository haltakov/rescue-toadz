import { HeaderContainer, OpenseaLink } from "./Header.styles";

const Header = () => {
    return (
        <HeaderContainer>
            <div>
                <img src="/header_rescue.png" alt="Rescue Toadz header image" />
                <img src="/header_toadz.png" alt="Rescue Toadz header image" />
            </div>

            <h2>
                A collection of 18 toadz travelling the blockchain to raise funds for humanitarian aid to the Ukraine
            </h2>
        </HeaderContainer>
    );
};

export default Header;
