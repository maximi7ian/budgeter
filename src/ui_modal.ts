/**
 * Modal component for custom budget report
 */

export const MODAL_CSS = `
  /* ========== Modal ========== */
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 14, 39, 0.8);
    backdrop-filter: blur(8px);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal-overlay.active {
    display: flex;
  }

  .modal {
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .modal-close {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1.25rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    transform: scale(1.1);
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-form-group {
    margin-bottom: 1.25rem;
  }

  .modal-label {
    display: block;
    color: #cbd5e1;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .modal-input {
    width: 100%;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 6px;
    color: #e2e8f0;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .modal-input:focus {
    outline: none;
    border-color: rgba(14, 165, 233, 0.5);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  .modal-input::placeholder {
    color: #64748b;
  }

  .modal-hint {
    color: #94a3b8;
    font-size: 0.8rem;
    margin-top: 0.375rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .modal-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .modal-btn-primary {
    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #10b981 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }

  .modal-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
  }

  .modal-btn-secondary {
    background: rgba(148, 163, 184, 0.1);
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: #cbd5e1;
  }

  .modal-btn-secondary:hover {
    background: rgba(148, 163, 184, 0.15);
    border-color: rgba(148, 163, 184, 0.3);
  }
`;

export function renderCustomReportModal(): string {
  const today = new Date().toISOString().split('T')[0];

  return `
    <!-- Custom Report Modal -->
    <div class="modal-overlay" id="customReportModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">📋 Custom Budget Report</h3>
          <button class="modal-close" onclick="closeCustomReportModal()" aria-label="Close">&times;</button>
        </div>
        <form id="customReportForm" onsubmit="submitCustomReport(event)">
          <div class="modal-body">
            <div class="modal-form-group">
              <label class="modal-label" for="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                class="modal-input"
                required
                max="${today}"
              />
              <div class="modal-hint">Select the beginning of your custom date range</div>
            </div>

            <div class="modal-form-group">
              <label class="modal-label" for="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                class="modal-input"
                required
                max="${today}"
              />
              <div class="modal-hint">Select the end of your custom date range</div>
            </div>

            <div class="modal-form-group">
              <label class="modal-label" for="customBudget">Budget (Optional)</label>
              <input
                type="number"
                id="customBudget"
                name="customBudget"
                class="modal-input"
                placeholder="e.g., 250.00"
                step="0.01"
                min="0"
              />
              <div class="modal-hint">Leave empty to auto-calculate based on daily rate (Weekly Budget ÷ 7 × days)</div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="modal-btn modal-btn-secondary" onclick="closeCustomReportModal()">Cancel</button>
            <button type="submit" class="modal-btn modal-btn-primary">Generate Report</button>
          </div>
        </form>
      </div>
    </div>

    <script>
      function openCustomReportModal() {
        document.getElementById('customReportModal').classList.add('active');
        // Set default dates (last 7 days)
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
        document.getElementById('startDate').value = weekAgo.toISOString().split('T')[0];
      }

      function closeCustomReportModal() {
        document.getElementById('customReportModal').classList.remove('active');
        document.getElementById('customReportForm').reset();
      }

      function submitCustomReport(event) {
        event.preventDefault();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const customBudget = document.getElementById('customBudget').value;

        // Build URL with parameters
        let url = '/transactions/custom?start=' + encodeURIComponent(startDate) + '&end=' + encodeURIComponent(endDate);
        if (customBudget) {
          url += '&budget=' + encodeURIComponent(customBudget);
        }

        // Navigate to the custom report
        window.location.href = url;
      }

      // Close modal when clicking outside
      document.getElementById('customReportModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
          closeCustomReportModal();
        }
      });

      // Close modal with Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeCustomReportModal();
        }
      });
    </script>
  `;
}
