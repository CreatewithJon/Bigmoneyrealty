export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-white/90 tracking-tight"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Appointments
        </h1>
        <p
          className="text-sm text-white/40 mt-0.5"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          Scheduled showings and client meetings
        </p>
      </div>
      <div className="bg-[#111] border border-dashed border-white/[0.08] rounded-xl p-12 text-center">
        <p className="text-white/25 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
          Appointments module — coming soon
        </p>
        <p className="text-white/15 text-xs mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
          Calendar and scheduling integration
        </p>
      </div>
    </div>
  )
}
