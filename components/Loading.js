const Loading = () => {
  return (
    <div
      className="loading fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40"
      aria-live="polite"
      aria-busy="true"
    >
      <svg width="205" height="250" viewBox="0 0 40 50">
        <polygon
          strokeWidth="1"
          stroke="#fff"
          fill="none"
          points="20,1 40,40 1,40"
        />
        <text fill="#fff" x="5" y="47">Loading</text>
      </svg>
    </div>
  )
}

export default Loading
