import styles from './App.module.css'

export default function Loading({ message }: { message: string }) {
  return <div className={styles.loading} role="status">
    <span className={styles.spinner} aria-hidden="true" />
    <p>{message}</p>
    <div className={styles.loadingTrack} aria-hidden="true">
      <span />
    </div>
    <small>Please wait while the artwork data loads.</small>
  </div>
}
