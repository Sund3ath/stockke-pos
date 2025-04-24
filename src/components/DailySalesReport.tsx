import React from 'react';
import { useStore } from '../store';
import { fetchDailySales } from '../api/orders';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DailySalesItem {
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  taxRate: number;
}

interface DailySalesReportProps {
  date: Date;
}

const DailySalesReport: React.FC<DailySalesReportProps> = ({ date }) => {
  const { settings } = useStore();

  const generateReport = async () => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const salesData = await fetchDailySales(formattedDate);

      if (!salesData) {
        throw new Error('Keine Verkaufsdaten für diesen Tag gefunden');
      }

      // Create PDF document
      const doc = new jsPDF();
      
      // Add company header
      doc.setFontSize(20);
      doc.text(settings.company.name, 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      const addressLines = settings.company.address.split(',').map(line => line.trim());
      addressLines.forEach((line, index) => {
        doc.text(line, 105, 30 + (index * 5), { align: 'center' });
      });
      doc.text(`Tel: ${settings.company.phone}`, 105, 30 + (addressLines.length * 5), { align: 'center' });
      
      // Add report title
      doc.setFontSize(16);
      doc.text('Tagesabschlussbericht', 105, 50, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.text(
        format(date, "EEEE, d. MMMM yyyy", { locale: de }),
        105,
        60,
        { align: 'center' }
      );
      
      // Add summary
      doc.setFontSize(12);
      doc.text(`Anzahl Bestellungen: ${salesData.orderCount}`, 20, 80);
      doc.text(`Gesamtumsatz: ${settings.currency.symbol}${salesData.total.toFixed(2)}`, 20, 90);
      
      // Prepare table data
      const tableData = salesData.items.map((item: DailySalesItem) => [
        item.productName,
        item.quantity.toString(),
        `${settings.currency.symbol}${item.total.toFixed(2)}`,
        `${item.taxRate}%`
      ]);
      
      // Add table
      autoTable(doc, {
        startY: 100,
        head: [['Produkt', 'Menge', 'Umsatz', 'MwSt.']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'right' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' }
        }
      });
      
      // Add footer with page numbers
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Seite ${i} von ${totalPages}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      doc.save(`Tagesabschluss_${formattedDate}.pdf`);
      
      console.log('PDF successfully generated');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Fehler beim Generieren des Berichts: ' + (error as Error).message);
    }
  };

  return (
    <button
      onClick={generateReport}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
      Tagesabschlussbericht generieren
    </button>
  );
};

export default DailySalesReport; 