import styles from "./ProModal.module.css";

export default function ProModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.header}>
          <h1 className={styles.title}>Go Pro</h1>
          <p className={styles.subtitle}>Unlock the full power of RedstoneAI</p>
        </div>

        <div className={styles.tiers}>
          {/* Free tier */}
          <div className={styles.tier}>
            <p className={styles.tierLabel}>Free</p>
            <p className={styles.tierPrice}>$0<span className={styles.tierPer}>/mo</span></p>
            <ul className={styles.featureList}>
              <li className={styles.feature}>
                <span className={styles.check}>✓</span>
                20 analyses per month
              </li>
              <li className={`${styles.feature} ${styles.featureMuted}`}>
                <span className={styles.cross}>✕</span>
                Ads shown after analysis
              </li>
              <li className={`${styles.feature} ${styles.featureMuted}`}>
                <span className={styles.cross}>✕</span>
                Standard queue priority
              </li>
            </ul>
          </div>

          <div className={styles.divider} />

          {/* Pro tier */}
          <div className={`${styles.tier} ${styles.tierPro}`}>
            <div className={styles.proBadge}>Most Popular</div>
            <p className={styles.tierLabel}>Pro</p>
            <p className={styles.tierPrice}>
              $X<span className={styles.tierPer}>/mo</span>
            </p>
            <ul className={styles.featureList}>
              <li className={styles.feature}>
                <span className={styles.checkPro}>✓</span>
                Unlimited analyses
              </li>
              <li className={styles.feature}>
                <span className={styles.checkPro}>✓</span>
                No ads
              </li>
              <li className={styles.feature}>
                <span className={styles.checkPro}>✓</span>
                Priority queue
              </li>
            </ul>
            <button className={styles.upgradeBtn} disabled>
              Coming Soon
            </button>
          </div>
        </div>

        <p className={styles.fine}>Payments and billing coming soon. Pricing subject to change.</p>
      </div>
    </div>
  );
}
