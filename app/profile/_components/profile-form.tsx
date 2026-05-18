"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { saveProfile, type ProfileFormState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { GENDERS, SKIN_TYPES } from "@/lib/skin-types";
import type { Profile } from "@/lib/types";

const initialState: ProfileFormState = {};

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
  const [state, formAction, isPending] = useActionState(saveProfile, initialState);
  const [dob, setDob] = useState(profile?.date_of_birth ?? "");
  const age = calcAge(dob);
  const isFirstFill = !profile;

  useEffect(() => {
    if (state.ok && isFirstFill) {
      window.location.href = "/dashboard";
    }
  }, [state.ok, isFirstFill]);

  return (
    <form action={formAction} className="space-y-6">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t.profile.name}</span>
        <input
          name="name"
          defaultValue={profile?.name ?? ""}
          placeholder={t.profile.namePlaceholder}
          autoComplete="given-name"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">
          {t.profile.dateOfBirth}
          {age !== null && (
            <span className="ml-2 text-xs font-normal text-zinc-500">
              ({t.profile.age} {age})
            </span>
          )}
        </span>
        <input
          name="date_of_birth"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t.profile.gender}</legend>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <label
              key={g}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm has-[input:checked]:border-zinc-900 has-[input:checked]:bg-zinc-900 has-[input:checked]:text-zinc-50 dark:border-zinc-700 dark:has-[input:checked]:border-zinc-100 dark:has-[input:checked]:bg-zinc-100 dark:has-[input:checked]:text-zinc-900"
            >
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
          <span className="text-zinc-500">{t.profile.skinTypesHint}</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SKIN_TYPES.map((skin) => (
            <label
              key={skin}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm has-[input:checked]:border-zinc-900 has-[input:checked]:bg-zinc-900 has-[input:checked]:text-zinc-50 dark:border-zinc-700 dark:has-[input:checked]:border-zinc-100 dark:has-[input:checked]:bg-zinc-100 dark:has-[input:checked]:text-zinc-900"
            >
              <input
                type="checkbox"
                name="skin_types"
                value={skin}
                defaultChecked={profile?.skin_types?.includes(skin) ?? false}
                className="sr-only"
              />
              {t.skinTypes[skin]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-zinc-900 px-4 py-3 text-base font-medium text-zinc-50 disabled:opacity-50 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900"
        >
          {isPending ? t.common.saving : t.common.save}
        </button>
        {!isFirstFill && (
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md px-3 text-sm text-zinc-600 underline transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            {t.common.backToDashboard}
          </Link>
        )}
        {state.error && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </span>
        )}
        {state.ok && !isPending && !isFirstFill && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            {t.common.saved}
          </span>
        )}
      </div>
    </form>
  );
}
