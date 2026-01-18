export type ReflectionTopic = {
  id: string;
  title: string;
  guidance: string;
  questionHints: string[];
};

export const REFLECTION_TOPICS: ReflectionTopic[] = [
  {
    id: "achievements",
    title: "הישגים ותוצרים",
    guidance: "Concrete deliverables: feature/PR/demo/fix/deploy. Include what was built and evidence.",
    questionHints: [
      "מה הספקתם לסיים השבוע?",
      "איזה פיצ'ר או תיקון יצא לפרודקשן?",
      "יש משהו שאפשר לראות או להדגים?",
      "מה התוצר הכי משמעותי מהשבוע?",
      "איזה PR נסגר או קוד שעלה?"
    ]
  },
  {
    id: "wins",
    title: "מה עבד טוב",
    guidance: "What helped you succeed? Practices, communication, planning. Give one concrete example.",
    questionHints: [
      "מה עזר לכם להתקדם השבוע?",
      "איזו שיטת עבודה הוכיחה את עצמה?",
      "היה משהו בתקשורת בצוות שעבד טוב?",
      "מה הייתם רוצים להמשיך לעשות?",
      "איזה תהליך חסך לכם זמן או בעיות?"
    ]
  },
  {
    id: "pain_points",
    title: "מה לא עבד",
    guidance: "What went poorly? Misalignment, rework, unclear tasks, bugs. Give one concrete example.",
    questionHints: [
      "מה היה מתסכל השבוע?",
      "איפה בזבזתם זמן על דברים שאפשר היה למנוע?",
      "היו אי-הבנות בצוות?",
      "משהו שנתקעתם עליו יותר מדי?",
      "מה הייתם עושים אחרת בדיעבד?"
    ]
  },
  {
    id: "blockers",
    title: "חסמים",
    guidance: "What blocked progress? Technical, dependencies, communication, time. Include type and impact.",
    questionHints: [
      "מה עיכב אתכם השבוע?",
      "היו תלויות שחיכיתם להן?",
      "משהו טכני שתקע אתכם?",
      "חסרה לכם החלטה או מידע ממישהו?",
      "כמה זמן איבדתם בגלל החסם הזה?"
    ]
  },
  {
    id: "decisions",
    title: "החלטות חשובות",
    guidance: "Key decision made and why. One decision is enough if concrete.",
    questionHints: [
      "איזו החלטה חשובה קיבלתם השבוע?",
      "עמדתם בפני דילמה? מה בחרתם ולמה?",
      "שקלתם כמה אפשרויות - מה הכריע?",
      "יש החלטה שאתם לא בטוחים בה?",
      "מה היו החלופות שוויתרתם עליהן?"
    ]
  },
  {
    id: "risks",
    title: "סיכונים לשבוע הבא",
    guidance: "What might fail next week? Add one mitigation idea.",
    questionHints: [
      "מה עלול להשתבש בשבוע הבא?",
      "יש משהו שמדאיג אתכם קדימה?",
      "איפה יש אי-ודאות שצריך להתכונן אליה?",
      "מה התוכנית אם X לא יעבוד?",
      "איך אפשר להקטין את הסיכון הזה?"
    ]
  },
  {
    id: "next_actions",
    title: "פעולות לשבוע הבא",
    guidance: "Exactly 3 concrete actions: what + owner + target (date/week).",
    questionHints: [
      "מה שלוש המשימות הכי חשובות לשבוע הבא?",
      "מי אחראי על כל משימה?",
      "מתי כל משימה צריכה להסתיים?",
      "מה היעד הראשון שתתחילו איתו?",
      "איך תדעו שהמשימה הושלמה?"
    ]
  },
];
