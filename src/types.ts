export type TaskCategory = '健康' | '心靈' | '探索' | '成長';

export interface TaskItem {
  id: string;
  category: TaskCategory;
  text: string;
  completed: boolean;
}

export interface SeedState {
  text: string;
  stage: number; // 0 = 0% 埋入土中, 1 = 33% 發芽, 2 = 66% 抽長, 3 = 100% 盛開
  unlocked_card: boolean;
  scratched: boolean;
  encouragement: string;
  healing_quote?: string;
}

export interface AppStorageData {
  last_drawn_date: string; // YYYY-MM-DD
  sound_enabled: boolean;
  seed_state: SeedState;
  today_tasks: TaskItem[];
  replaced_card_count: number;
}
