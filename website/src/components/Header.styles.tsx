import tw, { styled } from "twin.macro";

export const HeaderContainer = styled.div`
    ${tw`
    text-center
    `}

    div {
        ${tw`
        mt-8
        flex flex-row flex-wrap
        justify-center
        gap-12
        `}

        img {
            ${tw`
            h-16
            `}
        }
    }

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

export const OpenseaLink = styled.div`
    ${tw`
    absolute md:fixed
    top-0
    right-0
    m-2 md:m-3 lg:m-6 xl:m-8
    `}

    svg {
        ${tw`
            w-8 md:w-10 lg:w-16
        `}
    }
`;
