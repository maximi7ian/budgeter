/**
 * Modal component for custom budget report
 * Styles are now in src/ui/design-system.ts
 */

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
              <label class="modal-label" for="startDate">Start Date (Inclusive)</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                class="modal-input"
                required
                max="${today}"
              />
              <div class="modal-hint">First day to include in the report</div>
            </div>

            <div class="modal-form-group">
              <label class="modal-label" for="endDate">End Date (Exclusive)</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                class="modal-input"
                required
                max="${today}"
              />
              <div class="modal-hint">Day AFTER the last day you want included (not included itself)</div>
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
