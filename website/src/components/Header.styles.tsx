import tw, { styled } from "twin.macro";

export const HeaderContainer = styled.div`
    ${tw`
    text-center
    `}

    h1 {
        ${tw`
        mt-4
        text-7xl
        font-bold
        text-transparent bg-clip-text
        bg-gradient-to-b from-yellow-400 to-yellow-200
        `}
    }
`;
