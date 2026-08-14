import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { saveProfile } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { GENDERS, SKIN_TYPES } from "@/lib/skin-types";
import type { Lifestyle, Profile } from "@/lib/types";
import { showError, showSuccess } from "@/lib/toast";
import { Button } from "@/app/_components/button";

const inputCn =
  "w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2.5 text-(--text)";

const radioChipCn =
  "flex cursor-pointer items-center gap-2 rounded-(--cui-radius-full) border border-(--border) px-4 py-2 text-sm text-(--text-muted) transition-colors has-[input:checked]:border-transparent has-[input:checked]:bg-accent has-[input:checked]:text-(--on-accent)";

const LIFESTYLES: readonly Lifestyle[] = [
  "sedentary",
  "light",
  "active",
  "very_active",
];

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isPending, startSave] = useTransition();
  const [dob, setDob] = useState(profile?.date_of_birth ?? "");
  const [skinTypes, setSkinTypes] = useState<string[]>(
    profile?.skin_types ?? [],
  );
  const [newSkinType, setNewSkinType] = useState("");
  const age = calcAge(dob);
  const isFirstFill = !profile;

  const toggleSkinType = (s: string) => {
    setSkinTypes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const addCustomSkinType = () => {
    const v = newSkinType.trim().slice(0, 40);
    if (!v) return;
    setSkinTypes((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setNewSkinType("");
  };

  const presetSet = new Set<string>(SKIN_TYPES);
  const customSkinTypes = skinTypes.filter((s) => !presetSet.has(s));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    skinTypes.forEach((s) => formData.append("skin_types", s));
    startSave(async () => {
      const result = await saveProfile(formData);
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        if (isFirstFill) {
          window.location.href = "/dashboard";
        } else {
          showSuccess(t.common.saved);
        }
      } else if (result.errorCode) {
        showError(t.settings.errors.generic);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t.profile.name}</span>
        <input
          name="name"
          defaultValue={profile?.name ?? ""}
          placeholder={t.profile.namePlaceholder}
          autoComplete="given-name"
          className={inputCn}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          {t.profile.dateOfBirth}
          {age !== null && (
            <span className="ml-2 text-xs font-normal text-(--text-muted)">
              ({t.profile.age} {age})
            </span>
          )}
        </span>
        <input
          name="date_of_birth"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className={inputCn}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t.profile.gender}</legend>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <label key={g} className={radioChipCn}>
              <input
                type="radio"
                name="gender"
                value={g}
                defaultChecked={profile?.gender === g}
                className="sr-only"
              />
              {t.genders[g]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">
          {t.profile.skinTypes}{" "}
          <span className="text-(--text-muted)">{t.profile.skinTypesHint}</span>
        </legend>

        <div className="grid gap-2 sm:grid-cols-2">
          {SKIN_TYPES.map((skin) => {
            const active = skinTypes.includes(skin);
            return (
              <button
                key={skin}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSkinType(skin)}
                className={[
                  "flex min-h-[44px] cursor-pointer items-center justify-center rounded-(--cui-radius-full) border px-4 py-2 text-sm transition-colors",
                  active
                    ? "border-transparent bg-accent text-(--on-accent)"
                    : "border-(--border) text-(--text-muted) hover:border-(--accent-border) hover:text-(--text)",
                ].join(" ")}
              >
                {t.skinTypes[skin]}
              </button>
            );
          })}
          {customSkinTypes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed
              aria-label={`${t.profile.skinTypesCustom.removeLabel} ${s}`}
              onClick={() => toggleSkinType(s)}
              className="flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-(--cui-radius-full) border border-transparent bg-accent px-4 py-2 text-sm text-(--on-accent) transition-colors"
            >
              {s}
              <span aria-hidden className="opacity-60">
                ×
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newSkinType}
            onChange={(e) => setNewSkinType(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkinType();
              }
            }}
            placeholder={t.profile.skinTypesCustom.placeholder}
            className="flex-1 rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text)"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addCustomSkinType}
            disabled={!newSkinType.trim()}
          >
            {t.profile.skinTypesCustom.add}
          </Button>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t.profile.lifestyle}</legend>
        <p className="text-xs text-(--text-muted)">{t.profile.lifestyleHint}</p>
        <div className="flex flex-wrap gap-2">
          {LIFESTYLES.map((l) => (
            <label key={l} className={radioChipCn}>
              <input
                type="radio"
                name="lifestyle"
                value={l}
                defaultChecked={(profile?.lifestyle ?? "sedentary") === l}
                className="sr-only"
              />
              {t.profile.lifestyles[l]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t.profile.childrenCount}</span>
        <input
          type="number"
          name="children_count"
          min={0}
          max={20}
          defaultValue={profile?.children_count ?? 0}
          className={`sm:w-32 ${inputCn}`}
        />
      </label>

      <div className="safe-bottom sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-(--border) bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          {isPending ? t.common.saving : t.common.save}
        </Button>
      </div>
    </form>
  );
}
