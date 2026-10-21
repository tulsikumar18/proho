import React, { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Plus,
  FileCheck,
  Send,
} from "lucide-react";
import type { Deal, Invoice, PayoutRequest, Property } from "../types";
import { PayoutDisburseModal } from "../components/PayoutDisburseModal";
import { NewDealModal } from "../components/NewDealModal";

interface FinanceViewProps {
  payouts: PayoutRequest[];
  deals: Deal[];
  invoices: Invoice[];
  properties: Property[];
  onReviewPayout: (id: string, status: "APPROVED" | "REJECTED", reason?: string) => void;
  onDisbursePayout: (id: string, utr: string) => void;
  onCreateDeal: (propertyId: string, partnerName: string, amount: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  payouts,
  deals,
  invoices,
  properties,
  onReviewPayout,
  onDisbursePayout,
  onCreateDeal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"payouts" | "deals">("payouts");
  const [payoutFilter, setPayoutFilter] = useState<string>("ALL");
  const [selectedDisbursePayout, setSelectedDisbursePayout] = useState<PayoutRequest | null>(null);
  const [showNewDealModal, setShowNewDealModal] = useState(false);

  const filteredPayouts = payouts.filter((p) => {
    if (payoutFilter === "ALL") return true;
    return p.status === payoutFilter;
  });

  const formatPrice = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          className={`btn ${activeSubTab === "payouts" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveSubTab("payouts")}
        >
          <Wallet size={16} /> Partner Payout Requests ({payouts.filter((p) => p.status === "REQUESTED").length})
        </button>
        <button
          className={`btn ${activeSubTab === "deals" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveSubTab("deals")}
        >
          <FileCheck size={16} /> Closed Deals & Tax Invoices ({deals.length})
        </button>
      </div>

      {activeSubTab === "payouts" ? (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3>Partner Withdrawal & Payout Requests</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
                Review cleared partner withdrawal requests and disburse funds with bank transaction UTR.
              </p>
            </div>

            <div className="filter-tabs">
              {["ALL", "REQUESTED", "APPROVED", "PAID", "REJECTED"].map((tab) => (
                <button
                  key={tab}
                  className={`filter-btn ${payoutFilter === tab ? "active" : ""}`}
                  onClick={() => setPayoutFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Bank Account Details</th>
                  <th>Amount (INR)</th>
                  <th>Status</th>
                  <th>Bank UTR Reference</th>
                  <th>Requested Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="highlight-text">{item.partner_name}</span>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.partner_phone}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.bank_name}</span>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {item.account_number_masked} | IFSC: {item.ifsc_code}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--accent-emerald)", fontSize: "15px" }}>
                        {formatPrice(item.amount)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === "PAID"
                            ? "badge-approved"
                            : item.status === "APPROVED"
                            ? "badge-blue"
                            : item.status === "REJECTED"
                            ? "badge-rejected"
                            : "badge-pending"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.utr_reference ? (
                        <code style={{ fontSize: "12px", color: "var(--accent-indigo)", fontWeight: 600 }}>
                          {item.utr_reference}
                        </code>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pending Transfer</span>
                      )}
                    </td>
                    <td>{new Date(item.created_at).toLocaleDateString("en-IN")}</td>
                    <td>
                      {item.status === "REQUESTED" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onReviewPayout(item.id, "APPROVED")}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: "var(--accent-rose)" }}
                            onClick={() => onReviewPayout(item.id, "REJECTED", "Bank details discrepancy")}
                          >
                            <XCircle size={13} />
                          </button>
                        </div>
                      ) : item.status === "APPROVED" ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setSelectedDisbursePayout(item)}
                        >
                          <Send size={13} /> Disburse (UTR)
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3>Closed Deals & Commission Invoices</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
                Registered property sales with automated 5% Section 194H TDS calculations.
              </p>
            </div>

            <button className="btn btn-primary" onClick={() => setShowNewDealModal(true)}>
              <Plus size={16} /> Record & Close Deal
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Sold Property</th>
                  <th>Beneficiary Partner</th>
                  <th>Agreement Value</th>
                  <th>Gross Comm (2%)</th>
                  <th>TDS (5%)</th>
                  <th>Net Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const deal = deals.find((d) => d.partner_name === inv.partner_name);
                  return (
                    <tr key={inv.id}>
                      <td>
                        <code style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{inv.invoice_number}</code>
                      </td>
                      <td>
                        <span className="highlight-text">{deal ? deal.property_title : "Verified Property Unit"}</span>
                      </td>
                      <td>{inv.partner_name}</td>
                      <td>{deal ? formatPrice(deal.agreement_value) : "—"}</td>
                      <td>{formatPrice(inv.gross_commission)}</td>
                      <td style={{ color: "var(--accent-amber)" }}>- {formatPrice(inv.tds_deducted)}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--accent-emerald)" }}>
                          {formatPrice(inv.net_payable)}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-approved">{inv.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedDisbursePayout ? (
        <PayoutDisburseModal
          payout={selectedDisbursePayout}
          onClose={() => setSelectedDisbursePayout(null)}
          onDisburse={(id, utr) => {
            onDisbursePayout(id, utr);
            setSelectedDisbursePayout(null);
          }}
        />
      ) : null}

      {showNewDealModal ? (
        <NewDealModal
          properties={properties}
          onClose={() => setShowNewDealModal(false)}
          onSubmit={(propId, partner, amt) => {
            onCreateDeal(propId, partner, amt);
            setShowNewDealModal(false);
          }}
        />
      ) : null}
    </div>
  );
};
