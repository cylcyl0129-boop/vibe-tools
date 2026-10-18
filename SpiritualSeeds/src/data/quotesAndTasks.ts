import { TaskCategory, TaskItem } from '../types';

export const TASK_PRESETS: Record<TaskCategory, string[]> = {
  '心靈': [
    '深呼吸 3 次，感受當下的平靜',
    '對鏡子裡的自己微笑，說聲「你辛苦了」',
    '聽一首能讓你心情放鬆的純音樂或白噪音',
    '閉上雙眼發呆 3 分鐘，什麼都不必焦慮',
    '把手放在心口上，感受穩定而溫柔的心跳',
    '寫下一件今天值得感謝的小事或感謝自己',
    '允許自己今天有「不完美」的自由'
  ],
  '健康': [
    '緩慢喝一杯溫水，感受水流滋潤身體的感覺',
    '離開螢幕，眺望窗外最遠的那一片天空 1 分鐘',
    '輕輕轉動肩膀與頸部，釋放緊繃了一整天的肌肉',
    '做 30 秒溫和的眼球放鬆運動',
    '放慢腳步散步 5 分鐘，踩穩每一個當下的步伐',
    '調整坐姿，讓背部與雙肩回到舒適放鬆的平衡點',
    '好好享受一口食物的香氣與純粹滋味'
  ],
  '探索': [
    '抬頭觀察今天天空中雲朵的形狀或微風的走向',
    '仔細端詳身邊一株植物或樹木葉片上的細緻脈絡',
    '在日常的路線中，刻意走一條平常少走的小徑',
    '在生活環境中，尋找一件你以前沒注意過的可愛細節',
    '試著聽一首平常不常接觸的異國曲風或輕音樂',
    '用手機或雙眼捕捉一張讓你嘴角上揚的生活光影',
    '觸摸不同質地的物品，專注體驗指尖的觸覺'
  ],
  '成長': [
    '隨手整理桌面上的一個角落，創造呼吸感的小天地',
    '記下今天收穫的一個微小靈感或學到的新概念',
    '向今天遇見的一位朋友或夥伴表達真誠的感謝',
    '翻開一本喜歡的書，隨心閱讀幾行文字',
    '原諒自己今天可能出現的一點小失誤，這很正常',
    '替接下來的一週設定一個輕鬆隨興、無壓力的微小心願',
    '為自己倒一杯溫茶或咖啡，好好犒賞今天的付出'
  ]
};

// Emotional healing quotes for when the flower blooms
export const HEALING_QUOTES: string[] = [
  '允許自己偶爾脆弱，就像天空總有下雨的時候。雨過之後，泥土的氣味會特別清新。',
  '今天的你已經很努力了，不需要每件事都達到滿分。適度的休息是為了更長久的溫柔。',
  '那些看似壓在心頭的沉重，都是滋養靈魂的肥料。在看不見的泥土深處，你正在深深扎根。',
  '不必急著迎合全世界的期待，光是照顧好自己的情緒，就是今天最偉大的成就。',
  '情緒如潮汐有起有伏，當它來的時候靜靜陪伴它，當它走的時候道一聲謝謝。',
  '就算腳步放慢一點也沒關係，路邊的花草正在為你的節奏盛開。',
  '請溫柔地擁抱那個感到疲憊的自己，你是自己最好的守護者。',
  '生活不必總是緊繃前行，留一點空白給微風吹拂。',
  '你種下的煩惱已化作養分，所有的心結終會以另一種美麗的方式盛開。'
];

// Tomorrow's encouragement quotes for the scratch card
export const TOMORROW_ENCOURAGEMENTS: string[] = [
  '明天太陽升起時，世界會以全新的溫柔迎接你。',
  '明天的你，將擁有比今天更從容、更自由的心境。',
  '睡個好覺吧，明天有一場輕盈的小幸運正在途中向你奔來。',
  '明天是全新的一天，所有今天的陰霾都不會跟隨你越過午夜。',
  '帶著柔軟的心入睡，明天的清晨會為你帶來清澈的勇氣。',
  '明天的每一步，都會踏在充滿希望與安心的花徑上。',
  '你的堅韌會化作明天的羽翼，飛向更廣闊的寧靜天空。',
  '明天會有意想不到的美好細節，等待著你去發現與微笑。'
];

/**
 * Generate 3 diverse micro-adventure tasks across categories
 */
export function generateDailyTasks(): TaskItem[] {
  const categories: TaskCategory[] = ['心靈', '健康', '探索', '成長'];
  // Shuffle categories to pick 3 distinct ones
  const shuffledCats = [...categories].sort(() => Math.random() - 0.5).slice(0, 3);

  return shuffledCats.map((cat, idx) => {
    const pool = TASK_PRESETS[cat];
    const text = pool[Math.floor(Math.random() * pool.length)];
    return {
      id: `${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      category: cat,
      text,
      completed: false
    };
  });
}

/**
 * Replace incomplete tasks with fresh ones (1 daily chance)
 */
export function replaceIncompleteTasks(tasks: TaskItem[]): TaskItem[] {
  const categories: TaskCategory[] = ['心靈', '健康', '探索', '成長'];
  return tasks.map(task => {
    if (task.completed) {
      return task; // retain completed tasks
    }
    const pool = TASK_PRESETS[task.category];
    // Find an alternative that's different from the current text
    const alternatives = pool.filter(t => t !== task.text);
    const newText = alternatives.length > 0 
      ? alternatives[Math.floor(Math.random() * alternatives.length)]
      : pool[Math.floor(Math.random() * pool.length)];

    return {
      ...task,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: newText
    };
  });
}

export function getRandomHealingQuote(): string {
  return HEALING_QUOTES[Math.floor(Math.random() * HEALING_QUOTES.length)];
}

export function getRandomEncouragement(): string {
  return TOMORROW_ENCOURAGEMENTS[Math.floor(Math.random() * TOMORROW_ENCOURAGEMENTS.length)];
}
