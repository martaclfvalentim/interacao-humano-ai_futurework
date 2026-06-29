import express from "express";
import cors from "cors";
import multer from "multer";
import { createRequire } from "module";
import { parse as parseHtml } from "node-html-parser";
import "dotenv/config";

// pdf-parse v1 is CJS — import via createRequire in ESM context
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();
const PORT = process.env.PORT || 3001;

// ── LLM config: Groq preferred, Ollama fallback ───────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const OLLAMA_URL   = process.env.OLLAMA_URL  || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const USE_GROQ     = !!GROQ_API_KEY;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// Strip HTML tags from job descriptions
const stripHtml = (html) => (html ? parseHtml(html).text.replace(/\s+/g, " ").trim() : "");

// Store upload in memory; reject non-PDFs and files > 10 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Only PDF files are accepted"));
  },
});

const CV_PROMPT = `You are an expert CV/résumé parser with deep understanding of non-linear career paths. The CV may be in any language — parse it regardless.

Return ONLY a valid JSON object. No markdown, no explanation, no extra text.

{
  "name": "Full name",
  "language": "ISO 639-1 code: pt, en, es, fr, de, etc.",
  "summary": "2-3 sentence professional summary in the SAME language as the CV, written in third person. Mention key strengths, field, and trajectory.",
  "education": [
    {
      "degree": "Exact degree/program name",
      "institution": "University or school",
      "year": "e.g. '2019-2023', '2023-present', 'Sep 2022', or null",
      "status": "completed | ongoing | incomplete | erasmus | exchange",
      "notes": "e.g. 'Erasmus at Universidade de Coimbra 2021-2022', 'Changed from Law to Management in 2nd year', or null"
    }
  ],
  "experience": [
    {
      "title": "Job title",
      "company": "Company or organization",
      "start": "Month Year or Year",
      "end": "Month Year, Year, or null if current",
      "type": "full-time | part-time | internship | freelance | volunteer | erasmus-work",
      "description": "Key responsibilities and achievements"
    }
  ],
  "skills_explicit": ["skills listed in a skills/technologies section"],
  "skills_inferred": ["skills demonstrated in experience/projects but not explicitly listed"],
  "years_experience": 0.0,
  "suggested_careers": ["3-5 specific job titles matching this profile"],
  "location": "City, Country if found"
}

CRITICAL rules for years_experience calculation:
- Count ONLY paid professional work: full-time, part-time (pro-rated), internships (count at 0.5x if under 6 months, 1x if longer), freelance
- Do NOT count: Erasmus study periods, academic coursework, volunteer work (unless highly relevant), time spent changing degrees
- If the person changed degree mid-way, note it in education.notes — it does NOT add to years_experience
- Erasmus WORK placements (paid) DO count; Erasmus STUDY exchanges do NOT
- Overlapping jobs: count the overlapping period only once
- Ongoing jobs: calculate until today (${new Date().toISOString().slice(0, 7)})
- If no professional experience found: set to 0 and let the experience array be empty
- Round to 1 decimal place

Other rules:
- Extract ALL education entries including incomplete, changed, or exchange programs
- skills_explicit and skills_inferred must NOT overlap
- suggested_careers must reflect the person's actual background, not generic suggestions — always write them in ENGLISH regardless of CV language
- location must be in English (e.g. "Lisbon, Portugal" not "Lisboa, Portugal")
- summary must be in the SAME language as the CV`;

// ── Unified LLM caller ────────────────────────────────────────────────────────
async function callLLM({ systemPrompt, userText, jsonMode = false }) {
  if (USE_GROQ) {
    const body = {
      model: GROQ_MODEL,
      max_tokens: 4096,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userText },
      ],
    };
    if (jsonMode) body.response_format = { type: "json_object" };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } else {
    // Ollama fallback
    const messages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      { role: "user", content: userText },
    ];
    const body = { model: OLLAMA_MODEL, stream: false, messages };
    if (jsonMode) body.format = "json";

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.message?.content ?? "";
  }
}

// ── Chat: multi-turn (needs different shape for Groq) ─────────────────────────
async function callLLMChat({ systemPrompt, messages }) {
  if (USE_GROQ) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } else {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.message?.content ?? "";
  }
}

// ── POST /api/parse-cv ────────────────────────────────────────────────────────
app.post("/api/parse-cv", upload.single("cv"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No PDF file provided" });

  let rawText;
  try {
    const parsed = await pdfParse(req.file.buffer);
    rawText = parsed.text?.trim();
  } catch {
    return res.status(422).json({ error: "Could not extract text from PDF" });
  }

  if (!rawText || rawText.length < 50) {
    return res.status(422).json({ error: "PDF appears to be empty or image-based (no extractable text)" });
  }

  const truncated = rawText.length > 4000 ? rawText.slice(0, 4000) + "\n[truncated]" : rawText;

  try {
    console.log(`[LLM] Parsing CV via ${USE_GROQ ? "Groq" : "Ollama"}...`);
    const raw = await callLLM({
      systemPrompt: CV_PROMPT,
      userText: `Parse this CV:\n\n${truncated}`,
      jsonMode: true,
    });

    const cleaned = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim();
    let cvData;
    try {
      cvData = JSON.parse(cleaned);
    } catch {
      throw new Error("Model returned invalid JSON");
    }

    return res.json(cvData);
  } catch (err) {
    return res.status(502).json({ error: err.message || "LLM request failed" });
  }
});

// ── POST /api/chat ────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { profile, messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  const profileSummary = profile ? `
Name: ${profile.name || "Unknown"}
Summary: ${profile.summary || "N/A"}
Years of experience: ${profile.years_experience ?? "Unknown"}
Skills: ${[...(profile.skills_explicit || []), ...(profile.skills_inferred || [])].join(", ") || "None listed"}
Education: ${(profile.education || []).map(e => `${e.degree} at ${e.institution} (${e.year || "?"})`.trim()).join("; ") || "N/A"}
Suggested careers: ${(profile.suggested_careers || []).join(", ") || "N/A"}
` : "No CV data available.";

  const lang = profile?.language || "en";
  const langInstruction = lang === "pt"
    ? "IMPORTANT: Always respond in European Portuguese (Portugal), regardless of what language the user writes in."
    : lang === "es"
    ? "IMPORTANT: Always respond in Spanish."
    : "IMPORTANT: Always respond in English.";

  const systemPrompt = `You are a friendly and insightful career advisor AI for FutureWork, a career platform.
${langInstruction}

You have already analyzed the user's CV. Here is their profile:

${profileSummary}

Your job is to have a natural conversation to:
1. Help them reflect on their career goals, preferences, and motivations
2. Ask about anything important that might be missing from their CV (certifications, projects, soft skills, languages, volunteering, etc.)
3. Understand their preferences: remote vs presencial, tamanho da empresa, indústria, expectativas salariais, etc.
4. Give them useful career insights based on their background

Be conversational, warm, and specific — always reference their actual CV data when relevant. Ask one or two questions at a time, never more. Keep responses concise (2-4 sentences max). When you feel you have enough information, tell them they can click "Done" to continue.`;

  try {
    const reply = await callLLMChat({ systemPrompt, messages });
    return res.json({ message: reply });
  } catch (err) {
    return res.status(502).json({ error: err.message || "LLM request failed" });
  }
});

// ── POST /api/extract-preferences ────────────────────────────────────────────
app.post("/api/extract-preferences", async (req, res) => {
  const { messages } = req.body;
  if (!messages?.length) return res.json({ preferences: {} });

  const conversation = messages.map(m => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n");

  try {
    const raw = await callLLM({
      userText: `You are a career assistant. Read this conversation and extract ALL job search preferences the user expressed. Return ONLY valid JSON — no explanation, no markdown.

{
  "work_mode": "remote" | "hybrid" | "on-site" | null,
  "radius_km": number | null,
  "seniority": "junior" | "mid" | "senior" | null,
  "preferred_industries": ["string", ...] | [],
  "excluded_industries": ["string", ...] | [],
  "preferred_roles": ["string", ...] | [],
  "excluded_roles": ["string", ...] | [],
  "company_size": "startup" | "mid-size" | "enterprise" | null,
  "salary_min": number | null,
  "must_have": ["string", ...] | [],
  "deal_breakers": ["string", ...] | []
}

Rules:
- work_mode: "remote" if user wants to work from home/remotely; "on-site" if they want to go to the office/presencial; "hybrid" if both; null if not mentioned.
- radius_km: only set if on-site or hybrid AND a distance was mentioned. Default 30 for on-site if no distance given. null for remote.
- excluded_industries/excluded_roles: populate when user says things like "I don't want data roles", "not interested in finance", "avoid consulting". Be smart about synonyms (e.g. "data" → exclude "Data Analyst", "Data Scientist", "Data Engineer").
- preferred_roles/preferred_industries: what they DO want, if mentioned.
- deal_breakers: any hard no (e.g. "no travel", "no night shifts", "not startups").
- must_have: hard requirements (e.g. "must be in Lisbon", "needs visa sponsorship").
- Use null/[] for anything not mentioned. Never invent preferences.

Conversation:
${conversation}`,
      jsonMode: true,
    });

    let preferences = {};
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim();
      preferences = JSON.parse(cleaned);
    } catch { /* ignore */ }
    return res.json({ preferences });
  } catch (err) {
    return res.json({ preferences: {} });
  }
});

// ── POST /api/jobs ────────────────────────────────────────────────────────────
app.post("/api/jobs", async (req, res) => {
  const { profile, preferences, chatMessages = [] } = req.body;
  if (!profile) return res.status(400).json({ error: "profile required" });

  const JSEARCH_KEY = process.env.JSEARCH_API_KEY;
  const allSkills = [...(profile.skills_explicit || []), ...(profile.skills_inferred || [])];
  const careers = (profile.suggested_careers || []).slice(0, 3);
  const profileLocation = profile.location || "";
  const cityEn = profileLocation.split(",")[0].trim();
  const workMode = preferences?.work_mode || null;
  const radiusKm = preferences?.radius_km ?? 30;
  const remoteOnly = workMode === "remote";
  const excludedRoles = (preferences?.excluded_roles || []).map(r => r.toLowerCase());
  const excludedIndustries = (preferences?.excluded_industries || []).map(i => i.toLowerCase());
  const preferredRoles = (preferences?.preferred_roles || []).map(r => r.toLowerCase());
  const dealBreakers = (preferences?.deal_breakers || []).map(d => d.toLowerCase());
  const mustHave = (preferences?.must_have || []);
  const seniority = preferences?.seniority || null;

  console.log(`Work mode: ${workMode || "any"} | Location: "${profileLocation}" | Radius: ${radiusKm}km`);

  const seenKeys = new Set();
  const pool = [];

  const addJobs = (list) => {
    for (const j of list) {
      const key = `${j.title}||${j.company}`.toLowerCase();
      if (!seenKeys.has(key) && j.title) { seenKeys.add(key); pool.push(j); }
    }
  };

  // ── LinkedIn (guest API) ────────────────────────────────────────────────────
  {
    const LI_HEADERS = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
      "Accept-Language": "pt-PT,pt;q=0.9",
      "Accept": "text/html,application/xhtml+xml,*/*",
    };
    for (const title of careers) {
      try {
        const location = profileLocation || `${cityEn}, Portugal`;
        console.log(`[LinkedIn] "${title}" em "${location}"`);
        const params = new URLSearchParams({ keywords: title, location, start: "0" });
        if (remoteOnly) params.set("f_WT", "2");
        const r = await fetch(`https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${params}`, { headers: LI_HEADERS });
        if (!r.ok) { console.warn(`[LinkedIn] ${r.status}`); continue; }
        const html = await r.text();
        const doc = parseHtml(html);
        const cards = doc.querySelectorAll(".base-card, .job-search-card");
        for (const card of cards) {
          const t = card.querySelector(".base-search-card__title, h3");
          const company = card.querySelector(".base-search-card__subtitle, h4");
          const loc = card.querySelector(".job-search-card__location");
          const a = card.querySelector("a.base-card__full-link, a[href*='/jobs/view/']");
          if (!t) continue;
          const href = (a?.getAttribute("href") || "").split("?")[0];
          addJobs([{ title: t.text.trim(), company: company?.text.trim() || "", location: loc?.text.trim() || location, url: href, description: "", remote: !!remoteOnly, source: "LinkedIn" }]);
        }
      } catch (e) { console.warn("[LinkedIn]", e.message); }
      if (pool.length >= 20) break;
    }
    console.log(`[LinkedIn] pool: ${pool.length}`);
  }

  // ── JSearch ─────────────────────────────────────────────────────────────────
  if (JSEARCH_KEY && JSEARCH_KEY !== "your_rapidapi_key_here" && pool.length < 20) {
    for (const title of careers) {
      const queries = remoteOnly
        ? [`${title} remote`]
        : workMode === "on-site"
          ? cityEn ? [`${title} in ${cityEn}`] : [title]
          : cityEn ? [`${title} in ${cityEn}`, `${title} remote`] : [`${title} remote`, title];
      for (const q of queries) {
        try {
          console.log(`[JSearch] "${q}"`);
          const p = new URLSearchParams({ query: q, num_pages: "1" });
          if (remoteOnly) p.set("remote_jobs_only", "true");
          if (!remoteOnly && profileLocation) { p.set("location", profileLocation); p.set("distance", String(radiusKm)); }
          const r = await fetch(`https://jsearch.p.rapidapi.com/search?${p}`, {
            headers: { "X-RapidAPI-Key": JSEARCH_KEY, "X-RapidAPI-Host": "jsearch.p.rapidapi.com" },
          });
          if (!r.ok) { console.warn(`[JSearch] ${r.status} ${await r.text().catch(() => "")}`); continue; }
          const d = await r.json();
          addJobs((d.data || []).map(j => ({ title: j.job_title, company: j.employer_name, location: [j.job_city, j.job_country].filter(Boolean).join(", "), url: j.job_apply_link || j.job_google_link, description: stripHtml(j.job_description), remote: !!j.job_is_remote, source: "JSearch" })));
        } catch (e) { console.warn("[JSearch]", e.message); }
        if (pool.length >= 20) break;
      }
      if (pool.length >= 20) break;
    }
    console.log(`[JSearch] pool: ${pool.length}`);
  }

  // ── Arbeitnow ───────────────────────────────────────────────────────────────
  if (pool.length < 15) {
    for (const title of careers.slice(0, 2)) {
      try {
        console.log(`[Arbeitnow] "${title}"`);
        const p = new URLSearchParams({ search: title });
        if (remoteOnly) p.set("remote", "true");
        const r = await fetch(`https://www.arbeitnow.com/api/job-board-api?${p}`);
        if (!r.ok) { console.warn(`[Arbeitnow] ${r.status}`); continue; }
        const d = await r.json();
        addJobs((d.data || []).map(j => ({ title: j.title, company: j.company_name, location: j.location || "", url: j.url, description: stripHtml(j.description), remote: !!j.remote, source: "Arbeitnow" })));
      } catch (e) { console.warn("[Arbeitnow]", e.message); }
      if (pool.length >= 20) break;
    }
    console.log(`[Arbeitnow] pool: ${pool.length}`);
  }

  // ── Remotive (remote-only source — skip when user wants on-site) ────────────
  if (pool.length < 15 && workMode !== "on-site" && (remoteOnly || workMode === "hybrid" || !cityEn)) {
    try {
      const title = careers[0] || "analyst";
      console.log(`[Remotive] "${title}"`);
      const r = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(title)}&limit=20`);
      if (r.ok) {
        const d = await r.json();
        addJobs((d.jobs || []).map(j => ({ title: j.title, company: j.company_name, location: j.candidate_required_location || "Remote", url: j.url, description: stripHtml(j.description), remote: true, source: "Remotive" })));
      }
    } catch (e) { console.warn("[Remotive]", e.message); }
    console.log(`[Remotive] pool: ${pool.length}`);
  }

  // ── Filter pool based on all chat preferences ────────────────────────────────
  const filteredPool = pool.filter(j => {
    const titleLow = (j.title || "").toLowerCase();
    const descLow  = (j.description || "").toLowerCase();
    const combined = `${titleLow} ${descLow}`;

    // Work mode
    if (workMode === "on-site" && j.remote) return false;

    // Excluded roles (e.g. "data analyst", "data engineer")
    if (excludedRoles.some(ex => combined.includes(ex))) return false;

    // Excluded industries
    if (excludedIndustries.some(ex => combined.includes(ex))) return false;

    // Deal breakers (e.g. "travel", "night shift")
    if (dealBreakers.some(db => combined.includes(db))) return false;

    // Seniority: if user explicitly wants junior, exclude senior roles; if senior, exclude intern/junior
    if (seniority === "junior" && /\b(senior|lead|principal|head|director)\b/i.test(j.title)) return false;
    if (seniority === "senior" && /\b(intern|trainee|estágio|junior|entry.level|graduate)\b/i.test(j.title)) return false;

    return true;
  });

  console.log(`Total jobs in pool: ${pool.length} | After mode filter: ${filteredPool.length}`);
  if (filteredPool.length === 0) {
    return res.json({ jobs: [], message: "No listings found. Try adjusting your preferences." });
  }

  // ── LLM Batch Scoring ────────────────────────────────────────────────────────
  const candidates = filteredPool.slice(0, 12);
  console.log(`[Scoring] Sending ${candidates.length} jobs to LLM for scoring...`);

  const chatSummary = chatMessages.length > 0
    ? chatMessages.map(m => `${m.role === "user" ? "Candidate" : "Assistant"}: ${m.content}`).join("\n")
    : "No conversation — score purely based on profile.";

  const jobList = candidates.map((j, i) => (
    `Job ${i + 1}: ${j.title} at ${j.company} | ${j.location || "Unknown"} | ${j.remote ? "Remote" : "On-site"}
Description: ${(j.description || "").slice(0, 180)}`
  )).join("\n\n");

  const scoringPrompt = `You are a career matching expert. Score these job listings for a candidate based on their profile AND their conversation with a career advisor.

CANDIDATE PROFILE:
- Name: ${profile.name || "Unknown"}
- Skills: ${allSkills.join(", ")}
- Experience: ${profile.years_experience ?? 0} years
- Target roles: ${careers.join(", ")}
- Location: ${profile.location || "Unknown"}

CAREER CONVERSATION (pay close attention — this reveals preferences, values, and deal-breakers):
${chatSummary}

JOBS TO SCORE:
${jobList}

For each job, return a JSON array with one object per job (same order):
[
  {
    "id": 1,
    "match": <integer 40-97>,
    "tag": "Recommended" | "High Potential" | "Stretch",
    "matched": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"],
    "reason": "<2 sentences: why this fits or doesn't fit, referencing both skills AND what the candidate said in the conversation>"
  },
  ...
]

Scoring rules:
- match 85-97 = strong skill match + aligns with what candidate expressed in conversation
- match 65-84 = decent skill match OR aligns with conversation goals
- match 40-64 = weak match or conflicts with candidate's expressed preferences
- If the candidate expressed strong dislike for something (e.g. "I don't want data roles", "not interested in finance"), penalise those jobs heavily (match 40-55)
- If the candidate said they want something specific, boost those jobs
- reason must reference the conversation if relevant — don't just talk about skills
- Return ONLY the JSON array, no markdown, no explanation`;

  let jobs;
  try {
    const raw = await callLLM({ userText: scoringPrompt, jsonMode: true });
    const cleaned = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim();
    const scores = JSON.parse(cleaned);

    jobs = candidates.map((j, i) => {
      const s = scores[i] || {};
      const summary = (j.description || "").slice(0, 200) || `${j.title} at ${j.company} in ${j.location || "Unknown"}.`;
      return {
        id: i + 1,
        ...j,
        match: Math.min(97, Math.max(40, s.match || 60)),
        tag: s.tag || "High Potential",
        matched: s.matched || [],
        missing: s.missing || [],
        reason: s.reason || "",
        summary,
      };
    }).sort((a, b) => b.match - a.match).slice(0, 9);
  } catch (err) {
    console.error("[Scoring] LLM scoring failed, falling back to basic scoring:", err.message);
    // Simple fallback: skill keyword matching
    jobs = candidates.map((j, i) => {
      const titleLow = (j.title || "").toLowerCase();
      const matched = allSkills.filter(s => titleLow.includes(s.toLowerCase()));
      const careerHit = careers.some(c => c.toLowerCase().split(" ").some(w => w.length > 3 && titleLow.includes(w)));
      const match = Math.min(90, Math.max(45, 55 + matched.length * 5 + (careerHit ? 15 : 0)));
      const summary = (j.description || "").slice(0, 200) || `${j.title} at ${j.company}.`;
      return { id: i + 1, ...j, match, tag: match >= 80 ? "Recommended" : match >= 65 ? "High Potential" : "Stretch", matched, missing: [], reason: "", summary };
    }).sort((a, b) => b.match - a.match).slice(0, 9);
  }

  return res.json({ jobs });
});

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  const info = { status: "ok", llm: USE_GROQ ? "groq" : "ollama", model: USE_GROQ ? GROQ_MODEL : OLLAMA_MODEL };
  if (!USE_GROQ) {
    try {
      const r = await fetch(`${OLLAMA_URL}/api/tags`);
      const { models } = await r.json();
      info.ollama = "reachable";
      info.available = models.map(m => m.name);
    } catch {
      info.ollama = "unreachable";
    }
  }
  res.json(info);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`LLM: ${USE_GROQ ? `Groq (${GROQ_MODEL})` : `Ollama (${OLLAMA_URL} / ${OLLAMA_MODEL})`}`);
});