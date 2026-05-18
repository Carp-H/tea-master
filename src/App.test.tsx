import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("Tea Master app", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the recommended vessels after selecting a tea type", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "白茶" }));

    const vesselGroup = screen.getByRole("group", { name: "推荐主泡器" });
    expect(
      within(vesselGroup).getByRole("button", { name: "盖碗" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(vesselGroup).getByRole("button", { name: "瓷壶" })
    ).toBeInTheDocument();
  });

  it("updates quantified recommendations when people and vessel change", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "白茶" }));
    await user.click(screen.getByRole("button", { name: "增加人数" }));
    await user.click(screen.getByRole("button", { name: "增加人数" }));
    await user.click(screen.getByRole("button", { name: "瓷壶" }));

    expect(screen.getByText("3 人")).toBeInTheDocument();
    expect(screen.getByText("450 毫升")).toBeInTheDocument();
    expect(screen.getByText("7.5 克")).toBeInTheDocument();
    expect(screen.getByText("90°C")).toBeInTheDocument();
  });

  it("switches interface copy to English without changing the recipe", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "乌龙" }));
    const teaAmountBefore = screen.getByTestId("tea-amount").dataset.value;
    await user.selectOptions(screen.getByLabelText("语言"), "en");

    expect(screen.getByRole("heading", { name: "Tea Master" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Oolong" })).toBeInTheDocument();
    expect(screen.getByTestId("tea-amount").dataset.value).toBe(teaAmountBefore);
  });

  it("runs the guided timer through start, pause, and reset", async () => {
    vi.useFakeTimers();
    render(<App />);

    expect(screen.getByTestId("timer-display")).toHaveTextContent("02:00");

    fireEvent.click(screen.getByRole("button", { name: "开始" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("timer-display")).toHaveTextContent("01:59");

    fireEvent.click(screen.getByRole("button", { name: "暂停" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId("timer-display")).toHaveTextContent("01:59");

    fireEvent.click(screen.getByRole("button", { name: "重置" }));
    expect(screen.getByTestId("timer-display")).toHaveTextContent("02:00");
  });
});
