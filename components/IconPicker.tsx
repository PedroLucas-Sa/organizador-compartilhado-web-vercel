"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_PROJECT_ICON,
  PROJECT_ICON_CATEGORIES,
  PROJECT_ICONS,
  type ProjectIconCategory,
} from "@/data/project-icons";

type IconPickerProps = {
  value?: string | null;
  onChange: (icon: string) => void;
  disabled?: boolean;
  label?: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function IconPicker({ value, onChange, disabled = false, label = "Ícone" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProjectIconCategory | "Todos">("Todos");
  const selectedIcon = value?.trim() || DEFAULT_PROJECT_ICON;

  const selected = PROJECT_ICONS.find((item) => item.icon === selectedIcon);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    const seen = new Set<string>();

    return PROJECT_ICONS.filter((item) => {
      if (seen.has(item.icon)) return false;
      seen.add(item.icon);

      if (category !== "Todos" && item.category !== category) return false;
      if (!needle) return true;

      const haystack = normalize(`${item.label} ${item.category} ${item.keywords.join(" ")}`);
      return haystack.includes(needle);
    });
  }, [category, query]);

  function close() {
    setOpen(false);
    setQuery("");
    setCategory("Todos");
  }

  return (
    <div className="icon-picker-field">
      <span className="icon-picker-field-label">{label}</span>
      <button
        type="button"
        className="icon-picker-trigger"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="icon-picker-current">{selectedIcon}</span>
        <span className="icon-picker-trigger-copy">
          <b>{selected?.label ?? "Ícone personalizado"}</b>
          <small>Escolher outro ícone</small>
        </span>
        <span aria-hidden="true">⌄</span>
      </button>

      {open && (
        <div className="editor-overlay icon-picker-overlay" onMouseDown={close}>
          <div
            className="editor-card icon-picker-card"
            role="dialog"
            aria-modal="true"
            aria-label="Selecionar ícone do projeto"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="panel-header icon-picker-header">
              <div>
                <p className="eyebrow">ÍCONE DO PROJETO</p>
                <h2>Escolha um ícone</h2>
                <p className="muted">Busque por área, matéria ou finalidade do projeto.</p>
              </div>
              <button type="button" className="icon-button" aria-label="Fechar seletor" onClick={close}>×</button>
            </div>

            <div className="icon-picker-body">
              <input
                className="search-input icon-picker-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar: física, química, cálculo, leitura, laboratório..."
                autoFocus
              />

              <div className="icon-picker-categories" aria-label="Categorias de ícones">
                <button
                  type="button"
                  className={`filter-button ${category === "Todos" ? "active" : ""}`}
                  onClick={() => setCategory("Todos")}
                >
                  Todos
                </button>
                {PROJECT_ICON_CATEGORIES.map((item) => (
                  <button
                    type="button"
                    className={`filter-button ${category === item ? "active" : ""}`}
                    onClick={() => setCategory(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="icon-picker-summary">
                <span>{filtered.length} opção(ões)</span>
                <span>Selecionado: <b className="icon-picker-summary-icon">{selectedIcon}</b></span>
              </div>

              {filtered.length ? (
                <div className="icon-picker-grid">
                  {filtered.map((item) => (
                    <button
                      type="button"
                      className={`icon-picker-option ${selectedIcon === item.icon ? "selected" : ""}`}
                      key={`${item.icon}-${item.label}`}
                      title={`${item.label} — ${item.category}`}
                      onClick={() => {
                        onChange(item.icon);
                        close();
                      }}
                    >
                      <span>{item.icon}</span>
                      <small>{item.label}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="compact-empty small">
                  <b>Nenhum ícone encontrado.</b>
                  <span>Tente outro termo ou escolha outra categoria.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
