import { Request } from 'express';
import { verifyToken } from '../utils/auth';

const PUBLIC_OPERATIONS = [
  'productsByUserId', // Our new public query
  'IntrospectionQuery' // For GraphQL playground/tools
];

export const context = async ({ req }: { req: Request }) => {
  // Check if the operation is public
  const operationName = req.body?.operationName;
  const isPublicOperation = PUBLIC_OPERATIONS.includes(operationName);

  // Skip authentication for public operations
  if (isPublicOperation) {
    return { isPublicOperation: true };
  }

  // Regular authentication for all other operations
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const user = await verifyToken(token);
    return { user, isPublicOperation: false };
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 