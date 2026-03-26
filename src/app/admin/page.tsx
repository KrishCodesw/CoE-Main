import AdminPanelClient from "./AdminPanelClient";

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

function getAdminTokenFromCookies(): string | null {
  if (typeof document === "undefined") return null;
  const token = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("admin_access_token="))
    ?.split("=")[1];
  return token ? decodeURIComponent(token) : null;
}

export default async function AdminPage() {
  // This app currently stores the access token client-side after login.
  // To reuse the same auth mechanism on /admin, we read the token in client code.
  // Server rendering still provides the page shell; data fetch happens only with token.
  return (
    <AdminBootstrap />
  );
}

function AdminBootstrap() {
  const token = getAdminTokenFromCookies();

  if (!token) {
    return (
      <main className="max-w-3xl mx-auto px-4 md:px-8 pt-[120px] pb-12 min-h-screen">
        <div className="border border-[#c4c6d3] bg-white p-6 md:p-8">
          <h1 className="font-headline text-3xl text-[#002155]">Admin Access Required</h1>
          <p className="mt-3 text-[#434651]">
            Please login first, then set an access token cookie named <strong>admin_access_token</strong>.
          </p>
          <p className="mt-2 text-sm text-[#434651]">
            Example in browser console after admin login:
          </p>
          <pre className="mt-2 text-xs bg-[#f5f4f0] p-3 border border-[#e3e2df] overflow-x-auto">
{`document.cookie = "admin_access_token=" + encodeURIComponent(localStorage.getItem("accessToken") || "") + "; path=/";`}
          </pre>
        </div>
      </main>
    );
  }

  return <AdminDataLoader token={token} />;
}

async function AdminDataLoader({ token }: { token: string }) {
  try {
    const [stats, pendingBookings, pendingFaculty, users] = await Promise.all([
      fetchAdmin<Stats>("/api/admin/stats", token),
      fetchAdmin<Booking[]>("/api/admin/bookings?status=PENDING", token),
      fetchAdmin<AdminUser[]>("/api/admin/users?role=FACULTY&status=PENDING", token),
      fetchAdmin<AdminUser[]>("/api/admin/users", token),
    ]);

    return (
      <AdminPanelClient
        token={token}
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
