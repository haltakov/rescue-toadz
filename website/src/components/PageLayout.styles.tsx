import tw, { styled } from "twin.macro";

export const Link = styled.a`
    ${tw`
    text-blue-300
    hover:text-white
    `}
`;

export const PageContainer = styled.div`
    ${tw`
    px-4 md:px-8
    py-8
    max-w-screen-2xl mx-auto
    flex h-screen flex-col justify-between
    `}
`;
