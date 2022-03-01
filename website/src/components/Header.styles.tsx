import tw, { styled } from "twin.macro";

export const HeaderContainer = styled.div`
    ${tw`
    text-center
    `}

    h1 {
        ${tw`
        text-5xl md:text-7xl
        font-bold
        text-transparent bg-clip-text
        bg-gradient-to-b from-yellow-400 to-yellow-200
        `}
    }

    h2 {
        ${tw`
        mt-10
        text-2xl md:text-3xl
        font-bold
        text-transparent bg-clip-text
        bg-gradient-to-b from-yellow-200 to-yellow-100
        `}
    }
`;
