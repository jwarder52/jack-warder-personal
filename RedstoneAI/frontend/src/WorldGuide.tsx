import styles from "./WorldGuide.module.css";

export default function WorldGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h1 className={styles.title}>How to Download and Zip Your Minecraft World</h1>

        <section className={styles.section}>
          <h2 className={styles.step}>Step 1: Locate Your Minecraft Saves Folder</h2>

          <h3 className={styles.platform}>On Windows</h3>
          <ol className={styles.list}>
            <li>Press <kbd className={styles.kbd}>Windows + R</kbd></li>
            <li>Type <code className={styles.code}>%appdata%</code> and press Enter</li>
            <li>Open <code className={styles.code}>.minecraft → saves</code></li>
          </ol>

          <h3 className={styles.platform}>On Mac</h3>
          <ol className={styles.list}>
            <li>Open Finder and press <kbd className={styles.kbd}>Command + Shift + G</kbd></li>
            <li>Type <code className={styles.code}>~/Library/Application Support/minecraft/saves</code> and press Enter</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.step}>Step 2: Find Your World Folder</h2>
          <p className={styles.body}>Inside the saves folder you'll see a folder for each world, named after your world (e.g. <code className={styles.code}>MySurvivalWorld</code>).</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.step}>Step 3: Copy the World Folder <span className={styles.optional}>(optional but recommended)</span></h2>
          <ol className={styles.list}>
            <li>Right-click the world folder and click <strong>Copy</strong></li>
            <li>Paste it somewhere easy to access, like your Desktop</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.step}>Step 4: Zip the World Folder</h2>

          <h3 className={styles.platform}>On Windows</h3>
          <ol className={styles.list}>
            <li>Right-click the world folder</li>
            <li>Click <strong>Send to → Compressed (zipped) folder</strong></li>
          </ol>

          <h3 className={styles.platform}>On Mac</h3>
          <ol className={styles.list}>
            <li>Right-click the world folder</li>
            <li>Click <strong>Compress "WorldName"</strong></li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.step}>Step 5: Done!</h2>
          <p className={styles.body}>You now have a <code className={styles.code}>.zip</code> file ready to upload.</p>
        </section>

        <div className={styles.tips}>
          <h2 className={styles.tipsTitle}>Tips & Common Issues</h2>
          <ul className={styles.list}>
            <li>Close Minecraft before copying or zipping to prevent file corruption</li>
            <li>Large worlds may take a few minutes to zip</li>
            <li>Don't rename files inside the world folder — only rename the zip if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
