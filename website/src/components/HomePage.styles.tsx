import tw, { styled } from "twin.macro";

export const MainContainer = styled.div`
    ${tw`
    mt-8
    
    mb-auto
    mx-auto
    max-w-6xl
    `}
`;

export const Explanation = styled.div`
    ${tw`
    text-center
    text-xl font-thin
    `}

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
    md:gap-8 lg:gap-12
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
        w-24
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
`;

export const QuestionsContainer = styled.div`
    ${tw`
    my-6
    text-center
    text-xl font-thin
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    px-4 md:px-8 lg:px-16
    md:gap-6 lg:gap-10
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

export const Notification = styled.div`
    ${tw`
    fixed
    top-0
    right-0
    m-4
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
