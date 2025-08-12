class AdminNotificationService {
  constructor() {
    this.adminEmail = 'webuydiabeticteststripsOK@gmail.com'; // Your business email
    this.publicKey = 'sZ0fk29rxp7rdd1LD'; // Your actual EmailJS public key
    this.serviceId = 'service_wbtsok'; // Your actual service ID
    this.adminTemplateId = 'template_29pkgpq'; // Using your existing template for now
    
    // Initialize EmailJS
    emailjs.init(this.publicKey);
  }
  
  async sendOrderApprovalRequest(orderData, photos) {
    try {
      // Convert photos to base64 strings for email
      const photoAttachments = await this.preparePhotoAttachments(photos);
      
      // Format order items for display
      const itemsList = this.formatOrderItems(orderData.items);
      
      const templateParams = {
        email: this.adminEmail,
        passcode: `ORDER-${orderData.id}`,
        message: `🆘 NEW ORDER REQUIRES APPROVAL

📋 ORDER DETAILS
Order ID: ${orderData.id}
Customer: ${orderData.firstName} ${orderData.lastName}
Email: ${orderData.email}
Phone: ${orderData.phone || 'Not provided'}

🛒 ITEMS ORDERED
${itemsList}

💰 ORDER TOTAL: $${orderData.total}
📸 Photos Uploaded: ${photos.length}

🎯 NEXT STEPS:
1. Review uploaded photos in admin panel
2. Verify item quantities and condition
3. Approve or request changes
4. Send prepaid shipping label to customer

👉 REVIEW ORDER: https://www.webuyteststripsoklahoma.com/admin-approval.html?order=${orderData.id}

Please review and approve this order in the admin panel.`,
        name: `Admin - Order Review ${orderData.id}`
      };
      
      const response = await emailjs.send(
        this.serviceId,
        this.adminTemplateId,
        templateParams
      );
      
      console.log('✅ Admin approval email sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to send admin approval email:', error);
      return { success: false, error };
    }
  }
  
  async preparePhotoAttachments(photos) {
    // For now, we'll just send photo count and links
    // In a real implementation, you might upload to cloud storage
    return photos.map((photo, index) => ({
      name: `photo_${index + 1}.jpg`,
      size: photo.file.size,
      type: photo.file.type
    }));
  }
  
  formatOrderItems(items) {
    if (!items || items.length === 0) {
      return "No items found in order";
    }
    
    return items.map((item, index) => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      return `${index + 1}. ${item.name}
   Quantity: ${item.quantity}
   Unit Price: $${item.price}
   Subtotal: $${itemTotal}
   Model: ${item.model || 'Not specified'}`;
    }).join('\n\n');
  }
}

// Create global instance
window.adminNotificationService = new AdminNotificationService();