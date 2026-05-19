import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("Tea Master app", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to English as the main interface", () => {
    render(<App />);

    expect(screen.getByLabelText("Language")).toHaveValue("en");
    expect(screen.getByText("Choose tea and vessel, then brew by vessel capacity")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Green" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.queryByRole("tab", { name: "Yellow" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Raw Pu-erh" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Ripe Pu-erh" })).not.toBeInTheDocument();
    expect(screen.getByText("Recommended vessel")).toBeInTheDocument();
    expect(screen.queryByText("People")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Increase people" })).not.toBeInTheDocument();
    expect(screen.queryByText("选择茶类")).not.toBeInTheDocument();
  });

  it("shows the recommended vessels after selecting a tea type", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    expect(screen.queryByRole("tab", { name: "黄茶" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "普洱生茶" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "普洱熟茶" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "白茶" }));

    const vesselGroup = screen.getByRole("group", { name: "推荐主泡器" });
    expect(
      within(vesselGroup).getByRole("button", { name: "盖碗" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(vesselGroup).queryByRole("button", { name: "瓷壶" })
    ).not.toBeInTheDocument();
  });

  it("updates quantified recommendations from vessel capacity when vessel changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "红茶" }));
    await user.click(screen.getByRole("button", { name: "瓷壶" }));

    expect(screen.queryByText("喝茶人数")).not.toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "注水量" })).toHaveValue(230);
    expect(screen.getByText("2.5 克")).toBeInTheDocument();
    expect(screen.getByText("90–100°C")).toBeInTheDocument();
  });

  it("lets users edit water amount and recalculates tea leaves from the ratio", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "白茶" }));

    const waterInput = screen.getByRole("spinbutton", { name: "注水量" });
    expect(waterInput).toHaveAttribute("min", "10");
    expect(waterInput).toHaveAttribute("step", "10");
    await user.clear(waterInput);
    await user.type(waterInput, "600");

    expect(waterInput).toHaveValue(600);
    expect(screen.getByText("20 克")).toBeInTheDocument();
    expect(screen.getByText("1:20–1:40")).toBeInTheDocument();
  });

  it("shows the revised white tea gaiwan-only recommendation, rinse, and six-to-seven infusion flow", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "白茶" }));

    const vesselGroup = screen.getByRole("group", { name: "推荐主泡器" });
    expect(
      within(vesselGroup).getByRole("button", { name: "盖碗" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(vesselGroup).queryByRole("button", { name: "瓷壶" })
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("ratio")).toHaveTextContent("1:20–1:40");
    expect(screen.getByTestId("temperature")).toHaveTextContent("100°C");

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    expect(within(flow).getByText("润茶").closest("li")).toHaveTextContent(
      "100°C"
    );
    expect(within(flow).getByText("润茶").closest("li")).toHaveTextContent(
      "立刻倒出"
    );
    expect(within(flow).getByText("润茶").closest("li")).toHaveTextContent(
      "不饮用"
    );
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveTextContent(
      "20–30 秒"
    );
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveTextContent(
      "25–30 秒"
    );
    expect(within(flow).getByText("第 3 泡").closest("li")).toHaveTextContent(
      "35 秒"
    );
    expect(within(flow).getByText("第 6 泡").closest("li")).toHaveTextContent(
      "50 秒"
    );
    expect(within(flow).getByText("可选第 7 泡").closest("li")).toHaveTextContent(
      "55 秒"
    );
  });

  it("uses the rinse-specific discard wording for generic rinse steps", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "黑茶" }));

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    const rinseStep = within(flow).getByText("润茶").closest("li");

    expect(rinseStep).toHaveTextContent("快速注水后倒出");
    expect(rinseStep).toHaveTextContent("不饮用");
  });

  it("shows the green tea glass-cup refill flow and optional third infusion", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });

    expect(screen.getByTestId("temperature")).toHaveTextContent("80–100°C");

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveTextContent(
      "80/85°C"
    );
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveTextContent(
      "120 秒"
    );
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveTextContent(
      "剩三分之一"
    );
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveTextContent(
      "100°C"
    );
    expect(within(flow).getByText("可选第 3 泡").closest("li")).toHaveTextContent(
      "3–5 分钟"
    );

    fireEvent.click(screen.getByRole("button", { name: "开始" }));
    expect(screen.getByTestId("timer-display")).toHaveTextContent("02:00");
    expect(screen.getByText("杯中浸泡")).toBeInTheDocument();
  });

  it("shows the revised black tea porcelain-pot recommendation and optional third infusion", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "红茶" }));
    await user.click(screen.getByRole("button", { name: "瓷壶" }));

    expect(screen.getByRole("spinbutton", { name: "注水量" })).toHaveValue(230);
    expect(screen.getByTestId("ratio")).toHaveTextContent("1:100");
    expect(screen.getByTestId("temperature")).toHaveTextContent("90–100°C");

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveTextContent(
      "120 秒"
    );
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveTextContent(
      "180 秒"
    );
    expect(within(flow).getByText("可选第 3 泡").closest("li")).toHaveTextContent(
      "300 秒"
    );
  });

  it("shows the revised black tea gaiwan temperature and six-infusion flow", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "红茶" }));

    expect(screen.getByRole("button", { name: "盖碗" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByTestId("temperature")).toHaveTextContent("100°C");

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveTextContent(
      "20 秒"
    );
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveTextContent(
      "20 秒"
    );
    expect(within(flow).getByText("第 3 泡").closest("li")).toHaveTextContent(
      "25 秒"
    );
    expect(within(flow).getByText("第 4 泡").closest("li")).toHaveTextContent(
      "30 秒"
    );
    expect(within(flow).getByText("第 5 泡").closest("li")).toHaveTextContent(
      "40 秒"
    );
    expect(within(flow).getByText("第 6 泡").closest("li")).toHaveTextContent(
      "50 秒"
    );
    expect(within(flow).queryByText("第 7 泡")).not.toBeInTheDocument();
  });

  it("shows the revised oolong ratio range, temperature range, and immediate pours", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "乌龙" }));

    expect(screen.getByTestId("ratio")).toHaveTextContent("1:15–1:20");
    expect(screen.getByTestId("temperature")).toHaveTextContent("95–100°C");

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    expect(within(flow).queryByText("润茶")).not.toBeInTheDocument();
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveTextContent(
      "即冲即出"
    );
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveTextContent(
      "即冲即出"
    );
    expect(within(flow).getByText("第 3 泡").closest("li")).toHaveTextContent(
      "5 秒"
    );
    expect(within(flow).getByText("第 7 泡").closest("li")).toHaveTextContent(
      "25 秒"
    );
    expect(screen.getByTestId("timer-display")).toHaveTextContent("00:00");

    await user.click(screen.getByRole("button", { name: "开始" }));

    expect(screen.getByText("您的茶好了，请慢慢品尝。")).toBeInTheDocument();
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );

    await user.click(screen.getByRole("button", { name: "开始下一泡" }));
    expect(screen.getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );

    await user.click(screen.getByRole("button", { name: "开始下一泡" }));
    expect(screen.getByTestId("timer-display")).toHaveTextContent("00:05");
    expect(within(flow).getByText("第 3 泡").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
  });

  it("switches interface copy to English without changing the recipe", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
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

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("timer-display")).toHaveTextContent("01:59");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId("timer-display")).toHaveTextContent("01:59");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByTestId("timer-display")).toHaveTextContent("02:00");
  });

  it("waits for the user before starting the next infusion and highlights the active flow step", async () => {
    vi.useFakeTimers();
    render(<App />);

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });
    fireEvent.click(screen.getByRole("tab", { name: "黑茶" }));

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    expect(within(flow).getByText("润茶").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );

    fireEvent.click(screen.getByRole("button", { name: "开始" }));
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(screen.getByText("您的茶好了，请慢慢品尝。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始下一泡" })).toBeInTheDocument();
    expect(within(flow).getByText("润茶").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(within(flow).getByText("第 1 泡").closest("li")).not.toHaveAttribute(
      "aria-current"
    );

    fireEvent.click(screen.getByRole("button", { name: "开始下一泡" }));

    expect(screen.getByTestId("timer-display")).toHaveTextContent("00:10");
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(within(flow).getByText("润茶").closest("li")).not.toHaveAttribute(
      "aria-current"
    );
  });
});
