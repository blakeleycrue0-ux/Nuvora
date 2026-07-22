import {
  Brain, Droplets, BookOpen, Dumbbell, PenLine, Salad, Footprints, Zap, Medal, Flame,
  Trophy, TrendingUp, Crown, Layers, Heart, Sparkles, Target, Coffee, Music, Code, Leaf,
  Bike, Apple, Sunrise, Sunset, GlassWater, CigaretteOff, Bed, PhoneOff, Wallet, PiggyBank,
  Palette, Camera, Languages, GraduationCap, HeartPulse, Sprout, Wind, Waves, Mountain,
  NotebookPen, ListChecks, Repeat, type LucideIcon,
} from "lucide-react";

// Curated icon set for habits (key must be stable — it's stored on the habit).
export const HABIT_ICONS: Record<string, LucideIcon> = {
  brain: Brain,
  droplets: Droplets,
  "book-open": BookOpen,
  dumbbell: Dumbbell,
  "pen-line": PenLine,
  salad: Salad,
  heart: Heart,
  "heart-pulse": HeartPulse,
  sparkles: Sparkles,
  target: Target,
  coffee: Coffee,
  music: Music,
  code: Code,
  leaf: Leaf,
  bike: Bike,
  apple: Apple,
  sunrise: Sunrise,
  sunset: Sunset,
  "glass-water": GlassWater,
  "cigarette-off": CigaretteOff,
  bed: Bed,
  "phone-off": PhoneOff,
  wallet: Wallet,
  "piggy-bank": PiggyBank,
  palette: Palette,
  camera: Camera,
  languages: Languages,
  "graduation-cap": GraduationCap,
  sprout: Sprout,
  wind: Wind,
  waves: Waves,
  mountain: Mountain,
  "notebook-pen": NotebookPen,
  "list-checks": ListChecks,
  footprints: Footprints,
  repeat: Repeat,
  flame: Flame,
  zap: Zap,
};

export const ICON_KEYS = Object.keys(HABIT_ICONS);

export function HabitIcon({ name, size = 18, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  const Icon = HABIT_ICONS[name] ?? Target;
  return <Icon size={size} className={className} style={style} strokeWidth={2} />;
}

// Achievement icons (superset).
export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  footprints: Footprints, zap: Zap, medal: Medal, flame: Flame, trophy: Trophy,
  "trending-up": TrendingUp, crown: Crown, layers: Layers, target: Target,
};

// Refined jewel tones — muted for a luxury feel on near-black surfaces.
export const HABIT_COLORS: { key: string; value: string }[] = [
  { key: "c-indigo", value: "#8a8fd6" },
  { key: "c-violet", value: "#a893d6" },
  { key: "c-fuchsia", value: "#cf8fc4" },
  { key: "c-rose", value: "#d68a95" },
  { key: "c-amber", value: "#d9b874" },
  { key: "c-emerald", value: "#86bfa3" },
  { key: "c-sky", value: "#82aecf" },
  { key: "c-teal", value: "#7cc0b8" },
];

export function colorValue(key: string): string {
  return HABIT_COLORS.find((c) => c.key === key)?.value ?? "#6366f1";
}
