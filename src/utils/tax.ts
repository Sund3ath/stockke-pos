export const calculateTax = (
  price: number,
  taxRate: number,
  quantity: number = 1
): { net: number; tax: number; gross: number } => {
  const gross = price * quantity;
  const net = gross / (1 + taxRate / 100);
  const tax = gross - net;
  
  return {
    net: Number(net.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    gross: Number(gross.toFixed(2))
  };
};

export const getTaxRate = (
  category: 'mains' | 'sides' | 'drinks',
  isIndoor: boolean,
  settings: any
): number => {
  if (category === 'drinks') {
    return 19; // Drinks always 19%
  }
  
  return isIndoor ? settings.tax.indoor.food : settings.tax.outdoor.food;
};