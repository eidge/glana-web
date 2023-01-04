import Menu from "../menu";
import { render, screen } from "@testing-library/react";

const props = {
  togglePlay: () => null,
  toggleFlights: () => null,
  toggleSettings: () => null,
  isFlightsOpen: false,
  isPlaying: false,
  isSettingsOpen: false,
};

describe("Menu", () => {
  it("renders items", () => {
    render(<Menu {...props} />);
    const items = screen.getAllByRole("button");
    expect(items.length).toEqual(3);
  });

  describe("play button", () => {
    it("shows play icon", () => {
      render(<Menu {...props} isPlaying={false} />);

      let playIcon = screen.queryByLabelText("play");
      let playLabel = screen.queryByText("play");
      let pauseIcon = screen.queryByLabelText("pause");
      let pauseLabel = screen.queryByText("pause");

      expect(playIcon).toBeVisible();
      expect(playLabel).toBeVisible();
      expect(pauseIcon).toBeNull();
      expect(pauseLabel).toBeNull();
    });

    it("changes to pause when active", () => {
      render(<Menu {...props} isPlaying={true} />);

      let playIcon = screen.queryByLabelText("play");
      let playLabel = screen.queryByText("play");
      let pauseIcon = screen.queryByLabelText("pause");
      let pauseLabel = screen.queryByText("pause");

      expect(playIcon).toBeNull();
      expect(playLabel).toBeNull();
      expect(pauseIcon).toBeVisible();
      expect(pauseLabel).toBeVisible();
    });
  });
});
