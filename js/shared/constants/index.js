/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Constants
 * -----------------------------------------------------------------------------
 * File      : js/shared/constants/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

export const PLATFORM = Object.freeze({
    NAME: "GrowWithHR Intelligence Platform",
    SHORT_NAME: "GrowWithHR",
    VERSION: "1.0.0",
    BUILD: "SPRINT-1",
    ENVIRONMENT: "production",
    COUNTRY: "India",
    CURRENCY: "INR",
    LOCALE: "en-IN",
    TIMEZONE: "Asia/Kolkata"
});

export const STORAGE = Object.freeze({
    COMPANY_DNA: "gwhr.company.dna",
    KNOWLEDGE_LIBRARY: "gwhr.knowledge.library",
    RULE_ENGINE: "gwhr.rule.engine",
    RECOMMENDATIONS: "gwhr.recommendations",
    REPORTS: "gwhr.reports",
    SETTINGS: "gwhr.settings",
    CACHE: "gwhr.cache",
    SESSION: "gwhr.session",
    USER: "gwhr.user"
});

export const EVENTS = Object.freeze({

    PLATFORM_INITIALIZED: "platform.initialized",

    COMPANY_DNA_CREATED: "company.dna.created",
    COMPANY_DNA_UPDATED: "company.dna.updated",
    COMPANY_DNA_RESET: "company.dna.reset",

    KNOWLEDGE_LIBRARY_LOADED: "knowledge.library.loaded",

    RULE_ENGINE_READY: "rule.engine.ready",

    INTELLIGENCE_UPDATED: "intelligence.updated",

    RECOMMENDATION_CREATED: "recommendation.created",

    REPORT_GENERATED: "report.generated",

    NOTIFICATION_CREATED: "notification.created",

    ERROR: "system.error"

});

export const MODULES = Object.freeze({

    COMPANY_DNA: "company-dna",

    KNOWLEDGE_LIBRARY: "knowledge-library",

    RULE_ENGINE: "rule-engine",

    INTELLIGENCE_ENGINE: "intelligence-engine",

    RECOMMENDATION_ENGINE: "recommendation-engine",

    REPORT_ENGINE: "report-engine",

    NOTIFICATION_ENGINE: "notification-engine",

    AI_CONTEXT: "ai-context",

    COMPLIANCE: "compliance",

    ORGANIZATION: "organization",

    HIRING: "hiring",

    PERFORMANCE: "performance",

    LEADERSHIP: "leadership",

    TALENT: "talent",

    REWARDS: "rewards",

    LEARNING: "learning",

    CULTURE: "culture",

    POLICY: "policy"

});

export const ORGANIZATION_SIZE = Object.freeze({
    MICRO: "Micro",
    SMALL: "Small",
    MEDIUM: "Medium",
    LARGE: "Large",
    ENTERPRISE: "Enterprise"
});

export const GROWTH_STAGE = Object.freeze({
    IDEA: "Idea",
    STARTUP: "Startup",
    EARLY: "Early Growth",
    GROWTH: "Growth",
    SCALE: "Scale",
    ENTERPRISE: "Enterprise"
});

export const BUSINESS_MODEL = Object.freeze({
    B2B: "B2B",
    B2C: "B2C",
    D2C: "D2C",
    MARKETPLACE: "Marketplace",
    SAAS: "SaaS",
    MANUFACTURING: "Manufacturing",
    SERVICES: "Services",
    NON_PROFIT: "Non Profit"
});

export const ENTITY_TYPES = Object.freeze({
    PROPRIETORSHIP: "Proprietorship",
    PARTNERSHIP: "Partnership",
    LLP: "LLP",
    PRIVATE_LIMITED: "Private Limited",
    PUBLIC_LIMITED: "Public Limited",
    SECTION8: "Section 8",
    TRUST: "Trust",
    SOCIETY: "Society"
});

export const EMPLOYMENT_TYPES = Object.freeze({
    PERMANENT: "Permanent",
    CONTRACT: "Contract",
    INTERN: "Intern",
    APPRENTICE: "Apprentice",
    CONSULTANT: "Consultant",
    FREELANCER: "Freelancer"
});

export const PRIORITY = Object.freeze({
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical"
});

export const STATUS = Object.freeze({
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    DRAFT: "Draft",
    ARCHIVED: "Archived"
});

export const REPORT_TYPES = Object.freeze({
    PEOPLE_INTELLIGENCE: "People Intelligence",
    COMPLIANCE: "Compliance",
    ORGANIZATION: "Organization",
    PERFORMANCE: "Performance",
    LEADERSHIP: "Leadership",
    TALENT: "Talent",
    REWARDS: "Rewards",
    LEARNING: "Learning",
    CULTURE: "Culture",
    POLICY: "Policy"
});

export const AI = Object.freeze({
    MAX_CONTEXT_ITEMS: 100,
    MAX_RECOMMENDATIONS: 25,
    MAX_REPORT_ITEMS: 500
});

export const VALIDATION = Object.freeze({
    MIN_EMPLOYEES: 0,
    MAX_EMPLOYEES: 1000000,
    MAX_STRING_LENGTH: 500,
    MAX_ARRAY_ITEMS: 5000
});

export const CACHE = Object.freeze({
    DEFAULT_TTL: 300000,
    SHORT_TTL: 60000,
    LONG_TTL: 3600000
});

export default Object.freeze({
    PLATFORM,
    STORAGE,
    EVENTS,
    MODULES,
    ORGANIZATION_SIZE,
    GROWTH_STAGE,
    BUSINESS_MODEL,
    ENTITY_TYPES,
    EMPLOYMENT_TYPES,
    PRIORITY,
    STATUS,
    REPORT_TYPES,
    AI,
    VALIDATION,
    CACHE
});
