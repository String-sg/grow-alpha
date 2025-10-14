# Database Integration with Neon PostgreSQL

This document explains the database integration implemented for user authentication and profile management.

## Overview

The app now integrates with Neon PostgreSQL to store user profiles while maintaining AsyncStorage as a local cache for offline functionality.

## Architecture

- **Database**: Neon PostgreSQL (serverless)
- **Local Cache**: AsyncStorage (React Native)
- **Sync Strategy**: Online-first with offline fallback

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
DATABASE_URL=your-neon-database-connection-string
```

### App Configuration

Database URL is loaded via `app.config.js`:

```javascript
extra: {
  databaseUrl: process.env.DATABASE_URL,
}
```

## Services

### UserService (`services/userService.ts`)

Handles all database operations for users:

- `createUser(userData)` - Create new user
- `getUserByGoogleId(googleId)` - Lookup user by Google ID
- `getUserByUuid(uuid)` - Lookup user by UUID
- `updateUserLogin(googleId)` - Update last login time
- `createOrUpdateUser(userData)` - Upsert operation
- `updateUserProfile(googleId, updates)` - Update user profile

## Authentication Flow

1. **Google OAuth** → User provides Google credentials
2. **Domain Validation** → Email domain checked against MOE whitelist
3. **Database Sync** → User profile created/updated in Neon DB
4. **Local Cache** → User data stored in AsyncStorage
5. **Background Sync** → Data synced when connectivity restored

### First Sign-In
```typescript
// New user flow
const dbUser = await userService.createOrUpdateUser({
  google_id: userInfo.id,
  uuid: generateUUID(),
  email: userInfo.email,
  name: userInfo.name,
});
```

### Returning User
```typescript
// Existing user flow
await userService.updateUserLogin(userInfo.id);
const dbUser = await userService.getUserByGoogleId(userInfo.id);
```

## Offline Handling

### Local-First Approach
- All authentication works offline using AsyncStorage
- Database operations are attempted when online
- Failed database operations don't block authentication

### Network Reconnection
```typescript
// Auto-sync when network restored
useEffect(() => {
  NetInfo.addEventListener(state => {
    if (wasOffline && state.isConnected && user && !isDemoMode) {
      syncUserWithDatabase();
    }
  });
}, []);
```

## Testing

### Database Connection Test

```bash
npm run test:database
```

This script tests:
1. Database connectivity
2. Table creation
3. User CRUD operations
4. Data cleanup

### Manual Testing
1. Set `DATABASE_URL` in `.env`
2. Run the app with `npm start`
3. Sign in with Google OAuth
4. Check console logs for database sync messages

## Error Handling

### Graceful Degradation
- App continues to work if database is unavailable
- Local data in AsyncStorage is preserved
- Sync attempts resume when connectivity restored

### Error Logging
```typescript
try {
  await userService.createOrUpdateUser(userData);
} catch (error) {
  console.error('Failed to sync with database:', error);
  // Continue with local authentication
}
```

## Security Considerations

- Database credentials stored in environment variables
- SQL injection prevention via parameterized queries
- Email domain validation enforced
- UUID generation for user tracking

## Monitoring

Key logs to monitor:
- `"Syncing user with database..."` - Database sync initiated
- `"User synced with database successfully"` - Sync completed
- `"Failed to sync user with database"` - Sync failed (investigate)
- `"Network reconnected, syncing user data..."` - Auto-sync triggered

## Future Enhancements

1. **Podcast Progress Sync** - Sync audio progress across devices
2. **Quiz Results Storage** - Store quiz scores in database
3. **User Preferences** - Sync app preferences
4. **Analytics** - Track user engagement metrics
5. **Batch Sync** - Queue operations for bulk sync when online

## Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check `DATABASE_URL` in `.env`
   - Verify Neon database is accessible
   - Run `npm run test:database`

2. **User sync fails silently**
   - Check console logs for error details
   - Verify network connectivity
   - Check database permissions

3. **Duplicate UUID issues**
   - Clear AsyncStorage data
   - Re-authenticate user
   - Database will generate new UUID

### Debug Mode
Enable detailed logging:
```typescript
console.log('Database sync attempt:', {
  isOffline,
  isDemoMode,
  user: user?.email,
  timestamp: new Date().toISOString()
});
```