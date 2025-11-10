/**
 * Services Index
 * 
 * Central export point for all service modules.
 * This provides a clean API for consuming services throughout the application.
 */

// Authentication Service
export * from './auth.service';
export { authService } from './auth.service';

// User Service
export * from './user.service';
export { userService } from './user.service';

// Post Service
export * from './post.service';
export { postService } from './post.service';

// Trade Service
export * from './trade.service';
export { tradeService } from './trade.service';

// Chat Service
export * from './chat.service';
export { chatService } from './chat.service';

// Comments Service
export * from './comments.service';
export { commentsService } from './comments.service';

// Withdrawal Service
export * from './withdrawal.service';
export { withdrawalService } from './withdrawal.service';

// Firebase Service (base operations)
export * from './firebase.service';
export { firebaseService } from './firebase.service';
