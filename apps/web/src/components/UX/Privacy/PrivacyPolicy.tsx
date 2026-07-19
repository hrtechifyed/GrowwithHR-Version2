import { DataHandling } from "./DataHandling";

/**
 * PrivacyPolicy provides plain-language transparency for the current
 * GrowWithHR assessment, browser persistence and advisory-delivery flow.
 *
 * This component belongs to the experimental React/TypeScript UX layer.
 * Its wording must remain aligned with the deployed static application.
 *
 * @returns Full privacy, retention and data-handling information.
 * @example <PrivacyPolicy />
 */
export function PrivacyPolicy() {
  return (
    <main className="gwhr-privacy">
      <style>{`
        .gwhr-privacy {
          max-width: 980px;
          margin: auto;
          padding: clamp(1rem, 4vw, 3rem);
          line-height: 1.65;
          color: #24364b;
        }

        .gwhr-privacy h1,
        .gwhr-privacy h2 {
          color: #102033;
        }

        .gwhr-table {
          width: 100%;
          border-collapse: collapse;
          overflow: hidden;
          border-radius: 18px;
        }

        .gwhr-table th,
        .gwhr-table td {
          border: 1px solid #dbe7ff;
          padding: 0.85rem;
          text-align: left;
          vertical-align: top;
        }

        .gwhr-table th {
          background: #eef5ff;
        }

        @media (max-width: 640px) {
          .gwhr-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>

      <h1>Privacy and data handling for the Executive Assessment</h1>

      <p>
        We ask for business context so the advisory can be specific. Limited
        progress may be retained in your browser to support same-browser resume,
        report continuity and delivery status.
      </p>

      <p>
        When you request email delivery, the recipient information, assessment
        information needed for the advisory, prepared report data and generated
        PDF are transmitted to the GrowWithHR backend. The backend validates the
        request and sends the advisory through the Gmail API.
      </p>

      <DataHandling />

      <h2>Current retention position</h2>

      <table className="gwhr-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Where it is handled</th>
            <th>Current retention position</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Active assessment answers</td>
            <td>Browser memory</td>
            <td>
              Used while the assessment is open and active.
            </td>
          </tr>

          <tr>
            <td>Saved assessment progress</td>
            <td>Browser localStorage</td>
            <td>
              Retained until cleared, replaced or invalidated in the same
              browser.
            </td>
          </tr>

          <tr>
            <td>Prepared report state</td>
            <td>Browser localStorage</td>
            <td>
              Retained until cleared or replaced in the same browser.
            </td>
          </tr>

          <tr>
            <td>Recipient and delivery information</td>
            <td>Browser and GrowWithHR delivery backend</td>
            <td>
              Stored in the browser for continuity and processed by the backend
              when the user requests report delivery.
            </td>
          </tr>

          <tr>
            <td>Delivery request and generated PDF</td>
            <td>GrowWithHR Node.js/Express backend</td>
            <td>
              Processed for the time needed to validate and send the advisory.
              The current application does not intentionally save the completed
              assessment to a dedicated database.
            </td>
          </tr>

          <tr>
            <td>Sent advisory email and PDF</td>
            <td>Connected Gmail account</td>
            <td>
              Retained according to the Gmail account&apos;s configuration and
              retention practices.
            </td>
          </tr>

          <tr>
            <td>Operational delivery information</td>
            <td>Application or hosting logs</td>
            <td>
              May be retained according to operational and hosting
              configuration.
            </td>
          </tr>

          <tr>
            <td>Dedicated assessment database copy</td>
            <td>Not currently maintained</td>
            <td>Not applicable.</td>
          </tr>
        </tbody>
      </table>

      <h2>Current commitments</h2>

      <ul>
        <li>
          Collect only company information needed to prepare and deliver the
          advisory.
        </li>

        <li>
          Do not sell company assessment information.
        </li>

        <li>
          Do not maintain a hidden customer assessment database in the current
          implementation.
        </li>

        <li>
          Clearly distinguish browser storage, backend processing and Gmail
          retention.
        </li>

        <li>
          Do not request confidential employee-level personal, medical,
          payroll, disciplinary or performance information in the general
          company assessment.
        </li>

        <li>
          Keep recommendations directional, explainable and rules-based rather
          than presenting them as legal certification.
        </li>

        <li>
          Update privacy information, retention rules, access controls and user
          rights before enabling additional remote storage.
        </li>
      </ul>

      <h2>Not currently provided</h2>

      <ul>
        <li>User accounts.</li>
        <li>Cloud-saved assessments.</li>
        <li>Cross-device resume.</li>
        <li>A persistent customer-report database.</li>
        <li>A compliance evidence repository.</li>
        <li>CRM or Google Drive storage.</li>
        <li>RAG conversation-history storage.</li>
        <li>Automated deletion controls for sent Gmail messages.</li>
      </ul>

      <h2>Future persistence</h2>

      <p>
        Any future database, account, compliance-workspace, document-storage,
        CRM, analytics or RAG-history feature must define its purpose,
        permissions, retention, deletion, security and consent model before it
        is released.
      </p>

      <p>
        The architecture, data-flow and public privacy documentation must be
        updated at the same time.
      </p>
    </main>
  );
}
