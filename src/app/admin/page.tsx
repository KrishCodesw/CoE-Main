import Link from "next/link";
import { cookies } from "next/headers";
import AdminPanelClient from "./AdminPanelClient";
import { verifyAccessToken } from "@/lib/jwt";

type AdminApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BookingStudent = {
  id: number;
  name: string;
  email: string;
  uid: string | null;
};

type Booking = {
  id: number;
  purpose: string;
  date: string;
  timeSlot: string;
  lab: string;
  facilities: string[];
  status: string;
  adminNote: string | null;
  createdAt: string;
  student: BookingStudent;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  uid: string | null;
  isVerified: boolean;
  status: string;
  createdAt: string;
};

type Stats = {
  totalStudents: number;
  totalFaculty: number;
  pendingBookings: number;
  confirmedBookings: number;
  activeGrants: number;
  newsCount: number;
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function fetchAdmin<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const payload = (await res.json()) as AdminApiResponse<T>;
  if (!res.ok || !payload?.success) {
    throw new Error(payload?.message || "Admin request failed");
  }

  return payload.data;
}

function AdminMessage({ title, body, actionLabel, actionHref }: { title: string; body: string; actionLabel?: string; actionHref?: string }) {
  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 pt-[120px] pb-12 min-h-screen">
      <div className="border border-[#c4c6d3] bg-white p-6 md:p-8">
        <h1 className="font-headline text-3xl text-[#002155]">{title}</h1>
        <p className="mt-3 text-[#434651]">{body}</p>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex mt-6 bg-[#002155] text-white px-5 py-3 text-xs font-bold uppercase tracking-widest"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </main>
  );
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return (
      <AdminMessage
        title="Admin Access Required"
        body="Please login with an admin account to continue."
        actionLabel="Go to Login"
        actionHref="/login"
      />
    );
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.role !== "ADMIN") {
      return (
        <AdminMessage
          title="Insufficient Permissions"
          body="Your account does not have admin access."
          actionLabel="Go to Login"
          actionHref="/login"
        />
      );
    }
  } catch {
    return (
      <AdminMessage
        title="Session Expired"
        body="Your session has expired. Please login again."
        actionLabel="Go to Login"
        actionHref="/login"
      />
    );
  }

  try {
    const [stats, pendingBookings, pendingFaculty, users] = await Promise.all([
      fetchAdmin<Stats>("/api/admin/stats", token),
      fetchAdmin<Booking[]>("/api/admin/bookings?status=PENDING", token),
      fetchAdmin<AdminUser[]>("/api/admin/users?role=FACULTY&status=PENDING", token),
      fetchAdmin<AdminUser[]>("/api/admin/users", token),
    ]);

    return (
      <AdminPanelClient
        stats={stats}
        pendingBookings={pendingBookings}
        pendingFaculty={pendingFaculty}
        users={users}
      />
    );
  } catch (err) {
    return (
      <main className="max-w-3xl mx-auto px-4 md:px-8 pt-[120px] pb-12 min-h-screen">
        <div className="border border-red-300 bg-red-50 p-6 md:p-8">
          <h1 className="font-headline text-3xl text-[#002155]">Admin Panel Error</h1>
          <p className="mt-3 text-red-700 text-sm">
            {err instanceof Error ? err.message : "Could not load admin data."}
          </p>
        </div>
      </main>
    );
  }
}
