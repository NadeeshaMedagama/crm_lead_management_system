"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  addLeadNote,
  createLead,
  deleteLead,
  getDashboard,
  getLeadDetail,
  getLeads,
  login,
  setAuthToken,
  updateLead,
  updateLeadStatus,
} from "@/lib/api";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants";
import { DashboardStats, Lead, LeadSource, LeadStatus } from "@/types/crm";

type LeadFilters = {
  status: LeadStatus | "";
  leadSource: LeadSource | "";
  assignedSalesperson: string;
  search: string;
};

const emptyStats: DashboardStats = {
  totalLeads: 0,
  newLeads: 0,
  qualifiedLeads: 0,
  wonLeads: 0,
  lostLeads: 0,
  totalEstimatedDealValue: 0,
  totalWonDealValue: 0,
};

const blankLead = {
  leadName: "",
  companyName: "",
  email: "",
  phoneNumber: "",
  leadSource: "Website" as LeadSource,
  assignedSalesperson: "",
  status: "New" as LeadStatus,
  estimatedDealValue: 0,
};

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [leadForm, setLeadForm] = useState(blankLead);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadDates, setSelectedLeadDates] = useState<{ createdAt: string; updatedAt: string } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<{ content: string; createdBy: string; createdAt: string }[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({
    status: "",
    leadSource: "",
    assignedSalesperson: "",
    search: "",
  });

  const salespeople = useMemo(
    () => [...new Set(leads.map((lead) => lead.assignedSalesperson).filter(Boolean))],
    [leads]
  );

  const loadData = useCallback(async (nextFilters: LeadFilters = filters) => {
    try {
      const [leadData, dashboardData] = await Promise.all([getLeads(nextFilters), getDashboard()]);
      setLeads(leadData);
      setStats(dashboardData);
      setError("");
    } catch {
      setError("Failed to load CRM data. Please try again.");
    }
  }, [filters]);

  useEffect(() => {
    const storedToken = localStorage.getItem("crm_token");
    if (storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [token, loadData]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(email, password);
      setToken(response.token);
      localStorage.setItem("crm_token", response.token);
      setAuthToken(response.token);
      await loadData();
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("crm_token");
    setToken(null);
    setAuthToken(null);
    setLeads([]);
    setStats(emptyStats);
    setSelectedLead(null);
    setSelectedLeadDates(null);
    setNotes([]);
    setNoteText("");
  };

  const handleSaveLead = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedLead) {
      await createLead(leadForm);
    } else {
      await updateLead(selectedLead._id, leadForm);
    }
    setLeadForm(blankLead);
    setSelectedLead(null);
    await loadData();
  };

  const handleSelectLead = async (lead: Lead) => {
    setSelectedLead(lead);
    setLeadForm({
      leadName: lead.leadName,
      companyName: lead.companyName,
      email: lead.email,
      phoneNumber: lead.phoneNumber,
      leadSource: lead.leadSource,
      assignedSalesperson: lead.assignedSalesperson,
      status: lead.status,
      estimatedDealValue: lead.estimatedDealValue,
    });
    const detail = await getLeadDetail(lead._id);
    setNotes(detail.notes);
    setSelectedLeadDates({ createdAt: detail.createdAt, updatedAt: detail.updatedAt });
  };

  const handleAddNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedLead || !noteText.trim()) return;
    await addLeadNote(selectedLead._id, noteText.trim());
    setNoteText("");
    const detail = await getLeadDetail(selectedLead._id);
    setNotes(detail.notes);
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <form
          className="mx-auto mt-24 max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30"
          onSubmit={handleLogin}
        >
          <h1 className="mb-4 text-2xl font-bold text-slate-100">CRM Login</h1>
          <p className="mb-4 text-sm text-slate-400">Use admin@example.com / password123</p>
          <div className="mb-3">
            <label className="mb-1 block text-sm text-slate-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-100 outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-100 outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-2 font-medium text-white transition hover:bg-blue-500"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">CRM Lead Management</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
        {error && <p className="rounded-lg border border-red-800 bg-red-950 p-2 text-sm text-red-300">{error}</p>}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <p className="text-xs text-slate-400">{key}</p>
              <p className="text-xl font-semibold">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <form className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4" onSubmit={handleSaveLead}>
            <h2 className="text-lg font-semibold">{selectedLead ? "Edit Lead" : "Create Lead"}</h2>
            <input className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Lead Name" value={leadForm.leadName} onChange={(e) => setLeadForm({ ...leadForm, leadName: e.target.value })} required />
            <input className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Company Name" value={leadForm.companyName} onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })} required />
            <input className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Email" type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} required />
            <input className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Phone Number" value={leadForm.phoneNumber} onChange={(e) => setLeadForm({ ...leadForm, phoneNumber: e.target.value })} required />
            <select className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={leadForm.leadSource} onChange={(e) => setLeadForm({ ...leadForm, leadSource: e.target.value as LeadSource })}>
              {LEAD_SOURCES.map((source) => <option key={source}>{source}</option>)}
            </select>
            <input className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Assigned Salesperson" value={leadForm.assignedSalesperson} onChange={(e) => setLeadForm({ ...leadForm, assignedSalesperson: e.target.value })} required />
            <select className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={leadForm.status} onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value as LeadStatus })}>
              {LEAD_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
            <input className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Estimated Deal Value" type="number" min={0} value={leadForm.estimatedDealValue} onChange={(e) => setLeadForm({ ...leadForm, estimatedDealValue: Number(e.target.value) })} required />
            <div className="flex gap-2">
              <button className="rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-500" type="submit">{selectedLead ? "Update Lead" : "Create Lead"}</button>
              {selectedLead && (
                <button
                  className="rounded-lg bg-slate-700 px-3 py-2 text-white transition hover:bg-slate-600"
                  type="button"
                  onClick={() => {
                    setSelectedLead(null);
                    setSelectedLeadDates(null);
                    setLeadForm(blankLead);
                    setNotes([]);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-2 text-lg font-semibold">Lead Notes</h2>
            {selectedLead ? (
              <>
                <p className="mb-2 text-sm text-slate-400">Selected: {selectedLead.leadName}</p>
                {selectedLeadDates && (
                  <p className="mb-3 text-xs text-slate-400">
                    Created: {new Date(selectedLeadDates.createdAt).toLocaleString()} • Last Updated:{" "}
                    {new Date(selectedLeadDates.updatedAt).toLocaleString()}
                  </p>
                )}
                <form onSubmit={handleAddNote} className="mb-3 space-y-2">
                  <textarea className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Add note" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                  <button className="rounded-lg bg-emerald-600 px-3 py-2 text-white transition hover:bg-emerald-500">Add Note</button>
                </form>
                <div className="max-h-64 space-y-2 overflow-auto">
                  {notes.map((note) => (
                    <div
                      key={`${note.createdAt}-${note.content}`}
                      className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm"
                    >
                      <p className="mb-1">{note.content}</p>
                      <p className="text-xs text-slate-400">
                        {note.createdBy} • {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Select a lead from the table to view/add notes.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-lg font-semibold">Leads</h2>
          <div className="mb-4 grid gap-2 md:grid-cols-4">
            <input className="rounded-lg border border-slate-700 bg-slate-950 p-2" placeholder="Search name, company, email" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <select className="rounded-lg border border-slate-700 bg-slate-950 p-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as LeadStatus | "" })}>
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
            <select className="rounded-lg border border-slate-700 bg-slate-950 p-2" value={filters.leadSource} onChange={(e) => setFilters({ ...filters, leadSource: e.target.value as LeadSource | "" })}>
              <option value="">All sources</option>
              {LEAD_SOURCES.map((source) => <option key={source}>{source}</option>)}
            </select>
            <select className="rounded-lg border border-slate-700 bg-slate-950 p-2" value={filters.assignedSalesperson} onChange={(e) => setFilters({ ...filters, assignedSalesperson: e.target.value })}>
              <option value="">All salespeople</option>
              {salespeople.map((person) => <option key={person}>{person}</option>)}
            </select>
          </div>
          <button className="mb-4 rounded-lg bg-slate-700 px-3 py-2 text-white transition hover:bg-slate-600" onClick={() => void loadData(filters)}>
            Apply Filters
          </button>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-300">
                  <th className="p-2">Lead</th><th className="p-2">Company</th><th className="p-2">Status</th><th className="p-2">Source</th><th className="p-2">Salesperson</th><th className="p-2">Value</th><th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-t border-slate-800">
                    <td className="p-2">{lead.leadName}</td>
                    <td className="p-2">{lead.companyName}</td>
                    <td className="p-2">
                      <select className="rounded border border-slate-700 bg-slate-950 px-2 py-1" value={lead.status} onChange={(e) => void updateLeadStatus(lead._id, e.target.value as LeadStatus).then(() => loadData(filters))}>
                        {LEAD_STATUSES.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="p-2">{lead.leadSource}</td>
                    <td className="p-2">{lead.assignedSalesperson}</td>
                    <td className="p-2">{lead.estimatedDealValue}</td>
                    <td className="p-2 space-x-2">
                      <button className="rounded bg-indigo-600 px-2 py-1 text-white transition hover:bg-indigo-500" onClick={() => void handleSelectLead(lead)}>View/Edit</button>
                      <button className="rounded bg-red-600 px-2 py-1 text-white transition hover:bg-red-500" onClick={() => void deleteLead(lead._id).then(() => loadData(filters))}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
