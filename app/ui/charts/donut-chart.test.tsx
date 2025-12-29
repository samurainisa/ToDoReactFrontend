import { render, screen } from "@testing-library/react";
import { DonutChart } from "./donut-chart";

describe("DonutChart", () => {
  test("renders empty state when total is 0", () => {
    render(
      <DonutChart
        segments={[
          { id: "a", label: "A", value: 0, color: "#000" },
          { id: "b", label: "B", value: 0, color: "#000" },
        ]}
      />
    );

    expect(screen.getByText("Нет данных")).toBeInTheDocument();
  });
});

