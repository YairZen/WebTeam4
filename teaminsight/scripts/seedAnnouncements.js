/**
 * Seed script to populate the database with sample announcements
 * Run with: node scripts/seedAnnouncements.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Announcement Schema
const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  targetTeams: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

// 10 Sample Announcements for Academic Course
const sampleAnnouncements = [
  {
    title: "ברוכים הבאים לקורס!",
    body: "שלום לכולם! ברוכים הבאים לקורס פיתוח אפליקציות ווב. בקורס זה נלמד טכנולוגיות מתקדמות כמו React, Next.js ו-MongoDB. מומלץ להתחיל להכיר את החומרים באתר הקורס.",
    targetTeams: "all"
  },
  {
    title: "עדכון מועד הגשת פרויקט אמצע",
    body: "עקב בקשות רבות, מועד הגשת פרויקט האמצע נדחה בשבוע. המועד החדש הוא ה-15 לחודש הבא. נצלו את הזמן הנוסף לשיפור העבודה!",
    targetTeams: "all"
  },
  {
    title: "שעות קבלה השבוע",
    body: "שעות הקבלה השבוע יתקיימו ביום רביעי בין השעות 14:00-16:00 בחדר 302. ניתן להגיע ללא תיאום מראש. מומלץ להגיע עם שאלות ספציפיות.",
    targetTeams: "all"
  },
  {
    title: "סדנת Git ו-GitHub",
    body: "ביום חמישי הקרוב תתקיים סדנה מעשית על עבודה עם Git ו-GitHub. הסדנה תכלול: יצירת repositories, עבודה עם branches, ופתרון conflicts. ההשתתפות חובה!",
    targetTeams: "all"
  },
  {
    title: "תוצאות מבחן אמצע",
    body: "תוצאות מבחן האמצע פורסמו במערכת הציונים. הציון הממוצע הוא 78. סטודנטים המעוניינים לערער על הציון מתבקשים לפנות אליי תוך שבוע.",
    targetTeams: "all"
  },
  {
    title: "חומרי עזר חדשים",
    body: "הועלו לאתר הקורס חומרי עזר חדשים הכוללים: מדריך ל-API Design, דוגמאות קוד לאימות משתמשים, ותיעוד מפורט של הפרויקט. מומלץ מאוד לעבור על החומרים.",
    targetTeams: "all"
  },
  {
    title: "הרצאה מקוונת השבוע",
    body: "שימו לב - ההרצאה של יום שני הקרוב תתקיים באופן מקוון דרך Zoom. הקישור לשיעור נשלח למייל האוניברסיטאי. ההקלטה תהיה זמינה באתר הקורס.",
    targetTeams: "all"
  },
  {
    title: "תזכורת: הגשת דו\"ח התקדמות",
    body: "תזכורת לכל הצוותים - דו\"ח ההתקדמות השבועי צריך להיות מוגש עד יום ראשון בחצות. הדו\"ח צריך לכלול: משימות שהושלמו, אתגרים שנתקלתם בהם, ותוכנית לשבוע הבא.",
    targetTeams: "all"
  },
  {
    title: "אורח מיוחד בשיעור הבא",
    body: "בשיעור הבא יתארח אצלנו מפתח בכיר מחברת הייטק מובילה. הוא ידבר על טרנדים בתעשייה ועל מה שמחפשים במועמדים. הכינו שאלות מעניינות!",
    targetTeams: "all"
  },
  {
    title: "עדכון דרישות פרויקט גמר",
    body: "פורסם מסמך דרישות מעודכן לפרויקט הגמר. השינויים העיקריים: הוספת דרישת responsive design, תיעוד API מלא, ובדיקות אוטומטיות. המסמך המלא זמין באתר הקורס.",
    targetTeams: "all"
  }
];

async function seedAnnouncements() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Check existing announcements
    const existingCount = await Announcement.countDocuments();
    console.log(`📊 Current announcements count: ${existingCount}`);

    // Insert sample announcements
    console.log('📝 Inserting sample announcements...');
    const result = await Announcement.insertMany(sampleAnnouncements);
    console.log(`✅ Successfully inserted ${result.length} announcements`);

    // Show summary
    const newCount = await Announcement.countDocuments();
    console.log(`📊 Total announcements now: ${newCount}`);

    await mongoose.connection.close();
    console.log('🔒 Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding announcements:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAnnouncements();
