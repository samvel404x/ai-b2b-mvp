export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
      }}
    >
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          paddingTop: "80px",
        }}
      >
        <p
          style={{
            color: "#7c7cff",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          AI Business Platform
        </p>

        <h1
          style={{
            fontSize: "64px",
            lineHeight: "1.05",
            margin: "0 0 24px",
            maxWidth: "850px",
          }}
        >
          Find business losses. Automate operations. Grow with AI.
        </h1>

        <p
          style={{
            fontSize: "20px",
            lineHeight: "1.6",
            color: "#b5b5b5",
            maxWidth: "700px",
            marginBottom: "36px",
          }}
        >
          Genius helps businesses diagnose hidden losses, track key metrics in
          real time, and automate daily operations using AI agents.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <a
            href="#contact"
            style={{
              background: "white",
              color: "black",
              padding: "14px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Get Started
          </a>

          <a
            href="#features"
            style={{
              border: "1px solid #333",
              color: "white",
              padding: "14px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            See Features
          </a>
        </div>
      </section>

      <section
        id="features"
        style={{
          maxWidth: "1100px",
          margin: "100px auto 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h3>Loss Diagnosis</h3>
          <p style={textStyle}>
            Detect where your business loses money, time, leads, or efficiency.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>Real-Time Metrics</h3>
          <p style={textStyle}>
            Track the numbers that actually matter for growth and operations.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>AI Agents</h3>
          <p style={textStyle}>
            Automate repetitive tasks and improve execution speed with AI.
          </p>
        </div>
      </section>

      <section
        id="contact"
        style={{
          maxWidth: "1100px",
          margin: "100px auto 0",
          padding: "40px",
          border: "1px solid #222",
          borderRadius: "24px",
          background: "#0d0d0d",
        }}
      >
        <h2 style={{ fontSize: "36px", marginTop: 0 }}>
          Ready to build smarter operations?
        </h2>
        <p style={textStyle}>
          Contact us and start using AI to understand, optimize, and scale your
          business.
        </p>
      </section>
    </main>
  );
}

const cardStyle = {
  padding: "28px",
  border: "1px solid #222",
  borderRadius: "20px",
  background: "#0d0d0d",
};

const textStyle = {
  color: "#b5b5b5",
  lineHeight: "1.6",
};