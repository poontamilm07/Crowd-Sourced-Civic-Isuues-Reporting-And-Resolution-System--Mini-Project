import React from 'react';
import {
  FaFlag,
  FaUserCheck,
  FaHardHat,
  FaSpinner,
  FaCheckCircle,
} from 'react-icons/fa';

// ─────────────────────────────────────────
// Issue Progress Bar Component
// Shows real-time status of an issue
// ─────────────────────────────────────────

const ProgressBar = ({ status, timeline }) => {

  // Define all steps
  const steps = [
    {
      key: 'REPORTED',
      label: 'Reported',
      icon: <FaFlag />,
      time: timeline?.reportedAt,
    },
    {
      key: 'ASSIGNED',
      label: 'Assigned',
      icon: <FaUserCheck />,
      time: timeline?.assignedAt,
    },
    {
      key: 'WORK_ASSIGNED',
      label: 'Work Assigned',
      icon: <FaHardHat />,
      time: timeline?.workAssignedAt,
    },
    {
      key: 'IN_PROGRESS',
      label: 'In Progress',
      icon: <FaSpinner />,
      time: timeline?.workStartedAt,
    },
    {
      key: 'COMPLETED',
      label: 'Completed',
      icon: <FaCheckCircle />,
      time: timeline?.completedAt,
    },
  ];

  // Get index of current status
  const statusOrder = [
    'REPORTED',
    'ASSIGNED',
    'WORK_ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
  ];
  const currentIndex =
    statusOrder.indexOf(status);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.wrapper}>

      {/* Progress Line */}
      <div style={styles.progressContainer}>

        {/* Background Line */}
        <div style={styles.bgLine} />

        {/* Active Line */}
        <div
          style={{
            ...styles.activeLine,
            width: currentIndex === 0
              ? '0%'
              : `${(currentIndex / 4) * 100}%`,
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted =
            index < currentIndex;
          const isActive =
            index === currentIndex;
          const isPending =
            index > currentIndex;

          return (
            <div
              key={step.key}
              style={styles.stepWrapper}
            >
              {/* Circle */}
              <div
                style={{
                  ...styles.circle,
                  ...(isCompleted
                    ? styles.circleCompleted
                    : {}),
                  ...(isActive
                    ? styles.circleActive
                    : {}),
                  ...(isPending
                    ? styles.circlePending
                    : {}),
                }}
              >
                {step.icon}
              </div>

              {/* Label */}
              <div style={styles.labelWrapper}>
                <span
                  style={{
                    ...styles.label,
                    ...(isCompleted || isActive
                      ? styles.labelActive
                      : styles.labelPending),
                  }}
                >
                  {step.label}
                </span>

                {/* Timestamp */}
                {step.time && (
                  <span style={styles.timestamp}>
                    {formatDate(step.time)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Badge */}
      <div style={styles.statusBadge}>
        <span
          style={{
            ...styles.badge,
            ...getBadgeColor(status),
          }}
        >
          Current Status: {
            status?.replace(/_/g, ' ')
          }
        </span>
      </div>

    </div>
  );
};

// Get badge color based on status
const getBadgeColor = (status) => {
  switch (status) {
    case 'REPORTED':
      return {
        background: '#6c757d',
        color: 'white',
      };
    case 'ASSIGNED':
      return {
        background: '#0d6efd',
        color: 'white',
      };
    case 'WORK_ASSIGNED':
      return {
        background: '#fd7e14',
        color: 'white',
      };
    case 'IN_PROGRESS':
      return {
        background: '#ffc107',
        color: '#333',
      };
    case 'COMPLETED':
      return {
        background: '#198754',
        color: 'white',
      };
    default:
      return {
        background: '#6c757d',
        color: 'white',
      };
  }
};

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = {
  wrapper: {
    padding: '20px 10px',
    background: 'white',
    borderRadius: '12px',
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    padding: '0 20px',
    marginBottom: '20px',
  },
  bgLine: {
    position: 'absolute',
    top: '20px',
    left: '40px',
    right: '40px',
    height: '3px',
    background: '#dee2e6',
    zIndex: 0,
  },
  activeLine: {
    position: 'absolute',
    top: '20px',
    left: '40px',
    height: '3px',
    background: 'linear-gradient(90deg, #198754, #2c7be5)',
    zIndex: 1,
    transition: 'width 0.5s ease',
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    zIndex: 2,
    flex: 1,
  },
  circle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    border: '3px solid transparent',
  },
  circleCompleted: {
    background: '#198754',
    color: 'white',
    borderColor: '#198754',
  },
  circleActive: {
    background: '#2c7be5',
    color: 'white',
    borderColor: '#2c7be5',
    boxShadow:
      '0 0 0 5px rgba(44,123,229,0.2)',
  },
  circlePending: {
    background: '#f8f9fa',
    color: '#adb5bd',
    borderColor: '#dee2e6',
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '80px',
  },
  labelActive: {
    color: '#333',
  },
  labelPending: {
    color: '#adb5bd',
  },
  timestamp: {
    fontSize: '9px',
    color: '#6c757d',
    textAlign: 'center',
    maxWidth: '90px',
  },
  statusBadge: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px',
  },
  badge: {
    padding: '6px 20px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
};

export default ProgressBar;