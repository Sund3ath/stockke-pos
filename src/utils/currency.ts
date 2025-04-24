import { useStore } from '../store';

export const formatPrice = (price: number): string => {
  const { settings } = useStore.getState();
  const { currency } = settings;
  
  const formattedPrice = price.toFixed(2);
  
  return currency.position === 'before'
    ? `${currency.symbol}${formattedPrice}`
    : `${formattedPrice}${currency.symbol}`;
}; 