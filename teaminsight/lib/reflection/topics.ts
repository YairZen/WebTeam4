export type ReflectionTopic = {
  id: string;
  title: string;
  guidance: string;
  questionHints: string[];
};

export const REFLECTION_TOPICS: ReflectionTopic[] = [
  {
    id: "collaboration",
    title: "שיתוף פעולה בצוות",
    guidance: "How well did the team collaborate this week? Look for concrete examples of teamwork, helping each other, pair work, knowledge sharing.",
    questionHints: [
      "איך עבד שיתוף הפעולה בצוות השבוע?",
      "היה מצב שמישהו עזר לאחר בצוות?",
      "עבדתם ביחד על משהו או כל אחד לבד?",
      "איך חילקתם את העבודה ביניכם?",
      "היה רגע שהרגשתם שאתם באמת צוות?"
    ]
  },
  {
    id: "communication",
    title: "תקשורת בצוות",
    guidance: "Quality of team communication. Meetings, updates, responsiveness, clarity. What worked and what didn't in how they talked to each other.",
    questionHints: [
      "איך הייתה התקשורת בצוות השבוע?",
      "כולם היו מעודכנים במה שקורה?",
      "היו אי-הבנות או בלבולים?",
      "איך העברתם מידע אחד לשני?",
      "הפגישות שלכם היו יעילות?"
    ]
  },
  {
    id: "roles_contribution",
    title: "תרומה אישית ותפקידים",
    guidance: "Individual contributions and role clarity. Did everyone contribute? Were roles clear? Anyone took extra responsibility or stepped back?",
    questionHints: [
      "איך הייתה חלוקת העבודה השבוע?",
      "כל אחד ידע מה התפקיד שלו?",
      "מישהו לקח על עצמו יותר מדי?",
      "הרגשתם שהעומס מחולק בצורה הוגנת?",
      "מי הפתיע אתכם לטובה השבוע?"
    ]
  },
  {
    id: "challenges_conflicts",
    title: "אתגרים וחיכוכים",
    guidance: "Team challenges, disagreements, tensions. How were conflicts handled? What caused friction? Be honest about difficulties.",
    questionHints: [
      "היו חילוקי דעות או מתחים בצוות?",
      "איך התמודדתם עם אי-הסכמות?",
      "משהו יצר תסכול בעבודה המשותפת?",
      "היה רגע לא נעים שצריך לדבר עליו?",
      "מה היה האתגר הכי גדול בעבודת הצוות?"
    ]
  },
  {
    id: "decisions_process",
    title: "קבלת החלטות בצוות",
    guidance: "How does the team make decisions? Is everyone heard? Who leads? Consensus vs one person decides? Concrete example of a decision made together.",
    questionHints: [
      "איך קיבלתם החלטות השבוע?",
      "כולם הרגישו שיש להם מקום להשפיע?",
      "מי בדרך כלל מוביל את ההחלטות?",
      "היה ויכוח על משהו - איך הגעתם להסכמה?",
      "יש החלטה שלא כולם היו מרוצים ממנה?"
    ]
  },
  {
    id: "team_mood",
    title: "אווירה ומוטיבציה",
    guidance: "Team morale, energy, motivation. Are people engaged or burned out? What affects the team spirit? Celebrations or frustrations.",
    questionHints: [
      "מה האווירה בצוות השבוע?",
      "הרגשתם מוטיבציה או עייפות?",
      "היה משהו שהעלה את הרוח?",
      "משהו פגע במורל של הצוות?",
      "חגגתם הצלחות קטנות?"
    ]
  },
  {
    id: "learning_growth",
    title: "למידה וצמיחה כצוות",
    guidance: "What did the team learn about working together? Insights about collaboration. What would they do differently? Growth mindset.",
    questionHints: [
      "מה למדתם על עצמכם כצוות השבוע?",
      "יש משהו שהייתם עושים אחרת?",
      "מה תיקח איתך לשבוע הבא?",
      "גיליתם משהו חדש על איך לעבוד ביחד?",
      "איזה שיפור קטן אפשר לעשות בעבודת הצוות?"
    ]
  },
];
