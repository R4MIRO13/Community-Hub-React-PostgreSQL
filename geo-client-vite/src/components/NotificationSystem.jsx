// ...existing code from NotificationSystem.js will be copied here...
import React from 'react';

const NotificationSystem = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: "1em",
      left: "1em",
      zIndex: 3000,
      display: "flex",
      flexDirection: "column",
      gap: "0.5em",
      maxWidth: "400px"
    }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            padding: "1em 1.5em",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: notification.type === 'success' 
              ? "linear-gradient(135deg, #28a745, #20c997)"
              : notification.type === 'error'
              ? "linear-gradient(135deg, #dc3545, #c82333)"
              : notification.type === 'warning'
              ? "linear-gradient(135deg, #ffc107, #e0a800)"
              : "linear-gradient(135deg, #007bff, #0056b3)",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            animation: "slideIn 0.3s ease-out"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
            <span>
              {notification.type === 'success' ? '✅' :
               notification.type === 'error' ? '❌' :
               notification.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => onDismiss(notification.id)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "18px",
              padding: "0",
              marginLeft: "1em"
            }}
          >
            ×
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;