import { AuthenticationError } from 'apollo-server-express';

export const authMiddleware = async (resolve: any, root: any, args: any, context: any, info: any) => {
  // Skip authentication check for public operations
  if (context.isPublicOperation) {
    return resolve(root, args, context, info);
  }

  // Check authentication for protected operations
  if (!context.user) {
    throw new AuthenticationError('Not authenticated');
  }

  return resolve(root, args, context, info);
}; 