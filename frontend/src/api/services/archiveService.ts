// src/api/services/archiveService.ts
import api from "../api";

export interface ArchiveExhibition {
  exhibition_id: number;
  title: string;
  banner_url: string;
  live_stream_url: string | null;
  created_at: string;
}

export interface ArchiveApplication {
  application_id: number;
  full_name: string;
  email: string;
  institution?: string;
  research_purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  access_link?: string;
  admin_notes?: string;
  expires_at?: string;
  created_at: string;
}

class ArchiveService {
  // Public: fetch completed exhibitions (archive list)
  async getPublicArchive(): Promise<ArchiveExhibition[]> {
    const res = await api.get("/archive/public");
    return res.data.data;
  }

  // Public: submit an application (no auth required)
  async submitApplication(data: {
    full_name: string;
    email: string;
    institution?: string;
    research_purpose: string;
  }): Promise<{ application_id: number; message: string }> {
    const res = await api.post("/archive/apply", data);
    return res.data;
  }

  // Public: check application status by email (optional)
  async checkStatus(email: string): Promise<ArchiveApplication[]> {
    const res = await api.get(
      `/archive/status?email=${encodeURIComponent(email)}`,
    );
    return res.data.data;
  }

  // Admin: get all applications
  async getAllApplications(): Promise<ArchiveApplication[]> {
    const res = await api.get("/archive/admin/applications");
    return res.data.data;
  }

  // Admin: update application (approve/reject, add link, notes)
  async updateApplication(
    id: number,
    data: Partial<{
      status: "APPROVED" | "REJECTED";
      access_link: string;
      admin_notes: string;
      expires_at: string;
    }>,
  ): Promise<any> {
    const res = await api.put(`/archive/admin/applications/${id}`, data);
    return res.data;
  }
}

export default new ArchiveService();
