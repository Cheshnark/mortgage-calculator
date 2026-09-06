// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { CurrencyField } from "./CurrencyField";

function renderField(value: number) {
  const onChange = vi.fn();
  render(
    <NextIntlClientProvider locale="es" messages={{}}>
      <CurrencyField
        id="principal"
        label="Capital"
        value={value}
        onChange={onChange}
      />
    </NextIntlClientProvider>,
  );
  return {
    input: screen.getByLabelText("Capital") as HTMLInputElement,
    onChange,
  };
}

describe("CurrencyField", () => {
  it("en reposo muestra el importe agrupado", () => {
    const { input } = renderField(150_000);
    expect(input).toHaveValue("150.000");
  });

  it("al enfocarlo pasa a número plano para poder editarlo", async () => {
    const user = userEvent.setup();
    const { input } = renderField(150_000);

    await user.click(input);

    expect(input).toHaveValue("150000");
  });

  it("notifica solo los dígitos escritos", async () => {
    const user = userEvent.setup();
    const { input, onChange } = renderField(150_000);

    await user.clear(input);
    await user.type(input, "200000");

    expect(onChange).toHaveBeenLastCalledWith(200_000);
  });

  it("descarta los separadores que pegue el usuario", async () => {
    const user = userEvent.setup();
    const { input, onChange } = renderField(150_000);

    await user.clear(input);
    await user.paste("240.500 €");

    expect(onChange).toHaveBeenLastCalledWith(240_500);
  });

  it("notifica NaN cuando se vacía el campo", async () => {
    const user = userEvent.setup();
    const { input, onChange } = renderField(150_000);

    await user.clear(input);

    expect(onChange).toHaveBeenLastCalledWith(Number.NaN);
  });
});
