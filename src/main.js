// Import AOS
import AOS from 'aos';

// Initialize AOS
AOS.init({
  duration: 800,
  once: true,
  offset: 100
});

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100, // Account for fixed header
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add hover effect on buttons
  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
  buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.transform = 'translateY(0)';
    });
  });

  // Initialize booking system if on contact page
  if (document.getElementById('booking-form')) {
    initializeBookingSystem();
  }
});

// Booking system functionality
function initializeBookingSystem() {
  // Set minimum date to today
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateInput.min = now.toISOString().slice(0, 16);
  }

  // Enhanced form handling with validation
  const form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', handleBookingSubmit);
  }

  // Real-time validation feedback
  const inputs = document.querySelectorAll('input[required], select[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      if (this.value.trim() !== '') {
        this.style.borderColor = '#6b7280';
        hideFieldMessage(this);
      }
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  
  if (value === '') {
    setFieldError(field, 'Dieses Feld ist erforderlich');
    return false;
  }

  // Specific validations
  switch (field.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
        return false;
      }
      break;
    
    case 'tel':
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        setFieldError(field, 'Bitte geben Sie eine gültige Telefonnummer ein');
        return false;
      }
      break;
  }

  setFieldSuccess(field);
  return true;
}

function setFieldError(field, message) {
  field.style.borderColor = '#ef4444';
  showFieldMessage(field, message, 'error');
}

function setFieldSuccess(field) {
  field.style.borderColor = '#22c55e';
  hideFieldMessage(field);
}

function showFieldMessage(field, message, type) {
  hideFieldMessage(field);
  
  const messageEl = document.createElement('div');
  messageEl.className = `field-message text-sm mt-1 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`;
  messageEl.textContent = message;
  messageEl.setAttribute('data-field-message', field.id);
  
  field.parentNode.appendChild(messageEl);
}

function hideFieldMessage(field) {
  const existingMessage = field.parentNode.querySelector(`[data-field-message="${field.id}"]`);
  if (existingMessage) {
    existingMessage.remove();
  }
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Validate all required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'privacy'];
  let isValid = true;
  
  requiredFields.forEach(fieldName => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field && !validateField(field)) {
      isValid = false;
    }
  });
  
  if (!isValid) {
    showNotification('Bitte korrigieren Sie die markierten Felder.', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Wird gesendet...';
  submitBtn.disabled = true;
  
  try {
    // Send data to Make.com webhook
    await sendToWebhook(data);
    
    showNotification('Vielen Dank für Ihre Buchungsanfrage! Wir melden uns innerhalb von 4 Stunden bei Ihnen.', 'success');
    form.reset();
    
    // Reset field styles
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.style.borderColor = '#ffffff';
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    showNotification('Es gab einen Fehler beim Senden Ihrer Anfrage. Bitte versuchen Sie es erneut.', 'error');
  } finally {
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

async function sendToWebhook(formData) {
  const webhookUrl = 'https://hook.eu2.make.com/y3a1sjyasw2clkxfw33ss4qec92fukig';
  
  // Prepare the payload with all form data
  const payload = {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    email: formData.email || '',
    phone: formData.phone || '',
    company: formData.company || '',
    website: formData.website || '',
    preferredDate: formData.preferredDate || '',
    timePreference: formData.timePreference || '',
    message: formData.message || '',
    leadSource: formData.leadSource || '',
    privacy: formData.privacy === 'on' || formData.privacy === true,
    submittedAt: new Date().toISOString(),
    source: 'subsisdium-website'
  };
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Webhook failed with status: ${response.status}`);
  }
  
  return response;
}

function showNotification(message, type) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(n => n.remove());
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}