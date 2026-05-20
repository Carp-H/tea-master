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

    expect(screen.getByLabelText("Tea Master logo")).toBeInTheDocument();
    expect(screen.queryByText("TEA MASTER")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Language")).toHaveValue("en");
    expect(screen.getByText("Choose tea and vessel, then brew by vessel capacity")).toBeInTheDocument();
    expect(
      screen.getByText("Designed with great passion by LH, in collaboration with Codex.")
    ).toBeInTheDocument();
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
    expect(screen.getByRole("spinbutton", { name: "投茶量" })).toHaveValue(2.5);
    expect(screen.getByTestId("temperature").dataset.value).toBe("90–100°C");
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
    expect(screen.getByRole("spinbutton", { name: "投茶量" })).toHaveValue(20);
    expect(screen.getByTestId("ratio").dataset.value).toBe("1:20–1:40");
  });

  it("lets users edit tea leaves, ratio, and temperature with fixed step sizes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");

    const teaAmountInput = screen.getByRole("spinbutton", { name: "投茶量" });
    const ratioInput = screen.getByRole("spinbutton", { name: "茶水比" });
    const temperatureMinInput = screen.getByRole("spinbutton", {
      name: "水温 下限"
    });
    const temperatureMaxInput = screen.getByRole("spinbutton", {
      name: "水温 上限"
    });

    expect(teaAmountInput).toHaveAttribute("step", "0.1");
    expect(ratioInput).toHaveAttribute("step", "10");
    expect(temperatureMinInput).toHaveAttribute("step", "5");
    expect(temperatureMaxInput).toHaveAttribute("step", "5");
    expect(teaAmountInput).toHaveValue(2.5);
    expect(ratioInput).toHaveValue(100);
    expect(temperatureMinInput).toHaveValue(80);
    expect(temperatureMaxInput).toHaveValue(100);

    await user.clear(teaAmountInput);
    await user.type(teaAmountInput, "3.2");
    expect(teaAmountInput).toHaveValue(3.2);

    await user.clear(ratioInput);
    await user.type(ratioInput, "110");
    expect(ratioInput).toHaveValue(110);
    expect(teaAmountInput).toHaveValue(2.3);

    await user.clear(temperatureMinInput);
    await user.type(temperatureMinInput, "85");
    expect(temperatureMinInput).toHaveValue(85);
    expect(screen.getByTestId("temperature").dataset.value).toBe("85–100°C");
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
    expect(screen.getByTestId("ratio").dataset.value).toBe("1:20–1:40");
    expect(screen.getByTestId("temperature").dataset.value).toBe("100°C");
    expect(screen.getByTestId("infusion-count")).toHaveTextContent("6–7 泡");

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

  it("shows the revised dark tea gaiwan recommendation and two-rinse flow", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "黑茶" }));

    const vesselGroup = screen.getByRole("group", { name: "推荐主泡器" });
    expect(
      within(vesselGroup).getByRole("button", { name: "盖碗" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(vesselGroup).getByRole("button", { name: "紫砂壶/陶壶" })
    ).toBeInTheDocument();
    expect(
      within(vesselGroup).queryByRole("button", { name: "紫砂壶" })
    ).not.toBeInTheDocument();
    expect(
      within(vesselGroup).queryByRole("button", { name: "陶壶" })
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("ratio").dataset.value).toBe("1:20–1:25");
    expect(screen.getByRole("spinbutton", { name: "投茶量" })).toHaveValue(5.5);
    expect(screen.getByTestId("infusion-count")).toHaveTextContent("7 泡");

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    const firstRinseStep = within(flow).getByText("润茶 1").closest("li");
    const secondRinseStep = within(flow).getByText("润茶 2").closest("li");

    expect(firstRinseStep).toHaveTextContent("10 秒");
    expect(firstRinseStep).toHaveTextContent("快速注水后倒出");
    expect(firstRinseStep).toHaveTextContent("不饮用");
    expect(secondRinseStep).toHaveTextContent("即进即出");
    expect(secondRinseStep).toHaveTextContent("不饮用");
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveTextContent(
      "即冲即出"
    );
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveTextContent(
      "即冲即出"
    );
    expect(within(flow).getByText("第 3 泡").closest("li")).toHaveTextContent(
      "即冲即出"
    );
    expect(within(flow).getByText("第 4 泡").closest("li")).toHaveTextContent(
      "5 秒"
    );
    expect(within(flow).getByText("第 7 泡").closest("li")).toHaveTextContent(
      "20 秒"
    );
  });

  it("shows the green tea glass-cup refill flow and optional third infusion", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });

    expect(screen.getByTestId("temperature").dataset.value).toBe("80–100°C");

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
    expect(screen.getByTestId("ratio").dataset.value).toBe("1:100");
    expect(screen.getByTestId("temperature").dataset.value).toBe("90–100°C");

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
    expect(screen.getByTestId("temperature").dataset.value).toBe("100°C");

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

    expect(screen.getByTestId("ratio").dataset.value).toBe("1:15–1:20");
    expect(screen.getByTestId("temperature").dataset.value).toBe("95–100°C");

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

  it("localizes the footer credit", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    expect(screen.getByText("LH与Codex通力合作，诚意呈现。")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("语言"), "de");
    expect(
      screen.getByText("Von LH herzlich gestaltet, in Zusammenarbeit mit Codex.")
    ).toBeInTheDocument();
  });

  it("collects feedback and exposes recipe export actions", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");

    const feedback = screen.getByRole("region", { name: "反馈与分享" });
    expect(
      within(feedback).getByRole("button", { name: "很满意" })
    ).toBeInTheDocument();
    expect(
      within(feedback).getByRole("button", { name: "导出图片" })
    ).toBeInTheDocument();
    expect(
      within(feedback).getByRole("button", { name: "导出 PDF" })
    ).toBeInTheDocument();

    await user.click(within(feedback).getByRole("button", { name: "很满意" }));
    expect(within(feedback).getByRole("button", { name: "很满意" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await user.type(
      within(feedback).getByLabelText("留言反馈"),
      "希望之后增加浓淡偏好。"
    );
    await user.click(within(feedback).getByRole("button", { name: "提交反馈" }));

    expect(within(feedback).getByText("反馈已记录，谢谢。")).toBeInTheDocument();
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
    expect(within(flow).getByText("润茶 1").closest("li")).toHaveAttribute(
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
    expect(within(flow).getByText("润茶 1").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(within(flow).getByText("润茶 2").closest("li")).not.toHaveAttribute(
      "aria-current"
    );

    fireEvent.click(screen.getByRole("button", { name: "开始下一泡" }));

    expect(screen.getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(within(flow).getByText("润茶 2").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(within(flow).getByText("润茶 1").closest("li")).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("lets users select a brewing flow step to reset the timer to that step", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });
    fireEvent.click(screen.getByRole("tab", { name: "黑茶" }));

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    const fourthInfusionStep = within(flow).getByText("第 4 泡").closest("li");

    expect(fourthInfusionStep).not.toBeNull();
    fireEvent.click(fourthInfusionStep!);

    expect(screen.getByTestId("timer-display")).toHaveTextContent("00:05");
    expect(within(flow).getByText("第 4 泡").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    const timer = screen.getByRole("region", { name: "逐泡计时" });
    expect(
      within(timer).getByText("5 秒 · 计时结束后立即出汤。")
    ).toBeInTheDocument();

    const secondRinseStep = within(flow).getByText("润茶 2").closest("li");
    expect(secondRinseStep).not.toBeNull();
    fireEvent.click(secondRinseStep!);

    expect(screen.getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(within(flow).getByText("润茶 2").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
  });
});
