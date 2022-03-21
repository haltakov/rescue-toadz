/* eslint-disable testing-library/no-node-access */
import { render, screen } from "@testing-library/react";
import HomePage from "./HomePage";

describe("HomePage", () => {
    test("show the NFT collection images", () => {
        render(<HomePage />);

        for (let i = 1; i <= 12; ++i) {
            expect(screen.getByAltText(`Ukraine Toad #${i}`)).toBeInTheDocument();
        }
    });
});
