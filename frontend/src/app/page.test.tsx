import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders login form", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "CRM Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });
});
