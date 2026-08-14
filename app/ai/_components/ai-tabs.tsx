import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AddDashedButton } from "@/app/_components/add-dashed-button";
import { cardClass } from "@/app/_components/card";

type PromptType = string;

type CustomPromptItem = {
  id: string;
  name: string;
  question: string | null;
};

type PredefinedItem = {
  type: PromptType;
  title: string;
  desc: string;
};

type Props = {
  predefined: PredefinedItem[];
  custom: CustomPromptItem[];
  labels: {
    predefinedTab: string;
    myTab: string;
    addNew: string;
    noCustom: string;
  };
};

export function AiTabs({ predefined, custom, labels }: Props) {
  const [tab, setTab] = useState<"predefined" | "custom">("predefined");
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-0.5 rounded-(--cui-radius-full) bg-(--surface-3) p-1">
        {(["predefined", "custom"] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={[
              "flex-1 rounded-(--cui-radius-full) py-2 text-sm transition-colors",
              tab === t
                ? "bg-(--surface) font-semibold text-(--text) shadow-(--cui-shadow-sm)"
                : "font-medium text-(--text-muted) hover:text-(--text)",
            ].join(" ")}
          >
            {t === "predefined" ? labels.predefinedTab : labels.myTab}
          </button>
        ))}
      </div>

      {/* Predefined tab */}
      {tab === "predefined" && (
        <ul className="space-y-2">
          {predefined.map(({ type, title, desc }) => (
            <li key={type}>
              <Link
                to="/ai/$type"
                params={{ type }}
                className={cardClass("default", "flex items-start justify-between gap-3 hover:border-(--accent-border)")}
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-(--text)">{title}</p>
                  <p className="text-sm text-(--text-muted)">
                    {desc}
                  </p>
                </div>
                <span aria-hidden className="shrink-0 text-(--text-soft)">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* My prompts tab */}
      {tab === "custom" && (
        <div className="space-y-2">
          <AddDashedButton onClick={() => navigate({ to: "/ai/custom/new" })}>
            + {labels.addNew}
          </AddDashedButton>
          {custom.length === 0 ? (
            <p className="text-sm text-(--text-muted)">{labels.noCustom}</p>
          ) : (
            <ul className="space-y-2">
              {custom.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/ai/custom/$id"
                    params={{ id: p.id }}
                    className={cardClass("default", "flex items-start justify-between gap-3 hover:border-(--accent-border)")}
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium text-(--text)">{p.name}</p>
                      {p.question && (
                        <p className="truncate text-sm text-(--text-muted)">
                          {p.question}
                        </p>
                      )}
                    </div>
                    <span aria-hidden className="shrink-0 text-(--text-soft)">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
