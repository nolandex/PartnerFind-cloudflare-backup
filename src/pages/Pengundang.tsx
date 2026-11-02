import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Halaman Pengundang PartnerFind — tampilan website umum, ringkas &
// minimalis. Isi mengikuti program pengundang resmi (sama seperti bot
// Telegram @Partnerfindreal_bot): langkah, aturan imbalan hingga 20%,
// pesan undangan siap salin, dan kontak admin untuk penarikan imbalan.
// Section "Testimoni Pengundang" berisi kejadian ASLI yang dicatat
// admin (bergabung, tarik dana, review) dari /api/inviter-events.

const ADMIN_WA =
  "https://wa.me/6289691685228?text=Halo%20admin%20PartnerFind%2C%20saya%20mau%20tarik%20imbalan%20%2F%20bertanya";
const SITE_LINK = "https://partnerfind.ai.id";
const BOT_LINK = "https://t.me/Partnerfindreal_bot";

const INVITE_TEXT =
  "PartnerFind menghubungkan pencari peluang penghasilan dengan pemberi peluang.\n\n" +
  `Daftar lewat situs kami: ${SITE_LINK}`;

const STEPS = [
  "Buat grup WhatsApp bernama PartnerFind.",
  "Undang orang terdekatmu.",
  "Kirim pesan undangan di bawah ini ke grupmu.",
  "Minta anggota grup ikut membagikannya ke kenalan mereka.",
  "Grup penuh? Buat grup baru.",
];

type InvEvent = {
  id: number;
  type: string;
  name: string;
  amount: number | null;
  text: string | null;
  created_at: string;
};

function formatWaktu(at: string) {
  const iso = at.includes("T") ? at : at.replace(" ", "T") + "Z";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return at;
  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d) + " WIB"
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/45">
      {children}
    </h2>
  );
}

function TestimoniSection() {
  const [events, setEvents] = useState<InvEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch("/api/inviter-events")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j) setEvents(j.events || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const label = (t: string) =>
    t === "join" ? "Bergabung" : t === "withdraw" ? "Tarik Dana" : "Review";

  return (
    <section className="mt-12">
      <SectionTitle>Testimoni Pengundang</SectionTitle>
      {!loaded ? (
        <p className="mt-4 text-sm text-foreground/50">Memuat…</p>
      ) : events.length === 0 ? (
        <p className="mt-4 leading-relaxed text-foreground/65">
          Belum ada testimoni pengundang. Jadilah pengundang pertama — buat
          grupmu dan mulai undang orang terdekatmu.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="rounded-xl border border-border/60 bg-card/30 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">
                  {label(ev.type)}
                </span>
                <span className="text-xs text-foreground/40">
                  {formatWaktu(ev.created_at)}
                </span>
              </div>
              {ev.type === "join" && (
                <p className="mt-2 leading-relaxed">
                  <span className="font-semibold">{ev.name}</span> bergabung
                  sebagai pengundang.
                </p>
              )}
              {ev.type === "withdraw" && (
                <p className="mt-2 leading-relaxed">
                  <span className="font-semibold">{ev.name}</span> menarik
                  imbalan sebesar{" "}
                  <span className="font-semibold">
                    Rp{(ev.amount || 0).toLocaleString("id-ID")}
                  </span>
                  .
                </p>
              )}
              {ev.type.startsWith("review") && (
                <p className="mt-2 leading-relaxed">
                  “{ev.text}”{" "}
                  <span className="text-foreground/50">— {ev.name}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Pengundang() {
  const [copied, setCopied] = useState(false);

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="mx-auto max-w-xl px-5 py-10 sm:py-14">
        <header className="flex items-center justify-between">
          <span className="text-base font-black tracking-tight">PartnerFind</span>
          <Link to="/" className="text-sm text-foreground/50 transition-colors hover:text-foreground">
            Beranda
          </Link>
        </header>

        <h1 className="mt-14 text-3xl font-bold tracking-tight">Program Pengundang</h1>
        <p className="mt-3 leading-relaxed text-foreground/65">
          Buat grup WhatsApp bernama PartnerFind dan undang orang yang kamu kenal.
          Jika mereka sepakat dan menghasilkan, kamu menerima bagian hingga 20%
          dari hasilnya.
        </p>

        <section className="mt-12">
          <SectionTitle>Cara Kerja</SectionTitle>
          <ol className="mt-4 space-y-2.5">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span className="w-5 shrink-0 text-right font-semibold text-foreground/35">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <SectionTitle>Aturan</SectionTitle>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/80">
            <li>Biaya daftar terserah pendaftar.</li>
            <li>
              Jika orang yang kamu undang sepakat dan menghasilkan, kamu dapat
              bagian sampai 20% dari hasilnya.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <SectionTitle>Pesan Undangan</SectionTitle>
          <div className="mt-4 whitespace-pre-line rounded-xl border border-border/60 bg-card/30 p-4 text-[15px] leading-relaxed">
            {INVITE_TEXT}
          </div>
          <button
            type="button"
            onClick={copyInvite}
            className="mt-3 inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-semibold transition-colors hover:bg-card"
          >
            {copied ? "Tersalin ✓" : "Salin Pesan"}
          </button>
        </section>

        <section className="mt-12">
          <SectionTitle>Tarik Imbalan</SectionTitle>
          <div className="mt-4">
            <a
              href={ADMIN_WA}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "hsl(var(--brand-accent))" }}
            >
              Chat Admin
            </a>
          </div>
          <p className="mt-4 text-sm text-foreground/50">
            Program yang sama di Telegram:{" "}
            <a href={BOT_LINK} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">
              @Partnerfindreal_bot
            </a>
          </p>
        </section>

        <TestimoniSection />

        <footer className="mt-16 border-t border-border/60 pt-5 text-xs text-foreground/40">
          © 2026 PartnerFind
        </footer>
      </div>
    </div>
  );
}
