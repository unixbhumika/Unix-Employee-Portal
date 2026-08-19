import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  User, Users, Calendar, Clock, CheckCircle2, XCircle, FileText, Shield,
  LogOut, ChevronDown, ChevronRight, Phone, Menu, X, Plus, Search,
  AlertCircle, Building2, Lock, BarChart3, ClipboardList, Home,
  BatteryCharging, Cake, CalendarClock, ShieldCheck, UserCog, Send,
  UserMinus, Undo2, DoorOpen, CalendarDays, PartyPopper, Info,
  Receipt, Upload, Fuel, Wallet, Printer, Image as ImageIcon, FileCheck2, Building,
  Target, MapPin, Globe, Network, CircleDot, UserPlus, Pencil, Save,
} from "lucide-react";
import { loadKey, saveKey, supabaseConfigured } from "./storage.js";

/* ------------------------------------------------------------------ */
/*  Brand tokens                                                       */
/* ------------------------------------------------------------------ */
const C = {
  ink: "#14161A",
  inkSoft: "#1E2126",
  panel: "#F6F5F2",
  card: "#FFFFFF",
  border: "#E4E2DC",
  borderSoft: "#EDEBE6",
  red: "#C81E2C",
  redDeep: "#A0161F",
  gold: "#B8892B",
  goldSoft: "#F1E6CC",
  green: "#2F8F4E",
  greenSoft: "#E3F3E7",
  amber: "#C98A1B",
  amberSoft: "#FBF0DC",
  slate: "#3A3F44",
  muted: "#7A7F87",
  mutedLight: "#A8ACB2",
};

/* ------------------------------------------------------------------ */
/*  Brand mark (CSS-only, no external image dependency)                */
/* ------------------------------------------------------------------ */
function BrandMark({ size = 28, light = true, tagline = false }) {
  const textColor = light ? "#FFFFFF" : "#4A4E54";
  const taglineColor = light ? "#A8ACB2" : "#8A8E94";
  const gradId = "uGrad" + (light ? "L" : "D");
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size * (280 / 221)} viewBox="0 0 221 280" style={{ flexShrink: 0 }} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="30%">
            <stop offset="0%" stopColor="#8C1620" />
            <stop offset="55%" stopColor={C.red} />
            <stop offset="100%" stopColor="#E8242F" />
          </linearGradient>
        </defs>
        <path
          d="M133,16 L102,20 L87,24 L87,171 L92,183 L99,189 L105,191 L115,191 L123,188 L131,178 L133,171 Z M219,0 L171,10 L170,183 L157,209 L123,230 L96,230 L76,221 L58,203 L50,187 L48,31 L0,39 L3,196 L24,239 L51,263 L99,279 L141,275 L177,257 L202,230 L214,204 L220,171 Z"
          fill={`url(#${gradId})`}
          fillRule="evenodd"
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span style={{ color: textColor, fontWeight: 800, fontSize: size * 0.62, letterSpacing: "0.02em", lineHeight: 1 }}>UNIX</span>
        {tagline && (
          <span style={{ color: taglineColor, fontSize: size * 0.22, letterSpacing: "0.12em", fontStyle: "italic", marginTop: size * 0.08 }}>
            charging lives
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Domain constants                                                    */
/* ------------------------------------------------------------------ */
const ROLE_LABEL = {
  admin: "Admin",
  sales_supervisor: "Sales Supervisor",
  sales_executive: "Sales Executive",
  promoter: "Promoter",
  warehouse_manager: "Warehouse Manager",
};

const LEAVE_TYPES = ["Annual", "Sick", "Unpaid"];

const STATUS_META = {
  pending_sales_executive: { label: "Pending \u2014 Sales Executive", color: C.amber, bg: C.amberSoft },
  pending_supervisor: { label: "Pending \u2014 Supervisor", color: C.amber, bg: C.amberSoft },
  pending_admin: { label: "Pending \u2014 Admin", color: C.amber, bg: C.amberSoft },
  approved: { label: "Approved", color: C.green, bg: C.greenSoft },
  rejected: { label: "Rejected", color: C.red, bg: "#FBE4E4" },
  withdrawn: { label: "Withdrawn", color: C.muted, bg: C.borderSoft },
};

const RESIGNATION_STATUS_META = {
  pending_sales_executive: { label: "Pending \u2014 Sales Executive", color: C.amber, bg: C.amberSoft },
  pending_supervisor: { label: "Pending \u2014 Supervisor", color: C.amber, bg: C.amberSoft },
  pending_admin: { label: "Pending \u2014 Admin", color: C.amber, bg: C.amberSoft },
  approved: { label: "Accepted", color: C.green, bg: C.greenSoft },
  rejected: { label: "Not Accepted", color: C.red, bg: "#FBE4E4" },
  withdrawn: { label: "Withdrawn", color: C.muted, bg: C.borderSoft },
};

const STANDARD_NOTICE_DAYS = 60;
const ROLE_DEFAULT_SALARY = { admin: 12000, sales_supervisor: 8000, sales_executive: 4500, promoter: 3500, warehouse_manager: 6000 };
const ROLE_DEFAULT_LEAVE = {
  admin: { annualAllocation: 22, sickAllocation: 12 },
  sales_supervisor: { annualAllocation: 22, sickAllocation: 12 },
  sales_executive: { annualAllocation: 22, sickAllocation: 12 },
  promoter: { annualAllocation: 22, sickAllocation: 12 },
  warehouse_manager: { annualAllocation: 22, sickAllocation: 12 },
};

function seedWarehouseManager() {
  // Demo touch: birthday lands on "tomorrow" so the Admin dashboard birthday
  // reminder has something to show right away.
  const demoBirthday = new Date();
  demoBirthday.setDate(demoBirthday.getDate() + 1);
  const demoDob = `1991-${String(demoBirthday.getMonth() + 1).padStart(2, "0")}-${String(demoBirthday.getDate()).padStart(2, "0")}`;
  return {
    id: "WH-001", name: "Zayed Al Falasi", dob: demoDob, joiningDate: "2022-09-01",
    contact: "+971 55 666 7788", username: "zayed.wm", password: "zayed123",
    role: "warehouse_manager", supervisorId: "ADM-001", annualAllocation: 22, sickAllocation: 12,
    basicSalary: 6000, fuelAllowance: 0, passportNumber: "N9012234",
  };
}

// Migrates older stored employee data to the current hierarchy:
// - drops the retired generic "employee" role
// - ensures a Warehouse Manager account exists
// - re-parents any Promoter still pointing at a Sales Supervisor onto a Sales Executive
// - backfills basicSalary / fuelAllowance on records saved before those fields existed
function migrateEmployees(employees) {
  let changed = false;

  let list = employees.filter((e) => e.role !== "employee");
  if (list.length !== employees.length) changed = true;

  if (!list.some((e) => e.role === "warehouse_manager")) {
    list = [...list, seedWarehouseManager()];
    changed = true;
  }

  const supervisorIds = new Set(list.filter((e) => e.role === "sales_supervisor").map((e) => e.id));
  const firstExecutive = list.find((e) => e.role === "sales_executive");
  list = list.map((e) => {
    if (e.role === "promoter" && (supervisorIds.has(e.supervisorId) || !e.supervisorId) && firstExecutive) {
      changed = true;
      return { ...e, supervisorId: firstExecutive.id };
    }
    return e;
  });

  const updated = list.map((e) => {
    let emp = e;
    if (emp.basicSalary === undefined || emp.basicSalary === null) {
      emp = { ...emp, basicSalary: ROLE_DEFAULT_SALARY[emp.role] ?? 4500 };
      changed = true;
    }
    if (emp.fuelAllowance === undefined || emp.fuelAllowance === null) {
      emp = { ...emp, fuelAllowance: isFuelEligible(emp) ? 700 : 0 };
      changed = true;
    }
    if (emp.passportNumber === undefined || emp.passportNumber === null) {
      emp = { ...emp, passportNumber: "" };
      changed = true;
    }
    if (emp.annualAllocation !== 22) {
      emp = { ...emp, annualAllocation: 22 };
      changed = true;
    }
    return emp;
  });

  return { updated, changed };
}

/* ------------------------------------------------------------------ */
/*  Seed data                                                           */
/* ------------------------------------------------------------------ */
function seedEmployees() {
  return [
    {
      id: "ADM-001", name: "Aisha Al Mazrouei", dob: "1985-04-12", joiningDate: "2019-01-15",
      contact: "+971 50 111 2233", username: "admin", password: "admin123",
      role: "admin", annualAllocation: 22, sickAllocation: 12,
      basicSalary: 12000, fuelAllowance: 700, passportNumber: "N4521178",
    },
    {
      id: "SUP-001", name: "Omar Al Suwaidi", dob: "1988-07-22", joiningDate: "2020-03-01",
      contact: "+971 50 222 3344", username: "omar.supervisor", password: "omar123",
      role: "sales_supervisor", supervisorId: "ADM-001", annualAllocation: 22, sickAllocation: 12,
      basicSalary: 8000, fuelAllowance: 700, passportNumber: "N7783412",
    },
    {
      id: "SE-001", name: "Rahul Menon", dob: "1994-11-05", joiningDate: "2022-06-10",
      contact: "+971 55 333 4455", username: "rahul.se", password: "rahul123",
      role: "sales_executive", supervisorId: "SUP-001", annualAllocation: 22, sickAllocation: 12,
      basicSalary: 4500, fuelAllowance: 700, passportNumber: "P8834567",
    },
    {
      id: "PR-001", name: "Amina Yusuf", dob: "1996-02-18", joiningDate: "2023-01-09",
      contact: "+971 55 444 5566", username: "amina.pr", password: "amina123",
      role: "promoter", supervisorId: "SE-001", annualAllocation: 22, sickAllocation: 12,
      basicSalary: 3500, fuelAllowance: 0, passportNumber: "P2214498",
    },
    seedWarehouseManager(),
  ];
}

function seedLeaveRequests() {
  const now = Date.now();
  const d = (offsetDays) => new Date(now + offsetDays * 86400000).toISOString().slice(0, 10);
  return [
    {
      id: "LR-1001", employeeId: "WH-001", type: "Annual",
      startDate: d(-40), endDate: d(-36), days: 3, reason: "Family travel",
      status: "approved", appliedDate: d(-46),
      history: [
        { action: "Submitted", by: "Zayed Al Falasi", date: d(-46) },
        { action: "Approved by Admin", by: "Aisha Al Mazrouei", date: d(-44) },
      ],
    },
    {
      id: "LR-1002", employeeId: "SE-001", type: "Sick",
      startDate: d(-2), endDate: d(-2), days: 1, reason: "Fever",
      status: "pending_supervisor", appliedDate: d(-2),
      history: [{ action: "Submitted", by: "Rahul Menon", date: d(-2) }],
    },
    {
      id: "LR-1003", employeeId: "PR-001", type: "Annual",
      startDate: d(5), endDate: d(9), days: 5, reason: "Personal trip",
      status: "pending_supervisor", appliedDate: d(-1),
      history: [
        { action: "Submitted", by: "Amina Yusuf", date: d(-1) },
        { action: "Approved by Sales Executive", by: "Rahul Menon", date: d(0) },
      ],
    },
  ];
}

function seedResignations() {
  return [];
}

function seedFuelBills() {
  const now = Date.now();
  const d = (offsetDays) => new Date(now + offsetDays * 86400000).toISOString().slice(0, 10);
  return [
    {
      id: "FB-1001", employeeId: "SE-001", date: d(-6), amount: 180, note: "Fuel top-up \u2014 ADNOC",
      receiptDataUrl: null, receiptFileName: "adnoc-receipt-1.jpg",
      status: "pending_supervisor", submittedDate: d(-6),
      history: [{ action: "Submitted", by: "Rahul Menon", date: d(-6) }],
    },
    {
      id: "FB-1002", employeeId: "SE-001", date: d(-20), amount: 220, note: "Fuel \u2014 ENOC, Sheikh Zayed Rd",
      receiptDataUrl: null, receiptFileName: "enoc-receipt-2.jpg",
      status: "approved", submittedDate: d(-20),
      history: [
        { action: "Submitted", by: "Rahul Menon", date: d(-20) },
        { action: "Approved by Supervisor", by: "Omar Al Suwaidi", date: d(-18) },
        { action: "Approved by Admin", by: "Aisha Al Mazrouei", date: d(-16) },
      ],
    },
    {
      id: "FB-1003", employeeId: "SE-001", date: d(-15), amount: 60, note: "Fuel \u2014 small top-up",
      receiptDataUrl: null, receiptFileName: "receipt-3.jpg",
      status: "rejected", submittedDate: d(-15),
      history: [
        { action: "Submitted", by: "Rahul Menon", date: d(-15) },
        { action: "Approved by Supervisor", by: "Omar Al Suwaidi", date: d(-14) },
        { action: "Rejected", by: "Aisha Al Mazrouei", date: d(-13), note: "Receipt illegible, please resubmit a clearer photo." },
      ],
    },
    {
      id: "FB-1004", employeeId: "SUP-001", date: d(-10), amount: 150, note: "Fuel \u2014 EPPCO",
      receiptDataUrl: null, receiptFileName: "eppco-receipt.jpg",
      status: "approved", submittedDate: d(-10),
      history: [
        { action: "Submitted", by: "Omar Al Suwaidi", date: d(-10) },
        { action: "Approved by Admin", by: "Aisha Al Mazrouei", date: d(-9) },
      ],
    },
    {
      id: "FB-1005", employeeId: "SUP-001", date: d(-3), amount: 95, note: "Fuel \u2014 ADNOC, Al Quoz",
      receiptDataUrl: null, receiptFileName: "adnoc-receipt-4.jpg",
      status: "pending_admin", submittedDate: d(-3),
      history: [{ action: "Submitted", by: "Omar Al Suwaidi", date: d(-3) }],
    },
    {
      id: "FB-1006", employeeId: "ADM-001", date: d(-25), amount: 200, note: "Fuel \u2014 monthly top-up",
      receiptDataUrl: null, receiptFileName: "admin-receipt.jpg",
      status: "approved", submittedDate: d(-25),
      history: [
        { action: "Submitted", by: "Aisha Al Mazrouei", date: d(-25) },
        { action: "Approved by Admin", by: "Aisha Al Mazrouei", date: d(-24) },
      ],
    },
  ];
}

function seedPayslips() {
  return [];
}

function seedPettyCash() {
  const now = Date.now();
  const d = (offsetDays) => new Date(now + offsetDays * 86400000).toISOString().slice(0, 10);
  return [
    {
      id: "PC-1001", employeeId: "SUP-001", date: d(-12), amount: 320, note: "Team lunch \u2014 monthly sales huddle",
      receiptDataUrl: null, receiptFileName: "lunch-invoice.jpg",
      status: "approved", submittedDate: d(-12),
      history: [
        { action: "Submitted", by: "Omar Al Suwaidi", date: d(-12) },
        { action: "Approved by Admin", by: "Aisha Al Mazrouei", date: d(-11) },
      ],
    },
    {
      id: "PC-1002", employeeId: "SE-001", date: d(-4), amount: 85, note: "Printing \u2014 client presentation materials",
      receiptDataUrl: null, receiptFileName: "printing-invoice.jpg",
      status: "pending_supervisor", submittedDate: d(-4),
      history: [{ action: "Submitted", by: "Rahul Menon", date: d(-4) }],
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Date / leave math helpers                                           */
/* ------------------------------------------------------------------ */
// weekendMode: 'sat_sun' (Admin \u2014 standard 5-day week) or 'sun_only' (everyone else \u2014 Mon-Sat working, only Sunday off)
function businessDaysBetween(startStr, endStr, weekendMode = "sat_sun") {
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  if (isNaN(start) || isNaN(end) || end < start) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    const isWeekend = weekendMode === "sun_only" ? day === 0 : (day === 0 || day === 6);
    if (!isWeekend) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function weekendModeForRole(role) {
  return role === "admin" ? "sat_sun" : "sun_only";
}

function fmtDate(str) {
  if (!str) return "\u2014";
  const dt = new Date(str + "T00:00:00");
  if (isNaN(dt)) return str;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Returns "today", "tomorrow", or null based on month/day match against dob (year-independent)
function birthdayProximity(dob) {
  if (!dob) return null;
  const d = new Date(dob + "T00:00:00");
  if (isNaN(d)) return null;
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.getMonth() === today.getMonth() && d.getDate() === today.getDate()) return "today";
  if (d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate()) return "tomorrow";
  return null;
}

function turningAge(dob) {
  const d = new Date(dob + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age -= 1;
  return age + 1;
}

function yearsOfService(joiningDate) {
  const j = new Date(joiningDate);
  if (isNaN(j)) return 0;
  const diff = Date.now() - j.getTime();
  return diff / (1000 * 60 * 60 * 24 * 365.25);
}

function isEligibleForSickLeave(employee) {
  return yearsOfService(employee.joiningDate) >= 0.5;
}

function isEligibleForAnnualLeave(employee) {
  return yearsOfService(employee.joiningDate) >= 1;
}

// Working days remaining until an employee crosses a given service-length threshold (in years).
function daysUntilServiceMilestone(joiningDate, years) {
  const j = new Date(joiningDate);
  if (isNaN(j)) return 0;
  const milestone = new Date(j);
  milestone.setFullYear(milestone.getFullYear() + Math.floor(years));
  if (years % 1 !== 0) milestone.setMonth(milestone.getMonth() + Math.round((years % 1) * 12));
  const diff = Math.ceil((milestone - new Date()) / 86400000);
  return Math.max(diff, 0);
}

// Initial approval status when an employee submits a leave/resignation/fuel-bill request.
function routeStatusFor(employee) {
  if (employee.role === "promoter") return "pending_sales_executive";
  if (employee.role === "sales_executive") return "pending_supervisor";
  return "pending_admin"; // sales_supervisor, warehouse_manager, admin
}

// Given the request's current status and the applicant's role, returns the next status after an approve/reject action.
function advanceApprovalStatus(currentStatus, applicantRole, action) {
  if (action === "reject") return "rejected";
  if (currentStatus === "pending_sales_executive") return "pending_supervisor";
  if (currentStatus === "pending_supervisor") {
    // Promoter requests are finalized at Supervisor level; Sales Executive requests continue to Admin.
    return applicantRole === "promoter" ? "approved" : "pending_admin";
  }
  if (currentStatus === "pending_admin") return "approved";
  return currentStatus;
}

function approvalActionLabel(currentStatus, action) {
  if (action === "reject") return "Rejected";
  if (currentStatus === "pending_sales_executive") return "Approved by Sales Executive";
  if (currentStatus === "pending_supervisor") return "Approved by Supervisor";
  if (currentStatus === "pending_admin") return "Approved by Admin";
  return "Updated";
}

// Finds the Sales Supervisor above a given employee, walking the hierarchy for Promoters
// (Promoter -> Sales Executive -> Sales Supervisor) as well as direct Sales Executives.
function findSupervisorFor(applicant, employees) {
  if (applicant.role === "sales_executive") {
    return employees.find((e) => e.id === applicant.supervisorId) || null;
  }
  if (applicant.role === "promoter") {
    const exec = employees.find((e) => e.id === applicant.supervisorId);
    if (!exec) return null;
    return employees.find((e) => e.id === exec.supervisorId) || null;
  }
  return null;
}

// Whether currentUser is the correct approver for this request, given its current status.
function isActionableByCurrentUser(request, applicant, currentUser, employees) {
  if (!applicant) return false;
  if (currentUser.role === "sales_executive") {
    return request.status === "pending_sales_executive" && applicant.role === "promoter" && applicant.supervisorId === currentUser.id;
  }
  if (currentUser.role === "sales_supervisor") {
    if (request.status !== "pending_supervisor") return false;
    const supervisor = findSupervisorFor(applicant, employees);
    return supervisor?.id === currentUser.id;
  }
  if (currentUser.role === "admin") {
    return request.status === "pending_admin";
  }
  return false;
}

// Returns everyone who reports to managerId, directly or transitively (e.g. a Supervisor's
// team includes their Sales Executives and those Executives' Promoters).
function getAllReports(managerId, employees) {
  const direct = employees.filter((e) => e.supervisorId === managerId);
  return direct.reduce((acc, e) => [...acc, e, ...getAllReports(e.id, employees)], []);
}

const ID_PREFIX = { admin: "ADM", sales_supervisor: "SUP", sales_executive: "SE", promoter: "PR", warehouse_manager: "WH" };

function generateEmployeeId(role, employees) {
  const prefix = ID_PREFIX[role] || "EMP";
  const nums = employees
    .filter((e) => e.id.startsWith(prefix + "-"))
    .map((e) => parseInt(e.id.split("-")[1], 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

// Who a given role is allowed to report to, per the fixed org hierarchy.
function eligibleSupervisorsFor(role, employees, excludeId) {
  let pool = [];
  if (role === "sales_executive") pool = employees.filter((e) => e.role === "sales_supervisor");
  else if (role === "promoter") pool = employees.filter((e) => e.role === "sales_executive");
  else if (role === "sales_supervisor" || role === "warehouse_manager") pool = employees.filter((e) => e.role === "admin");
  return pool.filter((e) => e.id !== excludeId);
}

function routingDescriptionFor(role) {
  if (role === "promoter") return "Routed to your Sales Executive, then Sales Supervisor for final approval.";
  if (role === "sales_executive") return "Routed to your Sales Supervisor, then Admin for final approval.";
  if (role === "sales_supervisor") return "Routed directly to Admin for approval.";
  if (role === "warehouse_manager") return "Routed directly to Admin for approval.";
  return "Routed directly to Admin for approval.";
}

function isFuelEligible(employee) {
  return employee.role !== "promoter" && employee.role !== "warehouse_manager";
}

function isPettyCashEligible(employee) {
  return employee.role !== "promoter";
}

function monthLabel(year, month) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function lastNMonths(n) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return out;
}

function calculatePayslip(employee, year, month, leaveRequests, fuelBills, pettyCashClaims = []) {
  const pad = (n) => String(n).padStart(2, "0");
  const monthStr = `${year}-${pad(month)}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = `${monthStr}-01`;
  const lastDay = `${monthStr}-${pad(daysInMonth)}`;
  const workingDaysInMonth = businessDaysBetween(firstDay, lastDay, weekendModeForRole(employee.role));

  const myLeavesThisMonth = leaveRequests.filter(
    (r) => r.employeeId === employee.id && r.startDate.slice(0, 7) === monthStr
  );
  const myApprovedLeaves = myLeavesThisMonth.filter((r) => r.status === "approved");
  const myPendingLeaves = myLeavesThisMonth.filter((r) => r.status === "pending_supervisor" || r.status === "pending_admin" || r.status === "pending_sales_executive");
  const sumByType = (list, type) => list.filter((r) => r.type === type).reduce((a, r) => a + r.days, 0);
  const annualDays = sumByType(myApprovedLeaves, "Annual");
  const sickDays = sumByType(myApprovedLeaves, "Sick");
  const unpaidDays = sumByType(myApprovedLeaves, "Unpaid");
  const annualPendingDays = sumByType(myPendingLeaves, "Annual");
  const sickPendingDays = sumByType(myPendingLeaves, "Sick");
  const unpaidPendingDays = sumByType(myPendingLeaves, "Unpaid");

  const daysWorked = Math.max(workingDaysInMonth - annualDays - sickDays - unpaidDays, 0);
  const basicSalary = employee.basicSalary || 0;
  const dailyRate = daysInMonth > 0 ? basicSalary / daysInMonth : 0;
  const unpaidDeduction = Math.round(dailyRate * unpaidDays * 100) / 100;

  const eligibleForFuel = isFuelEligible(employee);
  const approvedFuelBills = fuelBills.filter(
    (b) => b.employeeId === employee.id && b.status === "approved" && b.date.slice(0, 7) === monthStr
  );
  const pendingFuelBills = fuelBills.filter(
    (b) => b.employeeId === employee.id && (b.status === "pending_supervisor" || b.status === "pending_admin" || b.status === "pending_sales_executive") && b.date.slice(0, 7) === monthStr
  );
  const approvedFuelTotal = approvedFuelBills.reduce((a, b) => a + Number(b.amount || 0), 0);
  const pendingFuelTotal = pendingFuelBills.reduce((a, b) => a + Number(b.amount || 0), 0);
  const fuelExpense = eligibleForFuel ? Math.min(approvedFuelTotal, employee.fuelAllowance || 0) : 0;

  const eligibleForPettyCash = isPettyCashEligible(employee);
  const approvedPettyCash = pettyCashClaims.filter(
    (b) => b.employeeId === employee.id && b.status === "approved" && b.date.slice(0, 7) === monthStr
  );
  const pendingPettyCash = pettyCashClaims.filter(
    (b) => b.employeeId === employee.id && (b.status === "pending_supervisor" || b.status === "pending_admin" || b.status === "pending_sales_executive") && b.date.slice(0, 7) === monthStr
  );
  const pettyCashTotal = eligibleForPettyCash ? approvedPettyCash.reduce((a, b) => a + Number(b.amount || 0), 0) : 0;
  const pendingPettyCashTotal = eligibleForPettyCash ? pendingPettyCash.reduce((a, b) => a + Number(b.amount || 0), 0) : 0;

  const grossPay = basicSalary + fuelExpense + pettyCashTotal;
  const netPay = Math.round((grossPay - unpaidDeduction) * 100) / 100;

  return {
    monthStr, daysInMonth, workingDaysInMonth, daysWorked,
    annualDays, sickDays, unpaidDays,
    annualPendingDays, sickPendingDays, unpaidPendingDays,
    basicSalary, dailyRate, unpaidDeduction,
    eligibleForFuel, approvedFuelTotal, pendingFuelTotal, fuelAllowance: employee.fuelAllowance || 0, fuelExpense,
    eligibleForPettyCash, pettyCashTotal, pendingPettyCashTotal,
    grossPay, netPay,
  };
}

// Payslips can only be generated once payroll for that month has actually run \u2014 on the 5th of the following month.
function payslipUnlockDate(year, month) {
  return new Date(year, month, 5); // month is 1-indexed input; JS Date month param is 0-indexed, so this lands on the 5th of the next calendar month
}

function isPayslipMonthAvailable(year, month) {
  return new Date() >= payslipUnlockDate(year, month);
}

function availablePayslipMonths(maxCount = 12) {
  const out = [];
  const now = new Date();
  for (let i = 1; out.length < maxCount && i <= 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    if (isPayslipMonthAvailable(year, month)) out.push({ year, month });
  }
  return out;
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function threeDigitsToWords(n) {
  let out = "";
  if (n >= 100) { out += ONES[Math.floor(n / 100)] + " Hundred "; n %= 100; }
  if (n >= 20) { out += TENS[Math.floor(n / 10)] + " "; n %= 10; }
  if (n > 0) out += ONES[n] + " ";
  return out.trim();
}

function numberToWords(num) {
  if (num === 0) return "Zero";
  const parts = [];
  let n = Math.floor(num);
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const rest = n;
  if (crore) parts.push(threeDigitsToWords(crore) + " Crore");
  if (lakh) parts.push(threeDigitsToWords(lakh) + " Lakh");
  if (thousand) parts.push(threeDigitsToWords(thousand) + " Thousand");
  if (rest) parts.push(threeDigitsToWords(rest));
  return parts.join(" ").trim() || "Zero";
}

function amountInWords(amount) {
  const whole = Math.floor(amount);
  const fils = Math.round((amount - whole) * 100);
  let out = `AED ${numberToWords(whole)} Only`;
  if (fils > 0) out = `AED ${numberToWords(whole)} and ${numberToWords(fils)} Fils Only`;
  return out;
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                      */
/* ------------------------------------------------------------------ */
function StatusBadge({ status, metaMap = STATUS_META }) {
  const meta = metaMap[status] || { label: status, color: C.muted, bg: "#EEE" };
  return (
    <span
      style={{ color: meta.color, background: meta.bg }}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
    >
      <span style={{ background: meta.color }} className="w-1.5 h-1.5 rounded-full inline-block" />
      {meta.label}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      style={{ color: C.slate, background: C.borderSoft, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide"
    >
      {ROLE_LABEL[role] || role}
    </span>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ background: C.card, borderColor: C.border, ...style }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, icon: Icon }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <div
          style={{ color: C.gold, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          className="text-xs font-bold uppercase tracking-wider mb-1"
        >
          {eyebrow}
        </div>
      )}
      <div className="flex items-center gap-2">
        {Icon && <Icon size={20} style={{ color: C.ink }} />}
        <h2 style={{ color: C.ink }} className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
    </div>
  );
}

function ChargeGauge({ label, allocation, used, pending, icon: Icon, locked = false }) {
  const remaining = Math.max(allocation - used - pending, 0);
  const usedPct = allocation > 0 ? Math.min((used / allocation) * 100, 100) : 0;
  const pendingPct = allocation > 0 ? Math.min((pending / allocation) * 100, 100 - usedPct) : 0;
  const low = remaining <= allocation * 0.15;
  return (
    <Card className="p-4 flex-1" style={{ minWidth: 210 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: locked ? C.muted : C.gold }} />
          <span style={{ color: C.slate }} className="text-sm font-semibold">{label}</span>
        </div>
        {locked ? (
          <Lock size={15} style={{ color: C.muted }} />
        ) : (
          <span
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: low ? C.red : C.ink }}
            className="text-lg font-bold"
          >
            {remaining}
          </span>
        )}
      </div>
      {locked ? (
        <div style={{ color: C.muted }} className="text-xs py-1.5">Not yet eligible — see note below</div>
      ) : (
        <>
          <div style={{ background: C.panel, border: `1px solid ${C.border}` }} className="h-3 rounded-full w-full overflow-hidden flex">
            <div style={{ width: `${usedPct}%`, background: C.ink }} className="h-full" />
            <div style={{ width: `${pendingPct}%`, background: C.gold }} className="h-full" />
          </div>
          <div style={{ color: C.muted }} className="flex justify-between text-xs mt-2">
            <span>{used} used</span>
            {pending > 0 && <span style={{ color: C.gold }}>{pending} pending</span>}
            <span>{allocation} allotted</span>
          </div>
        </>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Login screen                                                        */
/* ------------------------------------------------------------------ */
function LoginScreen({ employees, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  function submit() {
    const match = employees.find(
      (emp) => emp.username.toLowerCase() === username.trim().toLowerCase() && emp.password === password.trim()
    );
    if (!match) {
      setError("Invalid username or password.");
      return;
    }
    setError("");
    onLogin(match);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") submit();
  }

  return (
    <div style={{ background: C.ink }} className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(${C.inkSoft}22 1px, transparent 1px), linear-gradient(90deg, ${C.inkSoft}22 1px, transparent 1px)`,
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(circle at 50% 30%, black, transparent 75%)",
          pointerEvents: "none",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6"><BrandMark size={38} light={true} tagline /></div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Employee Portal</h1>
        </div>

        <Card style={{ background: "#FFFFFF" }} className="p-6 shadow-2xl">
          <div className="space-y-4">
            <div>
              <label style={{ color: C.slate }} className="block text-xs font-semibold mb-1.5 uppercase tracking-wide">Username</label>
              <div className="relative">
                <User size={16} style={{ color: C.muted, pointerEvents: "none" }} className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. rahul.se"
                  style={{ borderColor: C.border, color: C.ink }}
                  className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2"
                  onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${C.red}22`)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
            </div>
            <div>
              <label style={{ color: C.slate }} className="block text-xs font-semibold mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={16} style={{ color: C.muted, pointerEvents: "none" }} className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  style={{ borderColor: C.border, color: C.ink }}
                  className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none"
                  onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${C.red}22`)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
            </div>
            {error && (
              <div style={{ color: C.red, background: "#FBE4E4" }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            <button
              type="button"
              onClick={submit}
              style={{ background: C.red }}
              className="w-full text-white font-semibold text-sm rounded-lg py-2.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Sign in <ChevronRight size={16} />
            </button>
          </div>
        </Card>

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowDemo((s) => !s)}
            style={{ color: C.mutedLight }}
            className="text-xs underline underline-offset-2 hover:text-white transition-colors"
          >
            {showDemo ? "Hide demo credentials" : "View demo credentials"}
          </button>
        </div>
        {showDemo && (
          <Card style={{ background: "#FFFFFF" }} className="mt-3 p-4 text-xs">
            <table className="w-full">
              <thead>
                <tr style={{ color: C.muted }} className="text-left uppercase text-xs tracking-wide">
                  <th className="pb-2 font-semibold">Role</th>
                  <th className="pb-2 font-semibold">Username</th>
                  <th className="pb-2 font-semibold">Password</th>
                </tr>
              </thead>
              <tbody style={{ color: C.slate, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {employees.map((emp) => (
                  <tr key={emp.id} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                    <td className="py-1.5 pr-2" style={{ fontFamily: "inherit" }}>{ROLE_LABEL[emp.role]}</td>
                    <td className="py-1.5 pr-2">{emp.username}</td>
                    <td className="py-1.5">{emp.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
        <p style={{ color: C.mutedLight }} className="text-center text-xs mt-6">
          Prototype build — credentials are stored for demo purposes only.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */
function Sidebar({ user, activeTab, setActiveTab, onLogout, mobileOpen, setMobileOpen, pendingCount }) {
  const items = [
    { key: "overview", label: "Overview", icon: Home },
    { key: "profile", label: "My Profile", icon: User },
    { key: "requests", label: "Requests", icon: Send },
    { key: "payslip", label: "Payslip", icon: Wallet },
  ];
  items.push({ key: "holidays", label: "Holidays", icon: CalendarDays });
  items.push({ key: "policies", label: "Policies", icon: FileText });
  items.push({ key: "company", label: "Company Profile", icon: Building2 });
  if (["sales_executive", "sales_supervisor", "admin"].includes(user.role)) {
    items.push({ key: "approvals", label: "Approvals", icon: ClipboardList, badge: pendingCount });
  }
  if (user.role === "sales_executive") items.push({ key: "team", label: "My Team", icon: Users });
  if (user.role === "sales_supervisor") items.push({ key: "team", label: "My Team", icon: Users });
  if (user.role === "admin") {
    items.push({ key: "team", label: "All Employees", icon: Users });
    items.push({ key: "hierarchy", label: "Hierarchy", icon: Network });
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        style={{ background: C.ink }}
        className={`fixed lg:sticky top-0 h-screen w-64 flex flex-col z-50 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div style={{ borderColor: "#2A2D33" }} className="border-b px-5 py-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => { setActiveTab("overview"); setMobileOpen(false); }}
            className="hover:opacity-80 transition-opacity"
          >
            <BrandMark size={26} light={true} />
          </button>
          <button className="lg:hidden text-white" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); setMobileOpen(false); }}
                style={{ background: active ? C.red : "transparent", color: active ? "#fff" : C.mutedLight }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:text-white"
              >
                <Icon size={17} />
                <span className="flex-1 text-left">{item.label}</span>
                {!!item.badge && (
                  <span style={{ background: active ? "#fff" : C.gold, color: active ? C.red : "#fff" }} className="text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ borderColor: "#2A2D33" }} className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div style={{ background: C.red }} className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user.name}</div>
              <div style={{ color: C.mutedLight, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs truncate">{user.id}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{ color: C.mutedLight, borderColor: "#2A2D33" }}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium border rounded-lg py-2 hover:text-white hover:border-white/30 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview tab                                                        */
/* ------------------------------------------------------------------ */
function OverviewTab({ user, employees, leaveUsage, myRequests, teamCount, pendingForMe, setActiveTab }) {
  const upcomingBirthdays = user.role === "admin"
    ? employees.map((e) => ({ ...e, proximity: birthdayProximity(e.dob) })).filter((e) => e.proximity)
    : [];

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Dashboard" title={`Welcome back, ${user.name.split(" ")[0]}`} icon={Home} />

      {upcomingBirthdays.length > 0 && (
        <Card style={{ background: C.goldSoft, borderColor: "transparent" }} className="p-4">
          <div className="flex items-start gap-3">
            <div style={{ background: C.gold }} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
              <Cake size={17} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: "#6b5219" }} className="text-sm font-bold mb-1.5">
                {upcomingBirthdays.length === 1 ? "Upcoming birthday" : "Upcoming birthdays"}
              </div>
              <div className="space-y-1">
                {upcomingBirthdays.map((e) => (
                  <div key={e.id} style={{ color: "#6b5219" }} className="text-xs flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold">{e.name}</span>
                    <span>turns {turningAge(e.dob)}</span>
                    <span
                      style={{ background: e.proximity === "today" ? C.gold : "#D9C79A", color: "#fff" }}
                      className="rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
                    >
                      {e.proximity === "today" ? "Today" : "Tomorrow"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-4">
        <ChargeGauge label="Annual Leave" allocation={user.annualAllocation} used={leaveUsage.annualUsed} pending={leaveUsage.annualPending} icon={BatteryCharging} locked={!isEligibleForAnnualLeave(user)} />
        <ChargeGauge label="Sick Leave" allocation={user.sickAllocation} used={leaveUsage.sickUsed} pending={leaveUsage.sickPending} icon={BatteryCharging} locked={!isEligibleForSickLeave(user)} />
        <Card className="p-4 flex-1" style={{ minWidth: 210 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} style={{ color: C.gold }} />
              <span style={{ color: C.slate }} className="text-sm font-semibold">My Requests</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              style={{ color: C.red }}
              className="text-xs font-semibold hover:opacity-80 transition-opacity"
            >
              View
            </button>
          </div>
          <div style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-3xl font-bold">{myRequests.length}</div>
          <div style={{ color: C.muted }} className="text-xs mt-2">Total leave requests submitted</div>
        </Card>
        {(user.role === "admin" || user.role === "sales_supervisor" || user.role === "sales_executive") && (
          <Card className="p-4 flex-1" style={{ minWidth: 210 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={16} style={{ color: C.gold }} />
                <span style={{ color: C.slate }} className="text-sm font-semibold">{user.role === "admin" ? "Company Headcount" : "My Team"}</span>
              </div>
              {pendingForMe > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("approvals")}
                  style={{ color: C.red }}
                  className="text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  View requests
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className="text-left w-full hover:opacity-80 transition-opacity"
            >
              <div style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-3xl font-bold">{teamCount}</div>
              <div style={{ color: C.red }} className="text-xs font-semibold mt-1">View names & designations →</div>
            </button>
            {pendingForMe > 0 ? (
              <button
                type="button"
                onClick={() => setActiveTab("approvals")}
                style={{ color: C.gold, background: C.goldSoft }}
                className="text-xs font-semibold mt-2 rounded-md px-2 py-1 inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <AlertCircle size={12} /> {pendingForMe} awaiting your approval
              </button>
            ) : (
              <div style={{ color: C.muted }} className="text-xs mt-2">Nothing awaiting your approval</div>
            )}
          </Card>
        )}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: C.slate }} className="text-sm font-semibold">Recent leave activity</span>
          {myRequests.length > 0 && (
            <button type="button" onClick={() => setActiveTab("requests")} style={{ color: C.red }} className="text-xs font-semibold hover:opacity-80 transition-opacity">
              View all
            </button>
          )}
        </div>
        {myRequests.length === 0 ? (
          <div style={{ color: C.muted }} className="text-sm py-6 text-center">No leave requests yet. Apply for leave from the Leave tab.</div>
        ) : (
          <div className="space-y-2">
            {myRequests.slice(0, 4).map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setActiveTab("requests")}
                style={{ borderColor: C.borderSoft }}
                className="w-full flex items-center justify-between border rounded-lg px-3 py-2.5 text-left hover:opacity-80 transition-opacity"
              >
                <div>
                  <div style={{ color: C.ink }} className="text-sm font-medium">{r.type} · {r.days} day{r.days !== 1 ? "s" : ""}</div>
                  <div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</div>
                </div>
                <StatusBadge status={r.status} />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile tab                                                         */
/* ------------------------------------------------------------------ */
function ProfileTab({ user, employees, onUpdateContact, onChangePassword }) {
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState(user.contact);
  const supervisor = user.supervisorId ? employees.find((e) => e.id === user.supervisorId) : null;

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  function save() {
    onUpdateContact(user.id, contact);
    setEditing(false);
  }

  function submitPasswordChange() {
    setPwError(""); setPwSuccess("");
    if (currentPassword !== user.password) { setPwError("Current password is incorrect."); return; }
    if (!newPassword || newPassword.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPwError("New password and confirmation don't match."); return; }
    if (newPassword === currentPassword) { setPwError("New password must be different from your current password."); return; }
    onChangePassword(user.id, newPassword);
    setPwSuccess("Password updated successfully.");
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setTimeout(() => { setShowPasswordForm(false); setPwSuccess(""); }, 1800);
  }

  const fields = [
    { label: "Employee ID", value: user.id, icon: UserCog, mono: true },
    { label: "Full Name", value: user.name, icon: User },
    { label: "Role", value: ROLE_LABEL[user.role], icon: ShieldCheck },
    { label: "Date of Birth", value: fmtDate(user.dob), icon: Cake, mono: true },
    { label: "Joining Date", value: fmtDate(user.joiningDate), icon: CalendarClock, mono: true },
    { label: "Passport Number", value: user.passportNumber || "Not on file", icon: FileCheck2, mono: true },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Account" title="My Profile" icon={User} />
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div style={{ background: C.red }} className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div style={{ color: C.ink }} className="text-lg font-bold">{user.name}</div>
            <div className="mt-1"><RoleBadge role={user.role} /></div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label} style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3">
              <div style={{ color: C.muted }} className="flex items-center gap-1.5 text-xs uppercase tracking-wide font-semibold mb-1">
                <f.icon size={12} /> {f.label}
              </div>
              <div style={{ color: C.ink, fontFamily: f.mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit" }} className="text-sm font-medium">
                {f.value}
              </div>
            </div>
          ))}

          <div style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3 sm:col-span-2">
            <div style={{ color: C.muted }} className="flex items-center gap-1.5 text-xs uppercase tracking-wide font-semibold mb-1">
              <Phone size={12} /> Contact Details
            </div>
            {editing ? (
              <div className="flex gap-2 mt-1">
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  style={{ borderColor: C.border }}
                  className="flex-1 border rounded-md px-2.5 py-1.5 text-sm outline-none"
                />
                <button onClick={save} style={{ background: C.red }} className="text-white text-xs font-semibold px-3 rounded-md">Save</button>
                <button onClick={() => { setEditing(false); setContact(user.contact); }} style={{ color: C.muted, borderColor: C.border }} className="text-xs border px-3 rounded-md">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-sm font-medium">{user.contact}</span>
                <button onClick={() => setEditing(true)} style={{ color: C.red }} className="text-xs font-semibold">Edit</button>
              </div>
            )}
          </div>

          {supervisor && (
            <div style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3 sm:col-span-2">
              <div style={{ color: C.muted }} className="flex items-center gap-1.5 text-xs uppercase tracking-wide font-semibold mb-1">
                <Users size={12} /> Reports To
              </div>
              <div style={{ color: C.ink }} className="text-sm font-medium">{supervisor.name} <span style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">({supervisor.id})</span></div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-1">
          <div style={{ color: C.ink }} className="text-sm font-bold flex items-center gap-2"><Lock size={15} /> Password</div>
          {!showPasswordForm && (
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              style={{ color: C.red }}
              className="text-xs font-semibold"
            >
              Change Password
            </button>
          )}
        </div>
        {!showPasswordForm ? (
          <p style={{ color: C.muted }} className="text-xs mt-1">Change your own password any time \u2014 no need to ask an Admin.</p>
        ) : (
          <div className="space-y-3 mt-4 max-w-sm">
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ borderColor: C.border }}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{ borderColor: C.border }}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ borderColor: C.border }}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            {pwError && <div style={{ color: C.red, background: "#FBE4E4" }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><AlertCircle size={13} />{pwError}</div>}
            {pwSuccess && <div style={{ color: C.green, background: C.greenSoft }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><CheckCircle2 size={13} />{pwSuccess}</div>}
            <div className="flex gap-2">
              <button type="button" onClick={submitPasswordChange} style={{ background: C.red }} className="text-white text-xs font-semibold rounded-lg px-4 py-2 flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                <Save size={13} /> Update Password
              </button>
              <button
                type="button"
                onClick={() => { setShowPasswordForm(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPwError(""); }}
                style={{ color: C.muted, borderColor: C.border }}
                className="text-xs font-semibold border rounded-lg px-4 py-2"
              >
                Cancel
              </button>
            </div>
            <p style={{ color: C.muted }} className="text-xs">Locked out and can't remember your current password? Ask your Admin to reset it for you via All Employees \u2192 Edit.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Leave tab (apply + personal history)                                */
/* ------------------------------------------------------------------ */
function LeaveTab({ user, leaveUsage, myRequests, onApply, hideTitle }) {
  const annualEligible = isEligibleForAnnualLeave(user);
  const sickEligible = isEligibleForSickLeave(user);
  const availableTypes = LEAVE_TYPES.filter((t) => (t === "Annual" ? annualEligible : t === "Sick" ? sickEligible : true));

  const [type, setType] = useState(() => (annualEligible ? "Annual" : sickEligible ? "Sick" : "Unpaid"));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expanded, setExpanded] = useState(null);

  const days = businessDaysBetween(startDate, endDate, weekendModeForRole(user.role));

  function remainingFor(t) {
    if (t === "Annual") return user.annualAllocation - leaveUsage.annualUsed - leaveUsage.annualPending;
    if (t === "Sick") return user.sickAllocation - leaveUsage.sickUsed - leaveUsage.sickPending;
    return Infinity;
  }

  function submit() {
    setError(""); setSuccess("");
    if (!startDate || !endDate) { setError("Please select both start and end dates."); return; }
    if (new Date(endDate) < new Date(startDate)) { setError("End date cannot be before the start date."); return; }
    if (days === 0) { setError("Selected range has no working days (Sat/Sun excluded)."); return; }
    if (!reason.trim()) { setError("Please provide a reason for the leave."); return; }
    if (type === "Annual" && !annualEligible) { setError("Annual leave is only available after completing one full year of service."); return; }
    if (type === "Sick" && !sickEligible) { setError("Sick leave is only available after completing six months of service."); return; }
    if (type !== "Unpaid" && days > remainingFor(type)) {
      setError(`Insufficient ${type.toLowerCase()} leave balance. You have ${remainingFor(type)} day(s) remaining.`);
      return;
    }
    onApply({ type, startDate, endDate, days, reason: reason.trim() });
    setSuccess("Leave request submitted successfully.");
    setStartDate(""); setEndDate(""); setReason("");
  }

  return (
    <div className="space-y-6">
      {!hideTitle && <SectionTitle eyebrow="Time off" title="Leave" icon={Calendar} />}

      {(!annualEligible || !sickEligible) && (
        <div style={{ color: "#6b5219", background: C.amberSoft }} className="rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
          <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            {!sickEligible && <>Sick leave unlocks after 6 months of service ({daysUntilServiceMilestone(user.joiningDate, 0.5)} day{daysUntilServiceMilestone(user.joiningDate, 0.5) !== 1 ? "s" : ""} to go). </>}
            {!annualEligible && <>Annual leave unlocks after 1 year of service ({daysUntilServiceMilestone(user.joiningDate, 1)} day{daysUntilServiceMilestone(user.joiningDate, 1) !== 1 ? "s" : ""} to go). </>}
            Unpaid leave remains available in the meantime.
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <ChargeGauge label="Annual Leave" allocation={user.annualAllocation} used={leaveUsage.annualUsed} pending={leaveUsage.annualPending} icon={BatteryCharging} locked={!annualEligible} />
        <ChargeGauge label="Sick Leave" allocation={user.sickAllocation} used={leaveUsage.sickUsed} pending={leaveUsage.sickPending} icon={BatteryCharging} locked={!sickEligible} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-5 lg:col-span-2 h-fit">
          <div style={{ color: C.slate }} className="text-sm font-bold mb-4 flex items-center gap-2"><Plus size={15} /> Apply for Leave</div>
          <div className="space-y-3.5">
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Leave Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none">
                {availableTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
              </div>
              <div>
                <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
              </div>
            </div>
            {days > 0 && (
              <div style={{ color: C.gold, background: C.goldSoft }} className="text-xs font-semibold rounded-lg px-3 py-2">
                {days} working day{days !== 1 ? "s" : ""} requested ({user.role === "admin" ? "Sat & Sun excluded" : "Sun excluded"})
              </div>
            )}
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Reason</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Briefly describe the reason for leave"
                style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none" />
            </div>
            {error && <div style={{ color: C.red, background: "#FBE4E4" }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><AlertCircle size={13} />{error}</div>}
            {success && <div style={{ color: C.green, background: C.greenSoft }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><CheckCircle2 size={13} />{success}</div>}
            <button type="button" onClick={submit} style={{ background: C.red }} className="w-full text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Send size={14} /> Submit Request
            </button>
            <p style={{ color: C.muted }} className="text-xs text-center">{routingDescriptionFor(user.role)}</p>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <div style={{ color: C.slate }} className="text-sm font-bold mb-4">My Leave History</div>
          {myRequests.length === 0 ? (
            <div style={{ color: C.muted }} className="text-sm py-8 text-center">No requests submitted yet.</div>
          ) : (
            <div className="space-y-2">
              {myRequests.map((r) => (
                <div key={r.id} style={{ borderColor: C.borderSoft }} className="border rounded-lg overflow-hidden">
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="w-full flex items-center justify-between px-3.5 py-3 text-left">
                    <div className="flex items-center gap-3">
                      <ChevronRight size={14} style={{ color: C.muted, transform: expanded === r.id ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                      <div>
                        <div style={{ color: C.ink }} className="text-sm font-semibold">{r.type} · {r.days} day{r.days !== 1 ? "s" : ""}</div>
                        <div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</div>
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </button>
                  {expanded === r.id && (
                    <div style={{ borderColor: C.borderSoft, background: C.panel }} className="border-t px-3.5 py-3 text-xs space-y-2">
                      <div style={{ color: C.slate }}><span className="font-semibold">Reason: </span>{r.reason}</div>
                      <div className="space-y-1">
                        {r.history.map((h, i) => (
                          <div key={i} style={{ color: C.muted }} className="flex items-center gap-2">
                            <span style={{ background: C.mutedLight }} className="w-1 h-1 rounded-full" />
                            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(h.date)}</span>
                            <span>— {h.action} {h.by ? `by ${h.by}` : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Policies tab                                                        */
/* ------------------------------------------------------------------ */
const LEAVE_POLICY_SECTIONS = [
  { n: "12.1", title: "Leave During the First Six Months", body: "During the first six (6) months of employment, leave is generally treated as unpaid leave, subject to applicable UAE statutory entitlements and Company approval. Any leave in this period must be applied for and approved in advance." },
  { n: "12.2", title: "Sick Leave", body: "After the initial six (6) months, employees may avail sick leave in accordance with Company policy and UAE law. For planning purposes the Company permits up to one (1) sick-leave day per month, subject to supporting medical documentation where required. Sick leave must be notified as soon as reasonably possible." },
  { n: "12.3", title: "Annual Leave", body: "Upon completing one (1) full year of service, employees are eligible for annual leave of 21/22 working days as applicable under UAE law and their employment terms. Applications must be submitted at least 30 days in advance, except where shorter notice is reasonably necessary." },
  { n: "12.4", title: "Leave Approval & Business Requirements", body: "All leave requests are subject to prior approval and are considered based on business requirements, customer commitments, sales targets, and team availability. Approval is not automatic upon submission." },
  { n: "12.5", title: "Sales Team Leave Restrictions", body: "Two or more Sales Leaders may not take leave at the same time, nor may a Sales Leader and Promoter assigned to the same coverage area take leave simultaneously. Overlapping requests are resolved based on business requirements and operational priorities. Employees should not make non-refundable commitments until leave is formally approved." },
  { n: "12.6", title: "Leave Application Procedure", body: "Annual leave requests must be submitted at least 30 days in advance with written approval obtained before proceeding. Employees must complete customer handovers and pending work arrangements beforehand. Unauthorized leave may result in disciplinary action." },
  { n: "12.7", title: "General Leave Conditions", body: "Leave entitlement and approval are subject to eligibility, length of service, Company requirements, and applicable UAE law. The Company may schedule leave to ensure adequate staffing." },
  { n: "12.8", title: "Public Holidays & Leave Combination", body: "Employees may not intentionally combine leave with UAE public holidays to extend absence, unless approved by Management. Requests adjacent to public holidays are reviewed based on business requirements." },
  { n: "12.9", title: "Statutory Rights", body: "Nothing in this policy restricts, reduces, or replaces any mandatory entitlement under UAE employment law. Where UAE law is more favourable than Company policy, the statutory entitlement prevails." },
];

const INCENTIVE_POLICY_SECTIONS = [
  { n: "1", title: "Probation Period", body: "Probation sales targets: August AED 20,000 (fixed), September AED 40,000, October AED 50,000, November AED 70,000 \u2014 each requiring minimum 90% achievement to continue. If cumulative sales exceed AED 250,000 during probation, a 50% incentive applies to Sep/Oct/Nov incentive amounts." },
  { n: "2", title: "Permanent Employment \u2013 Salary & Allowances", body: "Monthly Salary: AED 4,500. Fuel Allowance: AED 700/month, subject to supporting bills. Sales incentive payable per the structure below." },
  { n: "3", title: "Sales Incentive Structure", body: "75%\u201390% achievement earns 1.00% incentive; 90%\u2013100% earns 1.50%; 101% and above earns 2.00%. Calculated on eligible net sales after returns, cancellations, credit notes, and discounts." },
  { n: "4", title: "Payment Recovery Incentive", body: "85%\u201395% recovery earns AED 700; 95%\u2013100% recovery earns AED 1,000. A 3-working-day grace period may apply. Payable only against amounts actually recovered and credited." },
  { n: "5", title: "Cash Bill Incentive", body: "1.5% of eligible cash bill value. Example: AED 50,000 cash sales \u00d7 1.5% = AED 750." },
  { n: "6", title: "Invoice Value Incentive", body: "AED 30 per qualifying invoice of AED 1,500 or above. Example: 25 invoices \u00d7 AED 30 = AED 750. Cancelled, returned or duplicate invoices do not qualify." },
  { n: "7", title: "Illustrative Monthly Incentive", body: "Combining all components, illustrative totals range from AED 3,300 (lower performance) to AED 3,925 (target) to AED 4,220 (higher performance) per month." },
  { n: "8", title: "Performance Review & Warning", body: "Performance is reviewed monthly. Achievement below 70% of target for two consecutive months may trigger a formal warning; two warnings may lead to suspension or further disciplinary action." },
  { n: "9", title: "Incentive Payment Conditions", body: "All incentives are subject to Sales and Finance verification. No incentive is payable on cancelled, returned, unapproved, duplicate, disputed, or non-compliant transactions." },
  { n: "10", title: "Company\u2019s Right to Review the Policy", body: "The Company may review, modify, suspend, or revise targets and incentives based on business needs, subject to applicable law. Material changes are communicated to affected employees." },
  { n: "11", title: "Employee Acknowledgement", body: "By signing the Offer Letter/Employment Agreement, employees confirm they have read, understood, and accepted this policy in full." },
];

/* ------------------------------------------------------------------ */
/*  Resignation tab                                                     */
/* ------------------------------------------------------------------ */
function ResignationTab({ user, myResignations, onApply, onWithdraw, hideTitle }) {
  const [lastWorkingDay, setLastWorkingDay] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expanded, setExpanded] = useState(null);

  const activeStatuses = ["pending_supervisor", "pending_admin", "approved"];
  const active = myResignations.find((r) => activeStatuses.includes(r.status));
  const past = myResignations.filter((r) => r.id !== active?.id);

  const noticeDays = lastWorkingDay ? businessDaysBetween(new Date().toISOString().slice(0, 10), lastWorkingDay, weekendModeForRole(user.role)) : 0;
  const shortNotice = lastWorkingDay && noticeDays < STANDARD_NOTICE_DAYS;

  function submit() {
    setError(""); setSuccess("");
    if (!lastWorkingDay) { setError("Please select your proposed last working day."); return; }
    if (new Date(lastWorkingDay) < new Date()) { setError("Last working day cannot be in the past."); return; }
    if (!reason.trim()) { setError("Please provide a reason for resigning."); return; }
    if (noticeDays < STANDARD_NOTICE_DAYS) {
      setError(`The required notice period is ${STANDARD_NOTICE_DAYS} working days. Your proposed last working day is only ${noticeDays} day${noticeDays !== 1 ? "s" : ""} away \u2014 please choose a later date, or discuss an exception directly with Management before submitting.`);
      return;
    }
    onApply({ lastWorkingDay, reason: reason.trim() });
    setSuccess("Resignation request submitted.");
    setLastWorkingDay(""); setReason("");
  }

  return (
    <div className="space-y-6">
      {!hideTitle && <SectionTitle eyebrow="Employment" title="Resignation" icon={DoorOpen} />}

      {active ? (
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div style={{ color: C.slate }} className="text-xs font-semibold uppercase tracking-wide mb-1">Active Resignation Request</div>
              <div style={{ color: C.ink }} className="text-lg font-bold">Last working day: {fmtDate(active.lastWorkingDay)}</div>
            </div>
            <StatusBadge status={active.status} metaMap={RESIGNATION_STATUS_META} />
          </div>
          <div style={{ color: C.slate, borderColor: C.borderSoft, background: C.panel }} className="text-sm rounded-lg border p-3 mb-4">
            <span className="font-semibold">Reason: </span>{active.reason}
          </div>
          <div className="space-y-1.5 mb-5">
            {active.history.map((h, i) => (
              <div key={i} style={{ color: C.muted }} className="flex items-center gap-2 text-xs">
                <span style={{ background: C.mutedLight }} className="w-1 h-1 rounded-full" />
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(h.date)}</span>
                <span>— {h.action} {h.by ? `by ${h.by}` : ""}</span>
              </div>
            ))}
          </div>
          {(active.status === "pending_supervisor" || active.status === "pending_admin") && (
            <button
              type="button"
              onClick={() => onWithdraw(active)}
              style={{ color: C.red, borderColor: C.red }}
              className="text-sm font-semibold border rounded-lg px-4 py-2 flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Undo2 size={14} /> Withdraw Request
            </button>
          )}
          {active.status === "approved" && (
            <div style={{ color: C.green, background: C.greenSoft }} className="text-sm font-semibold rounded-lg px-3 py-2.5 flex items-center gap-2">
              <CheckCircle2 size={15} /> Your resignation has been accepted. Please coordinate handover with your manager.
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-5 max-w-xl">
          <div style={{ color: C.slate }} className="text-sm font-bold mb-1 flex items-center gap-2"><UserMinus size={15} /> Raise a Resignation Request</div>
          <p style={{ color: C.muted }} className="text-xs mb-4">Required notice period is {STANDARD_NOTICE_DAYS} working days, as per your employment contract. Requests with a shorter notice period cannot be submitted through the portal.</p>
          <div className="space-y-3.5">
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Proposed Last Working Day</label>
              <input type="date" value={lastWorkingDay} onChange={(e) => setLastWorkingDay(e.target.value)} style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
            </div>
            {lastWorkingDay && (
              <div style={{ color: shortNotice ? C.red : C.green, background: shortNotice ? "#FBE4E4" : C.greenSoft }} className="text-xs font-semibold rounded-lg px-3 py-2 flex items-center gap-1.5">
                <AlertCircle size={13} />
                {noticeDays} working day{noticeDays !== 1 ? "s" : ""} of notice {shortNotice ? `(below the required ${STANDARD_NOTICE_DAYS} days \u2014 cannot be submitted)` : ""}
              </div>
            )}
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Reason</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Briefly describe your reason for resigning"
                style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none" />
            </div>
            {error && <div style={{ color: C.red, background: "#FBE4E4" }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><AlertCircle size={13} />{error}</div>}
            {success && <div style={{ color: C.green, background: C.greenSoft }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><CheckCircle2 size={13} />{success}</div>}
            <button type="button" onClick={submit} style={{ background: C.red }} className="w-full text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Send size={14} /> Submit Resignation Request
            </button>
            <p style={{ color: C.muted }} className="text-xs text-center">{routingDescriptionFor(user.role)}</p>
          </div>
        </Card>
      )}

      {past.length > 0 && (
        <Card className="p-5">
          <div style={{ color: C.slate }} className="text-sm font-bold mb-4">Past Requests</div>
          <div className="space-y-2">
            {past.map((r) => (
              <div key={r.id} style={{ borderColor: C.borderSoft }} className="border rounded-lg overflow-hidden">
                <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="w-full flex items-center justify-between px-3.5 py-3 text-left">
                  <div className="flex items-center gap-3">
                    <ChevronRight size={14} style={{ color: C.muted, transform: expanded === r.id ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                    <div>
                      <div style={{ color: C.ink }} className="text-sm font-semibold">Last day: {fmtDate(r.lastWorkingDay)}</div>
                      <div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">Submitted {fmtDate(r.submittedDate)}</div>
                    </div>
                  </div>
                  <StatusBadge status={r.status} metaMap={RESIGNATION_STATUS_META} />
                </button>
                {expanded === r.id && (
                  <div style={{ borderColor: C.borderSoft, background: C.panel }} className="border-t px-3.5 py-3 text-xs space-y-2">
                    <div style={{ color: C.slate }}><span className="font-semibold">Reason: </span>{r.reason}</div>
                    <div className="space-y-1">
                      {r.history.map((h, i) => (
                        <div key={i} style={{ color: C.muted }} className="flex items-center gap-2">
                          <span style={{ background: C.mutedLight }} className="w-1 h-1 rounded-full" />
                          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(h.date)}</span>
                          <span>— {h.action} {h.by ? `by ${h.by}` : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fuel Bills tab (not applicable to Promoters)                        */
/* ------------------------------------------------------------------ */
function compressImageFile(file, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function FuelBillsTab({ user, myFuelBills, onApply, hideTitle }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receiptDataUrl, setReceiptDataUrl] = useState(null);
  const [receiptFileName, setReceiptFileName] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const monthStr = new Date().toISOString().slice(0, 7);
  const approvedThisMonth = myFuelBills
    .filter((b) => b.status === "approved" && b.date.slice(0, 7) === monthStr)
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (file.type.startsWith("image/")) {
      try {
        setBusy(true);
        const dataUrl = await compressImageFile(file);
        setReceiptDataUrl(dataUrl);
        setReceiptFileName(file.name);
      } catch (err) {
        setError("Could not process that image. Please try another file.");
      } finally {
        setBusy(false);
      }
    } else if (file.type === "application/pdf") {
      if (file.size > 1200000) {
        setError("PDF is too large (max ~1.2MB). Please attach a smaller file or an image instead.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => { setReceiptDataUrl(reader.result); setReceiptFileName(file.name); };
      reader.readAsDataURL(file);
    } else {
      setError("Please upload an image or PDF file.");
    }
  }

  function submit() {
    setError(""); setSuccess("");
    if (!date) { setError("Please select the bill date."); return; }
    if (!amount || Number(amount) <= 0) { setError("Please enter a valid amount."); return; }
    if (!receiptDataUrl) { setError("Please attach a receipt (image or PDF) \u2014 it's required before this can be submitted for approval."); return; }
    onApply({ date, amount: Number(amount), note: note.trim(), receiptDataUrl, receiptFileName });
    setSuccess("Fuel bill submitted for approval.");
    setAmount(""); setNote(""); setReceiptDataUrl(null); setReceiptFileName(null);
  }

  return (
    <div className="space-y-6">
      {!hideTitle && <SectionTitle eyebrow="Expenses" title="Fuel Bills" icon={Fuel} />}

      <Card className="p-4 flex items-center justify-between flex-wrap gap-3" style={{ background: C.goldSoft, borderColor: "transparent" }}>
        <div className="flex items-center gap-2">
          <Wallet size={17} style={{ color: C.gold }} />
          <span style={{ color: "#6b5219" }} className="text-sm font-semibold">This month approved: AED {approvedThisMonth.toFixed(2)}</span>
        </div>
        <span style={{ color: "#6b5219" }} className="text-xs">Monthly fuel allowance cap: AED {(user.fuelAllowance || 0).toFixed(2)}</span>
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-5 lg:col-span-2 h-fit">
          <div style={{ color: C.slate }} className="text-sm font-bold mb-4 flex items-center gap-2"><Upload size={15} /> Upload Fuel Bill</div>
          <div className="space-y-3.5">
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Bill Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Amount (AED)</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Receipt (image or PDF) <span style={{ color: C.red }}>*</span></label>
              <label style={{ borderColor: C.border, color: C.muted }} className="w-full border border-dashed rounded-lg px-3 py-3 text-xs flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <ImageIcon size={15} />
                {receiptFileName ? receiptFileName : "Choose a file to attach"}
                <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
              </label>
              {busy && <div style={{ color: C.muted }} className="text-xs mt-1">Processing image…</div>}
              {receiptDataUrl && receiptDataUrl.startsWith("data:image") && (
                <img src={receiptDataUrl} alt="Receipt preview" className="mt-2 rounded-lg border max-h-32 object-cover" style={{ borderColor: C.borderSoft }} />
              )}
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Note (optional)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. ADNOC, Sheikh Zayed Rd" style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
            </div>
            {error && <div style={{ color: C.red, background: "#FBE4E4" }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><AlertCircle size={13} />{error}</div>}
            {success && <div style={{ color: C.green, background: C.greenSoft }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><CheckCircle2 size={13} />{success}</div>}
            <button type="button" onClick={submit} style={{ background: C.red }} className="w-full text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Send size={14} /> Submit for Approval
            </button>
            <p style={{ color: C.muted }} className="text-xs text-center">{routingDescriptionFor(user.role)}</p>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <div style={{ color: C.slate }} className="text-sm font-bold mb-4">My Fuel Bills</div>
          {myFuelBills.length === 0 ? (
            <div style={{ color: C.muted }} className="text-sm py-8 text-center">No fuel bills submitted yet.</div>
          ) : (
            <div className="space-y-2">
              {myFuelBills.map((b) => (
                <div key={b.id} style={{ borderColor: C.borderSoft }} className="border rounded-lg overflow-hidden">
                  <button onClick={() => setExpanded(expanded === b.id ? null : b.id)} className="w-full flex items-center justify-between px-3.5 py-3 text-left">
                    <div className="flex items-center gap-3">
                      <ChevronRight size={14} style={{ color: C.muted, transform: expanded === b.id ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                      <div>
                        <div style={{ color: C.ink }} className="text-sm font-semibold">AED {Number(b.amount).toFixed(2)}</div>
                        <div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">{fmtDate(b.date)}</div>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </button>
                  {expanded === b.id && (
                    <div style={{ borderColor: C.borderSoft, background: C.panel }} className="border-t px-3.5 py-3 text-xs space-y-2">
                      {b.note && <div style={{ color: C.slate }}><span className="font-semibold">Note: </span>{b.note}</div>}
                      {b.receiptDataUrl && b.receiptDataUrl.startsWith("data:image") && (
                        <img src={b.receiptDataUrl} alt="Receipt" className="rounded-lg border max-h-40" style={{ borderColor: C.borderSoft }} />
                      )}
                      {b.receiptFileName && !(b.receiptDataUrl && b.receiptDataUrl.startsWith("data:image")) && (
                        <div style={{ color: C.muted }} className="flex items-center gap-1.5"><FileCheck2 size={13} /> {b.receiptFileName}</div>
                      )}
                      <div className="space-y-1">
                        {b.history.map((h, i) => (
                          <div key={i} style={{ color: C.muted }} className="flex items-center gap-2">
                            <span style={{ background: C.mutedLight }} className="w-1 h-1 rounded-full" />
                            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(h.date)}</span>
                            <span>— {h.action} {h.by ? `by ${h.by}` : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function PettyCashTab({ user, myPettyCash, onApply, hideTitle }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receiptDataUrl, setReceiptDataUrl] = useState(null);
  const [receiptFileName, setReceiptFileName] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const monthStr = new Date().toISOString().slice(0, 7);
  const approvedThisMonth = myPettyCash
    .filter((b) => b.status === "approved" && b.date.slice(0, 7) === monthStr)
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (file.type.startsWith("image/")) {
      try {
        setBusy(true);
        const dataUrl = await compressImageFile(file);
        setReceiptDataUrl(dataUrl);
        setReceiptFileName(file.name);
      } catch (err) {
        setError("Could not process that image. Please try another file.");
      } finally {
        setBusy(false);
      }
    } else if (file.type === "application/pdf") {
      if (file.size > 1200000) {
        setError("PDF is too large (max ~1.2MB). Please attach a smaller file or an image instead.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => { setReceiptDataUrl(reader.result); setReceiptFileName(file.name); };
      reader.readAsDataURL(file);
    } else {
      setError("Please upload an image or PDF file.");
    }
  }

  function submit() {
    setError(""); setSuccess("");
    if (!date) { setError("Please select the expense date."); return; }
    if (!amount || Number(amount) <= 0) { setError("Please enter a valid amount."); return; }
    if (!note.trim()) { setError("Please describe what this expense was for."); return; }
    if (!receiptDataUrl) { setError("Please attach an invoice/receipt (image or PDF) \u2014 it's required before this can be submitted for approval."); return; }
    onApply({ date, amount: Number(amount), note: note.trim(), receiptDataUrl, receiptFileName });
    setSuccess("Petty cash claim submitted for approval.");
    setAmount(""); setNote(""); setReceiptDataUrl(null); setReceiptFileName(null);
  }

  return (
    <div className="space-y-6">
      {!hideTitle && <SectionTitle eyebrow="Expenses" title="Petty Cash" icon={Receipt} />}

      <Card className="p-4" style={{ background: C.goldSoft, borderColor: "transparent" }}>
        <div className="flex items-center gap-2">
          <Wallet size={17} style={{ color: C.gold }} />
          <span style={{ color: "#6b5219" }} className="text-sm font-semibold">This month approved: AED {approvedThisMonth.toFixed(2)}</span>
        </div>
        <p style={{ color: "#6b5219" }} className="text-xs mt-1">For company-related spend — meetings, team gatherings, and similar out-of-pocket costs. Approved claims are reimbursed in full through your payslip, with no monthly cap.</p>
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-5 lg:col-span-2 h-fit">
          <div style={{ color: C.slate }} className="text-sm font-bold mb-4 flex items-center gap-2"><Upload size={15} /> Submit Petty Cash Claim</div>
          <div className="space-y-3.5">
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Expense Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Amount (AED)</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">What was this for?</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Team lunch, client meeting supplies" style={{ borderColor: C.border, color: C.ink }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Invoice / Receipt (image or PDF) <span style={{ color: C.red }}>*</span></label>
              <label style={{ borderColor: C.border, color: C.muted }} className="w-full border border-dashed rounded-lg px-3 py-3 text-xs flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <ImageIcon size={15} />
                {receiptFileName ? receiptFileName : "Choose a file to attach"}
                <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
              </label>
              {busy && <div style={{ color: C.muted }} className="text-xs mt-1">Processing image…</div>}
              {receiptDataUrl && receiptDataUrl.startsWith("data:image") && (
                <img src={receiptDataUrl} alt="Receipt preview" className="mt-2 rounded-lg border max-h-32 object-cover" style={{ borderColor: C.borderSoft }} />
              )}
            </div>
            {error && <div style={{ color: C.red, background: "#FBE4E4" }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><AlertCircle size={13} />{error}</div>}
            {success && <div style={{ color: C.green, background: C.greenSoft }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><CheckCircle2 size={13} />{success}</div>}
            <button type="button" onClick={submit} style={{ background: C.red }} className="w-full text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Send size={14} /> Submit for Approval
            </button>
            <p style={{ color: C.muted }} className="text-xs text-center">{routingDescriptionFor(user.role)}</p>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <div style={{ color: C.slate }} className="text-sm font-bold mb-4">My Petty Cash Claims</div>
          {myPettyCash.length === 0 ? (
            <div style={{ color: C.muted }} className="text-sm py-8 text-center">No petty cash claims submitted yet.</div>
          ) : (
            <div className="space-y-2">
              {myPettyCash.map((b) => (
                <div key={b.id} style={{ borderColor: C.borderSoft }} className="border rounded-lg overflow-hidden">
                  <button onClick={() => setExpanded(expanded === b.id ? null : b.id)} className="w-full flex items-center justify-between px-3.5 py-3 text-left">
                    <div className="flex items-center gap-3">
                      <ChevronRight size={14} style={{ color: C.muted, transform: expanded === b.id ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                      <div>
                        <div style={{ color: C.ink }} className="text-sm font-semibold">AED {Number(b.amount).toFixed(2)}</div>
                        <div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">{fmtDate(b.date)}</div>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </button>
                  {expanded === b.id && (
                    <div style={{ borderColor: C.borderSoft, background: C.panel }} className="border-t px-3.5 py-3 text-xs space-y-2">
                      {b.note && <div style={{ color: C.slate }}><span className="font-semibold">Purpose: </span>{b.note}</div>}
                      {b.receiptDataUrl && b.receiptDataUrl.startsWith("data:image") && (
                        <img src={b.receiptDataUrl} alt="Receipt" className="rounded-lg border max-h-40" style={{ borderColor: C.borderSoft }} />
                      )}
                      {b.receiptFileName && !(b.receiptDataUrl && b.receiptDataUrl.startsWith("data:image")) && (
                        <div style={{ color: C.muted }} className="flex items-center gap-1.5"><FileCheck2 size={13} /> {b.receiptFileName}</div>
                      )}
                      <div className="space-y-1">
                        {b.history.map((h, i) => (
                          <div key={i} style={{ color: C.muted }} className="flex items-center gap-2">
                            <span style={{ background: C.mutedLight }} className="w-1 h-1 rounded-full" />
                            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(h.date)}</span>
                            <span>— {h.action} {h.by ? `by ${h.by}` : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Payslip tab                                                         */
/* ------------------------------------------------------------------ */
function buildPayslipDocument(user, p, selected, payslipRef, generatedDate) {
  const monthStr = `${selected.year}-${String(selected.month).padStart(2, "0")}`;
  const fmt = (n) => Number(n).toFixed(2);
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Payslip - ${esc(user.name)} - ${esc(monthLabel(selected.year, selected.month))}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #222; margin: 0; padding: 32px; background: #fff; }
  .sheet { max-width: 720px; margin: 0 auto; border: 1px solid #E4E2DC; border-radius: 12px; overflow: hidden; }
  .header { background: #14161A; color: #fff; padding: 24px 28px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand .mark { width: 28px; height: 28px; background: #C81E2C; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; }
  .brand .name { font-weight: 800; font-size: 17px; letter-spacing: 0.02em; }
  .subtle { color: #A8ACB2; font-size: 11px; margin-top: 6px; }
  .title { text-align: right; }
  .title .h { font-size: 18px; font-weight: 800; }
  .title .m { font-size: 13px; color: #A8ACB2; }
  .title .ref { font-family: 'Courier New', monospace; font-size: 11px; color: #A8ACB2; margin-top: 4px; }
  .body { padding: 24px 28px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .card { background: #F6F5F2; border: 1px solid #E4E2DC; border-radius: 8px; padding: 10px 12px; }
  .lbl { font-size: 10px; text-transform: uppercase; color: #7A7F87; font-weight: 700; margin-bottom: 3px; letter-spacing: 0.04em; }
  .val { font-size: 13px; font-weight: 600; color: #222; }
  .mono { font-family: 'Courier New', monospace; }
  .sectiontitle { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #3A3F44; letter-spacing: 0.04em; margin: 20px 0 8px; }
  table.pay { width: 100%; border-collapse: collapse; border: 1px solid #E4E2DC; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
  table.pay td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #EDEBE6; vertical-align: top; }
  table.pay th { text-align: left; padding: 10px 14px; background: #F6F5F2; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #3A3F44; border-bottom: 1px solid #E4E2DC; }
  table.pay .amt { text-align: right; font-family: 'Courier New', monospace; }
  table.pay .totrow td { font-weight: 800; background: #F6F5F2; }
  .netpay { background: #14161A; color: #fff; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .netpay .lab { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
  .netpay .amt { font-size: 22px; font-weight: 800; font-family: 'Courier New', monospace; }
  .words { font-size: 11px; color: #7A7F87; font-style: italic; margin-top: 8px; }
  .foot { font-size: 10px; color: #A8ACB2; margin-top: 24px; text-align: center; }
  @media print {
    body { padding: 0; }
    .sheet { border: none; border-radius: 0; max-width: 100%; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand"><div class="mark">U</div><div class="name">UNIX</div></div>
        <div class="subtle">UNIX \u2014 Payroll Department</div>
      </div>
      <div class="title">
        <div class="h">PAYSLIP</div>
        <div class="m">${esc(monthLabel(selected.year, selected.month))}</div>
        <div class="ref">Ref: ${esc(payslipRef)}</div>
      </div>
    </div>
    <div class="body">
      <div class="grid2">
        <div class="card">
          <div class="lbl">Employee</div>
          <div class="val">${esc(user.name)}</div>
          <div class="val mono" style="font-weight:400;color:#7A7F87;margin-top:2px;">${esc(user.id)} \u00b7 ${esc(ROLE_LABEL[user.role])}</div>
        </div>
        <div class="card">
          <div class="lbl">Pay Period</div>
          <div class="val">${esc(monthLabel(selected.year, selected.month))}</div>
          <div class="val mono" style="font-weight:400;color:#7A7F87;margin-top:2px;">${esc(fmtDate(`${monthStr}-01`))} \u2013 ${esc(fmtDate(`${monthStr}-${String(p.daysInMonth).padStart(2, "0")}`))}</div>
        </div>
      </div>

      <div class="grid3">
        <div class="card"><div class="lbl">Working Days</div><div class="val mono">${p.workingDaysInMonth}</div></div>
        <div class="card"><div class="lbl">Days Worked</div><div class="val mono">${p.daysWorked}</div></div>
        <div class="card"><div class="lbl">Calendar Days</div><div class="val mono">${p.daysInMonth}</div></div>
      </div>

      <div class="sectiontitle">Leave Taken This Month (Approved)</div>
      <div class="grid3">
        <div class="card"><div class="lbl">Annual (paid)</div><div class="val mono">${p.annualDays}d</div></div>
        <div class="card"><div class="lbl">Sick (paid)</div><div class="val mono">${p.sickDays}d</div></div>
        <div class="card" style="${p.unpaidDays > 0 ? "background:#FBE4E4;border-color:#FBE4E4;" : ""}"><div class="lbl" style="${p.unpaidDays > 0 ? "color:#C81E2C;" : ""}">Unpaid</div><div class="val mono" style="${p.unpaidDays > 0 ? "color:#C81E2C;" : ""}">${p.unpaidDays}d</div></div>
      </div>

      <table class="pay">
        <tr><th colspan="2">Earnings</th></tr>
        <tr><td>Basic Salary</td><td class="amt">${fmt(p.basicSalary)}</td></tr>
        ${p.eligibleForFuel ? `<tr><td>Fuel Reimbursement</td><td class="amt">${fmt(p.fuelExpense)}</td></tr>` : ""}
        ${p.pettyCashTotal > 0 ? `<tr><td>Petty Cash Reimbursement</td><td class="amt">${fmt(p.pettyCashTotal)}</td></tr>` : ""}
        <tr class="totrow"><td>Gross Earnings</td><td class="amt">${fmt(p.grossPay)}</td></tr>
      </table>

      <table class="pay">
        <tr><th colspan="2">Deductions</th></tr>
        <tr><td>Unpaid Leave (${p.unpaidDays}d \u00d7 AED ${fmt(p.dailyRate)})</td><td class="amt">${fmt(p.unpaidDeduction)}</td></tr>
        <tr class="totrow"><td>Total Deductions</td><td class="amt">${fmt(p.unpaidDeduction)}</td></tr>
      </table>

      <div class="netpay">
        <div class="lab">Net Pay</div>
        <div class="amt">AED ${fmt(p.netPay)}</div>
      </div>
      <div class="words">${esc(amountInWords(p.netPay))}</div>

      <div class="foot">
        Generated ${esc(generatedDate ? fmtDate(generatedDate) : "as a live preview")} \u00b7 This payslip is system generated; hence no signature or stamp is required.
      </div>
    </div>
  </div>
</body>
</html>`;
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PayslipTab({ user, employees, leaveRequests, fuelBills, pettyCash, payslips, onGenerate, onGenerateAll }) {
  const months = availablePayslipMonths(12);
  const [selected, setSelected] = useState(months[0] || { year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfReady, setPdfReady] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);
  const p = calculatePayslip(user, selected.year, selected.month, leaveRequests, fuelBills, pettyCash);

  const monthStr = `${selected.year}-${String(selected.month).padStart(2, "0")}`;
  const generated = payslips.find((ps) => ps.employeeId === user.id && ps.monthStr === monthStr);
  const myPayslips = payslips.filter((ps) => ps.employeeId === user.id).sort((a, b) => (a.monthStr < b.monthStr ? 1 : -1));

  const hasPendingItems = p.annualPendingDays + p.sickPendingDays + p.unpaidPendingDays > 0 || p.pendingFuelTotal > 0 || p.pendingPettyCashTotal > 0;
  const payslipRef = generated ? generated.id : `PREVIEW-${monthStr}`;

  async function loadScriptOnce(src, globalCheck) {
    if (globalCheck()) return;
    await new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) { existing.addEventListener("load", resolve); existing.addEventListener("error", reject); return; }
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Load the PDF library as soon as this screen opens, not on click. Mobile browsers (especially iOS Safari)
  // require file downloads to happen synchronously within the tap — if the library is still loading at click
  // time, the "await" breaks that direct-user-gesture chain and the download can silently fail or misbehave.
  useEffect(() => {
    let cancelled = false;
    loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", () => !!window.jspdf)
      .then(() => { if (!cancelled) setPdfReady(true); })
      .catch(() => { if (!cancelled) setPdfReady(false); });
    return () => { cancelled = true; };
  }, []);

  async function downloadPDF() {
    setPdfError(""); setPdfBusy(true);
    try {
      await loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", () => !!window.jspdf);
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 40;
      let y = 40;

      // Header band
      doc.setFillColor(20, 22, 26);
      doc.rect(0, 0, pageW, 90, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold"); doc.setFontSize(18);
      doc.text("UNIX", margin, 40);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.setTextColor(168, 172, 178);
      doc.text("UNIX \u2014 Payroll Department", margin, 58);
      doc.setFont("helvetica", "bold"); doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("PAYSLIP", pageW - margin, 38, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.setTextColor(168, 172, 178);
      doc.text(monthLabel(selected.year, selected.month), pageW - margin, 54, { align: "right" });
      doc.setFontSize(8);
      doc.text(`Ref: ${payslipRef}`, pageW - margin, 68, { align: "right" });

      y = 120;
      doc.setTextColor(58, 63, 68);
      const boxW = (pageW - margin * 2 - 12) / 2;

      function infoBox(x, label, lines) {
        doc.setDrawColor(228, 226, 220);
        doc.setFillColor(246, 245, 242);
        doc.rect(x, y, boxW, 46, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        doc.setTextColor(122, 127, 135);
        doc.text(label.toUpperCase(), x + 10, y + 16);
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        doc.setTextColor(34, 34, 34);
        lines.forEach((line, i) => doc.text(line, x + 10, y + 30 + i * 12));
      }
      infoBox(margin, "Employee", [user.name, `${user.id}  \u00b7  ${ROLE_LABEL[user.role]}`]);
      infoBox(margin + boxW + 12, "Pay Period", [monthLabel(selected.year, selected.month), `${fmtDate(`${monthStr}-01`)} \u2013 ${fmtDate(`${monthStr}-${String(p.daysInMonth).padStart(2, "0")}`)}`]);
      y += 60;

      const col3W = (pageW - margin * 2 - 24) / 3;
      function smallBox(x, label, value) {
        doc.setDrawColor(228, 226, 220);
        doc.setFillColor(246, 245, 242);
        doc.rect(x, y, col3W, 36, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
        doc.setTextColor(122, 127, 135);
        doc.text(label.toUpperCase(), x + 8, y + 14);
        doc.setFont("helvetica", "normal"); doc.setFontSize(11);
        doc.setTextColor(34, 34, 34);
        doc.text(String(value), x + 8, y + 28);
      }
      smallBox(margin, "Working Days", p.workingDaysInMonth);
      smallBox(margin + col3W + 12, "Days Worked", p.daysWorked);
      smallBox(margin + (col3W + 12) * 2, "Calendar Days", p.daysInMonth);
      y += 50;

      smallBox(margin, "Annual (paid)", `${p.annualDays}d`);
      smallBox(margin + col3W + 12, "Sick (paid)", `${p.sickDays}d`);
      smallBox(margin + (col3W + 12) * 2, "Unpaid", `${p.unpaidDays}d`);
      y += 56;

      // Earnings / Deductions table
      const earnRows = [["Basic Salary", p.basicSalary]];
      if (p.eligibleForFuel) earnRows.push(["Fuel Reimbursement", p.fuelExpense]);
      if (p.pettyCashTotal > 0) earnRows.push(["Petty Cash Reimbursement", p.pettyCashTotal]);
      const dedRows = [[`Unpaid Leave (${p.unpaidDays}d)`, p.unpaidDeduction]];

      const tableW = (pageW - margin * 2 - 12) / 2;
      function table(x, title, rows, totalLabel, total) {
        let ty = y;
        doc.setDrawColor(228, 226, 220);
        doc.setFillColor(246, 245, 242);
        doc.rect(x, ty, tableW, 20, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        doc.setTextColor(58, 63, 68);
        doc.text(title.toUpperCase(), x + 8, ty + 14);
        ty += 20;
        rows.forEach((row) => {
          doc.setDrawColor(237, 235, 230);
          doc.rect(x, ty, tableW, 20, "S");
          doc.setFont("helvetica", "normal"); doc.setFontSize(9);
          doc.setTextColor(58, 63, 68);
          doc.text(row[0], x + 8, ty + 13);
          doc.text(Number(row[1]).toFixed(2), x + tableW - 8, ty + 13, { align: "right" });
          ty += 20;
        });
        doc.setFillColor(246, 245, 242);
        doc.rect(x, ty, tableW, 22, "F");
        doc.setDrawColor(228, 226, 220);
        doc.rect(x, ty, tableW, 22, "S");
        doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
        doc.setTextColor(34, 34, 34);
        doc.text(totalLabel, x + 8, ty + 15);
        doc.text(Number(total).toFixed(2), x + tableW - 8, ty + 15, { align: "right" });
        return ty + 22;
      }
      const yA = table(margin, "Earnings", earnRows, "Gross Earnings", p.grossPay);
      const yB = table(margin + tableW + 12, "Deductions", dedRows, "Total Deductions", p.unpaidDeduction);
      y = Math.max(yA, yB) + 20;

      doc.setFillColor(20, 22, 26);
      doc.rect(margin, y, pageW - margin * 2, 40, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("NET PAY", margin + 14, y + 25);
      doc.setFontSize(15);
      doc.text(`AED ${p.netPay.toFixed(2)}`, pageW - margin - 14, y + 25, { align: "right" });
      y += 55;

      doc.setFont("helvetica", "italic"); doc.setFontSize(9);
      doc.setTextColor(122, 127, 135);
      doc.text(amountInWords(p.netPay), margin, y);
      y += 30;

      doc.setDrawColor(228, 226, 220);
      doc.line(margin, y, pageW - margin, y);
      y += 16;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text(`Generated ${generated ? fmtDate(generated.generatedDate) : "as a live preview"}  \u00b7  This payslip is system generated; hence no signature or stamp is required.`, pageW / 2, y, { align: "center" });

      // Use our own reliable Blob-download mechanism (same one the working HTML download uses)
      // rather than jsPDF's built-in save(), which mobile browsers — especially iOS Safari —
      // handle inconsistently and can open inline instead of downloading.
      const pdfBlob = doc.output("blob");
      downloadBlob(`Payslip_${user.id}_${monthStr}.pdf`, pdfBlob);
    } catch (err) {
      setPdfError("Could not generate the PDF (this may be blocked by your network). Try the HTML download below instead, or check your connection and retry.");
    } finally {
      setPdfBusy(false);
    }
  }

  async function handleGenerateAllClick() {
    setBulkBusy(true); setBulkDone(false);
    onGenerateAll(selected.year, selected.month);
    setTimeout(() => { setBulkBusy(false); setBulkDone(true); }, 400);
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Payroll" title="Payslip" icon={Wallet} />

      {months.length === 0 ? (
        <Card className="p-6 text-center">
          <Info size={18} style={{ color: C.gold, margin: "0 auto 8px" }} />
          <div style={{ color: C.ink }} className="text-sm font-semibold mb-1">No payslips available yet</div>
          <p style={{ color: C.muted }} className="text-xs">Payroll runs on the 5th of each month for the previous month. Your first payslip will be available shortly after that date.</p>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={`${selected.year}-${selected.month}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                setSelected({ year: y, month: m });
              }}
              style={{ borderColor: C.border, color: C.ink }}
              className="border rounded-lg px-3 py-2 text-sm outline-none"
            >
              {months.map((m) => (
                <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>{monthLabel(m.year, m.month)}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onGenerate(selected.year, selected.month)}
              style={{ background: C.red }}
              className="text-white text-xs font-semibold rounded-lg px-3.5 py-2 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <FileCheck2 size={13} /> {generated ? "Regenerate Payslip" : "Generate Payslip"}
            </button>
            <button
              type="button"
              onClick={downloadPDF}
              disabled={pdfBusy}
              style={{ background: C.ink }}
              className="text-white text-xs font-semibold rounded-lg px-3.5 py-2 flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <FileCheck2 size={13} /> {pdfBusy ? "Preparing PDF\u2026" : !pdfReady ? "Loading PDF tool\u2026" : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={() => {
                const filename = `Payslip_${user.id}_${monthStr}.html`;
                const html = buildPayslipDocument(user, p, selected, payslipRef, generated?.generatedDate);
                downloadTextFile(filename, html, "text/html");
              }}
              style={{ color: C.slate, borderColor: C.border }}
              className="text-xs font-semibold border rounded-lg px-3 py-2 flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <Printer size={13} /> Download HTML (backup)
            </button>
            {user.role === "admin" && (
              <button
                type="button"
                onClick={handleGenerateAllClick}
                disabled={bulkBusy}
                style={{ color: C.slate, borderColor: C.border }}
                className="text-xs font-semibold border rounded-lg px-3 py-2 flex items-center gap-1.5 hover:opacity-80 transition-opacity disabled:opacity-60"
              >
                <Users size={13} /> {bulkBusy ? "Generating\u2026" : `Generate All (${employees.length})`}
              </button>
            )}
          </div>

          {pdfError && (
            <div style={{ color: C.red, background: "#FBE4E4" }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5">
              <AlertCircle size={13} />{pdfError}
            </div>
          )}
          {bulkDone && (
            <div style={{ color: C.green, background: C.greenSoft }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5 w-fit">
              <CheckCircle2 size={13} /> Generated payslips for all {employees.length} employees for {monthLabel(selected.year, selected.month)}.
            </div>
          )}

          <p style={{ color: C.muted }} className="text-xs -mt-2">
            Wait for the button to say "Download PDF" (not "Loading...") before tapping, especially on mobile. If it opens as a webpage instead of saving, look for a Share or Download icon in your browser's toolbar to save it — this is a setting in some phone browsers, not something the button controls. "Download HTML (backup)" is an alternative that opens a printable webpage version.
          </p>

          {generated ? (
            <div style={{ color: C.green, background: C.greenSoft }} className="text-xs font-semibold rounded-lg px-3 py-2 flex items-center gap-1.5 w-fit">
              <CheckCircle2 size={13} /> Generated on {fmtDate(generated.generatedDate)} · Ref: {generated.id}
            </div>
          ) : (
            <div style={{ color: C.gold, background: C.goldSoft }} className="text-xs font-semibold rounded-lg px-3 py-2 flex items-center gap-1.5 w-fit">
              <Info size={13} /> Not yet generated — showing a live preview. Click "Generate Payslip" to save an official copy.
            </div>
          )}

          {hasPendingItems && (
            <div style={{ color: C.amber, background: C.amberSoft }} className="text-xs rounded-lg px-3 py-2.5 flex items-start gap-1.5">
              <AlertCircle size={13} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>
                There are still items pending approval this month
                {p.annualPendingDays > 0 && ` \u2014 ${p.annualPendingDays}d Annual leave`}
                {p.sickPendingDays > 0 && ` \u2014 ${p.sickPendingDays}d Sick leave`}
                {p.unpaidPendingDays > 0 && ` \u2014 ${p.unpaidPendingDays}d Unpaid leave`}
                {p.pendingFuelTotal > 0 && ` \u2014 AED ${p.pendingFuelTotal.toFixed(2)} in fuel bills`}
                {p.pendingPettyCashTotal > 0 && ` \u2014 AED ${p.pendingPettyCashTotal.toFixed(2)} in petty cash`}
                . These will only be reflected once fully approved.
              </span>
            </div>
          )}

          <Card className="overflow-hidden">
            <div style={{ background: C.ink }} className="p-6 flex items-start justify-between flex-wrap gap-4">
              <div>
                <BrandMark size={28} light={true} />
                <div style={{ color: C.mutedLight }} className="text-xs mt-2">UNIX — Payroll Department</div>
              </div>
              <div className="text-right">
                <div style={{ color: "#fff" }} className="text-lg font-bold">PAYSLIP</div>
                <div style={{ color: C.mutedLight }} className="text-sm">{monthLabel(selected.year, selected.month)}</div>
                <div style={{ color: C.mutedLight, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs mt-1">Ref: {payslipRef}</div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid sm:grid-cols-2 gap-3 mb-6 text-xs">
                <div style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3">
                  <div style={{ color: C.muted }} className="uppercase font-semibold mb-1">Employee</div>
                  <div style={{ color: C.ink }} className="font-medium">{user.name}</div>
                  <div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="mt-0.5">{user.id} · {ROLE_LABEL[user.role]}</div>
                </div>
                <div style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3">
                  <div style={{ color: C.muted }} className="uppercase font-semibold mb-1">Pay Period</div>
                  <div style={{ color: C.ink }} className="font-medium">{monthLabel(selected.year, selected.month)}</div>
                  <div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="mt-0.5">{fmtDate(`${monthStr}-01`)} \u2013 {fmtDate(`${monthStr}-${String(p.daysInMonth).padStart(2, "0")}`)}</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-6 text-xs">
                <div style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3">
                  <div style={{ color: C.muted }} className="uppercase font-semibold mb-1">Working Days</div>
                  <div style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="font-medium">{p.workingDaysInMonth}</div>
                </div>
                <div style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3">
                  <div style={{ color: C.muted }} className="uppercase font-semibold mb-1">Days Worked</div>
                  <div style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="font-medium">{p.daysWorked}</div>
                </div>
                <div style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3">
                  <div style={{ color: C.muted }} className="uppercase font-semibold mb-1">Calendar Days</div>
                  <div style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="font-medium">{p.daysInMonth}</div>
                </div>
              </div>

              <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-2">Leave Taken This Month (Approved)</div>
              <div className="grid sm:grid-cols-3 gap-3 mb-6 text-xs">
                <div style={{ borderColor: C.borderSoft }} className="rounded-lg border p-3 flex items-center justify-between">
                  <span style={{ color: C.muted }}>Annual (paid)</span>
                  <span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="font-semibold">{p.annualDays}d</span>
                </div>
                <div style={{ borderColor: C.borderSoft }} className="rounded-lg border p-3 flex items-center justify-between">
                  <span style={{ color: C.muted }}>Sick (paid)</span>
                  <span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="font-semibold">{p.sickDays}d</span>
                </div>
                <div style={{ borderColor: p.unpaidDays > 0 ? C.red : C.borderSoft, background: p.unpaidDays > 0 ? "#FBE4E4" : "transparent" }} className="rounded-lg border p-3 flex items-center justify-between">
                  <span style={{ color: p.unpaidDays > 0 ? C.red : C.muted }}>Unpaid</span>
                  <span style={{ color: p.unpaidDays > 0 ? C.red : C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="font-semibold">{p.unpaidDays}d</span>
                </div>
              </div>

              <div style={{ borderColor: C.border }} className="border rounded-lg overflow-hidden mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div style={{ borderColor: C.border }} className="border-b sm:border-b-0 sm:border-r">
                    <div style={{ background: C.panel, borderColor: C.borderSoft }} className="border-b px-3 py-2">
                      <span style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide">Earnings</span>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: C.slate }}>Basic Salary</span>
                        <span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{p.basicSalary.toFixed(2)}</span>
                      </div>
                      {p.eligibleForFuel && (
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: C.slate }}>Fuel Reimbursement</span>
                          <span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{p.fuelExpense.toFixed(2)}</span>
                        </div>
                      )}
                      {p.eligibleForFuel && (
                        <div style={{ color: C.muted }} className="text-xs">
                          AED {p.approvedFuelTotal.toFixed(2)} in approved bills, capped at AED {p.fuelAllowance.toFixed(2)}.
                        </div>
                      )}
                      {p.pettyCashTotal > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: C.slate }}>Petty Cash Reimbursement</span>
                          <span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{p.pettyCashTotal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ background: C.panel, borderColor: C.borderSoft }} className="border-t px-3 py-2 flex items-center justify-between">
                      <span style={{ color: C.ink }} className="text-sm font-bold">Gross Earnings</span>
                      <span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-sm font-bold">AED {p.grossPay.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: C.panel, borderColor: C.borderSoft }} className="border-b px-3 py-2">
                      <span style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide">Deductions</span>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: C.slate }}>Unpaid Leave ({p.unpaidDays}d)</span>
                        <span style={{ color: p.unpaidDeduction > 0 ? C.red : C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{p.unpaidDeduction.toFixed(2)}</span>
                      </div>
                      <div style={{ color: C.muted }} className="text-xs">
                        Daily rate: AED {p.dailyRate.toFixed(2)} (Basic ÷ {p.daysInMonth} days)
                      </div>
                    </div>
                    <div style={{ background: C.panel, borderColor: C.borderSoft }} className="border-t px-3 py-2 flex items-center justify-between">
                      <span style={{ color: C.ink }} className="text-sm font-bold">Total Deductions</span>
                      <span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-sm font-bold">{p.unpaidDeduction.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: C.ink }} className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
                <span style={{ color: "#fff" }} className="text-sm font-bold uppercase tracking-wide">Net Pay</span>
                <span style={{ color: "#fff", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xl font-bold">AED {p.netPay.toFixed(2)}</span>
              </div>
              <div style={{ color: C.muted }} className="text-xs italic mt-2">{amountInWords(p.netPay)}</div>
            </div>
          </Card>

          {myPayslips.length > 0 && (
            <Card className="p-5">
              <div style={{ color: C.slate }} className="text-sm font-bold mb-3">Payslip History</div>
              <div className="space-y-2">
                {myPayslips.map((ps) => (
                  <button
                    key={ps.id}
                    type="button"
                    onClick={() => setSelected({ year: ps.year, month: ps.month })}
                    style={{ borderColor: C.borderSoft }}
                    className="w-full flex items-center justify-between border rounded-lg px-3.5 py-2.5 text-left hover:opacity-80 transition-opacity"
                  >
                    <div>
                      <div style={{ color: C.ink }} className="text-sm font-medium">{monthLabel(ps.year, ps.month)}</div>
                      <div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">Ref: {ps.id} · Generated {fmtDate(ps.generatedDate)}</div>
                    </div>
                    <span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-sm font-bold">AED {ps.snapshot.netPay.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <p style={{ color: C.muted }} className="text-xs">
            Figures are calculated automatically from approved leave, fuel bills, and petty cash for the selected month. This payslip is system generated; hence no signature or stamp is required.
          </p>
        </>
      )}
    </div>
  );
}


function PolicyAccordion({ sections, accent }) {
  const [open, setOpen] = useState(sections[0]?.n || null);
  return (
    <div className="space-y-2">
      {sections.map((s) => {
        const isOpen = open === s.n;
        return (
          <div key={s.n} style={{ borderColor: C.borderSoft }} className="border rounded-lg overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : s.n)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <span style={{ color: accent, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs font-bold w-9 shrink-0">{s.n}</span>
              <span style={{ color: C.ink }} className="text-sm font-semibold flex-1">{s.title}</span>
              <ChevronDown size={15} style={{ color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
            </button>
            {isOpen && (
              <div style={{ color: C.slate, borderColor: C.borderSoft, background: C.panel }} className="border-t px-4 py-3.5 text-sm leading-relaxed">
                {s.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2026 UAE public holidays (officially confirmed dates)               */
/* ------------------------------------------------------------------ */
const UAE_HOLIDAYS_2026 = [
  { name: "New Year's Day", startDate: "2026-01-01", endDate: "2026-01-01", note: "Gregorian calendar \u2014 fixed date." },
  { name: "Eid Al Fitr", startDate: "2026-03-19", endDate: "2026-03-22", note: "Marks the end of Ramadan. Date confirmed by the UAE moon-sighting committee." },
  { name: "Arafah Day", startDate: "2026-05-26", endDate: "2026-05-26", note: "The day preceding Eid Al Adha, one of the holiest days in Islam." },
  { name: "Eid Al Adha", startDate: "2026-05-27", endDate: "2026-05-29", note: "Festival of Sacrifice. Date confirmed by the UAE moon-sighting committee." },
  { name: "Islamic New Year", startDate: "2026-06-15", endDate: "2026-06-15", note: "First day of Muharram, marking the start of the Hijri year 1448." },
  { name: "Prophet Muhammad's Birthday", startDate: "2026-08-28", endDate: "2026-08-28", note: "Mawlid Al Nabawi, 12 Rabi\u2019 Al Awwal. Confirmed by UAE Government Media Office." },
  { name: "Commemoration Day", startDate: "2026-11-30", endDate: "2026-11-30", note: "Honours the sacrifices of UAE's fallen heroes." },
  { name: "UAE National Day", startDate: "2026-12-02", endDate: "2026-12-03", note: "Marks the formation of the United Arab Emirates in 1971." },
];

function holidayDayCount(startDate, endDate) {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  return Math.round((end - start) / 86400000) + 1;
}

function HolidaysTab() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const withStatus = UAE_HOLIDAYS_2026.map((h) => ({
    ...h,
    days: holidayDayCount(h.startDate, h.endDate),
    isPast: h.endDate < todayStr,
    isCurrent: h.startDate <= todayStr && todayStr <= h.endDate,
  }));
  const nextUp = withStatus.find((h) => !h.isPast);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Calendar" title="UAE Public Holidays 2026" icon={CalendarDays} />

      {nextUp && (
        <Card style={{ background: C.ink }} className="p-5 flex items-center gap-4">
          <div style={{ background: C.red }} className="w-11 h-11 rounded-full flex items-center justify-center shrink-0">
            <PartyPopper size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: C.mutedLight }} className="text-xs font-semibold uppercase tracking-wide">{nextUp.isCurrent ? "Current holiday" : "Next up"}</div>
            <div style={{ color: "#fff" }} className="text-base font-bold">{nextUp.name}</div>
            <div style={{ color: C.mutedLight, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs mt-0.5">
              {nextUp.startDate === nextUp.endDate ? fmtDate(nextUp.startDate) : `${fmtDate(nextUp.startDate)} \u2013 ${fmtDate(nextUp.endDate)}`}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="space-y-2">
          {withStatus.map((h) => (
            <div
              key={h.name}
              style={{ borderColor: C.borderSoft, background: h.isPast ? C.panel : C.card, opacity: h.isPast ? 0.6 : 1 }}
              className="flex flex-wrap items-center justify-between gap-3 border rounded-lg px-4 py-3"
            >
              <div>
                <div style={{ color: C.ink }} className="text-sm font-bold">{h.name}</div>
                <div style={{ color: C.muted }} className="text-xs mt-0.5">{h.note}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-sm font-semibold">
                    {h.startDate === h.endDate ? fmtDate(h.startDate) : `${fmtDate(h.startDate)} \u2013 ${fmtDate(h.endDate)}`}
                  </div>
                  <div style={{ color: C.muted }} className="text-xs text-right">{h.days} day{h.days !== 1 ? "s" : ""}</div>
                </div>
                {h.isCurrent && <StatusBadge status="approved" />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ background: C.amberSoft, borderColor: "transparent" }} className="p-4 flex items-start gap-2.5">
        <Info size={16} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
        <p style={{ color: "#6b5219" }} className="text-xs leading-relaxed">
          Islamic dates (Eid Al Fitr, Arafah Day, Eid Al Adha, Islamic New Year, and Prophet Muhammad's Birthday) are confirmed by UAE moon-sighting committees and shown here based on official government announcements for 2026. Per Company policy (Section 12.8), leave may not be intentionally combined with public holidays to extend an absence without Management approval.
        </p>
      </Card>
    </div>
  );
}

function PoliciesTab() {
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Reference" title="Company Policies" icon={FileText} />
      <Card className="p-5">
        <PolicyAccordion sections={LEAVE_POLICY_SECTIONS} accent={C.red} />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Company Profile tab                                                 */
/* ------------------------------------------------------------------ */
function CompanyProfileTab() {
  const facts = [
    { icon: Building, label: "Legal Name", value: "Unix International (UAE) \u00b7 Unix India" },
    { icon: Target, label: "Industry", value: "Mobile accessories & smart wearables" },
    { icon: CalendarClock, label: "Founded", value: "2006 (Mumbai) \u00b7 UAE arm launched 2025" },
    { icon: MapPin, label: "UAE Base", value: "Dubai, UAE \u2014 since 2025" },
    { icon: Phone, label: "UAE Contact", value: "+971-50-715-7316" },
    { icon: Globe, label: "UAE Website", value: "unix-uae.com" },
  ];

  const numbers = [
    { value: "900+", label: "Employees" },
    { value: "600+", label: "Products" },
    { value: "20,000+", label: "Retail Points" },
    { value: "100+", label: "Superstockists" },
    { value: "70%", label: "Made in India" },
  ];

  const journey = [
    { when: "Oct 2005", what: "Unix's founders meet on a cricket ground as rival players and start discussing business." },
    { when: "Jan 2007", what: "Begin importing mobile chargers from China \u2014 it quickly becomes a bestseller." },
    { when: "Sep 2008", what: "Launch batteries, cables and other mobile accessories." },
    { when: "Mar 2011", what: "First Unix factory is set up." },
    { when: "May 2014", what: "Mobile covers added to the range; production lines expanded." },
    { when: "Aug 2025", what: "Expanded into the UAE market with the launch of Unix International." },
    { when: "Dec 2025", what: "100+ superstockists, 20,000+ retail points, \u20B9100 Cr+ turnover, 70% Made in India." },
  ];

  const certifications = [
    { title: "ISO 9001 Certified", body: "Independently certified, reinforcing consistent product quality and scalable manufacturing." },
    { title: "UKAS Accredited", body: "Management systems accredited under the UKAS framework for internationally recognized quality standards." },
    { title: "D-U-N-S\u00ae Registered", body: "A Dun & Bradstreet registered brand, verified for business credibility and transparency." },
    { title: "In-House R&D", body: "A dedicated R&D team keeps every product compatible with the latest devices and rigorously tested." },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="About" title="Company Profile" icon={Building2} />

      <Card style={{ background: C.ink }} className="p-6 flex flex-col items-start gap-3">
        <BrandMark size={38} light={true} tagline />
        <p style={{ color: C.mutedLight }} className="text-sm leading-relaxed max-w-xl">
          "Powering Connections, One Device at a Time." Unix is a revolutionary force in the smart wearables and mobile accessories industry, headquartered in Mumbai since 2006. In 2025, Unix took its first step into international markets with the launch of Unix International in the UAE.
        </p>
        <span style={{ color: C.mutedLight, borderColor: "#2A2D33" }} className="text-xs border rounded-full px-2.5 py-1">100% Founder-Owned & Independent</span>
      </Card>

      <Card className="p-5">
        <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-3">Company Facts</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {facts.map((f) => (
            <div key={f.label} style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3 flex items-start gap-2.5">
              <f.icon size={15} style={{ color: C.gold, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ color: C.muted }} className="text-xs uppercase font-semibold">{f.label}</div>
                <div style={{ color: C.ink }} className="text-sm font-medium">{f.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-2">Vision</div>
          <p style={{ color: C.slate }} className="text-sm leading-relaxed">
            Be a leader for mobile accessories in the value conscious segment.
          </p>
        </Card>
        <Card className="p-5">
          <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-2">Mission</div>
          <p style={{ color: C.slate }} className="text-sm leading-relaxed">
            Achieve 10% market share in the multi brand retail market by 2026.
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-3">By The Numbers</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {numbers.map((n) => (
            <div key={n.label} style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3 text-center">
              <div style={{ color: C.red, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-lg font-bold">{n.value}</div>
              <div style={{ color: C.muted }} className="text-xs mt-0.5">{n.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-3">Our Journey</div>
        <div className="space-y-3">
          {journey.map((j, i) => (
            <div key={i} className="flex items-start gap-3">
              <span style={{ color: C.gold, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs font-bold w-20 shrink-0 pt-0.5">{j.when}</span>
              <span style={{ color: C.slate }} className="text-sm">{j.what}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-3">Quality & Innovation</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {certifications.map((c) => (
            <div key={c.title} style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={13} style={{ color: C.green }} />
                <span style={{ color: C.ink }} className="text-sm font-bold">{c.title}</span>
              </div>
              <p style={{ color: C.muted }} className="text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-3">UAE Operations</div>
        <div style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-4">
          <div style={{ color: C.ink }} className="text-sm font-bold mb-2">Unix International — UAE Expansion</div>
          <ul style={{ color: C.slate }} className="text-xs space-y-1.5 leading-relaxed">
            <li>Launched in Dubai in 2025 — the brand's first international market</li>
            <li>Full product range: earbuds, neckbands, speakers, power banks, chargers & cables</li>
            <li>Also shipping internationally to Ghana, West Africa</li>
            <li>Website: unix-uae.com · +971-50-715-7316</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Approvals tab                                                       */
/* ------------------------------------------------------------------ */
function ApprovalsTab({ user, employees, leaveRequests, resignations, fuelBills, pettyCash, onDecision, onResignationDecision, onFuelBillDecision, onPettyCashDecision }) {
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState("");
  const [resNoteFor, setResNoteFor] = useState(null);
  const [resNote, setResNote] = useState("");
  const [fuelNoteFor, setFuelNoteFor] = useState(null);
  const [fuelNote, setFuelNote] = useState("");
  const [pettyNoteFor, setPettyNoteFor] = useState(null);
  const [pettyNote, setPettyNote] = useState("");

  const actionable = leaveRequests.filter((r) => {
    const applicant = employees.find((e) => e.id === r.employeeId);
    return isActionableByCurrentUser(r, applicant, user, employees);
  });

  const actionableResignations = resignations.filter((r) => {
    const applicant = employees.find((e) => e.id === r.employeeId);
    return isActionableByCurrentUser(r, applicant, user, employees);
  });

  const actionableFuelBills = fuelBills.filter((r) => {
    const applicant = employees.find((e) => e.id === r.employeeId);
    return isActionableByCurrentUser(r, applicant, user, employees);
  });

  const actionablePettyCash = pettyCash.filter((r) => {
    const applicant = employees.find((e) => e.id === r.employeeId);
    return isActionableByCurrentUser(r, applicant, user, employees);
  });

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Workflow" title="Approvals" icon={ClipboardList} />

      <div>
        <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-2">Leave Requests</div>
        <Card className="p-5">
          {actionable.length === 0 ? (
            <div style={{ color: C.muted }} className="text-sm py-8 text-center">Nothing awaiting your decision right now.</div>
          ) : (
            <div className="space-y-3">
              {actionable.map((r) => {
                const applicant = employees.find((e) => e.id === r.employeeId);
                return (
                  <div key={r.id} style={{ borderColor: C.borderSoft }} className="border rounded-lg p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <div style={{ color: C.ink }} className="text-sm font-bold">{applicant?.name} <span style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs font-normal">({applicant?.id})</span></div>
                        <div className="mt-1"><RoleBadge role={applicant?.role} /></div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ color: C.slate }} className="text-sm mb-1"><span className="font-semibold">{r.type}</span> · {r.days} day{r.days !== 1 ? "s" : ""} · <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</span></div>
                    <div style={{ color: C.muted }} className="text-xs mb-3">{r.reason}</div>

                    {noteFor === r.id && (
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note"
                        style={{ borderColor: C.border }}
                        className="w-full border rounded-md px-2.5 py-1.5 text-xs outline-none mb-2"
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onDecision(r, "approve", note); setNoteFor(null); setNote(""); }}
                        style={{ background: C.green }}
                        className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button
                        onClick={() => { onDecision(r, "reject", note); setNoteFor(null); setNote(""); }}
                        style={{ background: C.red }}
                        className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                      <button
                        onClick={() => setNoteFor(noteFor === r.id ? null : r.id)}
                        style={{ color: C.muted, borderColor: C.border }}
                        className="text-xs font-medium px-3 py-1.5 rounded-md border"
                      >
                        {noteFor === r.id ? "Cancel note" : "Add note"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div>
        <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-2">Resignation Requests</div>
        <Card className="p-5">
          {actionableResignations.length === 0 ? (
            <div style={{ color: C.muted }} className="text-sm py-8 text-center">No resignation requests awaiting your decision.</div>
          ) : (
            <div className="space-y-3">
              {actionableResignations.map((r) => {
                const applicant = employees.find((e) => e.id === r.employeeId);
                return (
                  <div key={r.id} style={{ borderColor: C.borderSoft }} className="border rounded-lg p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <div style={{ color: C.ink }} className="text-sm font-bold">{applicant?.name} <span style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs font-normal">({applicant?.id})</span></div>
                        <div className="mt-1"><RoleBadge role={applicant?.role} /></div>
                      </div>
                      <StatusBadge status={r.status} metaMap={RESIGNATION_STATUS_META} />
                    </div>
                    <div style={{ color: C.slate }} className="text-sm mb-1">Last working day: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(r.lastWorkingDay)}</span></div>
                    <div style={{ color: C.muted }} className="text-xs mb-3">{r.reason}</div>

                    {resNoteFor === r.id && (
                      <input
                        value={resNote}
                        onChange={(e) => setResNote(e.target.value)}
                        placeholder="Optional note"
                        style={{ borderColor: C.border }}
                        className="w-full border rounded-md px-2.5 py-1.5 text-xs outline-none mb-2"
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onResignationDecision(r, "approve", resNote); setResNoteFor(null); setResNote(""); }}
                        style={{ background: C.green }}
                        className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={13} /> Accept
                      </button>
                      <button
                        onClick={() => { onResignationDecision(r, "reject", resNote); setResNoteFor(null); setResNote(""); }}
                        style={{ background: C.red }}
                        className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
                      >
                        <XCircle size={13} /> Do Not Accept
                      </button>
                      <button
                        onClick={() => setResNoteFor(resNoteFor === r.id ? null : r.id)}
                        style={{ color: C.muted, borderColor: C.border }}
                        className="text-xs font-medium px-3 py-1.5 rounded-md border"
                      >
                        {resNoteFor === r.id ? "Cancel note" : "Add note"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div>
        <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-2">Fuel Bill Claims</div>
        <Card className="p-5">
          {actionableFuelBills.length === 0 ? (
            <div style={{ color: C.muted }} className="text-sm py-8 text-center">No fuel bill claims awaiting your decision.</div>
          ) : (
            <div className="space-y-3">
              {actionableFuelBills.map((r) => {
                const applicant = employees.find((e) => e.id === r.employeeId);
                return (
                  <div key={r.id} style={{ borderColor: C.borderSoft }} className="border rounded-lg p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <div style={{ color: C.ink }} className="text-sm font-bold">{applicant?.name} <span style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs font-normal">({applicant?.id})</span></div>
                        <div className="mt-1"><RoleBadge role={applicant?.role} /></div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ color: C.slate }} className="text-sm mb-1">AED {Number(r.amount).toFixed(2)} · <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(r.date)}</span></div>
                    {r.note && <div style={{ color: C.muted }} className="text-xs mb-2">{r.note}</div>}
                    {r.receiptDataUrl && r.receiptDataUrl.startsWith("data:image") && (
                      <img src={r.receiptDataUrl} alt="Receipt" className="rounded-lg border max-h-32 mb-3" style={{ borderColor: C.borderSoft }} />
                    )}
                    {r.receiptFileName && !(r.receiptDataUrl && r.receiptDataUrl.startsWith("data:image")) && (
                      <div style={{ color: C.muted }} className="flex items-center gap-1.5 text-xs mb-3"><FileCheck2 size={13} /> {r.receiptFileName}</div>
                    )}

                    {fuelNoteFor === r.id && (
                      <input
                        value={fuelNote}
                        onChange={(e) => setFuelNote(e.target.value)}
                        placeholder="Optional note"
                        style={{ borderColor: C.border }}
                        className="w-full border rounded-md px-2.5 py-1.5 text-xs outline-none mb-2"
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onFuelBillDecision(r, "approve", fuelNote); setFuelNoteFor(null); setFuelNote(""); }}
                        style={{ background: C.green }}
                        className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button
                        onClick={() => { onFuelBillDecision(r, "reject", fuelNote); setFuelNoteFor(null); setFuelNote(""); }}
                        style={{ background: C.red }}
                        className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                      <button
                        onClick={() => setFuelNoteFor(fuelNoteFor === r.id ? null : r.id)}
                        style={{ color: C.muted, borderColor: C.border }}
                        className="text-xs font-medium px-3 py-1.5 rounded-md border"
                      >
                        {fuelNoteFor === r.id ? "Cancel note" : "Add note"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div>
        <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-2">Petty Cash Claims</div>
        <Card className="p-5">
          {actionablePettyCash.length === 0 ? (
            <div style={{ color: C.muted }} className="text-sm py-8 text-center">No petty cash claims awaiting your decision.</div>
          ) : (
            <div className="space-y-3">
              {actionablePettyCash.map((r) => {
                const applicant = employees.find((e) => e.id === r.employeeId);
                return (
                  <div key={r.id} style={{ borderColor: C.borderSoft }} className="border rounded-lg p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <div style={{ color: C.ink }} className="text-sm font-bold">{applicant?.name} <span style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs font-normal">({applicant?.id})</span></div>
                        <div className="mt-1"><RoleBadge role={applicant?.role} /></div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ color: C.slate }} className="text-sm mb-1">AED {Number(r.amount).toFixed(2)} · <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(r.date)}</span></div>
                    {r.note && <div style={{ color: C.muted }} className="text-xs mb-2">{r.note}</div>}
                    {r.receiptDataUrl && r.receiptDataUrl.startsWith("data:image") && (
                      <img src={r.receiptDataUrl} alt="Receipt" className="rounded-lg border max-h-32 mb-3" style={{ borderColor: C.borderSoft }} />
                    )}
                    {r.receiptFileName && !(r.receiptDataUrl && r.receiptDataUrl.startsWith("data:image")) && (
                      <div style={{ color: C.muted }} className="flex items-center gap-1.5 text-xs mb-3"><FileCheck2 size={13} /> {r.receiptFileName}</div>
                    )}

                    {pettyNoteFor === r.id && (
                      <input
                        value={pettyNote}
                        onChange={(e) => setPettyNote(e.target.value)}
                        placeholder="Optional note"
                        style={{ borderColor: C.border }}
                        className="w-full border rounded-md px-2.5 py-1.5 text-xs outline-none mb-2"
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onPettyCashDecision(r, "approve", pettyNote); setPettyNoteFor(null); setPettyNote(""); }}
                        style={{ background: C.green }}
                        className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button
                        onClick={() => { onPettyCashDecision(r, "reject", pettyNote); setPettyNoteFor(null); setPettyNote(""); }}
                        style={{ background: C.red }}
                        className="text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                      <button
                        onClick={() => setPettyNoteFor(pettyNoteFor === r.id ? null : r.id)}
                        style={{ color: C.muted, borderColor: C.border }}
                        className="text-xs font-medium px-3 py-1.5 rounded-md border"
                      >
                        {pettyNoteFor === r.id ? "Cancel note" : "Add note"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Team tab (supervisor: assigned staff / admin: all employees)        */
/* ------------------------------------------------------------------ */
function isOnLeaveToday(employeeId, leaveRequests) {
  const today = new Date().toISOString().slice(0, 10);
  return leaveRequests.some((r) => r.employeeId === employeeId && r.status === "approved" && r.startDate <= today && today <= r.endDate);
}

function HierarchyNode({ employee, employees, leaveRequests, depth }) {
  const children = employees.filter((e) => e.supervisorId === employee.id);
  const onLeave = isOnLeaveToday(employee.id, leaveRequests);
  return (
    <div style={{ marginLeft: depth > 0 ? 28 : 0, borderLeft: depth > 0 ? `2px solid ${C.borderSoft}` : "none", paddingLeft: depth > 0 ? 16 : 0 }}>
      <div style={{ borderColor: C.borderSoft }} className="flex items-center justify-between gap-3 border rounded-lg px-3.5 py-2.5 mb-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div style={{ background: C.ink }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
            {employee.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div style={{ color: C.ink }} className="text-sm font-bold">{employee.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">{employee.id}</span>
              <RoleBadge role={employee.role} />
            </div>
          </div>
        </div>
        <span
          style={{ color: onLeave ? C.red : C.green, background: onLeave ? "#FBE4E4" : C.greenSoft }}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
        >
          <CircleDot size={11} /> {onLeave ? "On Leave Today" : "Available"}
        </span>
      </div>
      {children.map((c) => (
        <HierarchyNode key={c.id} employee={c} employees={employees} leaveRequests={leaveRequests} depth={depth + 1} />
      ))}
    </div>
  );
}

function HierarchyTab({ employees, leaveRequests }) {
  const roots = employees.filter((e) => e.role === "admin");
  const onLeaveCount = employees.filter((e) => isOnLeaveToday(e.id, leaveRequests)).length;

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Organization" title="Company Hierarchy" icon={Network} />

      <div className="flex flex-wrap gap-4">
        <Card className="p-4 flex-1" style={{ minWidth: 200 }}>
          <div style={{ color: C.muted }} className="text-xs uppercase font-semibold mb-1">Total Employees</div>
          <div style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-2xl font-bold">{employees.length}</div>
        </Card>
        <Card className="p-4 flex-1" style={{ minWidth: 200, background: onLeaveCount > 0 ? "#FBE4E4" : C.card }}>
          <div style={{ color: onLeaveCount > 0 ? C.red : C.muted }} className="text-xs uppercase font-semibold mb-1">On Leave Today</div>
          <div style={{ color: onLeaveCount > 0 ? C.red : C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-2xl font-bold">{onLeaveCount}</div>
        </Card>
        <Card className="p-4 flex-1" style={{ minWidth: 200, background: C.greenSoft }}>
          <div style={{ color: C.green }} className="text-xs uppercase font-semibold mb-1">Available Today</div>
          <div style={{ color: C.green, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-2xl font-bold">{employees.length - onLeaveCount}</div>
        </Card>
      </div>

      <Card className="p-5">
        {roots.map((r) => (
          <HierarchyNode key={r.id} employee={r} employees={employees} leaveRequests={leaveRequests} depth={0} />
        ))}
      </Card>

      <p style={{ color: C.muted }} className="text-xs">
        Reporting lines: Promoter → Sales Executive → Sales Supervisor → Admin, and Warehouse Manager → Admin. "On Leave Today" reflects approved leave covering today's date.
      </p>
    </div>
  );
}

function EmployeeFormModal({ employee, employees, onSave, onClose }) {
  const isEdit = !!employee;
  const [form, setForm] = useState(() => ({
    name: employee?.name || "",
    dob: employee?.dob || "",
    joiningDate: employee?.joiningDate || new Date().toISOString().slice(0, 10),
    contact: employee?.contact || "",
    username: employee?.username || "",
    password: employee?.password || "",
    role: employee?.role || "promoter",
    supervisorId: employee?.supervisorId || "",
    basicSalary: employee?.basicSalary ?? ROLE_DEFAULT_SALARY.promoter,
    fuelAllowance: employee?.fuelAllowance ?? 700,
    passportNumber: employee?.passportNumber || "",
  }));
  const [error, setError] = useState("");

  const supervisorOptions = eligibleSupervisorsFor(form.role, employees, employee?.id);
  const needsSupervisor = form.role !== "admin";
  const leaveDefaults = ROLE_DEFAULT_LEAVE[form.role] || { annualAllocation: 22, sickAllocation: 12 };

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "role") {
        next.supervisorId = "";
        next.fuelAllowance = (value === "promoter" || value === "warehouse_manager") ? 0 : (f.fuelAllowance || 700);
        if (!isEdit || employee.role !== value) next.basicSalary = ROLE_DEFAULT_SALARY[value] ?? f.basicSalary;
      }
      return next;
    });
  }

  function submit() {
    setError("");
    if (!form.name.trim()) return setError("Please enter the employee's full name.");
    if (!form.dob) return setError("Please select a date of birth.");
    if (!form.joiningDate) return setError("Please select a joining date.");
    if (!form.contact.trim()) return setError("Please enter contact details.");
    if (!form.username.trim()) return setError("Please enter a username.");
    if (!form.password.trim()) return setError("Please enter a password.");
    if (needsSupervisor && !form.supervisorId) return setError(`Please assign a reporting manager for this ${ROLE_LABEL[form.role]}.`);
    const usernameTaken = employees.some((e) => e.username.toLowerCase() === form.username.trim().toLowerCase() && e.id !== employee?.id);
    if (usernameTaken) return setError("That username is already in use \u2014 please choose another.");

    const payload = {
      ...form,
      name: form.name.trim(),
      contact: form.contact.trim(),
      username: form.username.trim(),
      passportNumber: form.passportNumber.trim(),
      annualAllocation: leaveDefaults.annualAllocation,
      sickAllocation: leaveDefaults.sickAllocation,
      basicSalary: Number(form.basicSalary) || 0,
      fuelAllowance: (form.role === "promoter" || form.role === "warehouse_manager") ? 0 : Number(form.fuelAllowance) || 0,
      supervisorId: needsSupervisor ? form.supervisorId : undefined,
    };
    onSave(payload, employee?.id);
  }

  return (
    <div style={{ background: "rgba(20,22,26,0.6)" }} className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card style={{ background: "#fff" }} className="w-full max-w-lg p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <div style={{ color: C.ink }} className="text-base font-bold">{isEdit ? "Edit Employee" : "Add New Employee"}</div>
          <button type="button" onClick={onClose} style={{ color: C.muted }}><X size={18} /></button>
        </div>

        <div style={{ maxHeight: "70vh" }} className="space-y-3.5 overflow-y-auto pr-1">
          {isEdit && (
            <div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">{employee.id}</div>
          )}
          <div>
            <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Full Name</label>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} style={{ borderColor: C.border }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} style={{ borderColor: C.border }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Joining Date</label>
              <input type="date" value={form.joiningDate} onChange={(e) => update("joiningDate", e.target.value)} style={{ borderColor: C.border }} className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none" />
            </div>
          </div>

          <div>
            <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Contact Details</label>
            <input value={form.contact} onChange={(e) => update("contact", e.target.value)} placeholder="+971 5X XXX XXXX" style={{ borderColor: C.border }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
          </div>

          <div>
            <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Passport Number</label>
            <input value={form.passportNumber} onChange={(e) => update("passportNumber", e.target.value)} placeholder="e.g. N1234567" style={{ borderColor: C.border }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Username</label>
              <input value={form.username} onChange={(e) => update("username", e.target.value)} style={{ borderColor: C.border }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Password</label>
              <input value={form.password} onChange={(e) => update("password", e.target.value)} style={{ borderColor: C.border }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
            </div>
          </div>

          <div>
            <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Role</label>
            <select value={form.role} onChange={(e) => update("role", e.target.value)} style={{ borderColor: C.border }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none">
              {Object.keys(ROLE_LABEL).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>

          {needsSupervisor && (
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Reports To</label>
              <select value={form.supervisorId} onChange={(e) => update("supervisorId", e.target.value)} style={{ borderColor: C.border }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none">
                <option value="">Select a manager…</option>
                {supervisorOptions.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
              </select>
              {supervisorOptions.length === 0 && (
                <div style={{ color: C.amber }} className="text-xs mt-1">No eligible manager exists yet for this role — add one first.</div>
              )}
            </div>
          )}

          <div style={{ borderColor: C.borderSoft, background: C.panel }} className="rounded-lg border p-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div style={{ color: C.muted }} className="text-xs font-semibold uppercase tracking-wide">Leave Allocation</div>
              <div style={{ color: C.ink }} className="text-sm font-medium mt-0.5">{leaveDefaults.annualAllocation} annual · {leaveDefaults.sickAllocation} sick days/year</div>
            </div>
            <div style={{ color: C.muted, maxWidth: 200 }} className="text-xs text-right">
              Standard for {ROLE_LABEL[form.role]}. Auto-applied — sick leave unlocks after 6 months, annual after 1 year of service.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Basic Salary (AED)</label>
              <input type="number" min="0" value={form.basicSalary} onChange={(e) => update("basicSalary", e.target.value)} style={{ borderColor: C.border }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label style={{ color: C.muted }} className="block text-xs font-semibold uppercase tracking-wide mb-1">Fuel Allowance (AED)</label>
              <input
                type="number" min="0"
                value={isFuelEligible(form) ? form.fuelAllowance : 0}
                disabled={!isFuelEligible(form)}
                onChange={(e) => update("fuelAllowance", e.target.value)}
                style={{ borderColor: C.border, background: !isFuelEligible(form) ? C.panel : "#fff", color: !isFuelEligible(form) ? C.muted : C.ink }}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              />
              {!isFuelEligible(form) && <div style={{ color: C.muted }} className="text-xs mt-1">Not applicable for {ROLE_LABEL[form.role]}s</div>}
            </div>
          </div>

          {error && <div style={{ color: C.red, background: "#FBE4E4" }} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"><AlertCircle size={13} />{error}</div>}
        </div>

        <div className="flex gap-2 mt-5">
          <button type="button" onClick={submit} style={{ background: C.red }} className="flex-1 text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Save size={14} /> {isEdit ? "Save Changes" : "Create Employee"}
          </button>
          <button type="button" onClick={onClose} style={{ color: C.muted, borderColor: C.border }} className="text-sm font-semibold border rounded-lg px-4 py-2.5">
            Cancel
          </button>
        </div>
      </Card>
    </div>
  );
}

function TeamTab({ user, employees, leaveRequests, resignations, computeUsage, onAddEmployee, onUpdateEmployeeFull }) {
  const [query, setQuery] = useState("");
  const [expandedEmp, setExpandedEmp] = useState(null);
  const [modalMode, setModalMode] = useState(null); // null | "add" | employee object being edited
  const isAdmin = user.role === "admin";

  const visibleEmployees = useMemo(() => {
    let list = employees;
    if (user.role === "sales_supervisor" || user.role === "sales_executive") {
      list = getAllReports(user.id, employees);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
    }
    return list;
  }, [employees, user, query]);

  function handleSave(payload, existingId) {
    if (existingId) onUpdateEmployeeFull(existingId, payload);
    else onAddEmployee(payload);
    setModalMode(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle eyebrow={user.role === "admin" ? "Organization" : "Team"} title={user.role === "admin" ? "All Employees" : "My Team"} icon={Users} />
        {isAdmin && (
          <button
            type="button"
            onClick={() => setModalMode("add")}
            style={{ background: C.red }}
            className="text-white text-xs font-semibold rounded-lg px-3.5 py-2 flex items-center gap-1.5 hover:opacity-90 transition-opacity h-fit"
          >
            <UserPlus size={14} /> Add Employee
          </button>
        )}
      </div>

      {modalMode && (
        <EmployeeFormModal
          employee={modalMode === "add" ? null : modalMode}
          employees={employees}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
        />
      )}

      <div className="relative max-w-sm">
        <Search size={15} style={{ color: C.muted, pointerEvents: "none" }} className="absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or employee ID"
          style={{ borderColor: C.border }}
          className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
        />
      </div>

      {visibleEmployees.length === 0 ? (
        <Card className="p-8 text-center"><span style={{ color: C.muted }} className="text-sm">No employees found.</span></Card>
      ) : (
        <div className="space-y-3">
          {visibleEmployees.map((emp) => {
            const usage = computeUsage(emp.id);
            const empRequests = leaveRequests.filter((r) => r.employeeId === emp.id).sort((a, b) => (a.appliedDate < b.appliedDate ? 1 : -1));
            const empResignations = resignations.filter((r) => r.employeeId === emp.id).sort((a, b) => (a.submittedDate < b.submittedDate ? 1 : -1));
            const activeResignation = empResignations.find((r) => ["pending_supervisor", "pending_admin", "approved"].includes(r.status));
            const isOpen = expandedEmp === emp.id;
            return (
              <Card key={emp.id} className="overflow-hidden">
                <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <button onClick={() => setExpandedEmp(isOpen ? null : emp.id)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                    <div style={{ background: C.ink }} className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {emp.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <div style={{ color: C.ink }} className="text-sm font-bold truncate">{emp.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-xs">{emp.id}</span>
                        <RoleBadge role={emp.role} />
                        {activeResignation && <StatusBadge status={activeResignation.status} metaMap={RESIGNATION_STATUS_META} />}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setExpandedEmp(isOpen ? null : emp.id)} className="flex items-center gap-4">
                      <div className="text-right">
                        <div style={{ color: C.muted }} className="text-xs uppercase font-semibold">Annual left</div>
                        {isEligibleForAnnualLeave(emp) ? (
                          <div style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-sm font-bold">{emp.annualAllocation - usage.annualUsed - usage.annualPending}</div>
                        ) : (
                          <div style={{ color: C.muted }} className="text-xs font-semibold flex items-center gap-1 justify-end"><Lock size={11} /> Not yet</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div style={{ color: C.muted }} className="text-xs uppercase font-semibold">Sick left</div>
                        {isEligibleForSickLeave(emp) ? (
                          <div style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} className="text-sm font-bold">{emp.sickAllocation - usage.sickUsed - usage.sickPending}</div>
                        ) : (
                          <div style={{ color: C.muted }} className="text-xs font-semibold flex items-center gap-1 justify-end"><Lock size={11} /> Not yet</div>
                        )}
                      </div>
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setModalMode(emp)}
                        style={{ color: C.slate, borderColor: C.border }}
                        className="text-xs font-semibold border rounded-lg px-2.5 py-1.5 flex items-center gap-1 hover:opacity-80 transition-opacity"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    )}
                    <button onClick={() => setExpandedEmp(isOpen ? null : emp.id)}>
                      <ChevronDown size={15} style={{ color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderColor: C.borderSoft, background: C.panel }} className="border-t px-4 py-4">
                    <div className="grid sm:grid-cols-4 gap-3 mb-4 text-xs">
                      <div><span style={{ color: C.muted }}>Contact: </span><span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{emp.contact}</span></div>
                      <div><span style={{ color: C.muted }}>DOB: </span><span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(emp.dob)}</span></div>
                      <div><span style={{ color: C.muted }}>Joined: </span><span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{fmtDate(emp.joiningDate)}</span></div>
                      <div><span style={{ color: C.muted }}>Passport: </span><span style={{ color: C.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{emp.passportNumber || "Not on file"}</span></div>
                    </div>
                    <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-2">Leave History</div>
                    {empRequests.length === 0 ? (
                      <div style={{ color: C.muted }} className="text-xs py-3">No leave requests on record.</div>
                    ) : (
                      <div className="space-y-1.5">
                        {empRequests.map((r) => (
                          <div key={r.id} style={{ borderColor: C.borderSoft, background: C.card }} className="flex items-center justify-between border rounded-md px-3 py-2 text-xs">
                            <span style={{ color: C.ink }}>{r.type} · {r.days}d · <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: C.muted }}>{fmtDate(r.startDate)}–{fmtDate(r.endDate)}</span></span>
                            <StatusBadge status={r.status} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ color: C.slate }} className="text-xs font-bold uppercase tracking-wide mb-2 mt-4">Resignation History</div>
                    {empResignations.length === 0 ? (
                      <div style={{ color: C.muted }} className="text-xs py-3">No resignation requests on record.</div>
                    ) : (
                      <div className="space-y-1.5">
                        {empResignations.map((r) => (
                          <div key={r.id} style={{ borderColor: C.borderSoft, background: C.card }} className="flex items-center justify-between border rounded-md px-3 py-2 text-xs">
                            <span style={{ color: C.ink }}>Last day: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: C.muted }}>{fmtDate(r.lastWorkingDay)}</span></span>
                            <StatusBadge status={r.status} metaMap={RESIGNATION_STATUS_META} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequestsHub({
  user, leaveUsage, myRequests, onApplyLeave,
  myResignations, onApplyResignation, onWithdrawResignation,
  myFuelBills, onApplyFuelBill,
  myPettyCash, onApplyPettyCash,
  initialSub, onSubChange,
}) {
  const [sub, setSub] = useState(initialSub || "leave");

  function selectSub(key) {
    setSub(key);
    if (onSubChange) onSubChange(key);
  }

  const subTabs = [
    { key: "leave", label: "Leave" },
    ...(isFuelEligible(user) ? [{ key: "fuel", label: "Fuel Bill" }] : []),
    ...(isPettyCashEligible(user) ? [{ key: "petty", label: "Petty Cash" }] : []),
    { key: "resignation", label: "Resignation" },
  ];

  // If the current sub-tab isn't valid for this user (e.g. a Promoter defaulted to "petty"), fall back to Leave.
  const effectiveSub = subTabs.some((t) => t.key === sub) ? sub : "leave";

  const titleMap = { leave: "Leave", fuel: "Fuel Bill", petty: "Petty Cash", resignation: "Resignation" };
  const iconMap = { leave: Calendar, fuel: Fuel, petty: Receipt, resignation: DoorOpen };
  const ActiveIcon = iconMap[effectiveSub] || Calendar;

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Requests" title={titleMap[effectiveSub]} icon={ActiveIcon} />
      <div className="flex gap-2 flex-wrap">
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => selectSub(t.key)}
            style={{ background: effectiveSub === t.key ? C.ink : C.card, color: effectiveSub === t.key ? "#fff" : C.slate, borderColor: C.border }}
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors"
          >
            {t.label}
          </button>
        ))}
      </div>

      {effectiveSub === "leave" && (
        <LeaveTab user={user} leaveUsage={leaveUsage} myRequests={myRequests} onApply={onApplyLeave} hideTitle />
      )}
      {effectiveSub === "fuel" && isFuelEligible(user) && (
        <FuelBillsTab user={user} myFuelBills={myFuelBills} onApply={onApplyFuelBill} hideTitle />
      )}
      {effectiveSub === "petty" && isPettyCashEligible(user) && (
        <PettyCashTab user={user} myPettyCash={myPettyCash} onApply={onApplyPettyCash} hideTitle />
      )}
      {effectiveSub === "resignation" && (
        <ResignationTab user={user} myResignations={myResignations} onApply={onApplyResignation} onWithdraw={onWithdrawResignation} hideTitle />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main App                                                            */
/* ------------------------------------------------------------------ */
export default function EmployeePortal() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [resignations, setResignations] = useState([]);
  const [fuelBills, setFuelBills] = useState([]);
  const [pettyCash, setPettyCash] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const emps = await loadKey("hr-employees-v1", null);
      const reqs = await loadKey("hr-leave-requests-v1", null);
      const resigns = await loadKey("hr-resignations-v1", null);
      const fuel = await loadKey("hr-fuel-bills-v1", null);
      const petty = await loadKey("hr-petty-cash-v1", null);
      const pays = await loadKey("hr-payslips-v1", null);
      const rawEmps = emps || seedEmployees();
      const { updated: finalEmps, changed: empsBackfilled } = migrateEmployees(rawEmps);
      const finalReqs = reqs || seedLeaveRequests();
      const finalResigns = resigns || seedResignations();
      const finalFuel = fuel || seedFuelBills();
      const finalPetty = petty || seedPettyCash();
      const finalPays = pays || seedPayslips();
      setEmployees(finalEmps);
      setLeaveRequests(finalReqs);
      setResignations(finalResigns);
      setFuelBills(finalFuel);
      setPettyCash(finalPetty);
      setPayslips(finalPays);
      if (!emps || empsBackfilled) saveKey("hr-employees-v1", finalEmps);
      if (!reqs) saveKey("hr-leave-requests-v1", finalReqs);
      if (!resigns) saveKey("hr-resignations-v1", finalResigns);
      if (!fuel) saveKey("hr-fuel-bills-v1", finalFuel);
      if (!petty) saveKey("hr-petty-cash-v1", finalPetty);
      if (!pays) saveKey("hr-payslips-v1", finalPays);
      setLoading(false);
    })();
  }, []);

  const currentUser = useMemo(() => employees.find((e) => e.id === currentUserId) || null, [employees, currentUserId]);

  const computeUsage = useCallback((employeeId) => {
    const mine = leaveRequests.filter((r) => r.employeeId === employeeId);
    const sum = (type, statuses) => mine.filter((r) => r.type === type && statuses.includes(r.status)).reduce((a, r) => a + r.days, 0);
    return {
      annualUsed: sum("Annual", ["approved"]),
      annualPending: sum("Annual", ["pending_supervisor", "pending_admin"]),
      sickUsed: sum("Sick", ["approved"]),
      sickPending: sum("Sick", ["pending_supervisor", "pending_admin"]),
    };
  }, [leaveRequests]);

  function handleLogin(emp) {
    setCurrentUserId(emp.id);
    setActiveTab("overview");
  }
  function handleLogout() {
    setCurrentUserId(null);
    setActiveTab("overview");
  }

  function handleApply({ type, startDate, endDate, days, reason }) {
    const status = routeStatusFor(currentUser);
    const newReq = {
      id: `LR-${Date.now()}`,
      employeeId: currentUser.id,
      type, startDate, endDate, days, reason,
      status,
      appliedDate: new Date().toISOString().slice(0, 10),
      history: [{ action: "Submitted", by: currentUser.name, date: new Date().toISOString().slice(0, 10) }],
    };
    const updated = [newReq, ...leaveRequests];
    setLeaveRequests(updated);
    saveKey("hr-leave-requests-v1", updated);
  }

  function handleDecision(request, action, note) {
    const today = new Date().toISOString().slice(0, 10);
    const applicant = employees.find((e) => e.id === request.employeeId);
    const updated = leaveRequests.map((r) => {
      if (r.id !== request.id) return r;
      const newStatus = advanceApprovalStatus(r.status, applicant?.role, action);
      const actionLabel = approvalActionLabel(r.status, action);
      const historyEntry = { action: actionLabel, by: currentUser.name, date: today };
      if (note && note.trim()) historyEntry.note = note.trim();
      return { ...r, status: newStatus, history: [...r.history, historyEntry] };
    });
    setLeaveRequests(updated);
    saveKey("hr-leave-requests-v1", updated);
  }

  function handleApplyResignation({ lastWorkingDay, reason }) {
    const status = routeStatusFor(currentUser);
    const today = new Date().toISOString().slice(0, 10);
    const newReq = {
      id: `RS-${Date.now()}`,
      employeeId: currentUser.id,
      lastWorkingDay, reason,
      status,
      submittedDate: today,
      history: [{ action: "Submitted", by: currentUser.name, date: today }],
    };
    const updated = [newReq, ...resignations];
    setResignations(updated);
    saveKey("hr-resignations-v1", updated);
  }

  function handleWithdrawResignation(request) {
    const today = new Date().toISOString().slice(0, 10);
    const updated = resignations.map((r) => {
      if (r.id !== request.id) return r;
      return { ...r, status: "withdrawn", history: [...r.history, { action: "Withdrawn by Employee", by: currentUser.name, date: today }] };
    });
    setResignations(updated);
    saveKey("hr-resignations-v1", updated);
  }

  function handleResignationDecision(request, action, note) {
    const today = new Date().toISOString().slice(0, 10);
    const applicant = employees.find((e) => e.id === request.employeeId);
    const updated = resignations.map((r) => {
      if (r.id !== request.id) return r;
      const newStatus = advanceApprovalStatus(r.status, applicant?.role, action);
      const actionLabel = action === "reject" ? "Not accepted" : approvalActionLabel(r.status, action);
      const historyEntry = { action: actionLabel, by: currentUser.name, date: today };
      if (note && note.trim()) historyEntry.note = note.trim();
      return { ...r, status: newStatus, history: [...r.history, historyEntry] };
    });
    setResignations(updated);
    saveKey("hr-resignations-v1", updated);
  }

  function handleApplyFuelBill({ date, amount, note, receiptDataUrl, receiptFileName }) {
    const status = routeStatusFor(currentUser);
    const today = new Date().toISOString().slice(0, 10);
    const newBill = {
      id: `FB-${Date.now()}`,
      employeeId: currentUser.id,
      date, amount, note, receiptDataUrl, receiptFileName,
      status,
      submittedDate: today,
      history: [{ action: "Submitted", by: currentUser.name, date: today }],
    };
    const updated = [newBill, ...fuelBills];
    setFuelBills(updated);
    saveKey("hr-fuel-bills-v1", updated);
  }

  function handleFuelBillDecision(request, action, note) {
    const today = new Date().toISOString().slice(0, 10);
    const applicant = employees.find((e) => e.id === request.employeeId);
    const updated = fuelBills.map((r) => {
      if (r.id !== request.id) return r;
      const newStatus = advanceApprovalStatus(r.status, applicant?.role, action);
      const actionLabel = approvalActionLabel(r.status, action);
      const historyEntry = { action: actionLabel, by: currentUser.name, date: today };
      if (note && note.trim()) historyEntry.note = note.trim();
      return { ...r, status: newStatus, history: [...r.history, historyEntry] };
    });
    setFuelBills(updated);
    saveKey("hr-fuel-bills-v1", updated);
  }

  function handleApplyPettyCash({ date, amount, note, receiptDataUrl, receiptFileName }) {
    const status = routeStatusFor(currentUser);
    const today = new Date().toISOString().slice(0, 10);
    const newClaim = {
      id: `PC-${Date.now()}`,
      employeeId: currentUser.id,
      date, amount, note, receiptDataUrl, receiptFileName,
      status,
      submittedDate: today,
      history: [{ action: "Submitted", by: currentUser.name, date: today }],
    };
    const updated = [newClaim, ...pettyCash];
    setPettyCash(updated);
    saveKey("hr-petty-cash-v1", updated);
  }

  function handlePettyCashDecision(request, action, note) {
    const today = new Date().toISOString().slice(0, 10);
    const applicant = employees.find((e) => e.id === request.employeeId);
    const updated = pettyCash.map((r) => {
      if (r.id !== request.id) return r;
      const newStatus = advanceApprovalStatus(r.status, applicant?.role, action);
      const actionLabel = approvalActionLabel(r.status, action);
      const historyEntry = { action: actionLabel, by: currentUser.name, date: today };
      if (note && note.trim()) historyEntry.note = note.trim();
      return { ...r, status: newStatus, history: [...r.history, historyEntry] };
    });
    setPettyCash(updated);
    saveKey("hr-petty-cash-v1", updated);
  }

  function handleGeneratePayslip(year, month) {
    const pad = (n) => String(n).padStart(2, "0");
    const monthStr = `${year}-${pad(month)}`;
    const snapshot = calculatePayslip(currentUser, year, month, leaveRequests, fuelBills, pettyCash);
    const today = new Date().toISOString().slice(0, 10);
    const existing = payslips.find((ps) => ps.employeeId === currentUser.id && ps.monthStr === monthStr);
    const record = {
      id: existing ? existing.id : `PS-${currentUser.id}-${monthStr}`,
      employeeId: currentUser.id,
      year, month, monthStr,
      generatedDate: today,
      generatedBy: currentUser.name,
      snapshot,
    };
    const updated = existing
      ? payslips.map((ps) => (ps.id === existing.id ? record : ps))
      : [record, ...payslips];
    setPayslips(updated);
    saveKey("hr-payslips-v1", updated);
  }

  function handleGenerateAllPayslips(year, month) {
    const pad = (n) => String(n).padStart(2, "0");
    const monthStr = `${year}-${pad(month)}`;
    const today = new Date().toISOString().slice(0, 10);
    let updated = [...payslips];
    employees.forEach((emp) => {
      const snapshot = calculatePayslip(emp, year, month, leaveRequests, fuelBills, pettyCash);
      const existing = updated.find((ps) => ps.employeeId === emp.id && ps.monthStr === monthStr);
      const record = {
        id: existing ? existing.id : `PS-${emp.id}-${monthStr}`,
        employeeId: emp.id,
        year, month, monthStr,
        generatedDate: today,
        generatedBy: currentUser.name,
        snapshot,
      };
      updated = existing ? updated.map((ps) => (ps.id === existing.id ? record : ps)) : [record, ...updated];
    });
    setPayslips(updated);
    saveKey("hr-payslips-v1", updated);
  }

  function handleUpdateContact(employeeId, contact) {
    const updated = employees.map((e) => (e.id === employeeId ? { ...e, contact } : e));
    setEmployees(updated);
    saveKey("hr-employees-v1", updated);
  }

  function handleChangePassword(employeeId, newPassword) {
    const updated = employees.map((e) => (e.id === employeeId ? { ...e, password: newPassword } : e));
    setEmployees(updated);
    saveKey("hr-employees-v1", updated);
  }

  function handleAddEmployee(payload) {
    const newEmp = { id: generateEmployeeId(payload.role, employees), ...payload };
    const updated = [...employees, newEmp];
    setEmployees(updated);
    saveKey("hr-employees-v1", updated);
  }

  function handleUpdateEmployeeFull(employeeId, payload) {
    const updated = employees.map((e) => (e.id === employeeId ? { ...e, ...payload } : e));
    setEmployees(updated);
    saveKey("hr-employees-v1", updated);
  }

  if (loading) {
    return (
      <div style={{ background: C.ink }} className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <BrandMark size={30} light={true} />
          <span style={{ color: C.mutedLight }} className="text-xs">Loading portal…</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen employees={employees} onLogin={handleLogin} />;
  }

  const myRequests = leaveRequests.filter((r) => r.employeeId === currentUser.id).sort((a, b) => (a.appliedDate < b.appliedDate ? 1 : -1));
  const myResignations = resignations.filter((r) => r.employeeId === currentUser.id).sort((a, b) => (a.submittedDate < b.submittedDate ? 1 : -1));
  const myFuelBills = fuelBills.filter((r) => r.employeeId === currentUser.id).sort((a, b) => (a.submittedDate < b.submittedDate ? 1 : -1));
  const myPettyCash = pettyCash.filter((r) => r.employeeId === currentUser.id).sort((a, b) => (a.submittedDate < b.submittedDate ? 1 : -1));
  const leaveUsage = computeUsage(currentUser.id);

  let teamCount = 0;
  if (currentUser.role === "admin") teamCount = employees.length;
  else if (currentUser.role === "sales_supervisor" || currentUser.role === "sales_executive") teamCount = getAllReports(currentUser.id, employees).length;

  const countActionable = (list) => list.filter((r) => {
    const applicant = employees.find((e) => e.id === r.employeeId);
    return isActionableByCurrentUser(r, applicant, currentUser, employees);
  }).length;

  const pendingForMe = ["sales_executive", "sales_supervisor", "admin"].includes(currentUser.role)
    ? countActionable(leaveRequests) + countActionable(resignations) + countActionable(fuelBills) + countActionable(pettyCash)
    : 0;

  return (
    <div style={{ background: C.panel, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }} className="min-h-screen w-full flex">
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        pendingCount={pendingForMe}
      />

      <div className="flex-1 min-w-0">
        <div style={{ background: C.card, borderColor: C.border }} className="border-b px-5 py-3.5 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <button type="button" onClick={() => setActiveTab("overview")} className="hover:opacity-80 transition-opacity">
            <BrandMark size={22} light={false} />
          </button>
          <button onClick={() => setMobileOpen(true)} style={{ color: C.ink }}><Menu size={20} /></button>
        </div>

        <main className="p-5 sm:p-8 max-w-6xl mx-auto">
          {!supabaseConfigured && (
            <div style={{ color: "#6b5219", background: C.amberSoft, borderColor: "transparent" }} className="rounded-xl border p-3.5 mb-5 flex items-start gap-2.5 text-xs">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                <strong>Local-only mode:</strong> Supabase isn't configured yet, so data is stored only in this browser and won't sync across devices or users.
                See the README for a 5-minute setup to enable shared, multi-device data.
              </span>
            </div>
          )}
          {activeTab === "overview" && (
            <OverviewTab user={currentUser} employees={employees} leaveUsage={leaveUsage} myRequests={myRequests} teamCount={teamCount} pendingForMe={pendingForMe} setActiveTab={setActiveTab} />
          )}
          {activeTab === "profile" && (
            <ProfileTab user={currentUser} employees={employees} onUpdateContact={handleUpdateContact} onChangePassword={handleChangePassword} />
          )}
          {activeTab === "requests" && (
            <RequestsHub
              user={currentUser}
              leaveUsage={leaveUsage} myRequests={myRequests} onApplyLeave={handleApply}
              myResignations={myResignations} onApplyResignation={handleApplyResignation} onWithdrawResignation={handleWithdrawResignation}
              myFuelBills={myFuelBills} onApplyFuelBill={handleApplyFuelBill}
              myPettyCash={myPettyCash} onApplyPettyCash={handleApplyPettyCash}
            />
          )}
          {activeTab === "payslip" && (
            <PayslipTab user={currentUser} employees={employees} leaveRequests={leaveRequests} fuelBills={fuelBills} pettyCash={pettyCash} payslips={payslips} onGenerate={handleGeneratePayslip} onGenerateAll={handleGenerateAllPayslips} />
          )}
          {activeTab === "holidays" && <HolidaysTab />}
          {activeTab === "policies" && <PoliciesTab />}
          {activeTab === "company" && <CompanyProfileTab />}
          {activeTab === "approvals" && ["sales_executive", "sales_supervisor", "admin"].includes(currentUser.role) && (
            <ApprovalsTab user={currentUser} employees={employees} leaveRequests={leaveRequests} resignations={resignations} fuelBills={fuelBills} pettyCash={pettyCash} onDecision={handleDecision} onResignationDecision={handleResignationDecision} onFuelBillDecision={handleFuelBillDecision} onPettyCashDecision={handlePettyCashDecision} />
          )}
          {activeTab === "team" && ["sales_executive", "sales_supervisor", "admin"].includes(currentUser.role) && (
            <TeamTab user={currentUser} employees={employees} leaveRequests={leaveRequests} resignations={resignations} computeUsage={computeUsage} onAddEmployee={handleAddEmployee} onUpdateEmployeeFull={handleUpdateEmployeeFull} />
          )}
          {activeTab === "hierarchy" && currentUser.role === "admin" && (
            <HierarchyTab employees={employees} leaveRequests={leaveRequests} />
          )}
        </main>
      </div>
    </div>
  );
}
