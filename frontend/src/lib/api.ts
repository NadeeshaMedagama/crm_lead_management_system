import axios from "axios";
import { DashboardStats, Lead, LeadDetail, LeadSource, LeadStatus, Note } from "@/types/crm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export async function login(email: string, password: string) {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data as { token: string; user: { id: string; email: string; name: string } };
}

export async function getLeads(filters?: {
  status?: LeadStatus | "";
  leadSource?: LeadSource | "";
  assignedSalesperson?: string;
  search?: string;
}) {
  const params = Object.fromEntries(
    Object.entries(filters || {}).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const response = await apiClient.get("/leads", { params });
  return response.data as Lead[];
}

export async function createLead(payload: Omit<Lead, "_id" | "createdAt" | "updatedAt">) {
  const response = await apiClient.post("/leads", payload);
  return response.data as Lead;
}

export async function updateLead(id: string, payload: Omit<Lead, "_id" | "createdAt" | "updatedAt">) {
  const response = await apiClient.put(`/leads/${id}`, payload);
  return response.data as Lead;
}

export async function deleteLead(id: string) {
  await apiClient.delete(`/leads/${id}`);
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const response = await apiClient.patch(`/leads/${id}/status`, { status });
  return response.data as Lead;
}

export async function getLeadDetail(id: string) {
  const response = await apiClient.get(`/leads/${id}`);
  return response.data as LeadDetail;
}

export async function addLeadNote(id: string, content: string) {
  const response = await apiClient.post(`/leads/${id}/notes`, { content });
  return response.data as Note;
}

export async function getDashboard() {
  const response = await apiClient.get("/dashboard");
  return response.data as DashboardStats;
}
