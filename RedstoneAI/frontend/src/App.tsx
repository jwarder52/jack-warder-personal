import { useState, useRef, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import styles from "./App.module.css";
import WorldGuide from "./WorldGuide";
import ProModal from "./ProModal";

const FREE_LIMIT = 20;

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ok"; blocksFound: number };

function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setFileName(file.name); onFile(file); }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setFileName(file.name); onFile(file); }
  }

  return (
    <div
      className={`${styles.uploadZone} ${dragging ? styles.uploadZoneDragging : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        name="world_zip"
        accept=".zip"
        required
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      {fileName ? (
        <p className={styles.uploadFileName}>{fileName}</p>
      ) : (
        <>
          <p className={styles.uploadText}>Drop your world ZIP here</p>
          <p className={styles.uploadHint}>or click to browse</p>
        </>
      )}
    </div>
  );
}

export default function App() {
  const { getToken, isSignedIn } = useAuth();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [worldFile, setWorldFile] = useState<File | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    getToken().then((token) => {
      console.log("[usage] fetching /me/usage");
      fetch("/me/usage", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => {
          console.log("[usage] response status", r.status);
          return r.json();
        })
        .then((data) => {
          console.log("[usage] call_count", data.call_count);
          setUsageCount(data.call_count ?? 0);
        })
        .catch((err) => console.error("[usage] fetch failed", err));
    });
  }, [isSignedIn]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!worldFile) return;

    setStatus({ kind: "loading" });
    setAnalysis(null);

    const fd = new FormData(e.currentTarget);
    fd.set("world_zip", worldFile);

    try {
      const token = await getToken();
      console.log("[analyze] submitting request");
      const resp = await fetch("/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await resp.json();
      console.log("[analyze] response status", resp.status, data);
      if (!resp.ok) {
        if (resp.status === 429) {
          console.warn("[analyze] limit reached, opening pro modal");
          setUsageCount(FREE_LIMIT);
          setShowPro(true);
        } else {
          setStatus({ kind: "error", message: data.detail ?? resp.statusText });
        }
      } else {
        setStatus({ kind: "ok", blocksFound: data.blocks_found });
        setAnalysis(data.analysis);
        setUsageCount(data.call_count ?? 0);
      }
    } catch (err) {
      console.error("[analyze] fetch failed", err);
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Network error" });
    }
  }

  // ── Fill these in ──────────────────────────────────────────
  const INSTAGRAM_HANDLE = "@RedstoneAI_dev";
  const INSTAGRAM_URL    = "https://www.instagram.com/redstoneai_dev";
  // ────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {showGuide && <WorldGuide onClose={() => setShowGuide(false)} />}
      {showPro && <ProModal onClose={() => setShowPro(false)} />}
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.authBar}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className={styles.signInBtn}>Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className={styles.authActions}>
                <button className={styles.goProBtn} onClick={() => setShowPro(true)}>
                  Go Pro
                </button>
                <UserButton />
              </div>
            </SignedIn>
          </div>
          <h1 className={styles.title}>RedstoneAI <span className={styles.betaTag}>beta</span></h1>
          <p className={styles.subtitle}>
            Upload a Minecraft world, point to a redstone component, and get an AI-powered analysis.
          </p>
        </header>

        <div className={styles.layout}>
          <div className={styles.main}>

        <div className={styles.warning}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.warningIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p><strong>Experimental:</strong> Please create a backup of your world before uploading.</p>
        </div>

        <form ref={formRef} className={styles.card} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>World File</h2>
            <UploadZone onFile={setWorldFile} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Seed Block Coordinates <span className={styles.optional}>(point at a key redstone component, not just wire)</span></h2>
            <div className={styles.coords}>
              {(["x", "y", "z"] as const).map((axis) => (
                <div key={axis} className={styles.coordField}>
                  <label className={styles.label} htmlFor={axis}>{axis.toUpperCase()}</label>
                  <input
                    className={styles.input}
                    type="number"
                    id={axis}
                    name={axis}
                    required
                    placeholder={axis === "y" ? "64" : "0"}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Dimension</h2>
            <div className={styles.dimGroup}>
              {(["overworld", "nether", "end"] as const).map((dim) => (
                <label key={dim} className={styles.dimOption}>
                  <input type="radio" name="dimension" value={dim} defaultChecked={dim === "overworld"} />
                  <span>{dim.charAt(0).toUpperCase() + dim.slice(1)}</span>
                </label>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Context <span className={styles.optional}>(optional)</span></h2>
            <textarea
              className={styles.textarea}
              name="user_context"
              placeholder="e.g. This is an automated bee farm — the dispenser should collect honey but isn't firing..."
            />
          </section>

          {usageCount >= FREE_LIMIT ? (
            <button
              type="button"
              className={styles.buttonLimitReached}
              onClick={() => setShowPro(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.limitIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Monthly limit reached — Go Pro to keep analyzing
            </button>
          ) : (
            <button className={styles.button} type="submit" disabled={status.kind === "loading"}>
              {status.kind === "loading" ? (
                <span className={styles.buttonLoading}>
                  <span className={styles.spinner} />
                  Analyzing...
                </span>
              ) : "Analyze"}
            </button>
          )}

          {status.kind !== "idle" && status.kind !== "loading" && (
            <p className={`${styles.statusMsg} ${status.kind === "error" ? styles.statusError : styles.statusOk}`}>
              {status.kind === "error" ? `Error: ${status.message}` : `Done — ${status.blocksFound} blocks analyzed.`}
            </p>
          )}

          <SignedIn>
            <div className={styles.usageRow}>
              <span
                className={`${styles.usageCount} ${
                  usageCount >= FREE_LIMIT ? styles.usageExhausted :
                  usageCount >= FREE_LIMIT * 0.75 ? styles.usageWarning : ""
                }`}
              >
                {usageCount} / {FREE_LIMIT} analyses used this month
              </span>
              {usageCount >= FREE_LIMIT * 0.75 && (
                <button className={styles.usageProLink} onClick={() => setShowPro(true)}>
                  Go Pro for unlimited
                </button>
              )}
            </div>
          </SignedIn>
        </form>

        {analysis && usageCount >= FREE_LIMIT && (
          <div className={styles.nudgeBanner}>
            <span>You've hit your free limit for this month.</span>
            <button className={styles.nudgeBtn} onClick={() => setShowPro(true)}>
              Go Pro for unlimited analyses
            </button>
          </div>
        )}

        {analysis && (
          <div className={styles.resultCard}>
            <h2 className={styles.resultTitle}>Analysis</h2>
            <pre className={styles.result}>{analysis}</pre>
          </div>
        )}

          </div>{/* end .main */}

          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <h2 className={styles.sideTitle}>Helpful Links</h2>
              <ul className={styles.linkList}>
                <li>
                  <a href="https://help.minecraft.net/hc/en-us/articles/40340122067085-Save-a-Backup-of-Your-Minecraft-Java-Edition-World" target="_blank" rel="noreferrer" className={`${styles.link} ${styles.linkBold}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.linkIcon}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    How to backup your Minecraft world
                  </a>
                </li>
                <li>
                  <button onClick={() => setShowGuide(true)} className={`${styles.link} ${styles.linkButton}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.linkIcon}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    How to get your world download
                  </button>
                </li>
                <li>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={styles.link}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.linkIcon}>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    Follow us on Instagram
                  </a>
                  <p className={styles.linkHandle}>{INSTAGRAM_HANDLE}</p>
                </li>
              </ul>
            </div>
          </aside>

        </div>{/* end .layout */}

        <footer className={styles.footer}>
          <h2 className={styles.footerTitle}>Contact Us</h2>
          <div className={styles.footerGrid}>
            <div className={styles.footerItem}>
              <p className={styles.footerLabel}>Support the Project</p>
              <a
                href="https://buymeacoffee.com/redstoneai"
                target="_blank"
                rel="noreferrer"
                className={styles.bmcBtn}
              >
                ☕ Buy me a coffee
              </a>
            </div>
            <div className={styles.footerDivider} />
            <div className={styles.footerItem}>
              <p className={styles.footerLabel}>Bugs &amp; Feedback</p>
              <a href="mailto:redstoneaidev@gmail.com" className={styles.footerEmail}>
                redstoneaidev@gmail.com
              </a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
