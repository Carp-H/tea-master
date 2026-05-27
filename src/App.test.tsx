import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const exportMocks = vi.hoisted(() => ({
  downloadRecipeImage: vi.fn(() => Promise.resolve()),
  downloadRecipePdf: vi.fn(() => Promise.resolve())
}));

vi.mock("./lib/recipeExport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./lib/recipeExport")>();

  return {
    ...actual,
    downloadRecipeImage: exportMocks.downloadRecipeImage,
    downloadRecipePdf: exportMocks.downloadRecipePdf
  };
});

describe("Tea Master app", () => {
  beforeEach(() => {
    exportMocks.downloadRecipeImage.mockClear();
    exportMocks.downloadRecipePdf.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to English as the main interface", () => {
    render(<App />);

    expect(screen.getByLabelText("Tea Master logo")).toBeInTheDocument();
    expect(screen.queryByText("TEA MASTER")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Language")).toHaveValue("en");
    expect(
      screen.getByText("No tea is born bad; only the way of brewing goes astray.")
    ).toBeInTheDocument();
    expect(screen.getByText("Taste Zen in Tea")).toBeInTheDocument();
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

  it("highlights the prepare step before any brewing timer starts", async () => {
    const user = userEvent.setup();
    render(<App />);

    const flow = screen.getByRole("region", { name: "Brewing flow" });
    expect(within(flow).getByText("Prepare").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(within(flow).getByText("Infusion 1").closest("li")).not.toHaveAttribute(
      "aria-current"
    );

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    const localizedFlow = screen.getByRole("region", { name: "泡茶流程" });
    expect(within(localizedFlow).getByText("准备").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(within(localizedFlow).getByText("第 1 泡").closest("li")).not.toHaveAttribute(
      "aria-current"
    );
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
    expect(screen.getByTestId("tea-amount")).toHaveTextContent("2.3 克");
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
    expect(screen.getByTestId("tea-amount")).toHaveTextContent("20.0 克");
    expect(screen.getByTestId("ratio").dataset.value).toBe("1:30");
  });

  it("keeps tea leaves calculated from water and ratio while temperature stays read-only", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");

    const waterInput = screen.getByRole("spinbutton", { name: "注水量" });
    const teaAmount = screen.getByTestId("tea-amount");
    const ratioInput = screen.getByRole("spinbutton", {
      name: "茶水比"
    }) as HTMLInputElement;

    expect(within(teaAmount).queryByRole("textbox")).not.toBeInTheDocument();
    expect(ratioInput).toHaveAttribute("step", "10");
    expect(screen.queryByRole("spinbutton", { name: "水温 下限" })).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: "水温 上限" })).not.toBeInTheDocument();
    expect(teaAmount).toHaveTextContent("2.5 克");
    expect(ratioInput).toHaveValue(100);
    expect(screen.getByTestId("temperature").dataset.value).toBe("80–100°C");

    await user.clear(ratioInput);
    await user.type(ratioInput, "110");
    expect(ratioInput).toHaveValue(110);
    expect(teaAmount).toHaveTextContent("2.3 克");

    await user.clear(waterInput);
    await user.type(waterInput, "330");
    expect(waterInput).toHaveValue(330);
    expect(teaAmount).toHaveTextContent("3.0 克");
  });

  it("steps tea-water ratio inputs by ten from their current recommendation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "白茶" }));

    const ratioInput = screen.getByRole("spinbutton", {
      name: "茶水比"
    }) as HTMLInputElement;
    expect(ratioInput).toHaveValue(30);

    act(() => {
      ratioInput.stepUp();
    });
    fireEvent.input(ratioInput);

    expect(ratioInput).toHaveValue(40);
    expect(screen.getByTestId("tea-amount")).toHaveTextContent("2.8 克");
  });

  it("uses a decimal point in Chinese and English, and a decimal comma in German", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    expect(screen.getByTestId("tea-amount").dataset.value).toBe("2.5");

    await user.selectOptions(screen.getByLabelText("语言"), "en");
    expect(screen.getByTestId("tea-amount").dataset.value).toBe("2.5");

    await user.selectOptions(screen.getByLabelText("Language"), "de");
    expect(screen.getByTestId("tea-amount").dataset.value).toBe("2,5");
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
    expect(screen.getByTestId("ratio").dataset.value).toBe("1:30");
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

    await user.click(
      within(within(flow).getByText("润茶").closest("li")!).getByRole("button", {
        name: "开始"
      })
    );
    expect(
      within(screen.getByRole("dialog", { name: "逐泡计时" })).getByText(
        "您的茶润好了，开始冲泡吧！"
      )
    ).toBeInTheDocument();
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
    expect(screen.getByTestId("ratio").dataset.value).toBe("1:20");
    expect(screen.getByTestId("tea-amount")).toHaveTextContent("5.5 克");
    expect(screen.getByTestId("infusion-count")).toHaveTextContent("8–10 泡");

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
    expect(within(flow).getByText("第 8 泡").closest("li")).toHaveTextContent(
      "25 秒"
    );
    expect(within(flow).getByText("可选第 9 泡").closest("li")).toHaveTextContent(
      "30 秒"
    );
    expect(within(flow).getByText("可选第 10 泡").closest("li")).toHaveTextContent(
      "35 秒"
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
      "前一泡茶水还剩大约三分之一"
    );
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveTextContent(
      "100°C"
    );
    expect(within(flow).getByText("可选第 3 泡").closest("li")).toHaveTextContent(
      "3–5 分钟"
    );
    expect(within(flow).getByText("可选第 3 泡").closest("li")).toHaveTextContent(
      "前一泡茶水还剩大约三分之一"
    );

    expect(screen.queryByRole("region", { name: "逐泡计时" })).not.toBeInTheDocument();
    const firstInfusionStep = within(flow).getByText("第 1 泡").closest("li");
    expect(firstInfusionStep).not.toBeNull();

    fireEvent.click(within(firstInfusionStep!).getByRole("button", { name: "开始" }));
    const timer = screen.getByRole("dialog", { name: "逐泡计时" });
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("02:00");
    expect(within(timer).queryByText("杯中浸泡")).not.toBeInTheDocument();
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

  it("shows the revised black tea gaiwan temperature and four-to-six infusion flow", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "红茶" }));

    expect(screen.getByRole("button", { name: "盖碗" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByTestId("temperature").dataset.value).toBe("100°C");
    expect(screen.getByTestId("infusion-count")).toHaveTextContent("4–6 泡");

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
    expect(within(flow).getByText("可选第 5 泡").closest("li")).toHaveTextContent(
      "40 秒"
    );
    expect(within(flow).getByText("可选第 6 泡").closest("li")).toHaveTextContent(
      "50 秒"
    );
    expect(within(flow).queryByText("第 7 泡")).not.toBeInTheDocument();
  });

  it("shows the revised oolong fixed ratio, temperature range, and immediate pours", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    await user.click(screen.getByRole("tab", { name: "乌龙" }));

    expect(screen.getByTestId("ratio").dataset.value).toBe("1:15");
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
    expect(screen.queryByRole("dialog", { name: "逐泡计时" })).not.toBeInTheDocument();

    await user.click(
      within(within(flow).getByText("第 1 泡").closest("li")!).getByRole("button", {
        name: "开始"
      })
    );
    const timer = screen.getByRole("dialog", { name: "逐泡计时" });
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(within(timer).queryByRole("button", { name: "开始" })).not.toBeInTheDocument();
    expect(within(timer).getByText("即冲即出，即时品饮。")).toBeInTheDocument();
    expect(within(flow).getByText("第 1 泡").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );

    await user.click(within(timer).getByRole("button", { name: "开始下一泡" }));
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(within(flow).getByText("第 2 泡").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );

    await user.click(within(timer).getByRole("button", { name: "开始下一泡" }));
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:05");
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
    expect(screen.getByText("LH x Codex, 诚意呈现。")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("语言"), "de");
    expect(
      screen.getByText("Von LH herzlich gestaltet, in Zusammenarbeit mit Codex.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Es gibt keinen schlechten Tee, nur falsche Zubereitung.")
    ).toBeInTheDocument();
    expect(screen.getByText("Tee und Zen - ein Geschmack")).toBeInTheDocument();
    expect(screen.queryByText("Tee und Zen - ein Geschmack.")).not.toBeInTheDocument();
  });

  it("does not render the feedback module", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");

    expect(screen.queryByRole("region", { name: "反馈与分享" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "很满意" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "提交反馈" })).not.toBeInTheDocument();
  });

  it("opens recipe export options from the brewing flow", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    const flow = screen.getByRole("region", { name: "泡茶流程" });

    expect(
      within(flow).queryByRole("menuitem", { name: "保存为 PNG 图片" })
    ).not.toBeInTheDocument();

    await user.click(within(flow).getByRole("button", { name: "保存我的泡茶配方" }));

    const exportMenu = within(flow).getByRole("menu", { name: "保存我的泡茶配方" });
    for (const label of [
      "保存为 PNG 图片",
      "保存为 JPEG 图片",
      "以 PDF 格式保存"
    ]) {
      expect(within(exportMenu).getByRole("menuitem", { name: label })).toBeInTheDocument();
    }
    expect(within(exportMenu).queryByRole("menuitem", { name: "保存为 WebP 图片" })).not.toBeInTheDocument();
    expect(within(exportMenu).queryByRole("menuitem", { name: "保存为 SVG 图片" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("heading", { name: "Tea Master" }));
    expect(
      within(flow).queryByRole("menu", { name: "保存我的泡茶配方" })
    ).not.toBeInTheDocument();
  });

  it("exports the recipe with the selected image format", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    const flow = screen.getByRole("region", { name: "泡茶流程" });
    const options = [
      ["保存为 PNG 图片", "png"],
      ["保存为 JPEG 图片", "jpeg"]
    ] as const;

    for (const [label, format] of options) {
      await user.click(within(flow).getByRole("button", { name: "保存我的泡茶配方" }));
      await user.click(
        within(flow).getByRole("menuitem", {
          name: label
        })
      );

      await waitFor(() =>
        expect(exportMocks.downloadRecipeImage).toHaveBeenLastCalledWith(
          expect.objectContaining({ appName: "Tea Master" }),
          expect.objectContaining({ teaType: "green" }),
          expect.objectContaining({ waterMl: "250" }),
          format
        )
      );
      expect(
        within(flow).queryByRole("menu", { name: "保存我的泡茶配方" })
      ).not.toBeInTheDocument();
    }
  });

  it("exports the recipe as a direct PDF download without opening a print window", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    render(<App />);

    await user.selectOptions(screen.getByLabelText("Language"), "zh");
    const flow = screen.getByRole("region", { name: "泡茶流程" });

    await user.click(within(flow).getByRole("button", { name: "保存我的泡茶配方" }));
    await user.click(
      within(flow).getByRole("menuitem", {
        name: "以 PDF 格式保存"
      })
    );

    await waitFor(() =>
      expect(exportMocks.downloadRecipePdf).toHaveBeenCalledWith(
        expect.objectContaining({ appName: "Tea Master" }),
        expect.objectContaining({ teaType: "green" }),
        expect.objectContaining({ waterMl: "250" })
      )
    );
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("runs the guided timer through start, pause, and reset", async () => {
    vi.useFakeTimers();
    render(<App />);

    const flow = screen.getByRole("region", { name: "Brewing flow" });
    const firstStep = within(flow).getByText("Infusion 1").closest("li");
    expect(firstStep).not.toBeNull();
    expect(screen.queryByRole("dialog", { name: "Infusion timer" })).not.toBeInTheDocument();

    fireEvent.click(within(firstStep!).getByRole("button", { name: "Start" }));
    const timer = screen.getByRole("dialog", { name: "Infusion timer" });
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("02:00");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("01:59");

    fireEvent.click(within(timer).getByRole("button", { name: "Pause" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("01:59");

    fireEvent.click(within(timer).getByRole("button", { name: "Reset" }));
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("02:00");
  });

  it("keeps the background step button synced while the timer dialog is open", async () => {
    vi.useFakeTimers();
    render(<App />);

    const flow = screen.getByRole("region", { name: "Brewing flow" });
    const firstStep = within(flow).getByText("Infusion 1").closest("li");
    expect(firstStep).not.toBeNull();

    fireEvent.click(within(firstStep!).getByRole("button", { name: "Start" }));
    const timer = screen.getByRole("dialog", { name: "Infusion timer" });

    expect(within(firstStep!).getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(within(firstStep!).getByRole("button", { name: "02:00" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("01:59");
    expect(within(firstStep!).getByRole("button", { name: "01:59" })).toBeInTheDocument();
  });

  it("uses the unified English drinking prompt when an infusion timer ends", async () => {
    vi.useFakeTimers();
    render(<App />);

    const flow = screen.getByRole("region", { name: "Brewing flow" });
    const firstStep = within(flow).getByText("Infusion 1").closest("li");
    expect(firstStep).not.toBeNull();

    fireEvent.click(within(firstStep!).getByRole("button", { name: "Start" }));
    const timer = screen.getByRole("dialog", { name: "Infusion timer" });

    act(() => {
      vi.advanceTimersByTime(120000);
    });

    expect(within(timer).getByText("take a sip!")).toBeInTheDocument();
    expect(within(timer).queryByText("Your tea is ready. Sip slowly.")).not.toBeInTheDocument();
  });

  it("keeps a closed running timer visible in its brewing step button", async () => {
    vi.useFakeTimers();
    render(<App />);

    const flow = screen.getByRole("region", { name: "Brewing flow" });
    const firstStep = within(flow).getByText("Infusion 1").closest("li");
    expect(firstStep).not.toBeNull();

    fireEvent.click(within(firstStep!).getByRole("button", { name: "Start" }));
    const timer = screen.getByRole("dialog", { name: "Infusion timer" });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("01:59");

    fireEvent.click(within(timer).getByRole("button", { name: "Close timer" }));

    expect(screen.queryByRole("dialog", { name: "Infusion timer" })).not.toBeInTheDocument();
    expect(within(firstStep!).getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(within(firstStep!).getByRole("button", { name: "01:59" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(within(firstStep!).getByRole("button", { name: "01:58" })).toBeInTheDocument();

    fireEvent.click(within(firstStep!).getByRole("button", { name: "Pause" }));
    expect(within(firstStep!).getByRole("button", { name: "Resume" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(within(firstStep!).getByRole("button", { name: "01:58" })).toBeInTheDocument();

    fireEvent.click(within(firstStep!).getByRole("button", { name: "Resume" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(within(firstStep!).getByRole("button", { name: "01:57" })).toBeInTheDocument();

    fireEvent.click(within(firstStep!).getByRole("button", { name: "01:57" }));
    expect(screen.getByRole("dialog", { name: "Infusion timer" })).toBeInTheDocument();
  });

  it("reopens a closed timer dialog when the countdown finishes", async () => {
    vi.useFakeTimers();
    render(<App />);

    const flow = screen.getByRole("region", { name: "Brewing flow" });
    const firstStep = within(flow).getByText("Infusion 1").closest("li");
    expect(firstStep).not.toBeNull();

    fireEvent.click(within(firstStep!).getByRole("button", { name: "Start" }));
    const timer = screen.getByRole("dialog", { name: "Infusion timer" });
    fireEvent.click(within(timer).getByRole("button", { name: "Close timer" }));
    expect(screen.queryByRole("dialog", { name: "Infusion timer" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(120000);
    });

    const reopenedTimer = screen.getByRole("dialog", { name: "Infusion timer" });
    expect(within(reopenedTimer).getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(within(reopenedTimer).getByText("take a sip!")).toBeInTheDocument();
  });

  it("waits for the user before starting the next infusion and highlights the active flow step", async () => {
    vi.useFakeTimers();
    render(<App />);

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });
    fireEvent.click(screen.getByRole("tab", { name: "黑茶" }));

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    expect(within(flow).getByText("准备").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(within(flow).getByText("润茶 1").closest("li")).not.toHaveAttribute(
      "aria-current"
    );

    fireEvent.click(
      within(within(flow).getByText("润茶 1").closest("li")!).getByRole("button", {
        name: "开始"
      })
    );
    const timer = screen.getByRole("dialog", { name: "逐泡计时" });
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(within(timer).getByText("第一道润茶结束，请继续。")).toBeInTheDocument();
    expect(within(timer).getByRole("button", { name: "开始下一泡" })).toBeInTheDocument();
    expect(within(flow).getByText("润茶 1").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(within(flow).getByText("润茶 2").closest("li")).not.toHaveAttribute(
      "aria-current"
    );

    fireEvent.click(within(timer).getByRole("button", { name: "开始下一泡" }));

    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(within(flow).getByText("润茶 2").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(within(flow).getByText("润茶 1").closest("li")).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("opens a step-specific timer from the brewing flow", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });
    fireEvent.click(screen.getByRole("tab", { name: "黑茶" }));

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    const fourthInfusionStep = within(flow).getByText("第 4 泡").closest("li");

    expect(fourthInfusionStep).not.toBeNull();
    fireEvent.click(
      within(fourthInfusionStep!).getByRole("button", { name: "开始" })
    );
    const timer = screen.getByRole("dialog", { name: "逐泡计时" });

    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:05");
    expect(within(timer).queryByText("出汤")).not.toBeInTheDocument();
    expect(within(flow).getByText("第 4 泡").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(
      within(timer).getByText("5 秒 · 计时结束后立即出汤。")
    ).toBeInTheDocument();

    const secondRinseStep = within(flow).getByText("润茶 2").closest("li");
    expect(secondRinseStep).not.toBeNull();
    fireEvent.click(
      within(secondRinseStep!).getByRole("button", { name: "开始" })
    );

    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:00");
    expect(within(flow).getByText("润茶 2").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
  });

  it("resets any step-specific timer to that step's own initial time", () => {
    vi.useFakeTimers();
    render(<App />);

    fireEvent.change(screen.getByLabelText("Language"), {
      target: { value: "zh" }
    });
    fireEvent.click(screen.getByRole("tab", { name: "黑茶" }));

    const flow = screen.getByRole("region", { name: "泡茶流程" });
    const fourthInfusionStep = within(flow).getByText("第 4 泡").closest("li");
    expect(fourthInfusionStep).not.toBeNull();

    fireEvent.click(
      within(fourthInfusionStep!).getByRole("button", { name: "开始" })
    );

    const timer = screen.getByRole("dialog", { name: "逐泡计时" });
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:05");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:04");

    fireEvent.click(within(timer).getByRole("button", { name: "重置" }));

    expect(within(timer).getByTestId("timer-display")).toHaveTextContent("00:05");
    expect(within(timer).getByText("第 4 泡")).toBeInTheDocument();
    expect(fourthInfusionStep).toHaveAttribute("aria-current", "step");
  });
});
