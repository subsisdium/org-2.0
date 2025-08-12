// Booking system functionality
class BookingSystem {
  constructor() {
    this.initializeForm();
    this.setupValidation();
  }

  initializeForm() {
    // Set minimum date to today
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dateInput.min = now.toISOString().slice(0, 16);
    }

    // Setup form submission
    const form = document.getElementById('booking-form');
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  setupValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', this.validateField.bind(this));
      input.addEventListener('input', this.clearValidation.bind(this));
    });
  }

  validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    if (value === '') {
      this.setFieldError(field, 'Dieses Feld ist erforderlich');
      return false;
    }

    // Specific validations
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          this.setFieldError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
          return false;
        }
        break;
      
      case 'tel':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
          this.setFieldError(field, 'Bitte geben Sie eine gültige Telefonnummer ein');
          return false;
        }
        break;
    }

    this.setFieldSuccess(field);
    return true;
  }

  setFieldError(field, message) {
    field.style.borderColor = '#ef4444';
    this.showFieldMessage(field, message, 'error');
  }

  setFieldSuccess(field) {
    field.style.borderColor = '#22c55e';
    this.hideFieldMessage(field);
  }

  clearValidation(event) {
    const field = event.target;
    if (field.value.trim() !== '') {
      field.style.borderColor = '#6b7280';
      this.hideFieldMessage(field);
    }
  }

  showFieldMessage(field, message, type) {
    // Remove existing message
    this.hideFieldMessage(field);
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `field-message text-sm mt-1 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`;
    messageEl.textContent = message;
    messageEl.setAttribute('data-field-message', field.id);
    
    field.parentNode.appendChild(messageEl);
  }

  hideFieldMessage(field) {
    const existingMessage = field.parentNode.querySelector(`[data-field-message="${field.id}"]`);
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate all required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'privacy'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field && !this.validateField({ target: field })) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      this.showNotification('Bitte korrigieren Sie die markierten Felder.', 'error');
      return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Wird gesendet...';
    submitBtn.disabled = true;
    
    try {
      // Here you would integrate with your backend/CRM
      await this.submitBooking(data);
      
      this.showNotification('Vielen Dank für Ihre Buchungsanfrage! Wir melden uns innerhalb von 4 Stunden bei Ihnen.', 'success');
      form.reset();
      
      // Optional: redirect to thank you page
      // setTimeout(() => window.location.href = 'thank-you.html', 2000);
      
    } catch (error) {
      this.showNotification('Es gab einen Fehler beim Senden Ihrer Anfrage. Bitte versuchen Sie es erneut.', 'error');
    } finally {
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  async submitBooking(data) {
    // Simulate API call - replace with actual backend integration
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Booking data:', data);
        resolve();
      }, 2000);
    });
    
    // Example of actual API integration:
    /*
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit booking');
    }
    
    return response.json();
    */
  }

  showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BookingSystem();
});

export default BookingSystem;