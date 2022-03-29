import tw, { styled } from "twin.macro";

export const MainContainer = styled.div`
    ${tw`
    mt-4
    
    mb-auto
    mx-auto
    max-w-6xl
    `}
`;

export const Explanation = styled.div`
    ${tw`
    text-center
    text-xl font-thin
    mx-auto
    max-w-4xl
    `}

    h3 {
        ${tw`
        my-8
        `}
    }

    p {
        ${tw`
        my-2
        `}
    }
`;

export const Collection = styled.div`
    ${tw`
    text-center
    text-xl font-thin
    p-4 md:p-8 lg:p-16
    grid
    grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    md:gap-6 lg:gap-8
    `}
`;

export const NFT = styled.div`
    ${tw`
    
    `}

    h3 {
        ${tw`
        font-normal
        `}
    }

    h4 {
        ${tw`
        font-thin
        text-base
        h-6
        `}
    }

    img {
        ${tw`
        py-2
        `}
    }

    img.hover-image {
        ${tw`
        absolute
        hidden
        left-0
        top-0
        `}
    }

    div {
        ${tw`
        relative
        `}
    }

    div:hover img.hover-image {
        ${tw`
        inline
        `}
    }

    span {
        ${tw`
        text-lg
        `}
    }
`;

export const NFTButtonContainer = styled.div`
    ${tw`
    my-2
    text-center
    text-xl font-thin
    px-4
    flex
    justify-center
    gap-2
    `}

    input {
        ${tw`
        font-thin
        w-32
        py-0
        px-2
        rounded-md
        mr-1
        border-0
        text-gray-800
        `}
    }

    button {
        ${tw`
        w-36
        py-1
        font-light
        text-gray-800
        rounded-md
    
        bg-gradient-to-br from-yellow-400 to-yellow-200
        hover:(bg-gradient-to-tl from-yellow-200 to-yellow-100)
        
        disabled:(bg-none bg-gray-400 text-gray-500)
        `}
    }
`;

export const FAQ = styled.div`
    ${tw`
    text-center
    mb-16
    `}

    h3 {
        ${tw`
        text-3xl
        font-normal
        `}
    }

    h4 {
        ${tw`
        mt-4 mb-1
        p-0
        `}
    }
`;

export const QuestionsContainer = styled.div`
    ${tw`
    my-6
    text-center
    text-xl font-thin
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    px-4 md:px-8 lg:px-16
    md:gap-6 lg:gap-8
    `}

    h4 {
        ${tw`
        font-normal
        mb-2
        `}
    }

    p {
        ${tw`
        `}
    }
`;

export const ConnectWallet = styled.div`
    ${tw`
    mt-12
    h-12
    text-center
    font-light
    text-xl
    `}

    button {
        ${tw`
        block
        mx-auto
        w-48
        text-gray-800
        rounded-md
        p-2
        text-xl

        bg-gradient-to-br from-yellow-400 to-yellow-200
        hover:(bg-gradient-to-tl from-yellow-200 to-yellow-100)
        `}
    }

    a {
        ${tw`
        cursor-pointer
        `}
    }
`;

export const ImportantInfo = styled.div`
    ${tw`
    text-center
    mb-12
    max-w-3xl
    mx-auto
    `}

    h3 {
        ${tw`
        text-3xl
        font-normal
        mb-8
        `}
    }

    ul {
        ${tw`
        text-left
        text-lg
        font-thin
        `}

        li {
            ${tw`
            py-1
            `}
        }

        strong {
            ${tw`
            w-48
            inline-block
            `}
        }
    }
`;

export const Notification = styled.div`
    ${tw`
    fixed
    top-0
    right-0
    mx-4
    mt-4
    `}

    div {
        ${tw`
        mt-4
        p-6
        rounded
        transition
        duration-500
        text-xl
        font-light
        `}
    }

    .error {
        ${tw`
        bg-red-200
        text-red-900
        `}
    }

    .success {
        ${tw`
        bg-green-200
        text-green-900
        `}
    }
`;
