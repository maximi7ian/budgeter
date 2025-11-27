/**
 * Modal component for custom budget report (view transactions)
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

        // Build URL with parameters using unified route
        let url = '/transactions?start=' + encodeURIComponent(startDate) + '&end=' + encodeURIComponent(endDate) + '&report_name=Custom';
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

/**
 * Modal component for sending custom email report
 * Similar to renderCustomReportModal but submits to /send-alert/custom
 */
export function renderCustomEmailModal(): string {
  const today = new Date().toISOString().split('T')[0];

  return `
    <!-- Custom Email Report Modal -->
    <div class="modal-overlay" id="customEmailModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">📧 Send Custom Budget Report</h3>
          <button class="modal-close" onclick="closeCustomEmailModal()" aria-label="Close">&times;</button>
        </div>
        <form id="customEmailForm" onsubmit="submitCustomEmail(event)">
          <div class="modal-body">
            <div class="modal-form-group">
              <label class="modal-label" for="emailStartDate">Start Date (Inclusive)</label>
              <input
                type="date"
                id="emailStartDate"
                name="emailStartDate"
                class="modal-input"
                required
                max="${today}"
              />
              <div class="modal-hint">First day to include in the report</div>
            </div>

            <div class="modal-form-group">
              <label class="modal-label" for="emailEndDate">End Date (Exclusive)</label>
              <input
                type="date"
                id="emailEndDate"
                name="emailEndDate"
                class="modal-input"
                required
                max="${today}"
              />
              <div class="modal-hint">Day AFTER the last day you want included (not included itself)</div>
            </div>

            <div class="modal-form-group">
              <label class="modal-label" for="emailCustomBudget">Budget (Optional)</label>
              <input
                type="number"
                id="emailCustomBudget"
                name="emailCustomBudget"
                class="modal-input"
                placeholder="e.g., 250.00"
                step="0.01"
                min="0"
              />
              <div class="modal-hint">Leave empty to auto-calculate based on daily rate (Weekly Budget ÷ 7 × days)</div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="modal-btn modal-btn-secondary" onclick="closeCustomEmailModal()">Cancel</button>
            <button type="submit" class="modal-btn modal-btn-primary">📧 Send Email</button>
          </div>
        </form>
      </div>
    </div>

    <script>
      function openCustomEmailModal() {
        document.getElementById('customEmailModal').classList.add('active');
        // Set default dates (last 7 days)
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        document.getElementById('emailEndDate').value = today.toISOString().split('T')[0];
        document.getElementById('emailStartDate').value = weekAgo.toISOString().split('T')[0];
      }

      function closeCustomEmailModal() {
        document.getElementById('customEmailModal').classList.remove('active');
        document.getElementById('customEmailForm').reset();
      }

      function submitCustomEmail(event) {
        event.preventDefault();
        const startDate = document.getElementById('emailStartDate').value;
        const endDate = document.getElementById('emailEndDate').value;
        const customBudget = document.getElementById('emailCustomBudget').value;

        // Build URL with parameters
        let url = '/send-alert/custom?start=' + encodeURIComponent(startDate) + '&end=' + encodeURIComponent(endDate);
        if (customBudget) {
          url += '&budget=' + encodeURIComponent(customBudget);
        }

        // Create a form and submit it as POST
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        document.body.appendChild(form);
        form.submit();
      }

      // Close modal when clicking outside
      document.getElementById('customEmailModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
          closeCustomEmailModal();
        }
      });

      // Close modal with Escape key (only if not already handled by custom report modal)
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          const customEmailModal = document.getElementById('customEmailModal');
          if (customEmailModal && customEmailModal.classList.contains('active')) {
            closeCustomEmailModal();
          }
        }
      });
    </script>
  `;
}
