# מרכז הפיתוח ב-Notion: הוראות הקמה (למתקין)

רק אם המשתמש בחר לעבוד עם Notion, ויש מחבר Notion פעיל בסשן (כלים בשם `notion-*`).
סדר ההקמה: עמוד ראשי, טבלת פרויקטים, טבלת טיקטים (עם קשר לפרויקטים), קשר-עצמי "טיקט אב", טבלת ריצות בדיקה (עם קשר לטיקטים), ותצוגת לוח.

## 1. עמוד ראשי
`notion-create-pages` עם `creation_mode: "draft"` (עמוד פרטי), כותרת "מרכז הפיתוח", ותוכן קצר: מה יש פה, התחנות של כל פיצ'ר, ורמות הגודל (קטן / בינוני / גדול).

## 2. טבלת "פרויקטים" (parent = העמוד הראשי)
```sql
CREATE TABLE ("שם" TITLE, "סטטוס" SELECT('אפיון':purple, 'תשתית':blue, 'בפיתוח':yellow, 'באוויר':green, 'מושהה':gray), "תיאור" RICH_TEXT, "תיקייה במחשב" RICH_TEXT, "ריפו בגיטהאב" URL, "כתובת האתר" URL, "מדריך למשתמש" URL, "טכנולוגיות" MULTI_SELECT('Next.js':default, 'Supabase':green, 'Vercel':gray, 'Python':blue, 'n8n':orange, 'Claude API':brown, 'MCP':pink), "נפתח" CREATED_TIME)
```

## 3. טבלת "טיקטים" (החלף <PROJECTS_DS> במזהה ה-data source של פרויקטים)
```sql
CREATE TABLE ("כותרת" TITLE, "מספר" UNIQUE_ID PREFIX 'TK', "פרויקט" RELATION('<PROJECTS_DS>', DUAL 'טיקטים'), "סוג" SELECT('פיצר':blue, 'משימה':default, 'באג':red, 'תשתית':purple, 'סוכן AI':green, 'אוטומציה':orange), "גודל" SELECT('קטן':green, 'בינוני':yellow, 'גדול':red), "סטטוס" SELECT('חדש':gray, 'אפיון':purple, 'ממתין לאישור תוכנית':orange, 'בפיתוח':yellow, 'בבדיקות':blue, 'ממתין לאישור מיזוג':orange, 'מוזג':green, 'באוויר':green, 'נחסם':red, 'בוטל':gray), "תחנה נוכחית" SELECT('מנהל':default, 'ארכיטקט':purple, 'מעצב':green, 'מפתח':yellow, 'בונה אוטומציות':orange, 'כותב בדיקות':blue, 'מהנדס מבחנים':blue, 'סוקר':pink, 'בודק ממשק':orange, 'מתעד':brown, 'ממתין למשתמש':red), "מבחני קבלה" RICH_TEXT, "ענף" RICH_TEXT, "PR" URL, "כתובת ניסיון" URL, "תוכנית אושרה" CHECKBOX, "מיזוג אושר" CHECKBOX, "אושר בתאריך" DATE, "לקחים" RICH_TEXT, "נפתח" CREATED_TIME, "עודכן" LAST_EDITED_TIME)
```
אחר כך, עם `notion-update-data-source` על טבלת הטיקטים (החלף <TICKETS_DS>):
```sql
ADD COLUMN "טיקט אב" RELATION('<TICKETS_DS>', DUAL 'תתי-טיקטים' 'subtickets')
```

## 4. טבלת "ריצות בדיקה"
```sql
CREATE TABLE ("שם" TITLE, "טיקט" RELATION('<TICKETS_DS>', DUAL 'ריצות בדיקה'), "סוג בדיקה" SELECT('בדיקות קוד':blue, 'סקירת קוד':pink, 'סקירת אבטחה':red, 'בדיקת ממשק בדפדפן':orange, 'בדיקת עיצוב ונגישות':green, 'מבחני סוכן (evals)':purple, 'ניסיונות פריצה':red, 'בדיקות אוטומטיות בגיטהאב':purple, 'בדיקה אחרי עלייה':green, 'אישור משתמש':yellow), "תוצאה" SELECT('עבר':green, 'נכשל':red, 'עבר עם הערות':yellow), "בוצע על ידי" SELECT('כותב בדיקות':blue, 'מהנדס מבחנים':blue, 'סוקר':pink, 'בודק ממשק':orange, 'מעצב':green, 'בונה אוטומציות':orange, 'גיטהאב':purple, 'מנהל':default, 'משתמש':yellow), "סיכום" RICH_TEXT, "הוכחות" FILES, "קישור" URL, "תאריך" CREATED_TIME)
```

## 5. תצוגת לוח
`notion-create-view` על טבלת הטיקטים: type `board`, שם "לוח עבודה", configure: `GROUP BY "סטטוס"; SHOW "מספר", "פרויקט", "סוג", "גודל", "תחנה נוכחית"`.

## 6. רישום המזהים
מלא את ~/.claude/skills/feature/notion.md לפי התבנית `notion.template.md`: כתובות העמוד והטבלאות, ומזהי ה-data source של כל אחת.
