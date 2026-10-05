var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_supabase_js = require("@supabase/supabase-js");
var import_genai = require("@google/genai");
var import_vite = require("vite");
var import_meta = {};
import_dotenv.default.config();
var isEsm = typeof import_meta?.url === "string";
var currentFilename = isEsm ? (0, import_url.fileURLToPath)(import_meta.url) : typeof __filename !== "undefined" ? __filename : "";
var currentDirname = isEsm ? import_path.default.dirname(currentFilename) : typeof __dirname !== "undefined" ? __dirname : process.cwd();
var app = (0, import_express.default)();
var args = process.argv.slice(2);
var portArg = 0;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" && args[i + 1]) {
    portArg = parseInt(args[i + 1], 10);
  } else if (args[i].startsWith("--port=")) {
    portArg = parseInt(args[i].split("=")[1], 10);
  }
}
var PORT = portArg || (process.env.NODE_ENV === "production" && process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3);
app.use(import_express.default.json({ limit: "10mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
function cleanEnvString(val) {
  if (!val) return "";
  return val.trim().replace(/^["'\[]+/, "").replace(/["'\]]+$/, "").trim();
}
var SUPABASE_URL = cleanEnvString(process.env.SUPABASE_URL);
var SUPABASE_SERVICE_ROLE_KEY = cleanEnvString(process.env.SUPABASE_SERVICE_ROLE_KEY);
var supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = (0, import_supabase_js.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("Connected to Supabase at:", SUPABASE_URL);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err.message);
    supabase = null;
  }
} else {
  console.warn(
    "WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured in environment/.env"
  );
}
function getSupabase() {
  if (!supabase) {
    throw new Error(
      "Database service is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file."
    );
  }
  return supabase;
}
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function addOneMonth(dateString) {
  if (!dateString) return dateString;
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateString;
  let targetYear = year;
  let targetMonth = month + 1;
  if (targetMonth > 12) {
    targetYear += 1;
    targetMonth = 1;
  }
  const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
  const clampedDay = Math.min(day, daysInTargetMonth);
  const mm = String(targetMonth).padStart(2, "0");
  const dd = String(clampedDay).padStart(2, "0");
  return `${targetYear}-${mm}-${dd}`;
}
function calculateFeeStatus(nextDueDateString, baseDate = /* @__PURE__ */ new Date()) {
  if (!nextDueDateString) return "Paid";
  const parts = nextDueDateString.split("-");
  let due;
  if (parts.length === 3 && parts[0].length === 4) {
    due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    due = new Date(nextDueDateString);
  }
  if (isNaN(due.getTime())) return "Paid";
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1e3 * 60 * 60 * 24));
  if (diffDays < 0) {
    return "Overdue";
  } else if (diffDays <= 7) {
    return "Due soon";
  } else {
    return "Paid";
  }
}
function calculateDaysOverdue(dueDateString) {
  if (!dueDateString) return 0;
  const parts = dueDateString.split("-");
  let due;
  if (parts.length === 3 && parts[0].length === 4) {
    due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    due = new Date(dueDateString);
  }
  if (isNaN(due.getTime())) return 0;
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  due.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.round(diffTime / (1e3 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
function toMemberCamel(row, plans = [], receipts = []) {
  if (!row) return null;
  const nextDueDate = row.next_due_date ? String(row.next_due_date).slice(0, 10) : "";
  return {
    id: String(row.id),
    name: row.name || "",
    phone: row.phone || "",
    age: Number(row.age) || 25,
    gender: row.gender || "Male",
    height: Number(row.height) || 175,
    weight: Number(row.weight) || 75,
    goal: row.goal || "General Fitness",
    program: row.program || "Regular member",
    joinDate: row.join_date ? String(row.join_date).slice(0, 10) : "",
    monthlyFee: Number(row.monthly_fee) || 3e3,
    notes: row.notes || "",
    feeStatus: calculateFeeStatus(nextDueDate),
    nextDueDate,
    lastPaymentDate: row.last_payment_date ? String(row.last_payment_date).slice(0, 10) : void 0,
    activityLevel: row.activity_level || void 0,
    injuries: row.injuries || void 0,
    savedPlans: plans,
    planReceipts: receipts
  };
}
function toMemberSnake(m) {
  const row = {};
  if (m.id !== void 0) row.id = String(m.id);
  if (m.name !== void 0) row.name = m.name;
  if (m.phone !== void 0) row.phone = m.phone;
  if (m.age !== void 0) row.age = Number(m.age);
  if (m.gender !== void 0) row.gender = m.gender;
  if (m.height !== void 0) row.height = Number(m.height);
  if (m.weight !== void 0) row.weight = Number(m.weight);
  if (m.goal !== void 0) row.goal = m.goal;
  if (m.program !== void 0) row.program = m.program;
  if (m.joinDate !== void 0) row.join_date = m.joinDate;
  if (m.monthlyFee !== void 0) row.monthly_fee = Number(m.monthlyFee);
  if (m.notes !== void 0) row.notes = m.notes;
  if (m.feeStatus !== void 0) row.fee_status = m.feeStatus;
  if (m.nextDueDate !== void 0) row.next_due_date = m.nextDueDate;
  if (m.lastPaymentDate !== void 0) row.last_payment_date = m.lastPaymentDate;
  if (m.activityLevel !== void 0) row.activity_level = m.activityLevel;
  if (m.injuries !== void 0) row.injuries = m.injuries;
  return row;
}
function toPaymentCamel(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    receiptNumber: row.receipt_number || "",
    memberId: String(row.member_id || ""),
    memberName: row.member_name || "",
    memberPhone: row.member_phone || void 0,
    amount: Number(row.amount) || 0,
    date: row.date ? String(row.date).slice(0, 10) : "",
    dueDate: row.due_date ? String(row.due_date).slice(0, 10) : "",
    status: row.status || "Paid",
    paymentMethod: row.payment_method || "Cash",
    notes: row.notes || void 0
  };
}
function toPaymentSnake(p) {
  const row = {};
  if (p.id !== void 0) row.id = String(p.id);
  if (p.receiptNumber !== void 0) row.receipt_number = p.receiptNumber;
  if (p.memberId !== void 0) row.member_id = String(p.memberId);
  if (p.memberName !== void 0) row.member_name = p.memberName;
  if (p.memberPhone !== void 0) row.member_phone = p.memberPhone;
  if (p.amount !== void 0) row.amount = Number(p.amount);
  if (p.date !== void 0) row.date = p.date;
  if (p.dueDate !== void 0) row.due_date = p.dueDate;
  if (p.status !== void 0) row.status = p.status;
  if (p.paymentMethod !== void 0) row.payment_method = p.paymentMethod;
  if (p.notes !== void 0) row.notes = p.notes;
  return row;
}
function toPlanCamel(row) {
  if (!row) return null;
  let schedule = row.schedule;
  if (typeof schedule === "string") {
    try {
      schedule = JSON.parse(schedule);
    } catch {
      schedule = [];
    }
  }
  let nutrition = row.nutrition;
  if (typeof nutrition === "string") {
    try {
      nutrition = JSON.parse(nutrition);
    } catch {
      nutrition = { dailyCalories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, sampleMeals: [] };
    }
  }
  let tips = row.tips;
  if (typeof tips === "string") {
    try {
      tips = JSON.parse(tips);
    } catch {
      tips = [];
    }
  }
  let receipt = row.receipt;
  if (typeof receipt === "string") {
    try {
      receipt = JSON.parse(receipt);
    } catch {
      receipt = void 0;
    }
  }
  return {
    id: String(row.id),
    title: row.title || void 0,
    memberId: row.member_id ? String(row.member_id) : void 0,
    memberName: row.member_name || "",
    goal: row.goal || "",
    generatedDate: row.generated_date ? String(row.generated_date).slice(0, 10) : "",
    bmr: row.bmr ? Number(row.bmr) : void 0,
    tdee: row.tdee ? Number(row.tdee) : void 0,
    targetCalories: row.target_calories ? Number(row.target_calories) : void 0,
    daysPerWeek: row.days_per_week ? Number(row.days_per_week) : void 0,
    splitName: row.split_name || void 0,
    injuries: row.injuries || void 0,
    foodPreference: row.food_preference || void 0,
    budget: row.budget || void 0,
    isAiGenerated: row.is_ai_generated !== void 0 ? Boolean(row.is_ai_generated) : void 0,
    isManual: row.is_manual !== void 0 ? Boolean(row.is_manual) : void 0,
    visualObservations: row.visual_observations || void 0,
    schedule: schedule || [],
    nutrition: nutrition || { dailyCalories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, sampleMeals: [] },
    tips: tips || [],
    notes: row.notes || void 0,
    photoUrl: row.photo_url || void 0,
    price: row.price ? Number(row.price) : void 0,
    priceType: row.price_type || void 0,
    receipt,
    receiptId: row.receipt_id || void 0
  };
}
function toPlanSnake(plan) {
  const row = {};
  if (plan.id !== void 0) row.id = String(plan.id);
  if (plan.title !== void 0) row.title = plan.title;
  if (plan.memberId !== void 0) row.member_id = plan.memberId ? String(plan.memberId) : null;
  if (plan.memberName !== void 0) row.member_name = plan.memberName;
  if (plan.goal !== void 0) row.goal = plan.goal;
  if (plan.generatedDate !== void 0) row.generated_date = plan.generatedDate;
  if (plan.bmr !== void 0) row.bmr = Number(plan.bmr);
  if (plan.tdee !== void 0) row.tdee = Number(plan.tdee);
  if (plan.targetCalories !== void 0) row.target_calories = Number(plan.targetCalories);
  if (plan.daysPerWeek !== void 0) row.days_per_week = Number(plan.daysPerWeek);
  if (plan.splitName !== void 0) row.split_name = plan.splitName;
  if (plan.injuries !== void 0) row.injuries = plan.injuries;
  if (plan.foodPreference !== void 0) row.food_preference = plan.foodPreference;
  if (plan.budget !== void 0) row.budget = plan.budget;
  if (plan.isAiGenerated !== void 0) row.is_ai_generated = Boolean(plan.isAiGenerated);
  if (plan.isManual !== void 0) row.is_manual = Boolean(plan.isManual);
  if (plan.visualObservations !== void 0) row.visual_observations = plan.visualObservations;
  if (plan.schedule !== void 0) row.schedule = plan.schedule;
  if (plan.nutrition !== void 0) row.nutrition = plan.nutrition;
  if (plan.tips !== void 0) row.tips = plan.tips;
  if (plan.notes !== void 0) row.notes = plan.notes;
  if (plan.price !== void 0) row.price = Number(plan.price);
  if (plan.priceType !== void 0) row.price_type = plan.priceType;
  return row;
}
function toReceiptCamel(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    receiptNumber: row.receipt_number || "",
    planId: String(row.general_plan_id || row.plan_id || ""),
    planTitle: row.plan_title || "",
    memberId: row.member_id ? String(row.member_id) : void 0,
    memberName: row.customer_name || row.member_name || "",
    memberPhone: row.member_phone || void 0,
    date: row.date ? String(row.date).slice(0, 10) : "",
    amount: Number(row.amount) || 0,
    priceType: row.price_type || "Automatic",
    coverageDescription: row.coverage_description || "",
    gymName: row.gym_name || "",
    gymAddress: row.gym_address || "",
    gymPhone: row.gym_phone || "",
    status: row.status || "Paid"
  };
}
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function toReceiptSnake(r) {
  const row = {};
  if (r.id !== void 0) row.id = String(r.id);
  if (r.receiptNumber !== void 0) row.receipt_number = r.receiptNumber;
  if (r.planId !== void 0 && UUID_REGEX.test(String(r.planId))) {
    row.plan_id = String(r.planId);
  }
  if (r.planTitle !== void 0) row.plan_title = r.planTitle;
  if (r.memberId !== void 0) row.member_id = r.memberId ? String(r.memberId) : null;
  const memberName = r.memberName || r.customerName;
  if (memberName !== void 0) row.member_name = memberName;
  if (r.memberPhone !== void 0) row.member_phone = r.memberPhone;
  if (r.date !== void 0) row.date = r.date;
  if (r.amount !== void 0) row.amount = Number(r.amount);
  if (r.priceType !== void 0) row.price_type = r.priceType;
  if (r.coverageDescription !== void 0) row.coverage_description = r.coverageDescription;
  if (r.gymName !== void 0) row.gym_name = r.gymName;
  if (r.gymPhone !== void 0) row.gym_phone = r.gymPhone;
  if (r.status !== void 0) row.status = r.status;
  return row;
}
function toGeneralSaleSnake(r) {
  const row = toReceiptSnake(r);
  const planIdStr = r.planId !== void 0 ? String(r.planId) : void 0;
  if (planIdStr && !UUID_REGEX.test(planIdStr)) {
    row.general_plan_id = planIdStr;
  } else if (r.generalPlanId) {
    row.general_plan_id = String(r.generalPlanId);
  }
  row.customer_name = r.memberName || r.customerName || row.member_name || "";
  delete row.plan_id;
  delete row.member_name;
  delete row.member_phone;
  delete row.gym_name;
  delete row.gym_address;
  delete row.gym_phone;
  delete row.status;
  delete row.coverage_description;
  return row;
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    supabaseConfigured: Boolean(supabase)
  });
});
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { gymName, gymAddress, gymPhone, email, password, superAdminSecret, superAdminKey } = req.body;
    const expectedSecret = cleanEnvString(process.env.SUPER_ADMIN_SECRET);
    const providedSecret = cleanEnvString(
      superAdminSecret || superAdminKey || req.headers["x-super-admin-secret"]
    );
    if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    if (!email || !password || !gymName) {
      res.status(400).json({ error: "Gym name, admin email, and password are required" });
      return;
    }
    if (!supabase) {
      res.status(503).json({
        error: "Supabase is not configured on the server. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file."
      });
      return;
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanGymName = String(gymName).trim();
    const cleanAddress = gymAddress ? String(gymAddress).trim() : "";
    const cleanPhone = gymPhone ? String(gymPhone).trim() : "";
    const db = getSupabase();
    let userId;
    let initialSession = null;
    const { data: adminUserData, error: adminUserErr } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: {
        name: cleanGymName,
        gym_name: cleanGymName
      }
    });
    if (!adminUserErr && adminUserData?.user) {
      userId = adminUserData.user.id;
    } else {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: String(password),
        options: {
          data: {
            name: cleanGymName,
            gym_name: cleanGymName
          }
        }
      });
      if (signUpErr || !signUpData?.user) {
        res.status(400).json({
          error: signUpErr?.message || adminUserErr?.message || "Failed to create user account"
        });
        return;
      }
      userId = signUpData.user.id;
      initialSession = signUpData.session;
    }
    const { data: gymRow, error: gymError } = await db.from("gyms").insert({
      name: cleanGymName,
      address: cleanAddress,
      phone: cleanPhone,
      admin_email: cleanEmail
    }).select().single();
    if (gymError || !gymRow) {
      console.error("Error creating gym row:", gymError?.message);
      await supabase.auth.admin.deleteUser(userId).catch(() => {
      });
      res.status(500).json({ error: gymError?.message || "Failed to initialize gym workspace" });
      return;
    }
    const { error: adminLinkErr } = await db.from("gym_admins").insert({
      user_id: userId,
      gym_id: gymRow.id
    });
    if (adminLinkErr) {
      console.error("Error linking gym admin:", adminLinkErr.message);
      res.status(500).json({ error: adminLinkErr.message || "Failed to associate administrator with gym" });
      return;
    }
    let session = initialSession;
    if (!session?.access_token) {
      const signInRes = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: String(password)
      });
      if (signInRes.data?.session) {
        session = signInRes.data.session;
      }
    }
    if (!session?.access_token) {
      res.json({
        requireEmailConfirmation: true,
        message: "Account created! Please check your email to confirm your account, then sign in.",
        adminEmail: cleanEmail,
        gymName: cleanGymName
      });
      return;
    }
    res.json({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in,
      adminName: cleanGymName,
      adminEmail: cleanEmail,
      gym: {
        id: gymRow.id,
        name: gymRow.name,
        address: gymRow.address || "",
        phone: gymRow.phone || "",
        adminEmail: gymRow.admin_email || cleanEmail
      }
    });
  } catch (err) {
    console.error("Error in /api/auth/signup:", err);
    res.status(500).json({ error: err.message || "An unexpected error occurred during signup" });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    if (!supabase) {
      res.status(503).json({
        error: "Supabase is not configured on the server. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file."
      });
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password)
    });
    if (error || !data?.session?.access_token || !data?.user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const { data: adminRow } = await supabase.from("gym_admins").select("gym_id, gyms (*)").eq("user_id", data.user.id).maybeSingle();
    const userMeta = data.user.user_metadata || {};
    const gymRecord = adminRow?.gyms;
    const adminName = gymRecord?.name || userMeta.name || userMeta.full_name || "Gym Administrator";
    res.json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      adminName,
      adminEmail: data.user.email || email,
      gym: gymRecord ? {
        id: gymRecord.id,
        name: gymRecord.name,
        address: gymRecord.address || "",
        phone: gymRecord.phone || "",
        adminEmail: gymRecord.admin_email || data.user.email || email
      } : void 0
    });
  } catch (err) {
    console.error("Error in /api/auth/login:", err.message);
    res.status(401).json({ error: "Invalid email or password" });
  }
});
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }
    if (!supabase) {
      res.status(503).json({
        error: "Supabase is not configured on the server. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file."
      });
      return;
    }
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: String(refreshToken).trim()
    });
    if (error || !data?.session?.access_token) {
      res.status(401).json({ error: error?.message || "Session expired or invalid refresh token" });
      return;
    }
    res.json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in
    });
  } catch (err) {
    console.error("Error in /api/auth/refresh:", err.message);
    res.status(401).json({ error: "Session expired or invalid refresh token" });
  }
});
app.post("/api/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && supabase) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      if (token) {
        await supabase.auth.admin?.signOut(token).catch(() => {
        });
      }
    }
  } catch {
  }
  res.json({ success: true });
});
app.get("/api/super-admin/gyms", async (req, res) => {
  try {
    const expectedSecret = cleanEnvString(process.env.SUPER_ADMIN_SECRET);
    const providedSecret = cleanEnvString(
      req.headers["x-super-admin-secret"] || req.headers["super-admin-secret"] || req.query.secret || req.query.superAdminSecret || req.query.superAdminKey
    );
    if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    if (!supabase) {
      res.status(503).json({
        error: "Supabase is not configured on the server. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file."
      });
      return;
    }
    const db = getSupabase();
    const { data: gyms, error: gymsErr } = await db.from("gyms").select("*").order("created_at", { ascending: false });
    if (gymsErr) throw gymsErr;
    const { data: members, error: membersErr } = await db.from("members").select("gym_id");
    if (membersErr) throw membersErr;
    const countMap = {};
    (members || []).forEach((m) => {
      if (m.gym_id) {
        countMap[m.gym_id] = (countMap[m.gym_id] || 0) + 1;
      }
    });
    const formattedGyms = (gyms || []).map((g) => ({
      id: String(g.id),
      name: g.name || "Unnamed Gym",
      address: g.address || "",
      phone: g.phone || "",
      adminEmail: g.admin_email || "",
      createdAt: g.created_at || "",
      memberCount: countMap[g.id] || 0
    }));
    res.json(formattedGyms);
  } catch (err) {
    console.error("Error in GET /api/super-admin/gyms:", err.message);
    res.status(500).json({ error: err.message || "Failed to fetch registered gyms" });
  }
});
var authMiddleware = async (req, res, next) => {
  if (req.path === "/api/health" || req.path === "/api/auth/login" || req.path === "/api/auth/signup" || req.path === "/api/auth/refresh" || req.path === "/api/super-admin/gyms" || !req.path.startsWith("/api/")) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header missing or invalid" });
    return;
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    res.status(401).json({ error: "Authentication token missing" });
    return;
  }
  if (!supabase) {
    res.status(503).json({
      error: "Database service is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env."
    });
    return;
  }
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired session token" });
      return;
    }
    const { data: adminRow, error: adminErr } = await supabase.from("gym_admins").select("gym_id").eq("user_id", user.id).maybeSingle();
    if (adminErr) {
      console.error("Error fetching gym_admins:", adminErr.message);
      res.status(500).json({ error: "Failed to verify gym association" });
      return;
    }
    if (!adminRow || !adminRow.gym_id) {
      res.status(403).json({ error: "No gym associated with this account." });
      return;
    }
    req.user = user;
    req.gymId = adminRow.gym_id;
    next();
  } catch {
    res.status(401).json({ error: "Failed to verify session token" });
  }
};
app.use(authMiddleware);
app.get("/api/gym/me", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { data, error } = await db.from("gyms").select("*").eq("id", gymId).single();
    if (error || !data) {
      res.status(404).json({ error: "Gym profile not found" });
      return;
    }
    res.json({
      id: data.id,
      name: data.name,
      address: data.address || "",
      phone: data.phone || "",
      adminEmail: data.admin_email || "",
      tagline: data.tagline || "STRENGTH & DISCIPLINE GYM",
      currency: data.currency || "PKR",
      currencySymbol: data.currency_symbol || "Rs"
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch gym profile" });
  }
});
app.put("/api/gym/me", async (req, res) => {
  try {
    const gymId = req.gymId;
    const { name, address, phone, tagline } = req.body;
    const db = getSupabase();
    const updatePayload = {};
    if (name !== void 0) updatePayload.name = String(name).trim();
    if (address !== void 0) updatePayload.address = String(address).trim();
    if (phone !== void 0) updatePayload.phone = String(phone).trim();
    if (tagline !== void 0) updatePayload.tagline = String(tagline).trim();
    const { data, error } = await db.from("gyms").update(updatePayload).eq("id", gymId).select().single();
    if (error || !data) {
      res.status(500).json({ error: error?.message || "Failed to update gym profile" });
      return;
    }
    res.json({
      id: data.id,
      name: data.name,
      address: data.address || "",
      phone: data.phone || "",
      adminEmail: data.admin_email || "",
      tagline: data.tagline || "STRENGTH & DISCIPLINE GYM",
      currency: data.currency || "PKR",
      currencySymbol: data.currency_symbol || "Rs"
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update gym profile" });
  }
});
app.get("/api/members", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { data: memberRows, error: mErr } = await db.from("members").select("*").eq("gym_id", gymId).order("id", { ascending: false });
    if (mErr) throw mErr;
    const [plansRes, receiptsRes] = await Promise.all([
      db.from("saved_plans").select("*").eq("gym_id", gymId),
      db.from("plan_receipts").select("*").eq("gym_id", gymId)
    ]);
    const plansByMember = /* @__PURE__ */ new Map();
    (plansRes.data || []).forEach((p) => {
      if (p.member_id) {
        const list = plansByMember.get(String(p.member_id)) || [];
        list.push(toPlanCamel(p));
        plansByMember.set(String(p.member_id), list);
      }
    });
    const receiptsByMember = /* @__PURE__ */ new Map();
    (receiptsRes.data || []).forEach((r) => {
      if (r.member_id) {
        const list = receiptsByMember.get(String(r.member_id)) || [];
        list.push(toReceiptCamel(r));
        receiptsByMember.set(String(r.member_id), list);
      }
    });
    const members = (memberRows || []).map(
      (m) => toMemberCamel(
        m,
        plansByMember.get(String(m.id)) || [],
        receiptsByMember.get(String(m.id)) || []
      )
    );
    res.json(members);
  } catch (err) {
    console.error("Error GET /api/members:", err.message);
    res.status(500).json({ error: err.message || "Failed to fetch members" });
  }
});
app.get("/api/members/:id", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { data: row, error } = await db.from("members").select("*").eq("id", req.params.id).eq("gym_id", gymId).maybeSingle();
    if (error) throw error;
    if (!row) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    const [plansRes, receiptsRes] = await Promise.all([
      db.from("saved_plans").select("*").eq("member_id", req.params.id).eq("gym_id", gymId),
      db.from("plan_receipts").select("*").eq("member_id", req.params.id).eq("gym_id", gymId)
    ]);
    const member = toMemberCamel(
      row,
      (plansRes.data || []).map(toPlanCamel),
      (receiptsRes.data || []).map(toReceiptCamel)
    );
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch member" });
  }
});
app.post("/api/members", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const body = req.body;
    const today = formatDate(/* @__PURE__ */ new Date());
    const memberId = body.id || import_crypto.default.randomUUID();
    const nextDue = body.nextDueDate || addOneMonth(today);
    const computedFeeStatus = body.feeStatus || calculateFeeStatus(nextDue);
    const snakeMember = toMemberSnake({
      ...body,
      id: memberId,
      program: body.program || "Regular member",
      joinDate: body.joinDate || today,
      nextDueDate: nextDue,
      feeStatus: computedFeeStatus,
      lastPaymentDate: computedFeeStatus === "Paid" ? today : void 0
    });
    snakeMember.gym_id = gymId;
    const { data: inserted, error: insertErr } = await db.from("members").insert(snakeMember).select().single();
    if (insertErr) throw insertErr;
    if (computedFeeStatus === "Paid") {
      const receiptNumber = `REC-${(/* @__PURE__ */ new Date()).getFullYear()}-${Date.now().toString().slice(-4)}`;
      const snakePayment = toPaymentSnake({
        id: import_crypto.default.randomUUID(),
        receiptNumber,
        memberId,
        memberName: body.name,
        memberPhone: body.phone,
        amount: Number(body.monthlyFee) || 3e3,
        date: today,
        dueDate: today,
        status: "Paid",
        paymentMethod: "Cash",
        notes: "Initial registration payment"
      });
      snakePayment.gym_id = gymId;
      await db.from("fee_payments").insert(snakePayment);
    }
    res.status(201).json(toMemberCamel(inserted));
  } catch (err) {
    console.error("Error POST /api/members:", err.message);
    res.status(500).json({ error: err.message || "Failed to create member" });
  }
});
app.patch("/api/members/:id", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const id = req.params.id;
    const updates = req.body;
    const { data: existing, error: fetchErr } = await db.from("members").select("*").eq("id", id).eq("gym_id", gymId).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) {
      res.status(404).json({ error: `Member ${id} not found` });
      return;
    }
    const today = formatDate(/* @__PURE__ */ new Date());
    const merged = { ...existing };
    if (updates.feeStatus && !updates.nextDueDate) {
      if (updates.feeStatus === "Paid") {
        if (!merged.next_due_date || merged.next_due_date < today) {
          updates.nextDueDate = addOneMonth(today);
        }
      } else if (updates.feeStatus === "Overdue") {
        if (!merged.next_due_date || merged.next_due_date >= today) {
          const past = /* @__PURE__ */ new Date();
          past.setDate(past.getDate() - 7);
          updates.nextDueDate = formatDate(past);
        }
      } else if (updates.feeStatus === "Due soon") {
        if (!merged.next_due_date || calculateFeeStatus(merged.next_due_date) !== "Due soon") {
          updates.nextDueDate = today;
        }
      }
    } else if (updates.nextDueDate) {
      updates.feeStatus = updates.feeStatus || calculateFeeStatus(updates.nextDueDate);
    }
    const snakeUpdates = toMemberSnake(updates);
    delete snakeUpdates.id;
    delete snakeUpdates.gym_id;
    const { data: updatedRow, error: updateErr } = await db.from("members").update(snakeUpdates).eq("id", id).eq("gym_id", gymId).select().single();
    if (updateErr) throw updateErr;
    if (updates.name || updates.phone) {
      const syncObj = {};
      if (updates.name) syncObj.member_name = updates.name;
      if (updates.phone) syncObj.member_phone = updates.phone;
      await Promise.all([
        db.from("fee_payments").update(syncObj).eq("member_id", id).eq("gym_id", gymId),
        db.from("plan_receipts").update(syncObj).eq("member_id", id).eq("gym_id", gymId)
      ]).catch(() => {
      });
    }
    res.json(toMemberCamel(updatedRow));
  } catch (err) {
    console.error("Error PATCH /api/members/:id:", err.message);
    res.status(500).json({ error: err.message || "Failed to update member" });
  }
});
app.delete("/api/members/:id", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { error } = await db.from("members").delete().eq("id", req.params.id).eq("gym_id", gymId);
    if (error) throw error;
    await Promise.all([
      db.from("fee_payments").delete().eq("member_id", req.params.id).eq("gym_id", gymId),
      db.from("saved_plans").delete().eq("member_id", req.params.id).eq("gym_id", gymId),
      db.from("plan_receipts").delete().eq("member_id", req.params.id).eq("gym_id", gymId)
    ]).catch(() => {
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete member" });
  }
});
app.post("/api/members/bulk", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const list = Array.isArray(req.body) ? req.body : req.body.members || [];
    const today = formatDate(/* @__PURE__ */ new Date());
    const createdMembers = [];
    for (const m of list) {
      const memberId = m.id || import_crypto.default.randomUUID();
      const nextDue = m.nextDueDate || addOneMonth(today);
      const computedFeeStatus = m.feeStatus || calculateFeeStatus(nextDue);
      const snakeMember = toMemberSnake({
        ...m,
        id: memberId,
        program: m.program || "Regular member",
        joinDate: m.joinDate || today,
        nextDueDate: nextDue,
        feeStatus: computedFeeStatus,
        lastPaymentDate: computedFeeStatus === "Paid" ? today : void 0
      });
      snakeMember.gym_id = gymId;
      const { data: inserted, error } = await db.from("members").insert(snakeMember).select().single();
      if (!error && inserted) {
        createdMembers.push(toMemberCamel(inserted));
        if (computedFeeStatus === "Paid") {
          const receiptNumber = `REC-${(/* @__PURE__ */ new Date()).getFullYear()}-${Date.now().toString().slice(-4)}`;
          const snakePayment = toPaymentSnake({
            id: import_crypto.default.randomUUID(),
            receiptNumber,
            memberId,
            memberName: m.name,
            memberPhone: m.phone,
            amount: Number(m.monthlyFee) || 3e3,
            date: today,
            dueDate: today,
            status: "Paid",
            paymentMethod: "Cash",
            notes: "Initial registration payment (bulk import)"
          });
          snakePayment.gym_id = gymId;
          await db.from("fee_payments").insert(snakePayment);
        }
      }
    }
    res.status(201).json(createdMembers);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to bulk import members" });
  }
});
app.post("/api/members/:id/mark-paid", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const memberId = req.params.id;
    const { amount, paymentMethod } = req.body;
    const { data: memberRow, error: fetchErr } = await db.from("members").select("*").eq("id", memberId).eq("gym_id", gymId).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!memberRow) {
      res.status(404).json({ error: `Member ${memberId} not found` });
      return;
    }
    const today = formatDate(/* @__PURE__ */ new Date());
    let nextDue;
    if (memberRow.next_due_date && memberRow.next_due_date >= today) {
      nextDue = addOneMonth(memberRow.next_due_date);
    } else {
      nextDue = addOneMonth(today);
    }
    const feeAmount = amount !== void 0 ? Number(amount) : Number(memberRow.monthly_fee) || 3e3;
    const computedStatus = calculateFeeStatus(nextDue);
    const { data: updatedMemberRow, error: updateErr } = await db.from("members").update({
      last_payment_date: today,
      next_due_date: nextDue,
      fee_status: computedStatus
    }).eq("id", memberId).eq("gym_id", gymId).select().single();
    if (updateErr) throw updateErr;
    const receiptNumber = `REC-${(/* @__PURE__ */ new Date()).getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newPaymentObj = {
      id: import_crypto.default.randomUUID(),
      receiptNumber,
      memberId,
      memberName: memberRow.name,
      memberPhone: memberRow.phone,
      amount: feeAmount,
      date: today,
      dueDate: nextDue,
      status: "Paid",
      paymentMethod: paymentMethod || "Cash",
      notes: "Monthly membership fee payment recorded by admin"
    };
    const snakePayment = toPaymentSnake(newPaymentObj);
    snakePayment.gym_id = gymId;
    const { data: insertedPayment, error: payErr } = await db.from("fee_payments").insert(snakePayment).select().single();
    if (payErr) throw payErr;
    res.json({
      member: toMemberCamel(updatedMemberRow),
      payment: toPaymentCamel(insertedPayment)
    });
  } catch (err) {
    console.error("Error in /api/members/:id/mark-paid:", err.message);
    res.status(500).json({ error: err.message || "Failed to mark member as paid" });
  }
});
app.get("/api/payments", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { data, error } = await db.from("fee_payments").select("*").eq("gym_id", gymId).order("date", { ascending: false }).order("id", { ascending: false });
    if (error) throw error;
    res.json((data || []).map(toPaymentCamel));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch payments" });
  }
});
app.post("/api/payments/:id/mark-paid", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const paymentId = req.params.id;
    const { data: paymentRow, error: fetchErr } = await db.from("fee_payments").select("*").eq("id", paymentId).eq("gym_id", gymId).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!paymentRow) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }
    const today = formatDate(/* @__PURE__ */ new Date());
    const { data: updatedPayment, error: updateErr } = await db.from("fee_payments").update({
      status: "Paid",
      date: today
    }).eq("id", paymentId).eq("gym_id", gymId).select().single();
    if (updateErr) throw updateErr;
    if (paymentRow.member_id) {
      const { data: mem } = await db.from("members").select("*").eq("id", paymentRow.member_id).eq("gym_id", gymId).maybeSingle();
      if (mem) {
        const nextDue = mem.next_due_date && mem.next_due_date >= today ? addOneMonth(mem.next_due_date) : addOneMonth(today);
        await db.from("members").update({
          last_payment_date: today,
          next_due_date: nextDue,
          fee_status: calculateFeeStatus(nextDue)
        }).eq("id", paymentRow.member_id).eq("gym_id", gymId);
      }
    }
    res.json(toPaymentCamel(updatedPayment));
  } catch (err) {
    console.error("Error in /api/payments/:id/mark-paid:", err.message);
    res.status(500).json({ error: err.message || "Failed to mark payment as paid" });
  }
});
app.get("/api/plans", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { data, error } = await db.from("saved_plans").select("*").eq("gym_id", gymId).order("generated_date", { ascending: false }).order("id", { ascending: false });
    if (error) throw error;
    res.json((data || []).map(toPlanCamel));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch plans" });
  }
});
app.post("/api/plans", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const plan = req.body;
    if (!plan.id) {
      plan.id = import_crypto.default.randomUUID();
    }
    const snakePlan = toPlanSnake(plan);
    snakePlan.gym_id = gymId;
    const { data, error } = await db.from("saved_plans").upsert(snakePlan, { onConflict: "id" }).select().single();
    if (error) throw error;
    if (plan.receipt) {
      const snakeReceipt = toReceiptSnake(plan.receipt);
      snakeReceipt.gym_id = gymId;
      await db.from("plan_receipts").upsert(snakeReceipt, { onConflict: "id" });
    }
    res.json(toPlanCamel(data));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to save plan" });
  }
});
app.delete("/api/plans/:id", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { error } = await db.from("saved_plans").delete().eq("id", req.params.id).eq("gym_id", gymId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete plan" });
  }
});
app.post("/api/plans/:id/save-to-member", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { memberId, plan } = req.body;
    const { data: memberCheck } = await db.from("members").select("id").eq("id", memberId).eq("gym_id", gymId).maybeSingle();
    if (!memberCheck) {
      res.status(404).json({ error: "Member not found in your gym" });
      return;
    }
    const planObj = {
      ...plan,
      id: req.params.id || plan.id || import_crypto.default.randomUUID(),
      memberId
    };
    const snakePlan = toPlanSnake(planObj);
    snakePlan.gym_id = gymId;
    const { error } = await db.from("saved_plans").upsert(snakePlan, { onConflict: "id" });
    if (error) throw error;
    if (planObj.receipt) {
      const snakeReceipt = toReceiptSnake({ ...planObj.receipt, memberId });
      snakeReceipt.gym_id = gymId;
      await db.from("plan_receipts").upsert(snakeReceipt, { onConflict: "id" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to save plan to member" });
  }
});
app.get("/api/plan-receipts", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { data, error } = await db.from("plan_receipts").select("*").eq("gym_id", gymId).order("date", { ascending: false }).order("id", { ascending: false });
    if (error) throw error;
    res.json((data || []).map(toReceiptCamel));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch plan receipts" });
  }
});
app.post("/api/plan-receipts", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const receipt = req.body;
    if (!receipt.id) {
      receipt.id = import_crypto.default.randomUUID();
    }
    const snakeReceipt = toReceiptSnake(receipt);
    snakeReceipt.gym_id = gymId;
    const { data, error } = await db.from("plan_receipts").upsert(snakeReceipt, { onConflict: "id" }).select().single();
    if (error) throw error;
    res.json(toReceiptCamel(data));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to save plan receipt" });
  }
});
app.get("/api/general-plan-sales", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const { data, error } = await db.from("general_plan_sales").select("*").eq("gym_id", gymId).order("date", { ascending: false }).order("id", { ascending: false });
    if (error) throw error;
    res.json((data || []).map(toReceiptCamel));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch general plan sales" });
  }
});
app.post("/api/general-plan-sales", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const saleReceipt = req.body;
    if (!saleReceipt.id) {
      saleReceipt.id = import_crypto.default.randomUUID();
    }
    const snakeSale = toGeneralSaleSnake(saleReceipt);
    snakeSale.gym_id = gymId;
    const { data, error } = await db.from("general_plan_sales").upsert(snakeSale, { onConflict: "id" }).select().single();
    if (error) throw error;
    try {
      const snakeMirror = toReceiptSnake(saleReceipt);
      snakeMirror.gym_id = gymId;
      await db.from("plan_receipts").upsert(snakeMirror, { onConflict: "id" });
    } catch (mirrorErr) {
      console.warn("Could not mirror general plan sale to plan_receipts:", mirrorErr?.message || mirrorErr);
    }
    res.json(toReceiptCamel(data));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to save general plan sale" });
  }
});
app.get("/api/dashboard-stats", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    const [membersRes, paymentsRes] = await Promise.all([
      db.from("members").select("*").eq("gym_id", gymId),
      db.from("fee_payments").select("*").eq("gym_id", gymId)
    ]);
    if (membersRes.error) throw membersRes.error;
    if (paymentsRes.error) throw paymentsRes.error;
    const rawMembers = membersRes.data || [];
    const rawPayments = paymentsRes.data || [];
    const now = /* @__PURE__ */ new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentYearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const totalMembers = rawMembers.length;
    let paidThisMonthCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;
    let regularCount = 0;
    let cuttingCount = 0;
    let bulkingCount = 0;
    const dueSoonMembers = [];
    const overdueMembers = [];
    rawMembers.forEach((m) => {
      const status = calculateFeeStatus(m.next_due_date, now);
      const camelM = toMemberCamel(m);
      if (status === "Paid") {
        paidThisMonthCount++;
      } else if (status === "Due soon") {
        dueSoonCount++;
        dueSoonMembers.push(camelM);
      } else if (status === "Overdue") {
        overdueCount++;
        overdueMembers.push({
          ...camelM,
          daysOverdue: calculateDaysOverdue(m.next_due_date)
        });
      }
      const prog = m.program || "Regular member";
      if (prog === "Cutting") cuttingCount++;
      else if (prog === "Bulking") bulkingCount++;
      else regularCount++;
    });
    overdueMembers.sort((a, b) => b.daysOverdue - a.daysOverdue);
    const unpaidOrOverdueCount = dueSoonCount + overdueCount;
    const membershipHealthRate = totalMembers === 0 ? 100 : Math.round(paidThisMonthCount / totalMembers * 100);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      let mIdx = currentMonth - i;
      let y = currentYear;
      while (mIdx < 0) {
        mIdx += 12;
        y -= 1;
      }
      const ym = `${y}-${String(mIdx + 1).padStart(2, "0")}`;
      const label = monthNames[mIdx];
      const isCurrent = i === 0;
      const monthPayments = rawPayments.filter((p) => {
        if (p.status !== "Paid") return false;
        const pDate = p.date ? String(p.date).slice(0, 10) : p.created_at ? String(p.created_at).slice(0, 10) : "";
        return pDate.startsWith(ym);
      });
      const amount = monthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      monthlyRevenue.push({
        yearMonth: ym,
        label,
        amount,
        isCurrent,
        paymentCount: monthPayments.length
      });
    }
    const currentMonthEntry = monthlyRevenue.find((m) => m.isCurrent) || monthlyRevenue[monthlyRevenue.length - 1];
    const moneyCollectedThisMonth = currentMonthEntry ? currentMonthEntry.amount : 0;
    res.json({
      totalMembers,
      paidThisMonthCount,
      unpaidOrOverdueCount,
      dueSoonCount,
      overdueCount,
      moneyCollectedThisMonth,
      monthlyRevenue,
      membershipHealthRate,
      regularCount,
      cuttingCount,
      bulkingCount,
      dueSoonMembers,
      overdueMembers,
      currencySymbol: "Rs",
      currentYearMonth
    });
  } catch (err) {
    console.error("Error GET /api/dashboard-stats:", err.message);
    res.status(500).json({ error: err.message || "Failed to compute dashboard stats" });
  }
});
app.post("/api/reset-revenue", async (req, res) => {
  try {
    const gymId = req.gymId;
    const db = getSupabase();
    await Promise.all([
      db.from("fee_payments").delete().eq("gym_id", gymId),
      db.from("plan_receipts").delete().eq("gym_id", gymId),
      db.from("general_plan_sales").delete().eq("gym_id", gymId),
      db.from("members").update({ last_payment_date: null }).eq("gym_id", gymId)
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to reset revenue" });
  }
});
function getActivityMultiplier(activityLevel, daysPerWeek) {
  if (activityLevel) {
    const act = activityLevel.toLowerCase().trim();
    if (act.includes("sedentary")) return 1.2;
    if (act.includes("lightly") || act.includes("light")) return 1.375;
    if (act.includes("moderately") || act.includes("moderate")) return 1.55;
    if (act.includes("very active") || act.includes("very")) return 1.725;
    if (act.includes("extremely") || act.includes("extreme")) return 1.9;
  }
  if (daysPerWeek !== void 0 && daysPerWeek > 0) {
    if (daysPerWeek <= 2) return 1.375;
    if (daysPerWeek <= 5) return 1.55;
    return 1.725;
  }
  return 1.55;
}
function calculateLocalPlan(body, visualObservations) {
  const {
    memberName = "Member",
    age = 25,
    gender = "Male",
    height = 175,
    weight = 75,
    goal = "General Fitness",
    activityLevel,
    daysPerWeek = 4,
    foodPreference = "Non-veg",
    budget = "Medium",
    injuries = ""
  } = body;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "Male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  const activityMultiplier = getActivityMultiplier(activityLevel, daysPerWeek);
  const tdee = Math.round(bmr * activityMultiplier);
  let targetCalories = tdee;
  let proteinRatio = 2;
  if (goal === "Bulking") {
    targetCalories = Math.round(tdee + 400);
    proteinRatio = 2;
  } else if (goal === "Cutting") {
    targetCalories = Math.round(tdee - 450);
    proteinRatio = 2.2;
  } else {
    targetCalories = Math.round(tdee);
    proteinRatio = 1.8;
  }
  const proteinGrams = Math.round(weight * proteinRatio);
  const fatGrams = Math.round(targetCalories * 0.25 / 9);
  const carbCalories = targetCalories - (proteinGrams * 4 + fatGrams * 9);
  const carbsGrams = Math.max(80, Math.round(carbCalories / 4));
  const isVeg = foodPreference === "Vegetarian";
  const sampleMeals = [
    {
      time: "Breakfast (Nashta)",
      name: goal === "Bulking" ? "High-Protein Desi Nashta" : "Lean Protein Nashta",
      items: isVeg ? "3 Boiled eggs (or paneer bhurji), 2 whole wheat rotis, 1 glass doodh with fruit." : goal === "Bulking" ? "4 Eggs (boiled or omelette), 2 parathas/rotis, 1 glass doodh with 2 bananas & peanut butter." : "4 Egg whites + 1 whole egg omelette with green chillies & tomatoes, 1 whole wheat chapati, green tea.",
      calories: Math.round(targetCalories * 0.28),
      proteinGrams: Math.round(proteinGrams * 0.3)
    },
    {
      time: "Lunch (Dopahar)",
      name: "Hearty Salan & Roti",
      items: isVeg ? "1 Large bowl Daal Chana, 1 bowl dahi raita, 2-3 whole wheat chapatis, fresh kachumber salad." : goal === "Bulking" ? "220g Chicken Karahi or Salan (light oil), 3 chapatis or boiled rice, 1 katori dahi raita, salad." : "180g Boiled or lightly grilled chicken breast with desi spices, 1 katori daal masoor, 1 chapati, fresh salad.",
      calories: Math.round(targetCalories * 0.35),
      proteinGrams: Math.round(proteinGrams * 0.35)
    },
    {
      time: "Evening Snack (Asar)",
      name: "Chana & Hydration Snack",
      items: "1 Bowl boiled chana chaat with lemon & cucumber, 1 handful roasted peanuts, 1 cup green tea.",
      calories: Math.round(targetCalories * 0.15),
      proteinGrams: Math.round(proteinGrams * 0.15)
    },
    {
      time: "Dinner (Raat)",
      name: "Restorative Protein Dinner",
      items: isVeg ? "1 Bowl Paneer or Lobia salan, 2 rotis, 1 bowl seasonal sabzi, 1 glass doodh before bed." : budget === "High" ? "200g Mutton/Beef salan or grilled fish, 2 rotis, 1 bowl daal, 1 glass warm doodh." : "200g Chicken salan, 2 whole wheat rotis, 1 bowl daal masoor, 1 glass warm milk.",
      calories: Math.round(targetCalories * 0.22),
      proteinGrams: Math.round(proteinGrams * 0.2)
    }
  ];
  const schedule = [
    {
      day: "Day 1 (Mon)",
      focus: "Upper Body Power & Push",
      exercises: [
        { name: "Barbell Flat Bench Press", sets: "4", reps: "8-10", rest: "90s", notes: "Full chest stretch" },
        { name: "Standing Overhead Dumbbell Press", sets: "3", reps: "10-12", rest: "75s" },
        { name: "Lat Pulldowns (Wide Grip)", sets: "4", reps: "10-12", rest: "60s" },
        { name: "Seated Cable Row", sets: "3", reps: "12", rest: "60s" },
        { name: "Tricep Rope Pushdowns", sets: "3", reps: "12-15", rest: "45s" }
      ]
    },
    {
      day: "Day 2 (Tue)",
      focus: "Lower Body Foundation & Hinge",
      exercises: [
        { name: "Barbell Back Squats", sets: "4", reps: "8-10", rest: "120s", notes: "Keep chest tall" },
        { name: "Romanian Deadlifts", sets: "4", reps: "10-12", rest: "90s", notes: "Hinge at hips" },
        { name: "Leg Press", sets: "3", reps: "12", rest: "75s" },
        { name: "Lying Hamstring Curls", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Standing Calf Raises", sets: "4", reps: "15-20", rest: "45s" }
      ]
    },
    {
      day: "Day 3 (Thu)",
      focus: "Upper Hypertrophy & Arms",
      exercises: [
        { name: "Incline Dumbbell Bench Press", sets: "4", reps: "10-12", rest: "75s" },
        { name: "Dumbbell Lateral Raises", sets: "4", reps: "15", rest: "45s" },
        { name: "Bent-Over Barbell Row", sets: "3", reps: "10-12", rest: "60s" },
        { name: "Barbell Bicep Curls", sets: "3", reps: "12", rest: "45s" },
        { name: "Incline Dumbbell Curls", sets: "3", reps: "12", rest: "45s" }
      ]
    },
    {
      day: "Day 4 (Fri)",
      focus: "Lower Hypertrophy & Core",
      exercises: [
        { name: "Goblet Squats or Hack Squat", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Dumbbell Walking Lunges", sets: "3", reps: "12 / leg", rest: "60s" },
        { name: "Seated Leg Extensions", sets: "3", reps: "15", rest: "60s" },
        { name: "Hanging Knee Raises or Planks", sets: "3", reps: "45s / 15 reps", rest: "45s" }
      ]
    }
  ];
  return {
    id: import_crypto.default.randomUUID(),
    title: `${goal} Protocol - ${memberName}`,
    memberName,
    goal,
    generatedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    daysPerWeek,
    splitName: `${daysPerWeek}-Day Upper / Lower Strength Protocol`,
    injuries: injuries || "None reported",
    foodPreference,
    budget,
    isAiGenerated: false,
    visualObservations: visualObservations || void 0,
    schedule: daysPerWeek <= 3 ? schedule.slice(0, 3) : schedule,
    nutrition: {
      dailyCalories: targetCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      sampleMeals
    },
    tips: [
      "Drink 3.5 to 4.5 liters of clean water daily.",
      "Control cooking oils in salan to 1-2 tsp per serving.",
      "Progressive overload: add 1 rep or small weight each week.",
      "Sleep 7-8 hours for full muscle recovery."
    ],
    notes: `Pakistani localized nutrition & fitness plan for ${memberName}.`
  };
}
function isUnavailableError(err) {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code || err?.error?.code || err?.error?.status;
  if (status === 503 || status === "503" || status === "UNAVAILABLE") return true;
  const msg = (err.message || String(err)).toLowerCase();
  return msg.includes("503") || msg.includes("unavailable") || msg.includes("high demand") || msg.includes("overloaded") || msg.includes("temporarily overloaded");
}
async function callGeminiWithRetry(fn) {
  const retryDelays = [2e3, 5e3];
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const is503Unavailable = isUnavailableError(err);
      if (!is503Unavailable || attempt >= retryDelays.length) {
        throw err;
      }
      const delay = retryDelays[attempt];
      console.warn(`[Gemini] Call failed with 503/UNAVAILABLE on attempt ${attempt + 1}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }
}
var handleGeneratePlan = async (req, res) => {
  try {
    const {
      gender = "Male",
      goal = "General Fitness",
      activityLevel = "Moderately Active (3-5 days/week)",
      daysPerWeek = 4,
      foodPreference = "Non-veg",
      budget = "Medium",
      injuries = "",
      photoBase64,
      hasConsent
    } = req.body;
    const memberName = req.body.memberName && String(req.body.memberName).trim() ? String(req.body.memberName).trim() : "Athlete";
    const numAge = Number(req.body.age) || 25;
    const numHeight = Number(req.body.height || req.body.heightCm) || 175;
    const numWeight = Number(req.body.weight || req.body.weightKg) || 75;
    if (photoBase64 && !hasConsent) {
      res.status(400).json({ error: "Explicit member consent is required to analyze photos" });
      return;
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const plan2 = calculateLocalPlan(req.body);
      res.json({
        plan: plan2,
        isAiGenerated: false,
        fallback: true,
        message: "Generated using local Pakistani nutrition & fitness engine (API key not configured)."
      });
      return;
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const userPrompt = `
You are the head strength & conditioning coach and sports nutritionist for IRONFORGE Gym in Pakistan.
Generate a comprehensive, scientifically calibrated workout and nutrition protocol tailored specifically for a gym member in Pakistan.

CLIENT PROFILE:
- Name: ${memberName}
- Age: ${numAge} years old
- Gender: ${gender || "Male"}
- Height: ${numHeight} cm
- Weight: ${numWeight} kg
- Fitness Goal: ${goal || "General Fitness"}
- Training Frequency: ${daysPerWeek} days per week
- Activity Level: ${activityLevel}
- Dietary Preference: ${foodPreference} (Pakistani Halal)
- Food Budget Level: ${budget} (Low/Medium/High)
- Injuries / Constraints: ${injuries && injuries.trim() ? injuries : "None reported"}

CRITICAL PAKISTANI NUTRITION RULES:
1. Every meal must use authentic, easily accessible Pakistani halal staples:
   - Roti/Chapati (whole wheat), Paratha (moderate ghee for bulking), Boiled white/brown Rice (chawal).
   - Daals: Daal Mash, Daal Masoor, Daal Chana, Daal Moong.
   - Proteins: Boiled eggs / anda omelette, Chicken (karahi, salan, boiled, grilled), Beef / Mutton salan, Fish, Dahi (yogurt) / Raita, Doodh (milk).
   - Snacks: Boiled Chana Chaat (black or white chana with onion, tomato, lemon), roasted chana (bhunay chane), peanuts, almonds, namkeen lassi.
   - Sabzi: Palak, Bhindi, Tinda, Tori, Gobhi with controlled cooking oil.
2. Specify exact, everyday portions (e.g. "2 whole wheat rotis", "1 katori daal mash", "3 boiled eggs", "1 glass doodh", "200g chicken breast / salan").
3. If goal is Bulking: Provide high-protein, calorie-dense foods (e.g. extra roti, milk, banana shake, peanut butter, eggs).
4. If goal is Cutting: Emphasize lean protein, minimal cooking oil in salan (1-2 tsp), more daal, kachumber salad, fewer parathas.
5. If budget is Low: Prioritize eggs, daal, chana, seasonal sabzi, peanuts. If High: include beef, mutton, fish, dry fruits.
6. Provide a 3 to 5 day structured workout split with exercise names, sets, reps, and rest periods.
7. Include 4 actionable, practical tips.
${photoBase64 ? "8. A photo of the member has been provided with consent. Provide a 1-2 sentence GENERAL visual observation regarding body structure, posture, and muscular symmetry. Do NOT make medical diagnoses or claim exact body fat percentage." : ""}
`;
    const contents = [];
    if (photoBase64 && typeof photoBase64 === "string") {
      let base64Clean = photoBase64;
      let mimeType = "image/jpeg";
      const match = photoBase64.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Clean = match[2];
      }
      contents.push({
        inlineData: {
          mimeType,
          data: base64Clean
        }
      });
    }
    contents.push({ text: userPrompt });
    const response = await callGeminiWithRetry(
      () => ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: { parts: contents },
        config: {
          systemInstruction: "You are an expert Pakistani fitness coach and sports nutritionist for IRONFORGE. Output only valid JSON matching the exact schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              title: { type: import_genai.Type.STRING },
              goal: { type: import_genai.Type.STRING },
              splitName: { type: import_genai.Type.STRING },
              targetCalories: { type: import_genai.Type.INTEGER },
              proteinGrams: { type: import_genai.Type.INTEGER },
              carbsGrams: { type: import_genai.Type.INTEGER },
              fatGrams: { type: import_genai.Type.INTEGER },
              visualObservations: { type: import_genai.Type.STRING, description: "General posture/frame observations" },
              schedule: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    day: { type: import_genai.Type.STRING },
                    focus: { type: import_genai.Type.STRING },
                    exercises: {
                      type: import_genai.Type.ARRAY,
                      items: {
                        type: import_genai.Type.OBJECT,
                        properties: {
                          name: { type: import_genai.Type.STRING },
                          sets: { type: import_genai.Type.STRING },
                          reps: { type: import_genai.Type.STRING },
                          rest: { type: import_genai.Type.STRING },
                          notes: { type: import_genai.Type.STRING }
                        },
                        required: ["name", "sets", "reps"]
                      }
                    }
                  },
                  required: ["day", "focus", "exercises"]
                }
              },
              sampleMeals: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    time: { type: import_genai.Type.STRING },
                    name: { type: import_genai.Type.STRING },
                    items: { type: import_genai.Type.STRING },
                    calories: { type: import_genai.Type.INTEGER },
                    proteinGrams: { type: import_genai.Type.INTEGER }
                  },
                  required: ["time", "name", "items"]
                }
              },
              tips: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              notes: { type: import_genai.Type.STRING }
            },
            required: ["title", "splitName", "targetCalories", "proteinGrams", "carbsGrams", "fatGrams", "schedule", "sampleMeals", "tips"]
          }
        }
      })
    );
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI model");
    }
    const parsed = JSON.parse(responseText.trim());
    const plan = {
      id: import_crypto.default.randomUUID(),
      title: parsed.title || `${goal} Protocol - ${memberName}`,
      memberName,
      goal: parsed.goal || goal,
      generatedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      bmr: Math.round(10 * numWeight + 6.25 * numHeight - 5 * numAge + (gender === "Male" ? 5 : -161)),
      tdee: Math.round(parsed.targetCalories || 2400),
      targetCalories: parsed.targetCalories || 2400,
      daysPerWeek: Number(daysPerWeek) || 4,
      splitName: parsed.splitName || `${daysPerWeek}-Day Workout Split`,
      injuries: injuries || "None reported",
      foodPreference,
      budget,
      isAiGenerated: true,
      visualObservations: parsed.visualObservations || void 0,
      schedule: parsed.schedule || [],
      nutrition: {
        dailyCalories: parsed.targetCalories || 2400,
        proteinGrams: parsed.proteinGrams || 150,
        carbsGrams: parsed.carbsGrams || 250,
        fatGrams: parsed.fatGrams || 65,
        sampleMeals: parsed.sampleMeals || []
      },
      tips: parsed.tips || [],
      notes: parsed.notes || `AI-calibrated protocol designed for ${memberName}.`
    };
    res.json({
      plan,
      isAiGenerated: true,
      fallback: false
    });
  } catch (error) {
    console.error("Error in /api/generate-plan:", error);
    try {
      const fallbackPlan = calculateLocalPlan(req.body);
      res.json({
        plan: fallbackPlan,
        isAiGenerated: false,
        fallback: true,
        message: "AI service temporarily unavailable; created plan using local Pakistani nutrition calculator."
      });
    } catch (fallbackError) {
      res.status(500).json({ error: "Failed to generate plan", details: error?.message });
    }
  }
};
var handleExtractMembers = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "No text extracted from document to analyze." });
      return;
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server. You can still add members manually using the "Add Member" button.'
      });
      return;
    }
    const ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const extractionPrompt = `
You are an expert member registry assistant for IRONFORGE Gym in Pakistan.
Extract all individual gym member entries found in the following document text.
The document may contain information for a single member or a list of multiple members. Extract every member record clearly.

FOR EACH MEMBER FOUND, EXTRACT:
- name: Full name of the member (Required, string)
- phone: Contact number (Pakistani format like 03001234567 or international format, string or empty string if not found)
- age: Numeric age in years (integer or null if not found)
- gender: One of "Male", "Female", or "Other" (string or null if unknown)
- height: Height in centimeters (integer, convert feet/inches like 5'10" to ~178cm, or null if not found)
- weight: Weight in kilograms (number, convert lbs to kg if specified, or null if not found)
- goal: One of "Bulking", "Cutting", or "General Fitness" (string, default "General Fitness" if ambiguous)
- program: One of "Regular member", "Cutting", or "Bulking" (string, default "Regular member")
- joinDate: Date in YYYY-MM-DD format (if a date is stated in the document, or null)
- monthlyFee: Monthly membership fee in PKR (integer, default 3000 if not stated)
- notes: Any medical history, constraints, fitness background, or custom directives mentioned

RAW DOCUMENT TEXT:
${text.slice(0, 6e4)}
`;
    const response = await callGeminiWithRetry(
      () => ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: extractionPrompt,
        config: {
          systemInstruction: "You extract structured gym member records from document text for IRONFORGE. Output only valid JSON matching the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              members: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    name: { type: import_genai.Type.STRING },
                    phone: { type: import_genai.Type.STRING },
                    age: { type: import_genai.Type.INTEGER },
                    gender: { type: import_genai.Type.STRING },
                    height: { type: import_genai.Type.INTEGER },
                    weight: { type: import_genai.Type.NUMBER },
                    goal: { type: import_genai.Type.STRING },
                    program: { type: import_genai.Type.STRING },
                    joinDate: { type: import_genai.Type.STRING },
                    monthlyFee: { type: import_genai.Type.INTEGER },
                    notes: { type: import_genai.Type.STRING }
                  },
                  required: ["name"]
                }
              }
            },
            required: ["members"]
          }
        }
      })
    );
    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from AI model");
    }
    const parsed = JSON.parse(responseText.trim());
    const rawMembers = Array.isArray(parsed.members) ? parsed.members : [];
    res.json({
      members: rawMembers,
      count: rawMembers.length
    });
  } catch (error) {
    console.error("Error in /api/members/extract-from-text:", error);
    if (isUnavailableError(error)) {
      res.status(503).json({
        error: "AI service is temporarily overloaded. Please wait a minute and try again, or add members manually using the 'Add Member' button."
      });
      return;
    }
    res.status(500).json({
      error: error?.message || 'Failed to extract members from document text. You can still add members manually using "Add Member".'
    });
  }
};
app.post("/api/plans/generate", handleGeneratePlan);
app.post("/api/generate-plan", handleGeneratePlan);
app.post("/api/members/extract-from-text", handleExtractMembers);
app.post("/api/extract-members", handleExtractMembers);
if (!process.env.VERCEL) {
  async function setupVite() {
    if (process.env.NODE_ENV !== "production") {
      const vite = await (0, import_vite.createServer)({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } else {
      const distPath = import_path.default.join(process.cwd(), "dist");
      app.use(import_express.default.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(import_path.default.join(distPath, "index.html"));
      });
    }
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`IRONFORGE Server running on http://0.0.0.0:${PORT}`);
    });
    server.on("error", (err) => {
      console.error("Server error:", err);
    });
    const shutdown = () => {
      console.log("Received shutdown signal, closing server gracefully...");
      server.close(() => {
        process.exit(0);
      });
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  }
  setupVite().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
var server_default = app;
//# sourceMappingURL=server.cjs.map
