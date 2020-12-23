import Button from "../button";
import { render, screen } from "@testing-library/react";

async function expectButtonToMatchSnapshot() {
  const button = await screen.findByRole("button");
  expect(button).toMatchSnapshot();
}

describe("Button", () => {
  it("renders solo icon", async () => {
    render(<Button size="lg" color="white" icon="cog" onClick={jest.fn} />);
    const icon = screen.queryByLabelText("cog");
    expect(icon).toBeVisible();
    expectButtonToMatchSnapshot();
  });

  it("renders solo text", async () => {
    render(
      <Button size="lg" color="white" text="click me" onClick={jest.fn} />
    );

    const text = await screen.findByText("click me");
    expect(text).toHaveTextContent("click me");
    expect(text).not.toHaveAttribute("class", expect.stringContaining("pl-2"));

    const icon = screen.queryByLabelText("cog");
    expect(icon).toBeNull();

    expectButtonToMatchSnapshot();
  });

  it("renders icon and text", async () => {
    render(
      <Button
        size="lg"
        color="white"
        icon="cog"
        text="click me"
        onClick={jest.fn}
      />
    );

    const text = await screen.findByText("click me");
    expect(text).toHaveTextContent("click me");
    expect(text).toHaveAttribute("class", expect.stringContaining("pl-2"));

    const icon = screen.queryByLabelText("cog");
    expect(icon).toBeVisible();

    expectButtonToMatchSnapshot();
  });
});
