export type ProfileVisibility = "public" | "private";

export type ProfileRecord = {
  id: string;
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  location: string | null;
  visibility: ProfileVisibility;
  created_at: string;
  updated_at: string;
};

export type CertificateRecord = {
  id: string;
  course_id: string;
  certificate_number: string;
  verification_code: string;
  issued_at: string;
  courses?: { title: string; slug: string } | null;
};

export type ProgressRecord = {
  id: string;
  status: "not_started" | "in_progress" | "completed";
  percent_complete: number;
  completed_at: string | null;
  last_accessed_at: string;
  courses?: { title: string; slug: string } | null;
  lessons?: { title: string; slug: string } | null;
};

export type ProjectRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  repository_url: string | null;
  demo_url: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  created_at: string;
};
