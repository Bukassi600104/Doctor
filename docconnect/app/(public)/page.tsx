/* eslint-disable @next/next/no-img-element */
/**
 * DocConnect Homepage — inside (public) layout so it shares the consistent navbar/footer.
 */
import Link from "next/link"
import {
  Stethoscope, MessageSquare, Users, Pill,
  UserPlus, Search, Video, Star, ArrowRight, CalendarPlus,
} from "lucide-react"

const IMG_HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDjKvmmDJuNW7At9sG2OaFNKhRPAAVzG7sQSnO6WqZ7j4msB1GGXsI9QJxxb-G7gEbyzS7EF0ClYLPJBN1hk8sCSL_LlTC_47Fi0ClDOG_mv8UmT-y4Qa-DnMopsab74r55UQqsP6AkibmzBIlWcZ9MiVu_PaovQ1v7a6lrb8VB0FlDJ_PUVPelzxCOQu-btdpjUcM2xbs4nLoMtoRzFcAwDTRYIUvkwU1-YxjQ2WsuOkaJtz_0AAhJwV8VHFjWWotWoWrSDygaFgmg"

const DOCTORS = [
  {
    name: "Dr. Tunde Adebayo",
    specialty: "General Practitioner",
    rating: 4.9,
    reviews: 120,
    rate: "₦5,000",
    status: "online" as const,
    slug: "dr-tunde-adebayo",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwsoQJm5T_pLf1jR57Dow3hL_C4vbpE5t4aSS87Vr4RQqhpq4kBQm7sZIqZSqyMul5sUlJxyEL6Lyp99vY6NBIHxNJiaIBcFCMI26hS2NY6U-4Gwf7iJnMKz52g2pZBYSr744yugA0_CFoMe61KiNJiaxtWYvJZka5Sh3Ia3ZNyLRIHYM4EFeagsp6QC0Yt0k9VPz3uBd7c_jgP2jRRl0h72ehZGebkHKOzb9trQkssA1asxUh3H9iOOmRtiMqdIEQpAH7rUrm9aRV",
  },
  {
    name: "Dr. Chioma Okafor",
    specialty: "Cardiologist",
    rating: 5.0,
    reviews: 85,
    rate: "₦12,000",
    status: "online" as const,
    slug: "dr-chioma-okafor",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBciAu_di7htkpn6yBtTWjqa_TmsUVDr0JwxNHOsVqlU3y-mTKyRF-eOZp33KhM-yMbhlPTsSchCcFhPC4p-fixpvdlkrVA1GVlvL9VBOut_wFPyq0airuQQypsKSHI4XwUIaYqE2GsfMgp6uKiXd8vLjFaEBGlSNfE6iwKk530j8cQ_pWRmOeeLJ0QzE7OcImch102v1kNnqz-C5zK06uwCIg9UOV1M-gFNVi4PRHtKTElYu4G4NbTjjHJcTZYh1MdqhoFbzomvO6i",
  },
  {
    name: "Dr. Yusuf Ibrahim",
    specialty: "Pediatrician",
    rating: 4.8,
    reviews: 210,
    rate: "₦6,500",
    status: "busy" as const,
    slug: "dr-yusuf-ibrahim",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk4j0LCfB8xClsqb1_PZS3sNGhh8uccexYH9V-aTwdUZpDHWhxs4iG7jkqP8zbYDGAZxwkmmO9rszLPIevinQdNAg9sWWv3L16s2W3oKGY9jjzk1ktXFRhsEhlCkTRxQ-cz2vURpfdyb6qGGJ-cGYBhr-KloY3HN9azwlZYzWK1U3tOiAk08QTCtCNr2hgFDeX9W6uoIoBP2dC0SCzt4nw1Juc8kUQJhN3qS8O5fao1dSPeGwO15V3Su2tcNnqP-BZqcYclXdV7jWD",
  },
  {
    name: "Dr. Amara Nnadi",
    specialty: "Dermatologist",
    rating: 4.9,
    reviews: 156,
    rate: "₦7,000",
    status: "online" as const,
    slug: "dr-amara-nnadi",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3DXqyrT8dZPkadL7_Zsr7fnTWA-2YbKYjbtDqczzjvioISY9u8h4_kr9e69yrZJN6Bndwil9zxNqAQOB5RnqTQWx-aLob-h9AXqAD2fSsWAH1jy87AEb2-KjzcTl8CeS638HBB9F-oHr7LNokwgJA0wx3ue2rSzGH8-T3D2aQAprLhbaogpYbpfJunSb-5-1jHJ1s8SoOUJmt6jJMKTl9vzvWiO7DZ5mpLt0TOTFE3dmPTUUUwIdqV8amVWcbaKSg7E61CEvVDuzD",
  },
]

const STATUS_CONFIG = {
  online: { dot: "bg-green-500", text: "text-green-600", label: "Available Now", pulse: true },
  busy:   { dot: "bg-amber-400", text: "text-amber-500", label: "Busy",          pulse: false },
  offline:{ dot: "bg-slate-400", text: "text-slate-500", label: "Offline",       pulse: false },
}

export default function LandingPage() {
  return (
    <div className="bg-[#F8F5F0] text-slate-900 overflow-x-hidden">
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-[1280px] px-4 md:px-10 py-8 md:py-12 flex flex-col gap-12">

          {/* ── Hero ── */}
          <div className="flex flex-col gap-6 md:gap-10">
            <div className="flex flex-col max-w-[800px] gap-4">
              <h1 className="text-slate-900 text-4xl md:text-6xl font-black leading-[1.1] tracking-[-0.02em] font-display">
                Healthcare, Delivered to{" "}
                <br />
                <span className="text-[#0C6B4E] italic">Every Nigerian</span>
              </h1>
              <p className="text-slate-600 text-lg md:text-xl font-normal leading-relaxed max-w-[600px]">
                Premium telemedicine connecting you with verified specialists instantly. Quality care without the queue.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <Link href="/doctors"
                  className="flex items-center justify-center rounded-lg h-12 px-6 bg-[#0C6B4E] text-white text-base font-bold leading-normal hover:bg-[#0C6B4E]/90 transition-colors shadow-md">
                  Find a Doctor
                </Link>
                <Link href="/register"
                  className="flex items-center justify-center rounded-lg h-12 px-6 bg-white border border-slate-300 text-slate-900 text-base font-bold leading-normal hover:bg-slate-50 transition-colors">
                  Book Consultation
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl relative bg-slate-200">
              <img
                src={IMG_HERO}
                alt="Confident Nigerian female doctor smiling in a modern bright clinic setting"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#D4A017] size-2 rounded-full animate-pulse" />
                  <span className="text-sm font-medium tracking-wide uppercase">Live Network</span>
                </div>
                <p className="text-lg font-medium opacity-90">Connecting Lagos, Abuja, &amp; Beyond</p>
              </div>
            </div>
          </div>

          {/* ── Stats Bar ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 -mt-16 md:-mt-20 relative z-10 px-2">
            {[
              { icon: Stethoscope,   label: "Active Doctors",  value: "500+"  },
              { icon: MessageSquare, label: "Consultations",   value: "12k+"  },
              { icon: Users,         label: "Happy Patients",  value: "10k+"  },
              { icon: Pill,          label: "Specialties",     value: "45+"   },
            ].map((s) => (
              <div key={s.label}
                className="flex flex-col gap-3 rounded-xl p-6 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="size-10 rounded-full bg-[#0C6B4E]/10 flex items-center justify-center text-[#0C6B4E] mb-1">
                  <s.icon size={22} />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-slate-900 text-3xl font-bold font-display">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── How It Works ── */}
          <div id="how-it-works" className="py-16 md:py-24">
            <div className="flex flex-col items-center text-center gap-4 mb-16">
              <h2 className="text-slate-900 text-3xl md:text-5xl font-bold font-display">How It Works</h2>
              <p className="text-slate-600 text-lg max-w-2xl">
                Getting medical care has never been easier. Follow these three simple steps to connect with a specialist.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-slate-200 -z-10" />
              {[
                { icon: UserPlus, label: "Create Account",    desc: "Sign up in minutes. Verify your identity securely and build your health profile." },
                { icon: Search,   label: "Choose Specialist", desc: "Browse verified doctors by specialty, rating, and availability. Book instantly." },
                { icon: Video,    label: "Get Consulted",     desc: "High-quality video consultation. Get your digital prescription immediately." },
              ].map((step, i) => (
                <div key={step.label} className="flex flex-col items-center text-center gap-6 group">
                  <div className="size-24 rounded-full bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center relative z-10 group-hover:border-[#0C6B4E] transition-colors duration-300">
                    <div className="size-20 rounded-full bg-[#0C6B4E]/5 flex items-center justify-center text-[#0C6B4E]">
                      <step.icon size={40} />
                    </div>
                    <div className="absolute -top-2 -right-2 size-8 bg-[#D4A017] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 px-4">
                    <h3 className="text-slate-900 text-xl font-bold font-display">{step.label}</h3>
                    <p className="text-slate-600 text-base">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Meet Our Specialists ── */}
          <div className="w-full" id="for-doctors">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-slate-900 text-3xl md:text-4xl font-bold font-display mb-2">
                  Meet Our Specialists
                </h2>
                <p className="text-slate-600">Top-rated doctors available for consultation today.</p>
              </div>
              <Link href="/doctors"
                className="hidden md:flex items-center gap-1 text-[#0C6B4E] font-bold hover:text-[#D4A017] transition-colors">
                View all doctors <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DOCTORS.map((doc) => {
                const sc = STATUS_CONFIG[doc.status]
                return (
                  <Link key={doc.slug} href={`/doctors/${doc.slug}`}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col no-underline">
                    <div className="p-6 flex flex-col items-center gap-4 border-b border-slate-100 bg-slate-50/50">
                      <div className="relative">
                        <div className="size-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                          <img src={doc.img} alt={`Portrait of ${doc.name}`}
                            className="w-full h-full object-cover" />
                        </div>
                        <div className={`absolute bottom-0 right-0 size-5 ${sc.dot} border-2 border-white rounded-full`} title={sc.label} />
                      </div>
                      <div className="text-center">
                        <h3 className="text-slate-900 font-bold text-lg font-display">{doc.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0C6B4E]/10 text-[#0C6B4E] mt-1">
                          {doc.specialty}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-4 grow justify-between">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Star size={18} className="text-[#D4A017] fill-[#D4A017]" />
                          <span className="font-bold text-slate-900">{doc.rating.toFixed(1)}</span>
                          <span className="text-slate-400">({doc.reviews})</span>
                        </div>
                        <div className={`flex items-center gap-1 ${sc.text} text-xs font-bold uppercase tracking-wide`}>
                          <span className={`size-2 rounded-full ${sc.dot} ${sc.pulse ? "animate-pulse" : ""}`} />
                          {sc.label}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-medium uppercase">Per Session</span>
                          <span className="text-slate-900 font-bold">{doc.rate}</span>
                        </div>
                        <div className="bg-slate-900 text-white rounded-lg p-2 hover:bg-[#0C6B4E] transition-colors cursor-pointer">
                          <CalendarPlus size={20} />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-8 flex justify-center md:hidden">
              <Link href="/doctors" className="flex items-center gap-1 text-[#0C6B4E] font-bold hover:text-[#D4A017] transition-colors">
                View all doctors <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* ── CTA Section ── */}
          <div className="w-full bg-slate-900 rounded-3xl overflow-hidden relative mt-16 text-white p-8 md:p-16 flex flex-col items-center text-center gap-6">
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
            />
            <h2 className="text-3xl md:text-5xl font-bold font-display relative z-10 text-white">
              Ready to prioritize your health?
            </h2>
            <p className="text-slate-300 max-w-xl text-lg relative z-10">
              Join thousands of Nigerians accessing world-class healthcare from the comfort of their homes.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-2 relative z-10">
              <Link href="/register"
                className="flex items-center justify-center rounded-lg h-12 px-8 bg-[#0C6B4E] text-white text-base font-bold leading-normal hover:bg-[#0C6B4E]/90 transition-colors shadow-lg">
                Get Started Now
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
