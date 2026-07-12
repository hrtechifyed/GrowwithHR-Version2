/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Enumerations
 * -----------------------------------------------------------------------------
 * File      : js/shared/enums/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

export const LogLevel = Object.freeze({
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR",
    FATAL: "FATAL"
});

export const RecommendationType = Object.freeze({
    INFORMATION: "Information",
    ACTION: "Action",
    WARNING: "Warning",
    RISK: "Risk",
    COMPLIANCE: "Compliance",
    IMPROVEMENT: "Improvement"
});

export const RecommendationStatus = Object.freeze({
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CLOSED: "Closed",
    IGNORED: "Ignored"
});

export const RuleResult = Object.freeze({
    PASS: "Pass",
    FAIL: "Fail",
    WARNING: "Warning",
    NOT_APPLICABLE: "Not Applicable"
});

export const IntelligenceLevel = Object.freeze({
    BASIC: "Basic",
    STANDARD: "Standard",
    ADVANCED: "Advanced",
    ENTERPRISE: "Enterprise"
});

export const CompanyLifecycle = Object.freeze({
    IDEA: "Idea",
    INCORPORATED: "Incorporated",
    OPERATING: "Operating",
    GROWING: "Growing",
    SCALING: "Scaling",
    MATURE: "Mature"
});

export const Department = Object.freeze({
    HR: "Human Resources",
    FINANCE: "Finance",
    SALES: "Sales",
    MARKETING: "Marketing",
    ENGINEERING: "Engineering",
    PRODUCT: "Product",
    OPERATIONS: "Operations",
    CUSTOMER_SUCCESS: "Customer Success",
    LEGAL: "Legal",
    ADMINISTRATION: "Administration"
});

export const EmploymentStatus = Object.freeze({
    ACTIVE: "Active",
    NOTICE_PERIOD: "Notice Period",
    RESIGNED: "Resigned",
    TERMINATED: "Terminated",
    RETIRED: "Retired"
});

export const Gender = Object.freeze({
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
    UNDISCLOSED: "Undisclosed"
});

export const Frequency = Object.freeze({
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    QUARTERLY: "Quarterly",
    HALF_YEARLY: "Half-Yearly",
    YEARLY: "Yearly",
    AD_HOC: "Ad Hoc"
});

export const RiskLevel = Object.freeze({
    LOW: "Low",
    MODERATE: "Moderate",
    HIGH: "High",
    CRITICAL: "Critical"
});

export const NotificationChannel = Object.freeze({
    SYSTEM: "System",
    EMAIL: "Email",
    SMS: "SMS",
    PUSH: "Push"
});

export const IntelligenceModule = Object.freeze({
    COMPLIANCE: "Compliance Intelligence",
    ORGANIZATION: "Organization Intelligence",
    HIRING: "Hiring Intelligence",
    PERFORMANCE: "Performance Intelligence",
    LEADERSHIP: "Leadership Intelligence",
    TALENT: "Talent Intelligence",
    REWARDS: "Rewards Intelligence",
    LEARNING: "Learning Intelligence",
    CULTURE: "Culture Intelligence",
    POLICY: "Policy Intelligence"
});

export default Object.freeze({
    LogLevel,
    RecommendationType,
    RecommendationStatus,
    RuleResult,
    IntelligenceLevel,
    CompanyLifecycle,
    Department,
    EmploymentStatus,
    Gender,
    Frequency,
    RiskLevel,
    NotificationChannel,
    IntelligenceModule
});
