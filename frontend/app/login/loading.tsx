"use client";

export function LoadingAnimation({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{ marginBottom: "20px" }}>
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
        <p>{text}</p>
      </div>
      <style jsx>{`
        .spinner {
          width: 40px;
          height: 40px;
          position: relative;
        }
        .double-bounce1,
        .double-bounce2 {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #333;
          opacity: 0.6;
          position: absolute;
          top: 0;
          left: 0;
          animation: bounce 2s infinite ease-in-out;
        }
        .double-bounce2 {
          animation-delay: -1s;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: scale(0);
          }
          50% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
export function LoadingPage() {
  return <LoadingAnimation text="Loading..." />;
}

export default LoadingPage;
