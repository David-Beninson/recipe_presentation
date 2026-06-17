import React, { useState } from "react";
import { Play, Sparkles, RefreshCw, AlertTriangle, CheckCircle, Flame, Plus, Trash2, Heart, Database, Code, ShieldAlert, Wifi, WifiOff, Terminal, Award } from "lucide-react";

// --- API Sandbox Helper types ---
interface ChefResponse {
  recipeName?: string;
  estimatedTime?: string;
  difficulty?: string;
  ingredients?: string[];
  instructions?: string[];
  chefComment?: string;
}

// ==========================================
// SANDBOX 1-3: Jinja2 vs HTMX (Flicker Simulator)
// ==========================================
export function JinjaTemplateSandbox() {
  const [items, setItems] = useState<string[]>(["עגבנייה", "שמן זית"]);
  const [inputValue, setInputValue] = useState("");
  const [isFlickering, setIsFlickering] = useState(false);
  const [flickerStats, setFlickerStats] = useState({ reloads: 0, ms: 0, bytes: "0 KB" });

  const [htmxItems, setHtmxItems] = useState<string[]>(["עגבנייה", "שמן זית"]);
  const [htmxInput, setHtmxInput] = useState("");
  const [isUpdatingHtmx, setIsUpdatingHtmx] = useState(false);
  const [htmxStats, setHtmxStats] = useState({ requests: 0, ms: 0, bytes: "0 KB" });

  const handleJinjaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Simulate whole-page reload / flicker
    setIsFlickering(true);
    const start = performance.now();
    
    setTimeout(() => {
      setItems([...items, inputValue.trim()]);
      setInputValue("");
      setIsFlickering(false);
      const elapsed = Math.round(performance.now() - start + 450); // add network overhead
      setFlickerStats(prev => ({
        reloads: prev.reloads + 1,
        ms: elapsed,
        bytes: "1.4 MB (דף שלם + נכסים + CSS)"
      }));
    }, 600);
  };

  const handleHtmxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmxInput.trim()) return;

    setIsUpdatingHtmx(true);
    const start = performance.now();

    setTimeout(() => {
      setHtmxItems([...htmxItems, htmxInput.trim()]);
      setHtmxInput("");
      setIsUpdatingHtmx(false);
      const elapsed = Math.round(performance.now() - start + 80);
      setHtmxStats(prev => ({
        requests: prev.requests + 1,
        ms: elapsed,
        bytes: "0.4 KB (רכיב HTML חלקי בלבד)"
      }));
    }, 250);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right" dir="rtl">
      {/* Jinja2 - Whole Page */}
      <div className="relative border-4 border-red-200 bg-red-50/40 p-5 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs">
        {isFlickering && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-40 animate-pulse">
            <RefreshCw className="h-10 w-10 text-red-600 animate-spin mb-3" />
            <p className="text-red-700 font-mono text-xs font-bold">LOADING WHOLE DOM VIEW...</p>
            <p className="text-slate-450 text-[11px] mt-1">Downloading CSS & Client Bundle assets (1.4MB)...</p>
          </div>
        )}
        
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-800 border border-red-200 rounded-full font-mono font-bold">Jinja2 Engine</span>
            <h4 className="font-sans font-extrabold text-red-900 text-sm">רענון עמוד מלא (Page Reload)</h4>
          </div>
          <p className="text-slate-650 text-xs mb-4 leading-relaxed font-sans">
            כל שינוי קטן דורש מהשרת לגרד את כל הדאטה, ליצור מחדש את כל מבנה ה-HTML של הדף, ולטעון מחדש את קובצי ה-CSS וה-JS ביוזר.
          </p>

          <form onSubmit={handleJinjaSubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="הוסף מצרך..."
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:border-red-500 font-sans"
            />
            <button type="submit" className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
              <Plus className="h-3.5 w-3.5" /> הוסף מצרך
            </button>
          </form>

          <div className="bg-white p-3 rounded-xl border border-slate-200 min-h-[105px] mb-4 shadow-inner">
            <p className="text-[10px] text-red-400 mb-2 font-mono font-bold"># Active Ingredients List</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((item, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-bold">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-red-100/50 border border-red-150 p-3 rounded-xl text-[11px] font-mono text-red-900 shadow-xs">
          <div className="flex justify-between mb-1">
            <span className="font-bold">{flickerStats.reloads} פעמים</span>
            <span>רענוני דף מלאים:</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-bold text-amber-700">{flickerStats.ms > 0 ? `${flickerStats.ms}ms` : "לא בוצע"}</span>
            <span>זמן תגובה מצטבר:</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-600">{flickerStats.bytes}</span>
            <span>תעבורת רשת:</span>
          </div>
        </div>
      </div>

      {/* HTMX - Partial Swap */}
      <div className="border-4 border-emerald-250 bg-emerald-50/40 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-850 border border-emerald-200 rounded-full font-mono font-bold">HTMX AJAX Swap</span>
            <h4 className="font-sans font-extrabold text-emerald-900 text-sm">עדכון חלקי סקסי (Partial Render)</h4>
          </div>
          <p className="text-slate-650 text-xs mb-4 leading-relaxed font-sans">
            רק מלבן המצרכים מתחלף בסיוע בקשת AJAX פנימית ישירות מהשרת. ללא רענון עמוד, ללא עומס על הדפדפן, ובמהירות הבזק!
          </p>

          <form onSubmit={handleHtmxSubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              value={htmxInput}
              onChange={(e) => setHtmxInput(e.target.value)}
              placeholder="הוסף מצרך..."
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-850 focus:outline-none focus:border-emerald-500 font-sans"
            />
            <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
              <span className="inline-block h-2 w-2 bg-white rounded-full animate-ping mr-0.5" />
              הוסף ב-HTMX
            </button>
          </form>

          <div className={`bg-white p-3 rounded-xl border border-slate-200 min-h-[105px] mb-4 transition-all duration-300 shadow-inner ${isUpdatingHtmx ? "border-emerald-400 bg-emerald-50/30" : ""}`}>
            <p className="text-[10px] text-emerald-500 mb-2 font-mono font-bold">
              hx-target="#ingredients-list" hx-swap="outerHTML"
            </p>
            <div className="flex flex-wrap gap-1.5" id="ingredients-list">
              {htmxItems.map((item, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-bold animate-fade-in animate-duration-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-emerald-100/50 border border-emerald-150 p-3 rounded-xl text-[11px] font-mono text-emerald-900 shadow-xs">
          <div className="flex justify-between mb-1">
            <span className="font-bold">{htmxStats.requests} קריאות</span>
            <span>טעינות חלקיות:</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-bold text-amber-700">{htmxStats.ms > 0 ? `${htmxStats.ms}ms` : "לא בוצע"}</span>
            <span>זמן תגובה מצטבר:</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-600">{htmxStats.bytes}</span>
            <span>תעבורת רשת:</span>
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// SANDBOX 4: AI Chef Structured Prompts Playground
// ==========================================
export function AIChefSandbox() {
  const [selectedPersona, setSelectedPersona] = useState<"grandma" | "meticulous" | "angry">("meticulous");
  const [ingredientsInput, setIngredientsInput] = useState("תפוחי אדמה, פטריות, שמנת, מלח");
  const [useStructuredJson, setUseStructuredJson] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // States to keep the responses
  const [responseText, setResponseText] = useState<string>("");
  const [renderedRecipe, setRenderedRecipe] = useState<ChefResponse | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ isSimulated: boolean; message?: string } | null>(null);

  // Pre-configured mock responses for offline fallback
  const mockResponses = {
    meticulous: {
      json: JSON.stringify({
        recipeName: "קדרת תפודי אדמה ופטריות מוקרמת",
        estimatedTime: "40 דקות",
        difficulty: "קל",
        ingredients: ["500 גרם תפוחי אדמה", "250 גרם פטריות שמפיניון", "250 מ\"ל שמנת לבישול 15%", "1 כפית מלח גס", "2 שיני שום כתושות"],
        instructions: [
          "מקלפים וחותכים את תפוחי האדמה לקוביות קטנות ומבשלים במים רותחים 10 דקות.",
          "במחבת רחבה מטגנים פטריות פרוסות עם מעט שמן זית עד להשחמה.",
          "מוסיפים שום מעוך ותפוחי אדמה ומערבבים היטב.",
          "יוצקים את השמנת, מתבלים במלח ומבשלים על אש קטנה עד שהרוטב מסמיך."
        ],
        chefComment: "טיפ של שף: השאירו את תפוחי האדמה מעט יציבים לפני הוספת השמנת כדי שלא יהפכו לפירה!"
      }, null, 2),
      text: "הנה מתכון מעולה בשבילך: קדרת תפוחי אדמה ופטריות מוקרמת. לוקחים 500 גרם תפוחי אדמה, מבשלים אותם עשר דקות במים חמים. בינתיים קוצצים פטריות ומטגנים במחבת עם שמן שיהיה בצבע זהב יפה. מוסיפים את תפוחי האדמה, שופכים שמנת ומערבבים עם המלח והשום. מבשלים עד שזה מבעבע ומסמיך ובתיאבון!"
    },
    grandma: {
      json: JSON.stringify({
        recipeName: "תבשיל תפודים ופטריות של בית",
        estimatedTime: "שעתיים בערך",
        difficulty: "לפי העין",
        ingredients: ["תפוחי אדמה (כמה שנכנס בסיר)", "פטריות טריות (סלסלה אחת או שתיים)", "שמנת מתוקה (כמה שהלב אומר לכם)", "מלח (קמצוץ טוב)", "שמן זית בנדיבות"],
        instructions: [
          "קודם כל תשטפו את הידיים ותגידו ברכה.",
          "תקלפו את התפודים ותחתכו לעיגולים שמנמנים שלא יתפרקו.",
          "שימו שמן זית בנדיבות בסיר, זרקו את הפטריות ותנו להן להתבשל באהבה.",
          "תוסיפו שמנת ומלח, וכשהכל חם תכבו ותנו לזה לעמוד קצת."
        ],
        chefComment: "יא איבני, אל תתקמצן על השמן זית! שמן זית וקצת אהבה זה כל הסוד לחיים בריאים."
      }, null, 2),
      text: "שלום עיניים שלי, קח תפוחי אדמה כמה שיש לך, תשים בסיר עם הרבה שמן זית אל תתקמצן. תבשל אותם לאט לאט ברוגע, תוסיף את הפטריות שיהיה טעים ותשפוך את כל השמנת. אל תסתכל על הגרם, תבשל לפי הרגש והלב. תגיש חם חם ותאכל עוד קצת, נהיית רזה!"
    },
    angry: {
      json: JSON.stringify({
        recipeName: "תפוחי אדמה פתטיים ברוטב פטריות יהיר",
        estimatedTime: "25 דקות (אם תצליח לא לשרוף את המטבח)",
        difficulty: "בינוני, אבל בשבילך זה קשה",
        ingredients: ["תפוחי אדמה של סופר זול (מצער)", "פטריות עצובות ששכחת במקרר", "שמנת לבישול פשוטה", "מלח גס (לפחות לא מלח דק זול)"],
        instructions: [
          "תחתוך את תפוחי האדמה. תנסה שהפרוסות יהיו שוות, למרות שאני מניח שלעולם לא תגיע לרמת דיוק כזו.",
          "תצרוב את הפטריות במחבת חמה מאוד. לא, לא חמה מספיק! חמה יותר!",
          "תציף הכל בשמנת כדי להסתיר את חוסר הכישרון שלך ותתפלל שיהיה לזה טעם סביר."
        ],
        chefComment: "אתה קורא לזה בישול? בשביל זה למדתי 15 שנה בצרפת? כדי לקבל מצרכים של טירונים?"
      }, null, 2),
      text: "אוי, באמת? תפוחי אדמה ושמנת? כמה מקורי... היית יכול לנסות קצת יותר. טוב, קח את תפוחי האדמה הפשוטים שלך, זרוק למחבת עם פטריות זולות, שפוך שמנת כדי לכסות על חוסר היכולת שלך לתבל, ותנסה לא לחרוך את השום כמו בפעם הקודמת. בתיאבון (או מה שזה לא יהיה אצלכם)."
    }
  };

  const handleTriggerAI = async () => {
    setIsLoading(true);
    setErrorInfo(null);
    setResponseText("");
    setRenderedRecipe(null);

    // Formulate system instructions based on persona and structure rules
    let systemInstruction = "";
    if (selectedPersona === "meticulous") {
      systemInstruction = "You are a world-class meticulous master chef. Respond only in Hebrew (apart from titles if needed). Design unique, beautiful recipes. Be very detailed and clean.";
    } else if (selectedPersona === "grandma") {
      systemInstruction = "עליך להתנהג כמו סבתא מרוקאית חמה ומצחיקה שמבשלת לפי העין בלי לשקול! תמיד משתמשת בהמון שמן זית, דואגת שהסועדים יאכלו עוד ובטוחה שהיא יודעת הכי טוב. כתבי בעברית משעשעת וחמה.";
    } else if (selectedPersona === "angry") {
      systemInstruction = "You are an extremely pretentious, easily annoyed luxury French Chef with 3 Michelin stars who despises simple food. Mock the user's ingredients, write in a super dramatic French-accented style in Hebrew or English mixed with French words ('Sacré bleu!', 'Mon dieu!'), but still yield a surprisingly chef-tier cooking process.";
    }

    if (useStructuredJson) {
      systemInstruction += " You MUST strictly generate the response in the specified JSON schema format. Do NOT include any markdown or text before/after.";
    } else {
      systemInstruction += " Respond in standard conversational text. Wrap paragraphs with random friendly chitchat.";
    }

    const payload = {
      prompt: `צור מתכון מושלם מהמצרכים הבאים: ${ingredientsInput}`,
      systemInstruction,
      formatJson: useStructuredJson,
      persona: selectedPersona
    };

    try {
      const res = await fetch("/api/chef", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to make call");
      }

      if (data.simulation) {
        // Fallback to beautiful simulation if API key is not yet set
        setTimeout(() => {
          setIsLoading(false);
          setErrorInfo({ isSimulated: true, message: data.message });
          
          if (useStructuredJson) {
            const mockJson = mockResponses[selectedPersona].json;
            setResponseText(mockJson);
            setRenderedRecipe(JSON.parse(mockJson));
          } else {
            setResponseText(mockResponses[selectedPersona].text);
          }
        }, 1200);
        return;
      }

      setIsLoading(false);
      setResponseText(data.text);
      if (useStructuredJson) {
        try {
          const parsed = JSON.parse(data.text);
          setRenderedRecipe(parsed);
        } catch (e) {
          console.error("JSON parsing error of response:", e);
        }
      }
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setErrorInfo({ isSimulated: true, message: "נתקלנו בשגיאה, פועל במצב סימולציה מהיר: " + err.message });
      
      // Fallback
      if (useStructuredJson) {
        const mockJson = mockResponses[selectedPersona].json;
        setResponseText(mockJson);
        setRenderedRecipe(JSON.parse(mockJson));
      } else {
        setResponseText(mockResponses[selectedPersona].text);
      }
    }
  };

  return (
    <div className="border-4 border-purple-200 bg-purple-50/40 p-5 rounded-3xl text-right text-slate-850 shadow-xs" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-sans font-extrabold text-purple-900 text-sm md:text-base">קונפיגורטור פרומפטים מובנה</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            בדקו כיצד הלבשת תפקיד (System Instructions) בשרת ואילוץ סכמת JSON מונים אנומליות והופכים את ה-AI לרכיב אמין באפליקציה.
          </p>

          {/* Select Persona */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">בחר/י דמות לרובוט השף:</label>
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-inner">
              <button
                onClick={() => setSelectedPersona("meticulous")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${selectedPersona === "meticulous" ? "bg-purple-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                שף דקדקן
              </button>
              <button
                onClick={() => setSelectedPersona("grandma")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${selectedPersona === "grandma" ? "bg-purple-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                סבתא חמה
              </button>
              <button
                onClick={() => setSelectedPersona("angry")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${selectedPersona === "angry" ? "bg-purple-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                שף עצבני
              </button>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">מצרכים שיש בארון:</label>
            <input
              type="text"
              value={ingredientsInput}
              onChange={(e) => setIngredientsInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-500 font-sans shadow-xs"
            />
          </div>

          {/* Structure Target */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 font-mono">responseSchema</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useStructuredJson}
                  onChange={(e) => setUseStructuredJson(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <p className="text-[10px] text-slate-450 leading-relaxed font-sans">
              {useStructuredJson 
                ? "פעיל: השרת מאלץ פירסור JSON קשיח הכולל מפתח tip, שם, זמנים ומרכיבים."
                : "כבוי: ה-AI יזום טקסט חופשי, יתעלם מהמבנה הרצוי וייעשה קשה להמחשה ב-Code."}
            </p>
          </div>

          <button
            onClick={handleTriggerAI}
            disabled={isLoading}
            className="w-full py-2 bg-gradient-to-l from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                מחלץ מתכון (מזין ב-Gemini)...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                בדוק AI Prompt בשידור חי
              </>
            )}
          </button>
        </div>

        {/* Display response / code */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between min-h-[300px] overflow-hidden shadow-xs">
          {errorInfo && (
            <div className="mb-3 px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] flex items-center gap-2 font-mono font-bold">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span>{errorInfo.message}</span>
            </div>
          )}

          {!responseText && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Code className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-slate-400 text-xs font-sans">לחץ על 'בדוק AI Prompt' כדי להריץ את ה-Prompts במנוע ולקבל את פלט ה-Response</p>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-12">
              <Flame className="h-10 w-10 text-orange-500 animate-bounce" />
              <p className="text-xs text-purple-700 font-mono font-bold">SYSTEM_PROMPT: {selectedPersona.toUpperCase()}_CHEF_ONLINE...</p>
            </div>
          )}

          {responseText && !isLoading && (
            <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full">
              {/* Structured View */}
              {useStructuredJson && renderedRecipe ? (
                <div className="flex-1 space-y-2 text-right">
                  <div className="flex justify-between items-center bg-purple-50 px-2 py-1 rounded-md border border-purple-100 text-[10px] text-purple-700 font-bold font-mono">
                    <span>Parsable Response UI</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold rounded">Success ✅</span>
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-extrabold text-slate-900 leading-tight">{renderedRecipe.recipeName}</h4>
                    <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5 font-sans">
                      <span>קושי: <b>{renderedRecipe.difficulty}</b></span> | 
                      <span>זמן: <b>{renderedRecipe.estimatedTime}</b></span>
                    </div>
                  </div>

                  <div className="text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-inner">
                    <h5 className="font-extrabold text-slate-800 mb-1 text-xs">מרכיבים:</h5>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-sans">
                      {renderedRecipe.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                  </div>

                  <div className="text-[11px] bg-purple-100/30 p-2.5 rounded-xl border border-purple-100">
                    <h5 className="font-extrabold text-purple-900 mb-1 text-xs">סגנון והערת השף:</h5>
                    <p className="text-purple-800 italic leading-relaxed">"{renderedRecipe.chefComment}"</p>
                  </div>
                </div>
              ) : (
                /* Plain Unstructured text view */
                responseText && !renderedRecipe && (
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center bg-amber-50/50 px-2 py-1 rounded-md border border-amber-100">
                      <span className="text-[10px] text-amber-800 font-bold">Unstructured plain text response</span>
                      <span className="px-1.5 py-0.5 text-[9px] bg-yellow-105 text-yellow-800 font-bold rounded">Friendly but chaotic</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto">
                      {responseText}
                    </div>
                  </div>
                )
              )}

              {/* Raw JSON Code View */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between">
                <div className="flex justify-between items-center bg-slate-800 px-2.5 py-1 rounded-t-xl border-t border-r border-l border-slate-900 shadow-xs">
                  <span className="text-[10px] text-slate-350 font-mono font-bold">Raw JSON Payload</span>
                  <span className="text-[9px] text-purple-300 font-mono font-bold">UTF-8 Output</span>
                </div>
                <pre className="flex-1 bg-slate-900 text-[11px] text-emerald-400 p-3 rounded-b-xl border border-slate-955 font-mono overflow-auto max-h-[220px] text-left shadow-inner" dir="ltr">
                  {responseText}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ==========================================
// SANDBOX 5: Lazy Developer API Speedrun
// ==========================================
export function LazyAPISandbox() {
  const [approach, setApproach] = useState<"hard" | "smart" | null>(null);
  const [logRows, setLogRows] = useState<string[]>([]);
  const [percent, setPercent] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const startHardWay = () => {
    setApproach("hard");
    setLogRows(["יוזם גירוד מתכונים מאתרי בישול ידנית (Scraping)..."]);
    setPercent(0);
    setIsSimulating(true);

    const logs = [
      "מוריד קובץ HTML מאתר 1 - פירסור נכשל בגלל שינוי דיזיין.",
      "מחבר שומר מסד נתונים מקומי. יוצר טבלאות ראשוניות.",
      "שורה 103: שגיאת כתיב במצרך 'כוס קמח' - הוגדר כ'כוס קח'.",
      "הקוד יזם לולאת סקראפינג מחזורית. שגיאת עומס משתמשים!",
      "כתובת ה-IP שלך נחסמה זמנית על ידי Cloudflare באחד האתרים.",
      "מציב שרתי פרוקסי לעקיפת החסימה. שירות פרוקסי עולה 20$.",
      "שמירה במסד נתונים של 42 מתכונים חלקים. נדרשים עוד 4,958 מתכונים...",
      "תסכול עמוק. שוקל לפרוש ולפתוח חוות פרחים."
    ];

    let currentLogIdx = 0;
    const interval = setInterval(() => {
      setPercent(p => {
        if (p >= 8) {
          clearInterval(interval);
          setIsSimulating(false);
          setLogRows(prev => [...prev, "❌ הופסק מפאת חוסר סבלנות ואיבוד שפיות של המפתח."]);
          return 8;
        }
        
        if (logs[currentLogIdx]) {
          setLogRows(prev => [...prev, `[שגיאה / אזהרה] ${logs[currentLogIdx]}`]);
          currentLogIdx++;
        }
        return p + 1;
      });
    }, 450);
  };

  const startSmartWay = () => {
    setApproach("smart");
    setLogRows(["מתחבר ל-Spoonacular API בשידור חי...", "שולח בקשת GET פשוטה..."]);
    setPercent(0);
    setIsSimulating(true);

    setTimeout(() => {
      setPercent(100);
      setIsSimulating(false);
      setLogRows(prev => [
        ...prev,
        "✅ קריאה מאובטחת החזירה 5,000 מתכונים מסודרים וחתוכים!",
        "✅ מוכן לשימוש ישיר ב-Frontend בתוך 0.12 שניות בלבד.",
        "🎉 חסכון מטורף של שבועות עבודה!"
      ]);
    }, 1500);
  };

  return (
    <div className="border-4 border-blue-200 bg-blue-50/40 p-5 rounded-3xl text-right text-slate-850 shadow-xs" dir="rtl">
      <div className="flex flex-col md:flex-row gap-5">
        {/* Selection side */}
        <div className="w-full md:w-2/5 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="font-sans font-extrabold text-blue-900 text-sm md:text-base">סימולטור 'עצלנות טכנולוגית חכמה'</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            מדוע לערוך, לגרד ולבנות מסדי נתונים של אלפי מתכונים באופן עצמאי כשיש API חיצוני חינמי ופשוט שפותר הכל ברגע?
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={startHardWay}
              disabled={isSimulating}
              className={`p-3 text-right border-2 rounded-2xl transition-all cursor-pointer ${approach === "hard" ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-350"}`}
            >
              <div className="font-extrabold text-xs text-red-700">גישה א': לעבוד קשה ותשוש 😩</div>
              <div className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-sans">גירוד אתרים ידני, סינון, טיפול בחסימות ובניית DB מאפס.</div>
            </button>

            <button
              onClick={startSmartWay}
              disabled={isSimulating}
              className={`p-3 text-right border-2 rounded-2xl transition-all cursor-pointer ${approach === "smart" ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-350"}`}
            >
              <div className="font-extrabold text-xs text-emerald-700 font-sans">גישה ב': העצלן החכם והיעיל 🚀</div>
              <div className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-sans">חיבור ישיר של 5 שורות קוד לקריאת API חינמית קיימת. המצרכים פשוט זורמים!</div>
            </button>
          </div>
        </div>

        {/* Output side */}
        <div className="flex-1 bg-slate-900 rounded-2xl p-4 border border-slate-950 font-mono text-xs flex flex-col justify-between min-h-[220px] shadow-inner text-left" dir="ltr">
          <div>
            <div className="flex justify-between items-center text-slate-500 text-[9px] border-b border-slate-800 pb-2 mb-2 font-bold uppercase">
              <span>DB Sync Console</span>
              <span>ESTIMATED STATUS</span>
            </div>

            <div className="space-y-1.5 max-h-[145px] overflow-y-auto">
              {logRows.length === 0 && (
                <p className="text-slate-600 italic text-[11px]">Choose an Approach to initiate database synchronization log...</p>
              )}
              {logRows.map((log, idx) => {
                const isError = log.includes("[שגיאה") || log.includes("❌");
                const isSuccess = log.includes("✅") || log.includes("🎉");
                return (
                  <p key={idx} className={`leading-relaxed text-[11px] font-mono ${isError ? "text-red-400" : isSuccess ? "text-emerald-400" : "text-slate-400"}`}>
                    {log}
                  </p>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-[10px] text-slate-450 mb-1 font-bold">
              <span>Import Progress:</span>
              <span>{approach === "hard" ? `${percent}%` : approach === "smart" ? `${percent}%` : "0%"}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${approach === "hard" ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${approach === "hard" ? (percent / 8) * 100 : percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// SANDBOX 6: Optimistic UI / Like Counter
// ==========================================
export function OptimisticUISandbox() {
  const [likes, setLikes] = useState(142);
  const [isLiked, setIsLiked] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"stable" | "failed">("stable");
  const [logs, setLogs] = useState<string[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  const handleLikeClick = () => {
    // 1. Optimistic Update immediately!
    const newLikedState = !isLiked;
    const previousLiked = isLiked;
    setIsLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);
    
    // Add Client immediate feedback log
    setLogs(prev => [`[לקוח] עדכון לייק אופטימיסטי מיידי: ${newLikedState ? "Like" : "Unlike"}! הנתונים השתנו ב-DOM.`, ...prev]);

    // 2. Trigger Mock Network Server call
    setLogs(prev => ["[רשת] שולח עדכון למסד הנתונים ברקע...", ...prev]);

    setTimeout(() => {
      if (connectionMode === "stable") {
        setLogs(prev => ["✅ [שרת] הלייק נשמר בהצלחה במסד הנתונים! (No rollback needed)", ...prev]);
      } else {
        // Rollback state since network / server failed!
        setIsShaking(true);
        setIsLiked(previousLiked);
        setLikes(prev => previousLiked ? prev + 1 : prev - 1);
        setLogs(prev => [
          "❌ [שרת] שגיאה: החיבור נכשל / קריסת DB! מבצע Rollback למצב הקודם כדי לשמור על קונסיסטנטיות.",
          ...prev
        ]);
        
        setTimeout(() => setIsShaking(false), 500);
      }
    }, 1100);
  };

  return (
    <div className="border-4 border-amber-200 bg-amber-50/40 p-5 rounded-3xl text-right text-slate-850 shadow-xs" dir="rtl">
      <div className="flex flex-col md:flex-row gap-5">
        {/* Simple Interactive Card block */}
        <div className="w-full md:w-1/3 flex flex-col justify-between items-center bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="text-center">
            <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded-full font-sans font-bold">רכיב כרטיסייה</span>
            <h4 className="font-extrabold text-slate-900 mt-2 text-sm leading-tight">פשטידת פטריות מוקרמת</h4>
            <p className="text-[11px] text-slate-500 mt-1">השף המושלם • 35 דקות</p>
          </div>

          {/* Recipe Image Simulated */}
          <div className="w-24 h-24 my-4 rounded-full border-2 border-slate-200 relative flex items-center justify-center bg-gradient-to-tr from-amber-50 to-rose-50 shadow-inner">
            <Flame className="h-8 w-8 text-amber-500/70" />
          </div>

          {/* Target button */}
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-xs font-bold select-none transition-all duration-300 cursor-pointer ${
              isLiked 
                ? "bg-rose-50 border-rose-300 text-rose-600 shadow-xs" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
            } ${isShaking ? "animate-bounce border-red-500 text-red-650" : ""}`}
            style={{
              transform: isShaking ? "scale(1.1)" : "none",
            }}
          >
            <Heart className={`h-4 w-4 transition-all ${isLiked ? "fill-rose-500 text-rose-500 scale-125" : "text-slate-400"}`} />
            <span>לייקים ({likes})</span>
          </button>
        </div>

        {/* Controls and Logs block */}
        <div className="flex-1 space-y-4">
          {/* Connection selection */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 mb-2">בחר מצב חיבור רשת לרעשן הלייקים:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConnectionMode("stable")}
                className={`py-1.5 px-3 text-xs font-bold rounded-lg border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${connectionMode === "stable" ? "bg-amber-100/30 border-amber-400 text-amber-800" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"}`}
              >
                <Wifi className="h-3.5 w-3.5 text-amber-600" />
                חיבור יציב וחלק (Fast DB)
              </button>
              <button
                onClick={() => setConnectionMode("failed")}
                className={`py-1.5 px-3 text-xs font-bold rounded-lg border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${connectionMode === "failed" ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"}`}
              >
                <WifiOff className="h-3.5 w-3.5 text-red-600" />
                שגיאת שרת / איבוד קליטה
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2.5 leading-relaxed font-sans">
              במצב שגיאה, ה-UI יתעדכן **מיידית** בלחיצה (על מנת לתת פידבק מהיר למשתמש), אך ישתחזר לאחור (Rollback) באופן שקוף ואלגנטי כשקריאת השרת תיכשל לאחר שניה!
            </p>
          </div>

          {/* Logs console */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-950 font-mono text-[11px] h-[110px] overflow-y-auto flex flex-col justify-start text-left shadow-inner" dir="ltr">
            <span className="text-[9px] text-slate-500 mb-2 block border-b border-slate-800 pb-1 font-bold uppercase">Real-time UI Event Logs</span>
            {logs.length === 0 ? (
              <p className="text-slate-500 italic font-mono">Press like on the left card to trigger optimistic events logs rendering...</p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className={`mb-1 font-mono ${log.includes("❌") ? "text-red-400" : log.includes("✅") ? "text-emerald-400" : "text-amber-400/80"}`}>
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
