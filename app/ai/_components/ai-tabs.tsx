import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AddDashedButton } from "@/app/_components/add-dashed-button";

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
      <div className="flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {(["predefined", "custom"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "flex-1 rounded-md py-2 text-sm font-medium transition",
              tab === t
                ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
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
                className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {desc}
                  </p>
                </div>
                <span aria-hidden className="shrink-0 text-zinc-400">
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
            <p className="text-sm text-zinc-500">{labels.noCustom}</p>
          ) : (
            <ul className="space-y-2">
              {custom.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/ai/custom/$id"
                    params={{ id: p.id }}
                    className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{p.name}</p>
                      {p.question && (
                        <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                          {p.question}
                        </p>
                      )}
                    </div>
                    <span aria-hidden className="shrink-0 text-zinc-400">
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
