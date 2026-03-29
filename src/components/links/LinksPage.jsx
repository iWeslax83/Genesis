import { FiExternalLink, FiGithub, FiMonitor, FiFileText, FiArrowLeft} from 'react-icons/fi';
import { FaGoogleDrive } from "react-icons/fa6";

const LINKS = [
  {
    id: 'app',
    title: 'Canlı Uygulama',
    description: 'GENESIS simülasyonunu tarayıcıda çalıştır',
    icon: FiMonitor,
    gradient: 'from-[#5b8def] to-[#4a7cd8]',
    url: 'https://genesis-nu-flame.vercel.app/',
  },
  {
    id: 'pptx',
    title: 'PowerPoint Sunumu',
    description: 'Proje tanıtım sunumu — PPTX',
    icon: FiFileText,
    gradient: 'from-[#d4903a] to-[#c07e2e]',
    url: "https://docs.google.com/presentation/d/1iFJ6-2ah1kDQG7Gi3x75rMn0hSuBRcml/edit?usp=sharing&ouid=105007010425965348442&rtpof=true&sd=true",
  },
    {
    id: 'github',
    title: 'GitHub Deposu',
    description: 'Kaynak kod ve dokümantasyon',
    icon: FiGithub,
    gradient: 'from-[#8b7fc7] to-[#7265b0]',
    url: 'https://github.com/iWeslax83/genesis',
  },
  {
    id: 'drive',
    title: 'Google Drive Klasörü',
    description: 'Tarayıcıda interaktif sunum',
    icon: FaGoogleDrive,
    gradient: 'from-[#4a9caa] to-[#3d8a97]',
    url: 'https://drive.google.com/drive/folders/1hF8gZKVExMpuf0qPAkp4gXFx5NZzfVkm?usp=drive_link',
  },
];

/* Inline SVG plant/leaf decorations */
function FloatingLeaf({ className, style }) {
  return (
    <svg viewBox="0 0 40 60" fill="none" className={className} style={style}>
      <path
        d="M20 58 C20 58 4 42 4 24 C4 8 20 2 20 2 C20 2 36 8 36 24 C36 42 20 58 20 58Z"
        fill="currentColor" fillOpacity="0.07"
      />
      <path d="M20 56 L20 10" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.8" />
      <path d="M20 20 C14 16 8 18 8 18" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.6" />
      <path d="M20 30 C26 26 32 28 32 28" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.6" />
      <path d="M20 40 C14 36 8 38 8 38" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.6" />
    </svg>
  );
}

function Sprout({ className, style }) {
  return (
    <svg viewBox="0 0 30 50" fill="none" className={className} style={style}>
      <path d="M15 48 L15 22" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" strokeLinecap="round" />
      <path d="M15 28 C8 20 2 22 2 16 C2 10 10 8 15 16" fill="currentColor" fillOpacity="0.06" />
      <path d="M15 22 C22 14 28 16 28 10 C28 4 20 2 15 10" fill="currentColor" fillOpacity="0.06" />
    </svg>
  );
}

function DNAHelix({ className, style }) {
  return (
    <svg viewBox="0 0 20 80" fill="none" className={className} style={style}>
      {[0, 16, 32, 48, 64].map((y) => (
        <g key={y}>
          <ellipse cx="10" cy={y + 4} rx="8" ry="3" stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.6" />
          <line x1="4" y1={y + 4} x2="16" y2={y + 4} stroke="currentColor" strokeOpacity="0.04" strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

function Star({ cx, cy, r, opacity, delay }) {
  return (
    <circle cx={cx} cy={cy} r={r} fill="white" opacity={opacity}>
      <animate attributeName="opacity" values={`${opacity};${opacity * 0.3};${opacity}`} dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  );
}

function LinkButton({ link, index }) {
  const Icon = link.icon;
  const isPlaceholder = !link.url;

  const inner = (
    <div
      className={`group relative flex items-center gap-4 w-full px-5 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
        isPlaceholder
          ? 'border-white/5 bg-white/[0.03] opacity-40 cursor-default'
          : 'border-white/10 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 cursor-pointer'
      }`}
      style={{ animationDelay: `${index * 100 + 300}ms` }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
          {link.title}
        </div>
        <div className="text-[11px] text-white/40 truncate">{link.description}</div>
      </div>
      {isPlaceholder ? (
        <span className="text-[14px] text-white/20 italic whitespace-nowrap">Yakında</span>
      ) : (
        <FiExternalLink size={14} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
      )}
    </div>
  );

  if (isPlaceholder) return <div className="animate-fade-in-up">{inner}</div>;

  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className="block animate-fade-in-up">
      {inner}
    </a>
  );
}

export default function LinksPage() {
  return (
    <div className="min-h-screen w-full bg-[#060810] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Stars background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <Star cx="10%" cy="8%" r={1} opacity={0.4} delay={0} />
        <Star cx="25%" cy="15%" r={0.6} opacity={0.3} delay={1.2} />
        <Star cx="80%" cy="5%" r={0.8} opacity={0.35} delay={0.5} />
        <Star cx="65%" cy="12%" r={0.5} opacity={0.25} delay={2} />
        <Star cx="90%" cy="20%" r={0.7} opacity={0.3} delay={0.8} />
        <Star cx="5%" cy="30%" r={0.6} opacity={0.2} delay={1.5} />
        <Star cx="50%" cy="3%" r={0.9} opacity={0.3} delay={0.3} />
        <Star cx="35%" cy="22%" r={0.5} opacity={0.2} delay={2.5} />
        <Star cx="75%" cy="85%" r={0.7} opacity={0.25} delay={1} />
        <Star cx="15%" cy="90%" r={0.6} opacity={0.2} delay={1.8} />
        <Star cx="92%" cy="75%" r={0.5} opacity={0.3} delay={0.7} />
        <Star cx="42%" cy="92%" r={0.8} opacity={0.2} delay={2.2} />
        <Star cx="58%" cy="88%" r={0.5} opacity={0.15} delay={1.3} />
      </svg>

      {/* Main planet glow */}
      <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(75,160,90,0.08) 0%, rgba(91,141,239,0.04) 40%, transparent 70%)' }}
      />

      {/* Secondary ambient glow */}
      <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(74,156,170,0.06) 0%, transparent 60%)' }}
      />
      <div className="absolute top-[60%] left-[-8%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,127,199,0.05) 0%, transparent 60%)' }}
      />

      {/* Floating botanical decorations */}
      <FloatingLeaf className="absolute text-emerald-400 w-12 top-[10%] left-[8%] rotate-[-15deg] opacity-60" />
      <FloatingLeaf className="absolute text-emerald-500 w-16 bottom-[15%] right-[6%] rotate-[20deg] opacity-50" />
      <FloatingLeaf className="absolute text-green-400 w-10 top-[55%] left-[4%] rotate-[35deg] opacity-40" />
      <Sprout className="absolute text-emerald-400 w-8 bottom-[20%] left-[12%] opacity-50" />
      <Sprout className="absolute text-green-400 w-10 top-[18%] right-[10%] rotate-[10deg] opacity-40" />
      <Sprout className="absolute text-emerald-500 w-6 bottom-[35%] right-[15%] rotate-[-8deg] opacity-35" />
      <DNAHelix className="absolute text-blue-400 w-5 top-[25%] right-[5%] opacity-40" />
      <DNAHelix className="absolute text-purple-400 w-4 bottom-[25%] left-[6%] opacity-30" />

      {/* Ground soil gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(80,50,20,0.08) 0%, transparent 100%)' }}
      />

      {/* Horizon line */}
      <div className="absolute bottom-20 left-[10%] right-[10%] h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(78,173,91,0.08) 30%, rgba(74,156,170,0.06) 70%, transparent)' }}
      />

      {/* Back to app */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.location.reload(); }}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-white/25 hover:text-white/60 transition-colors z-20"
      >
        <FiArrowLeft size={14} />
        <span>Simülasyona dön</span>
      </a>

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Profile header */}
        <div className="text-center animate-fade-in-up space-y-3">
          <div className="relative w-20 h-20 mx-auto">
            {/* Orbit ring */}
            <div className="absolute inset-[-8px] rounded-full border border-white/[0.04] animate-[spin_20s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
            </div>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-[#5b8def] to-[#4a9caa] flex items-center justify-center shadow-2xl shadow-emerald-500/15">
              <span className="text-3xl font-bold text-white">G</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">GENESIS</h1>
            <p className="text-xs text-white/35 mt-1 max-w-[280px] mx-auto leading-relaxed">
              Kapalı Döngü Uzay Tarımı Yaşam Destek Sistemi Simülatörü
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3">
          {LINKS.map((link, i) => (
            <LinkButton key={link.id} link={link} index={i} />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-white/10 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          GENESIS &middot; ESA MELiSSA Tabanlı BLSS Simülasyonu
        </div>
      </div>
    </div>
  );
}
