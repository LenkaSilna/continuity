export type Gender = "female" | "male" | "prefer-not-to-say";
export type TimeOfDay = "morning" | "afternoon" | "evening";
export type ItemKind = "product" | "supplement" | "habit";
export type CalendarView = "month" | "week" | "day";
export type CycleIntensity = "light" | "medium" | "heavy";
export type ThemeMode = "light" | "dark";
export type Accent = "rose" | "lavender" | "mint";
export type Lifestyle = "sedentary" | "light" | "active" | "very_active";

export type ModuleFlags = {
  module_products: boolean;
  module_supplements: boolean;
  module_habits: boolean;
  module_routine: boolean;
  module_observations: boolean;
  module_cycle: boolean;
  module_journal: boolean;
  module_ai: boolean;
};

export type Profile = {
  user_id: string;
  name: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  skin_types: string[];
  has_partner: boolean;
  children_count: number;
  lifestyle: Lifestyle;
  calendar_view: CalendarView;
  theme: ThemeMode;
  accent: Accent;
  created_at: string;
  updated_at: string;
} & ModuleFlags;

export type ProductType = {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
};

export type ProductBrand = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Product = {
  id: string;
  user_id: string;
  name: string;
  brand_id: string | null;
  type_id: string | null;
  active_ingredients: string | null;
  inci: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type SupplementType = {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
};

export type SupplementBrand = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Supplement = {
  id: string;
  user_id: string;
  name: string;
  brand_id: string | null;
  type_id: string | null;
  dosage: string | null;
  purpose: string | null;
  ingredients: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type RoutineItem = {
  id: string;
  user_id: string;
  time_of_day: TimeOfDay;
  item_kind: ItemKind;
  product_id: string | null;
  supplement_id: string | null;
  habit_id: string | null;
  position: number;
  archived_at: string | null;
  created_at: string;
};

export type DailyLog = {
  id: string;
  user_id: string;
  log_date: string;
  time_of_day: TimeOfDay;
  item_kind: ItemKind;
  product_id: string | null;
  supplement_id: string | null;
  habit_id: string | null;
  done_at: string;
};

export type CycleLog = {
  user_id: string;
  log_date: string;
  intensity: CycleIntensity;
};

export type Tag = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  color: string | null;
  created_at: string;
};

export type DailyTag = {
  user_id: string;
  log_date: string;
  tag_id: string;
};

export type DailyNote = {
  user_id: string;
  log_date: string;
  mood: number | null;
  notes: string | null;
  updated_at: string;
};

export const DATA_BLOCKS = [
  "profile",
  "products",
  "supplements",
  "habits",
  "observations",
  "cycle",
  "mood",
  "data_context",
] as const;

export type DataBlock = (typeof DATA_BLOCKS)[number];

export type CustomPrompt = {
  id: string;
  name: string;
  question: string;
  data_blocks: DataBlock[];
  created_at: string;
  updated_at: string;
};
