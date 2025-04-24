import { jsPDF } from 'jspdf';
import { OrderItem } from '../types';
import { useStore } from '../store';
import { calculateTax } from './tax';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;

export const generateInvoice = (items: OrderItem[], total: number, paymentMethod: 'cash' | 'card' = 'cash', cashReceived?: number) => {
  const store = useStore.getState();
  const { settings } = store;
  const now = new Date();
  
  // Create new document
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  // Set fonts
  doc.setFont('helvetica', 'normal');
  
  // Header section
  doc.setFontSize(12);
  doc.text('YOUR', MARGIN, 30);
  doc.text('LOGO', MARGIN, 40);
  
  doc.setFontSize(10);
  doc.text(`NO. ${String(Date.now()).slice(-6).padStart(6, '0')}`, PAGE_WIDTH - MARGIN - 40, 30);
  
  // INVOICE title
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', MARGIN, 80);
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${now.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })}`, MARGIN, 100);
  
  // Billing Information
  doc.setFontSize(10);
  doc.text('Billed to:', MARGIN, 120);
  doc.text('From:', PAGE_WIDTH / 2, 120);
  
  // Company details
  doc.setFont('helvetica', 'bold');
  doc.text(settings.company.name, MARGIN, 130);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.company.address.split('\n'), MARGIN, 140);
  doc.text(settings.company.email, MARGIN, 150);
  
  // From details
  doc.text(settings.company.name, PAGE_WIDTH / 2, 130);
  doc.text(settings.company.address.split('\n'), PAGE_WIDTH / 2, 140);
  doc.text(settings.company.email, PAGE_WIDTH / 2, 150);
  
  // Table header
  const tableTop = 180;
  const tableHeaders = ['Item', 'Quantity', 'Price', 'Amount'];
  const colWidths = [80, 30, 30, 30];
  let currentX = MARGIN;
  
  // Draw table header background
  doc.setFillColor(240, 240, 240);
  doc.rect(MARGIN, tableTop - 10, PAGE_WIDTH - (MARGIN * 2), 12, 'F');
  
  // Draw table headers
  doc.setFont('helvetica', 'bold');
  tableHeaders.forEach((header, i) => {
    doc.text(header, currentX, tableTop);
    currentX += colWidths[i];
  });
  
  // Table content
  let y = tableTop + 20;
  doc.setFont('helvetica', 'normal');
  
  items.forEach((item) => {
    currentX = MARGIN;
    doc.text(item.product.name, currentX, y);
    doc.text(item.quantity.toString(), currentX + colWidths[0], y);
    doc.text(`€${item.product.price.toFixed(2)}`, currentX + colWidths[0] + colWidths[1], y);
    doc.text(`€${(item.product.price * item.quantity).toFixed(2)}`, currentX + colWidths[0] + colWidths[1] + colWidths[2], y);
    y += 12;
  });
  
  // Total
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', PAGE_WIDTH - MARGIN - 60, y);
  doc.text(`€${total.toFixed(2)}`, PAGE_WIDTH - MARGIN - 30, y);
  
  // Payment details
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment method: ${paymentMethod}`, MARGIN, y);
  if (paymentMethod === 'cash' && cashReceived) {
    y += 10;
    doc.text(`Cash received: €${cashReceived.toFixed(2)}`, MARGIN, y);
    doc.text(`Change: €${(cashReceived - total).toFixed(2)}`, MARGIN, y + 10);
  }
  
  // Note
  y += 30;
  doc.text('Note:', MARGIN, y);
  doc.text('Thank you for choosing us!', MARGIN, y + 10);
  
  // Footer wave decoration
  const footerY = PAGE_HEIGHT - 40;
  doc.setFillColor(200, 200, 200);
  doc.rect(0, footerY, PAGE_WIDTH, 20, 'F');
  doc.setFillColor(80, 80, 80);
  doc.rect(0, footerY + 20, PAGE_WIDTH, 20, 'F');
  
  // Save the PDF
  doc.save(`invoice-${now.getTime()}.pdf`);
};