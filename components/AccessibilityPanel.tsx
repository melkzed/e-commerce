"use client";

import { Accessibility, Contrast, RotateCcw, Type, Underline } from "lucide-react";
import { useEffect, useState } from "react";

type FontScale = "normal" | "large" | "xlarge";

type AccessibilitySettings = {
  fontScale: FontScale;
  highContrast: boolean;
  reduceMotion: boolean;
  readableSpacing: boolean;
  underlineLinks: boolean;
};

const ACCESSIBILITY_KEY = "melkzedek-accessibility-settings";

const defaultSettings: AccessibilitySettings = {
  fontScale: "normal",
  highContrast: false,
  reduceMotion: false,
  readableSpacing: false,
  underlineLinks: false
};

function readAccessibilitySettings() {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const stored = window.localStorage.getItem(ACCESSIBILITY_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function applyAccessibilitySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;

  root.dataset.a11yFont = settings.fontScale;
  root.dataset.a11yContrast = settings.highContrast ? "high" : "default";
  root.dataset.a11yMotion = settings.reduceMotion ? "reduced" : "default";
  root.dataset.a11ySpacing = settings.readableSpacing ? "wide" : "default";
  root.dataset.a11yLinks = settings.underlineLinks ? "underlined" : "default";
}

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    const storedSettings = readAccessibilitySettings();
    setSettings(storedSettings);
    applyAccessibilitySettings(storedSettings);
  }, []);

  const updateSettings = (nextSettings: AccessibilitySettings) => {
    setSettings(nextSettings);
    applyAccessibilitySettings(nextSettings);
    window.localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(nextSettings));
  };

  const patchSettings = (patch: Partial<AccessibilitySettings>) => {
    updateSettings({ ...settings, ...patch });
  };

  const resetSettings = () => {
    updateSettings(defaultSettings);
  };

  return (
    <aside className="accessibility-widget" aria-label="Acessibilidade">
      <button
        className="accessibility-trigger"
        type="button"
        aria-controls="accessibility-panel"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Accessibility size={20} />
        <span>Acessibilidade</span>
      </button>

      {open && (
        <section id="accessibility-panel" className="accessibility-panel">
          <div className="accessibility-panel-head">
            <div>
              <span>WCAG</span>
              <h2>Ajustes de leitura</h2>
            </div>
            <button className="icon-only-button" type="button" onClick={resetSettings} aria-label="Restaurar ajustes">
              <RotateCcw size={17} />
            </button>
          </div>

          <div className="accessibility-control">
            <span>
              <Type size={16} />
              Tamanho do texto
            </span>
            <div className="accessibility-segment" role="group" aria-label="Tamanho do texto">
              {[
                ["normal", "A"],
                ["large", "A+"],
                ["xlarge", "A++"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={settings.fontScale === value ? "active" : undefined}
                  type="button"
                  onClick={() => patchSettings({ fontScale: value as FontScale })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="accessibility-toggle">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(event) => patchSettings({ highContrast: event.target.checked })}
            />
            <span>
              <Contrast size={16} />
              Contraste alto
            </span>
          </label>

          <label className="accessibility-toggle">
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(event) => patchSettings({ reduceMotion: event.target.checked })}
            />
            <span>
              <Accessibility size={16} />
              Reduzir movimento
            </span>
          </label>

          <label className="accessibility-toggle">
            <input
              type="checkbox"
              checked={settings.underlineLinks}
              onChange={(event) => patchSettings({ underlineLinks: event.target.checked })}
            />
            <span>
              <Underline size={16} />
              Sublinhar links
            </span>
          </label>

          <label className="accessibility-toggle">
            <input
              type="checkbox"
              checked={settings.readableSpacing}
              onChange={(event) => patchSettings({ readableSpacing: event.target.checked })}
            />
            <span>
              <Type size={16} />
              Espaçamento de leitura
            </span>
          </label>
        </section>
      )}
    </aside>
  );
}
