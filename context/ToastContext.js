"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            minWidth: "300px",
                            padding: "16px",
                            borderRadius: "8px",
                            backgroundColor: "white",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderLeft: `4px solid ${toast.type === "success" ? "#10b981" : "#ef4444"
                                }`,
                            animation: "slideIn 0.3s ease-out",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {toast.type === "success" ? (
                                <CheckCircle size={20} color="#10b981" />
                            ) : (
                                <AlertCircle size={20} color="#ef4444" />
                            )}
                            <span
                                style={{
                                    color: "#1e293b",
                                    fontWeight: 500,
                                    fontSize: "0.95rem",
                                }}
                            >
                                {toast.message}
                            </span>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#94a3b8",
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                ))}
                <style jsx global>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
            </div>
        </ToastContext.Provider>
    );
};
