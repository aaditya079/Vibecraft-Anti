import { useState, useRef, useEffect } from 'react';
import { type ClassSection } from '../data/timetables';
import { type SemesterCalculationResult } from '../utils/calculator';
import { 
  X, 
  ArrowUp, 
  Minimize2,
  Sparkles
} from 'lucide-react';

interface Props {
  section: ClassSection;
  results: SemesterCalculationResult;
  planningDate: string;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isAi?: boolean;
  modelTag?: string;
}

const DEFAULT_KEY_B64 = 'QVEuQWI4Uk42THBsa19COGVYMGt4RXFwR0ozRlNuS2VweWtwWV9fc09wVnNxVDB3VHdZeWc=';
const getApiKey = () => {
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  try {
    return atob(DEFAULT_KEY_B64);
  } catch {
    return '';
  }
};

export default function AttendanceAdvisorChat({ section, results, planningDate }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello. I am your Attendance Advisor for ${section.name}. I analyze your section's official timetable and live attendance records to simulate leaves, calculate safe skips, and prevent detention. How may I assist your planning?`,
      timestamp: 'Now',
      isAi: true,
      modelTag: 'Gemini 3.8 Flash'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Local fallback engine in case network is offline
  const generateFallbackResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    if (q.includes('all of em') || q.includes('all of them') || q.includes('miss all') || q.includes('skip all')) {
      const finalPct = results.totalSemesterClasses > 0 ? (results.overallAttended / results.totalSemesterClasses) * 100 : 0;
      return `Critical Impact Analysis:
If you skip all remaining ${results.totalClassesRemaining} classes in the semester, your overall attendance will fall to ${finalPct.toFixed(1)}%. You will face irreversible detention across all subjects.`;
    }

    const classCountMatch = q.match(/(?:miss|skip|bunk|take)\s*(\d+)/i) || q.match(/(\d+)\s*(?:class|classes|period|periods)/i);
    if (classCountMatch) {
      const count = parseInt(classCountMatch[1], 10);
      const remaining = results.totalClassesRemaining;
      const futureAttended = Math.max(0, results.overallAttended + (remaining - count));
      const projectedPct = results.totalSemesterClasses > 0 ? (futureAttended / results.totalSemesterClasses) * 100 : 0;
      const maxSafeSkips = Math.max(0, remaining - results.overallToAttend75);

      return `Absence Simulation (${count} classes):
• Projected final standing: ${projectedPct.toFixed(1)}% (${futureAttended} of ${results.totalSemesterClasses} classes attended).
• Compliance status: ${projectedPct < 75 ? 'Detention threshold breached (<75%).' : 'Compliant standing maintained (≥75%).'}
• Safe skip allowance: ${maxSafeSkips} total classes remaining before falling below 75%.`;
    }

    return `For ${section.name}, you have ${results.totalClassesRemaining} classes remaining. Current overall attendance is ${results.overallCurrentPercentage}%. You must attend at least ${results.overallToAttend75} more classes to secure the mandatory 75% threshold.`;
  };

  // Call Gemini 3.8 Flash API with rich live dashboard context
  const askGeminiAdvisor = async (query: string): Promise<string> => {
    const subjectContext = results.subjectResults.map(s => 
      `- ${s.name} (${s.code}, Slot ${s.slot}): Attended ${s.classesAttended}/${s.classesHeld} held (${s.currentPercentage}%). Remaining classes: ${s.classesRemaining}. Classes needed for 75%: ${s.classesToAttend75}. Safe skips allowed: ${s.bunkBudget75}. Max achievable: ${s.maxAchievablePercentage}%. Irreversible detention: ${s.isIrreversibleDetention ? 'YES' : 'NO'}`
    ).join('\n');

    const scheduleContext = Object.entries(section.schedule).map(([day, periods]) => 
      `${day}: ${periods.filter(Boolean).join(', ') || 'No classes'}`
    ).join('\n');

    const systemPrompt = `You are the Official Smart Attendance Advisor AI for college students at SRMIST, powered by Gemini 3.8 Flash for VibeCraft Season 1.
Your tone is professional, clear, concise, and helpful (like Apple Intelligence).
Provide accurate, math-backed responses.

CURRENT STUDENT DATA:
• Section: ${section.name} (Venue: ${section.venue})
• Semester Window: 29 August 2026 to 29 November 2026
• Planning Date: ${planningDate}
• Overall Semester Stats: Total classes: ${results.totalSemesterClasses}, Classes held so far: ${results.totalClassesHeld}, Classes left: ${results.totalClassesRemaining}
• Overall Attended: ${results.overallAttended}/${results.totalClassesHeld} (${results.overallCurrentPercentage}%)
• Classes needed for Overall ≥75%: ${results.overallToAttend75} classes
• Classes needed for Overall ≥90%: ${results.overallToAttend90} classes
• Irreversible Detention Triggered: ${results.isOverallIrreversible ? 'YES (MATHEMATICALLY IMPOSSIBLE TO REACH 75%)' : 'NO'}

SUBJECT BREAKDOWN:
${subjectContext}

WEEKLY TIMETABLE SCHEDULE:
${scheduleContext}

RULES & POLICIES:
1. Minimum mandatory attendance is 75%. Below 75% means detention (cannot write semester exams).
2. Distinction / Dean's list requires 90%.
3. If student asks "what if I miss 20 classes" or "what if I miss all of them", run the exact math using total classes left (${results.totalClassesRemaining}) and calculate the exact new attendance percentage.
4. If student asks about sick leave starting tomorrow or a specific day, look at the timetable for those days, identify exact classes missed, and calculate the exact drop.
5. On-Duty (OD) and Medical Leave credit missed classes as attended if approved by HOD.
6. Format answers with clean bullets and calm, precise phrasing without excessive exclamation marks or emojis.`;

    const apiKey = getApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nSTUDENT QUESTION: "${query}"\nProvide a precise, math-backed response:` }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API error ${res.status}`);
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('No candidate content');
    return reply;
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: 'Now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const aiReply = await askGeminiAdvisor(query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: aiReply,
        isAi: true,
        modelTag: 'Gemini 3.8 Flash',
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const fallbackText = generateFallbackResponse(query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: fallbackText,
        modelTag: 'Offline Calculation',
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Apple-style Floating Advisor Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white shadow-2xl border border-white/[0.12] backdrop-blur-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-xs font-medium text-zinc-200">Attendance Advisor</span>
          <span className="text-[10px] text-zinc-500 font-normal">AI</span>
        </button>
      )}

      {/* Apple Intelligence Style Dialog Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-zinc-950/90 border border-white/[0.12] rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col h-[560px] max-h-[85vh] transition-all">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-xs text-white">
                    Attendance Advisor
                  </h4>
                  <span className="text-[10px] text-zinc-500">Gemini 3.8</span>
                </div>
                <p className="text-[11px] text-zinc-400">{section.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 border-b border-white/[0.04] flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar bg-black/20">
            <button
              onClick={() => handleSend("What if I miss 20 classes?")}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 whitespace-nowrap transition"
            >
              Miss 20 classes?
            </button>
            <button
              onClick={() => handleSend("What if I miss all remaining classes?")}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 whitespace-nowrap transition"
            >
              Miss all classes?
            </button>
            <button
              onClick={() => handleSend("If I take a 3-day sick leave starting tomorrow, will my attendance drop below 75%?")}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 whitespace-nowrap transition"
            >
              3-day leave impact
            </button>
            <button
              onClick={() => handleSend("How many classes can I safely bunk?")}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 whitespace-nowrap transition"
            >
              Safe bunk allowance
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600/90 text-white rounded-tr-sm'
                      : 'bg-white/[0.04] border border-white/[0.06] text-zinc-200 rounded-tl-sm whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.modelTag && (
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.modelTag}</span>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-zinc-400 p-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse delay-150"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse delay-300"></div>
                <span className="text-zinc-500">Calculating timetable projection...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-white/[0.06] bg-black/40 flex items-center gap-2"
          >
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                placeholder="Ask about skips, leaves, or subjects..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="w-full bg-zinc-900/90 border border-white/[0.1] rounded-full pl-3.5 pr-10 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-1.5 w-6 h-6 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center transition"
              >
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
}
