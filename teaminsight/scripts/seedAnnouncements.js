/**
 * Seed script to populate the database with sample announcements
 * Run with: node scripts/seedAnnouncements.js
 *
 * This script:
 * 1. Deletes ALL existing announcements
 * 2. Adds 10 new announcements starting from 26.10.25, each Sunday
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

// Announcement Schema (without automatic timestamps - we set them manually)
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
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  }
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

// Helper function to get Sunday dates starting from 26.10.2025
function getSundayDates(startDate, count) {
  const dates = [];
  const current = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const date = new Date(current);
    date.setHours(9, 0, 0, 0); // Set time to 09:00:00
    dates.push(date);
    current.setDate(current.getDate() + 7); // Add 7 days for next Sunday
  }

  return dates;
}

// 10 Sample Announcements for IoT Course - Industrial Engineering and Management
const announcementData = [
  {
    title: "ברוכים הבאים לקורס IoT",
    body: "שלום לכולם וברוכים הבאים לקורס האינטרנט של הדברים בהנדסת תעשייה וניהול! במהלך הסמסטר נלמד לתכנן, לפתח ולנהל מערכות IoT תעשייתיות. נעבוד עם חיישנים, בקרים ופלטפורמות ענן לניטור תהליכי ייצור.",
    targetTeams: "all"
  },
  {
    title: "הגשת פרויקט אמצע - עדכון",
    body: "מועד הגשת פרויקט האמצע נדחה לתאריך 15 לחודש הבא. הפרויקט צריך לכלול תכנון מערכת IoT לניטור קו ייצור, כולל בחירת חיישנים, ארכיטקטורת תקשורת ודשבורד בסיסי להצגת נתונים בזמן אמת.",
    targetTeams: "all"
  },
  {
    title: "שעות קבלה במעבדה",
    body: "שעות הקבלה השבוע יתקיימו במעבדת IoT בבניין הנדסת תעשייה, חדר 302, ביום רביעי 14:00-16:00. ניתן להגיע עם ציוד לבדיקה או שאלות על חיבור חיישנים ותכנות מיקרו-בקרים.",
    targetTeams: "all"
  },
  {
    title: "סדנת Arduino ו-ESP32",
    body: "ביום חמישי תתקיים סדנה מעשית על תכנות Arduino ו-ESP32. נלמד חיבור חיישני טמפרטורה ולחות, שליחת נתונים ל-MQTT ובניית התראות אוטומטיות. יש להביא לפטופ עם Arduino IDE מותקן. השתתפות חובה!",
    targetTeams: "all"
  },
  {
    title: "ציוני מבחן אמצע פורסמו",
    body: "תוצאות מבחן האמצע בנושא פרוטוקולי תקשורת IoT פורסמו במערכת. הממוצע הכיתתי עמד על 79. סטודנטים שמעוניינים בהסבר על התשובות או ערעור מוזמנים לפנות אליי בשעות הקבלה תוך שבוע.",
    targetTeams: "all"
  },
  {
    title: "חומרי לימוד חדשים באתר",
    body: "הועלו לאתר הקורס מדריכים חדשים: תכנון רשתות חיישנים תעשייתיות, אבטחת מידע במערכות IoT, ואינטגרציה עם מערכות ERP. כמו כן נוספו דוגמאות קוד לעבודה עם AWS IoT Core ו-Azure IoT Hub.",
    targetTeams: "all"
  },
  {
    title: "שיעור מקוון בזום",
    body: "השיעור הקרוב על ניתוח Big Data ממערכות IoT יתקיים בזום עקב כנס בקמפוס. קישור נשלח למייל האוניברסיטאי. נלמד שימוש ב-Python לעיבוד נתוני חיישנים וזיהוי אנומליות בתהליכי ייצור. הקלטה תעלה לאתר.",
    targetTeams: "all"
  },
  {
    title: "דוח התקדמות שבועי",
    body: "תזכורת לכל הצוותים: דוח ההתקדמות השבועי יוגש עד יום ראשון בחצות. הדוח צריך לכלול: סטטוס חיבור החומרה, בעיות תקשורת שנתקלתם בהן, נתונים שנאספו מהחיישנים, ותוכנית העבודה לשבוע הבא.",
    targetTeams: "all"
  },
  {
    title: "הרצאת אורח מתעשיית 4.0",
    body: "בשיעור הבא יתארח מהנדס IoT בכיר מחברת תעשייה מובילה. ההרצאה תעסוק ביישום מערכות IoT במפעלים חכמים, אתגרים בשטח ומגמות עתידיות בתעשייה 4.0. הכינו שאלות על קריירה ופרויקטים אמיתיים!",
    targetTeams: "all"
  },
  {
    title: "עדכון דרישות פרויקט גמר",
    body: "פורסמו דרישות מעודכנות לפרויקט הגמר. השינויים: חובה לכלול לפחות 3 סוגי חיישנים, דשבורד אינטראקטיבי עם גרפים בזמן אמת, מערכת התראות חכמה, ותיעוד טכני מלא כולל תרשימי ארכיטקטורה.",
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

    // Delete all existing announcements
    const existingCount = await Announcement.countDocuments();
    console.log(`📊 Found ${existingCount} existing announcements`);

    console.log('🗑️  Deleting all existing announcements...');
    await Announcement.deleteMany({});
    console.log('✅ All existing announcements deleted');

    // Generate Sunday dates starting from 26.10.2025
    // October 26, 2025 is a Sunday
    const startDate = new Date('2025-10-26T09:00:00.000Z');
    const sundayDates = getSundayDates(startDate, announcementData.length);

    // Create announcements with custom dates
    const announcementsWithDates = announcementData.map((announcement, index) => ({
      ...announcement,
      createdAt: sundayDates[index],
      updatedAt: sundayDates[index]
    }));

    // Display dates for verification
    console.log('\n📅 Announcement dates:');
    sundayDates.forEach((date, index) => {
      console.log(`   ${index + 1}. ${date.toLocaleDateString('he-IL')} (${date.toLocaleDateString('en-US', { weekday: 'long' })})`);
    });

    // Insert announcements
    console.log('\n📝 Inserting sample announcements...');
    const result = await Announcement.insertMany(announcementsWithDates);
    console.log(`✅ Successfully inserted ${result.length} announcements`);

    // Show summary
    const newCount = await Announcement.countDocuments();
    console.log(`\n📊 Total announcements now: ${newCount}`);

    await mongoose.connection.close();
    console.log('🔒 Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding announcements:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAnnouncements();
