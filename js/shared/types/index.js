/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Type Definitions
 * -----------------------------------------------------------------------------
 * File      : js/shared/types/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

/**
 * @typedef {Object} CompanyIdentity
 * @property {string} legalName
 * @property {string} displayName
 * @property {string} entityType
 * @property {string} incorporationDate
 * @property {string} cin
 * @property {string} pan
 * @property {string} tan
 * @property {string} gstin
 */

/**
 * @typedef {Object} IndustryProfile
 * @property {string} sector
 * @property {string} subSector
 * @property {string} nicCode
 * @property {string[]} businessActivities
 */

/**
 * @typedef {Object} Headquarters
 * @property {string} country
 * @property {string} state
 * @property {string} city
 */

/**
 * @typedef {Object} GeographyProfile
 * @property {Headquarters} headquarters
 * @property {string[]} operatingStates
 * @property {string[]} operatingCities
 * @property {string[]} countries
 */

/**
 * @typedef {Object} WorkforceProfile
 * @property {number} totalEmployees
 * @property {number} permanentEmployees
 * @property {number} contractEmployees
 * @property {number} apprentices
 * @property {number} interns
 * @property {number} consultants
 * @property {number} remoteEmployees
 * @property {number} womenEmployees
 * @property {number} disabledEmployees
 */

/**
 * @typedef {Object} OrganizationProfile
 * @property {string[]} departments
 * @property {number} reportingLevels
 * @property {string[]} businessUnits
 * @property {string[]} branches
 * @property {string[]} factories
 * @property {string[]} offices
 */

/**
 * @typedef {Object} BusinessProfile
 * @property {string} businessModel
 * @property {string} fundingStage
 * @property {string} growthStage
 * @property {string} annualRevenue
 * @property {string} payrollFrequency
 * @property {string} financialYear
 */

/**
 * @typedef {Object} ComplianceProfile
 * @property {Array} registrations
 * @property {Array} licenses
 * @property {Array} policies
 * @property {Array} applicableActs
 * @property {Array} statutoryBodies
 */

/**
 * @typedef {Object} Metadata
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} createdBy
 * @property {string} updatedBy
 * @property {string} version
 */

/**
 * @typedef {Object} CompanyDNA
 * @property {CompanyIdentity} company
 * @property {IndustryProfile} industry
 * @property {GeographyProfile} geography
 * @property {WorkforceProfile} workforce
 * @property {OrganizationProfile} organization
 * @property {BusinessProfile} business
 * @property {ComplianceProfile} compliance
 * @property {Metadata} metadata
 */

/**
 * @typedef {Object} Recommendation
 * @property {string} id
 * @property {string} module
 * @property {string} title
 * @property {string} description
 * @property {string} priority
 * @property {string} type
 * @property {string} status
 * @property {string} owner
 * @property {Date|string} dueDate
 * @property {Array} references
 */

/**
 * @typedef {Object} IntelligenceResult
 * @property {string} module
 * @property {number} score
 * @property {Array} findings
 * @property {Recommendation[]} recommendations
 * @property {Array} risks
 */

/**
 * @typedef {Object} ReportSection
 * @property {string} title
 * @property {number} score
 * @property {Array} findings
 * @property {Recommendation[]} recommendations
 */

/**
 * @typedef {Object} PeopleIntelligenceReport
 * @property {string} company
 * @property {Date|string} generatedAt
 * @property {number} overallScore
 * @property {ReportSection[]} sections
 */

/**
 * Empty export to mark this file as an ES Module.
 */
export {};
