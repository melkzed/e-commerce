"use client";

import { LockKeyhole, AlertCircle, Sparkles } from "lucide-react";

export function ModernPageHeader({ 
  title, 
  subtitle, 
  icon: Icon = Sparkles 
}: { 
  title: string; 
  subtitle?: string;
  icon?: React.ComponentType<any>;
}) {
  return (
    <div style={{
      padding: "40px 20px",
      background: "linear-gradient(135deg, rgba(109, 40, 217, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
      borderBottom: "1px solid rgba(167, 139, 250, 0.2)",
      borderRadius: "12px",
      marginBottom: "30px"
    }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <Icon size={32} style={{ color: "var(--galaxy-accent)", marginTop: "4px" }} />
        <div>
          <h1 style={{ 
            margin: "0 0 8px 0",
            fontSize: "2rem",
            fontWeight: 900,
            color: "var(--text-primary)"
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              margin: 0,
              color: "var(--text-muted)",
              fontSize: "1rem",
              lineHeight: 1.6
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ModernCard({ 
  children, 
  title,
  icon: Icon
}: { 
  children: React.ReactNode;
  title?: string;
  icon?: React.ComponentType<any>;
}) {
  return (
    <div style={{
      padding: "24px",
      border: "1px solid rgba(167, 139, 250, 0.2)",
      borderRadius: "12px",
      background: "linear-gradient(135deg, rgba(109, 40, 217, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
      transition: "all 300ms ease",
      cursor: "pointer"
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = "rgba(217, 70, 239, 0.4)";
      el.style.background = "linear-gradient(135deg, rgba(109, 40, 217, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)";
      el.style.transform = "translateY(-4px)";
      el.style.boxShadow = "0 20px 50px rgba(217, 70, 239, 0.2)";
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLElement;
      el.style.borderColor = "rgba(167, 139, 250, 0.2)";
      el.style.background = "linear-gradient(135deg, rgba(109, 40, 217, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)";
      el.style.transform = "translateY(0)";
      el.style.boxShadow = "none";
    }}
    >
      {title && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
          {Icon && <Icon size={24} style={{ color: "var(--galaxy-accent)" }} />}
          <h3 style={{
            margin: 0,
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "var(--text-primary)"
          }}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

export function StatusBadge({ 
  status, 
  variant = "success" 
}: { 
  status: string;
  variant?: "success" | "warning" | "error" | "info";
}) {
  const colors = {
    success: { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.4)", text: "#10b981" },
    warning: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", text: "#f59e0b" },
    error: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", text: "#ef4444" },
    info: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)", text: "#3b82f6" }
  };

  const color = colors[variant];

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 14px",
      borderRadius: "8px",
      background: color.bg,
      border: `1px solid ${color.border}`,
      color: color.text,
      fontSize: "0.85rem",
      fontWeight: 600
    }}>
      {status}
    </span>
  );
}
