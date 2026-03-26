"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

type FacultyUser = {
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

type AdminPanelClientProps = {
  stats: Stats;
  pendingBookings: Booking[];
  pendingFaculty: FacultyUser[];
  users: FacultyUser[];
};

const apiCall = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    credentials: "include",
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.message || "Request failed");
  }
  return payload;
};

export default function AdminPanelClient({
  stats,
  pendingBookings,
  pendingFaculty,
  users,
}: AdminPanelClientProps) {
  const router = useRouter();

  const [busyBookingId, setBusyBookingId] = useState<number | null>(null);
  const [busyFacultyId, setBusyFacultyId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const recentUsers = useMemo(() => users.slice(0, 12), [users]);

  const handleConfirmBooking = async (id: number) => {
    try {
      setErrorMessage("");
      setStatusMessage("");
      setBusyBookingId(id);
      await apiCall(`/api/admin/bookings/${id}/confirm`, { method: "PATCH" });
      setStatusMessage(`Booking #${id} confirmed.`);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not confirm booking.");
    } finally {
      setBusyBookingId(null);
    }
  };

  const handleRejectBooking = async (id: number) => {
    const adminNote = window.prompt("Optional rejection note for the student:", "") ?? "";

    try {
      setErrorMessage("");
      setStatusMessage("");
      setBusyBookingId(id);
      await apiCall(`/api/admin/bookings/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ adminNote }),
      });
      setStatusMessage(`Booking #${id} rejected.`);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not reject booking.");
    } finally {
      setBusyBookingId(null);
    }
  };

  const handleApproveFaculty = async (id: number) => {
    try {
      setErrorMessage("");
      setStatusMessage("");
      setBusyFacultyId(id);
      await apiCall(`/api/admin/faculty/${id}/approve`, { method: "PATCH" });
      setStatusMessage(`Faculty user #${id} approved.`);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not approve faculty user.");
    } finally {
      setBusyFacultyId(null);
    }
  };

  const handleRejectFaculty = async (id: number) => {
    try {
      setErrorMessage("");
      setStatusMessage("");
      setBusyFacultyId(id);
      await apiCall(`/api/admin/faculty/${id}/reject`, { method: "PATCH" });
      setStatusMessage(`Faculty user #${id} rejected.`);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not reject faculty user.");
    } finally {
      setBusyFacultyId(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 pt-[120px] pb-14 min-h-screen">
      <header className="mb-8 border-l-4 border-[#002155] pl-4 md:pl-6">
        <h1 className="font-headline text-3xl md:text-[40px] font-bold tracking-tight text-[#002155] leading-none">
          Admin Control Room
        </h1>
        <p className="mt-2 text-[#434651] max-w-3xl font-body">
          Review pending booking requests, approve faculty registrations, and track platform metrics.
        </p>
      </header>

      {statusMessage ? (
        <p className="mb-4 border border-green-300 bg-green-50 text-green-800 px-4 py-3 text-sm">
          {statusMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mb-4 border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {errorMessage}
        </p>
      ) : null}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <div className="border border-[#c4c6d3] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#434651] font-label">Total Students</p>
          <p className="mt-2 text-3xl font-bold text-[#002155]">{stats.totalStudents}</p>
        </div>
        <div className="border border-[#c4c6d3] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#434651] font-label">Total Faculty</p>
          <p className="mt-2 text-3xl font-bold text-[#002155]">{stats.totalFaculty}</p>
        </div>
        <div className="border border-[#c4c6d3] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#434651] font-label">Pending Bookings</p>
          <p className="mt-2 text-3xl font-bold text-[#8c4f00]">{stats.pendingBookings}</p>
        </div>
        <div className="border border-[#c4c6d3] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#434651] font-label">Confirmed Bookings</p>
          <p className="mt-2 text-3xl font-bold text-[#002155]">{stats.confirmedBookings}</p>
        </div>
        <div className="border border-[#c4c6d3] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#434651] font-label">Active Grants</p>
          <p className="mt-2 text-3xl font-bold text-[#002155]">{stats.activeGrants}</p>
        </div>
        <div className="border border-[#c4c6d3] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#434651] font-label">Visible News Posts</p>
          <p className="mt-2 text-3xl font-bold text-[#002155]">{stats.newsCount}</p>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-2xl text-[#002155]">Pending Bookings</h2>
          <span className="text-xs uppercase tracking-widest text-[#434651] font-label">
            {pendingBookings.length} requests
          </span>
        </div>

        {pendingBookings.length === 0 ? (
          <p className="border border-dashed border-[#c4c6d3] bg-white p-6 text-[#434651]">No pending bookings.</p>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <article key={booking.id} className="border border-[#c4c6d3] bg-white p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#002155]">
                      #{booking.id} • {booking.lab} • {new Date(booking.date).toLocaleDateString()} • {booking.timeSlot}
                    </p>
                    <p className="mt-1 text-sm text-[#434651]">{booking.purpose}</p>
                    <p className="mt-2 text-xs text-[#434651]">
                      Student: {booking.student.name} ({booking.student.email})
                    </p>
                    {booking.facilities?.length ? (
                      <p className="mt-1 text-xs text-[#434651]">
                        Facilities: {booking.facilities.join(", ")}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleConfirmBooking(booking.id)}
                      disabled={busyBookingId === booking.id}
                      className="bg-[#002155] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:bg-opacity-50"
                    >
                      {busyBookingId === booking.id ? "Working..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => handleRejectBooking(booking.id)}
                      disabled={busyBookingId === booking.id}
                      className="border border-[#ba1a1a] text-[#ba1a1a] px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-2xl text-[#002155]">Pending Faculty Approvals</h2>
          <span className="text-xs uppercase tracking-widest text-[#434651] font-label">
            {pendingFaculty.length} pending
          </span>
        </div>

        {pendingFaculty.length === 0 ? (
          <p className="border border-dashed border-[#c4c6d3] bg-white p-6 text-[#434651]">No pending faculty approvals.</p>
        ) : (
          <div className="space-y-4">
            {pendingFaculty.map((faculty) => (
              <article key={faculty.id} className="border border-[#c4c6d3] bg-white p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#002155]">
                      #{faculty.id} • {faculty.name}
                    </p>
                    <p className="mt-1 text-xs text-[#434651]">{faculty.email}</p>
                    {faculty.phone ? <p className="text-xs text-[#434651]">{faculty.phone}</p> : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApproveFaculty(faculty.id)}
                      disabled={busyFacultyId === faculty.id}
                      className="bg-[#002155] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:bg-opacity-50"
                    >
                      {busyFacultyId === faculty.id ? "Working..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleRejectFaculty(faculty.id)}
                      disabled={busyFacultyId === faculty.id}
                      className="border border-[#ba1a1a] text-[#ba1a1a] px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-2xl text-[#002155]">Recent Users</h2>
          <span className="text-xs uppercase tracking-widest text-[#434651] font-label">{users.length} total</span>
        </div>

        <div className="overflow-x-auto border border-[#c4c6d3] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f4f0] text-[#434651] uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Verified</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-t border-[#e3e2df]">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{user.status}</td>
                  <td className="px-4 py-3">{user.isVerified ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
