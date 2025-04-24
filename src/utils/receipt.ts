import { jsPDF } from 'jspdf';
import { OrderItem } from '../types';
import { useStore } from '../store';
import { calculateTax } from './tax';

// Constants for receipt formatting (72mm thermal printer)
const PAGE_WIDTH = 72;
const MARGIN = 4;
const LINE_HEIGHT = 6; // Increased line height
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

// Helper function to split long text into multiple lines
const splitText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = doc.getStringUnitWidth(`${currentLine} ${word}`) * doc.getFontSize() / doc.internal.scaleFactor;
    
    if (width < maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

const centerText = (doc: jsPDF, text: string, y: number, fontSize: number = 10): number => {
  doc.setFontSize(fontSize);
  const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
  const x = (PAGE_WIDTH - textWidth) / 2;
  doc.text(text, x, y);
  return y + LINE_HEIGHT;
};

const leftText = (doc: jsPDF, text: string, y: number, fontSize: number = 10): number => {
  doc.setFontSize(fontSize);
  doc.text(text, MARGIN, y);
  return y + LINE_HEIGHT;
};

const rightText = (doc: jsPDF, text: string, y: number, fontSize: number = 10): number => {
  doc.setFontSize(fontSize);
  const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
  doc.text(text, PAGE_WIDTH - MARGIN - textWidth, y);
  return y + LINE_HEIGHT;
};

const drawLine = (doc: jsPDF, y: number): number => {
  doc.setDrawColor(0);
  doc.line(MARGIN, y - 2, PAGE_WIDTH - MARGIN, y - 2);
  return y + LINE_HEIGHT;
};

const formatCurrency = (amount: number): string => `€${amount.toFixed(2)}`;

export const generateReceipt = (
  items: OrderItem[], 
  total: number, 
  paymentMethod: 'cash' | 'card', 
  cashReceived?: number,
  isIndoor: boolean = true
): void => {
  const store = useStore.getState();
  const { settings } = store;
  const now = new Date();

  // Create new document
  const doc = new jsPDF({
    unit: 'mm',
    format: [PAGE_WIDTH, 180],
    orientation: 'portrait'
  });

  // Set font
  doc.setFont('Helvetica');
  let y = MARGIN + 2;

  // Header
  y = centerText(doc, settings.company.name, y, 12);
  
  // Split address into multiple lines if needed
  const addressLines = settings.company.address.split(',');
  addressLines.forEach(line => {
    y = centerText(doc, line.trim(), y, 8);
  });
  
  y = centerText(doc, settings.company.phone || '', y, 8);
  y = centerText(doc, settings.company.email || '', y, 8);
  y = drawLine(doc, y + 2);

  // Tax ID and Company Info
  y = leftText(doc, `Tax ID: ${settings.company.taxId}`, y, 8);
  y = leftText(doc, `Date: ${now.toLocaleDateString()}`, y, 8);
  y = leftText(doc, `Time: ${now.toLocaleTimeString()}`, y, 8);
  y = leftText(doc, `Location: ${isIndoor ? 'Indoor' : 'Outdoor'}`, y, 8);
  y = drawLine(doc, y + 2);

  // Items
  items.forEach(item => {
    const itemTotal = item.product.price * item.quantity;
    const taxRate = isIndoor || item.product.category === 'drinks' ? 19 : 7;
    
    // Item name and quantity
    const itemText = `${item.quantity}x ${item.product.name}`;
    y = leftText(doc, itemText, y, 9);
    
    // Price on the next line, aligned right
    const priceText = formatCurrency(itemTotal);
    y = rightText(doc, priceText, y - LINE_HEIGHT, 9);
    
    // Tax rate on a new line
    y = leftText(doc, `(${taxRate}% VAT)`, y, 7);
  });

  y = drawLine(doc, y + 2);

  // Tax summary
  const taxGroups = items.reduce((acc, item) => {
    const taxRate = isIndoor || item.product.category === 'drinks' ? 19 : 7;
    if (!acc[taxRate]) acc[taxRate] = [];
    acc[taxRate].push(item);
    return acc;
  }, {} as Record<number, OrderItem[]>);

  Object.entries(taxGroups).forEach(([rate, groupItems]) => {
    const subtotal = groupItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const { net, tax } = calculateTax(subtotal, Number(rate));
    
    y = leftText(doc, `${rate}% VAT`, y, 8);
    y = rightText(doc, `Net: ${formatCurrency(net)}`, y - LINE_HEIGHT, 8);
    y = rightText(doc, `VAT: ${formatCurrency(tax)}`, y, 8);
  });

  y = drawLine(doc, y + 2);

  // Total
  doc.setFontSize(12);
  doc.text('Total:', MARGIN, y);
  doc.text(formatCurrency(total), PAGE_WIDTH - MARGIN - doc.getStringUnitWidth(formatCurrency(total)) * 12 / doc.internal.scaleFactor, y);
  y += LINE_HEIGHT * 1.5;

  // Payment details
  y = leftText(doc, `Payment: ${paymentMethod.toUpperCase()}`, y, 9);
  if (paymentMethod === 'cash' && cashReceived) {
    y = leftText(doc, `Cash received: ${formatCurrency(cashReceived)}`, y, 9);
    y = leftText(doc, `Change: ${formatCurrency(cashReceived - total)}`, y, 9);
  }

  y = drawLine(doc, y + 2);

  // TSE Information
  y = leftText(doc, 'TSE Information:', y, 8);
  y = leftText(doc, `Device ID: ${settings.tse.deviceId}`, y, 8);
  y = leftText(doc, `Signature:`, y, 8);
  y = leftText(doc, `TSE-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(), y, 8);
  y = leftText(doc, `Transaction: ${Date.now()}`, y, 8);

  y = drawLine(doc, y + 2);

  // Footer
  y = centerText(doc, 'Thank you for your visit!', y, 9);

  // Save the PDF
  doc.save(`receipt-${now.getTime()}.pdf`);
};