import tw, { styled } from "twin.macro";

export const PageContainer = styled.div`
    ${tw`
    px-4 md:px-8
    py-8
    max-w-screen-2xl mx-auto
    flex h-screen flex-col justify-between
    `}

    a {
        ${tw`
        text-yellow-300
        hover:text-yellow-100
        font-normal
        `}
    }
`;
