import { StateCreator } from 'zustand';
import { Table, Order } from '../types';

export interface TableSlice {
  tables: Table[];
  selectedTable: Table | null;
  selectTable: (tableId: string | null) => void;
  occupyTable: (tableId: string, order: Order) => void;
  clearTable: (tableId: string) => void;
}

const initialTables: Table[] = [
  { id: '1', name: '1', occupied: false, currentOrder: null },
  { id: '2', name: '2', occupied: false, currentOrder: null },
  { id: '3', name: '3', occupied: false, currentOrder: null },
  { id: '4', name: '4', occupied: false, currentOrder: null },
  { id: '5', name: '5', occupied: false, currentOrder: null },
  { id: '6', name: '6', occupied: false, currentOrder: null },
  { id: '7', name: '7', occupied: false, currentOrder: null },
  { id: '8', name: '8', occupied: false, currentOrder: null },
  { id: '9', name: '9', occupied: false, currentOrder: null },
  { id: '10', name: '10', occupied: false, currentOrder: null },
  { id: '11', name: '11', occupied: false, currentOrder: null },
  { id: '12', name: '12', occupied: false, currentOrder: null },
  // Virtual table for pickup orders
  { id: 'pickup', name: 'Pickup', occupied: false, currentOrder: null },
];

export const createTableSlice: StateCreator<TableSlice> = (set, get) => ({
  tables: initialTables,
  selectedTable: null,
  selectTable: (tableId) => {
    if (!tableId) {
      set({ selectedTable: null });
      return;
    }

    const table = get().tables.find((t) => t.id === tableId);
    set({ selectedTable: table || null });
  },
  occupyTable: (tableId, order) => {
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId
          ? { ...table, occupied: true, currentOrder: order }
          : table
      ),
    }));
  },
  clearTable: (tableId) => {
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId
          ? { ...table, occupied: false, currentOrder: null }
          : table
      ),
    }));
  },
});