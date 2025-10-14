import { sql, initializeDatabase } from '@/config/database';

export interface DatabaseUser {
  id: number;
  google_id: string;
  uuid: string;
  email: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface CreateUserData {
  google_id: string;
  uuid: string;
  email: string;
  name: string;
}

class UserService {
  private initialized = false;

  private async ensureInitialized() {
    if (!this.initialized && sql) {
      try {
        await initializeDatabase();
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
      }
    }
  }

  async createUser(userData: CreateUserData): Promise<DatabaseUser | null> {
    if (!sql) {
      console.warn('Database not configured, skipping user creation');
      return null;
    }

    try {
      await this.ensureInitialized();

      const domain = userData.email.split('@')[1];

      const result = await sql`
        INSERT INTO users (google_id, uuid, email, name, domain, created_at, updated_at, last_login)
        VALUES (${userData.google_id}, ${userData.uuid}, ${userData.email}, ${userData.name}, ${domain}, NOW(), NOW(), NOW())
        RETURNING *;
      `;

      return result[0] as DatabaseUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUserByGoogleId(googleId: string): Promise<DatabaseUser | null> {
    if (!sql) {
      console.warn('Database not configured, skipping user lookup');
      return null;
    }

    try {
      await this.ensureInitialized();

      const result = await sql`
        SELECT * FROM users WHERE google_id = ${googleId} LIMIT 1;
      `;

      return result[0] as DatabaseUser || null;
    } catch (error) {
      console.error('Failed to get user by Google ID:', error);
      throw error;
    }
  }

  async getUserByUuid(uuid: string): Promise<DatabaseUser | null> {
    if (!sql) {
      console.warn('Database not configured, skipping user lookup');
      return null;
    }

    try {
      await this.ensureInitialized();

      const result = await sql`
        SELECT * FROM users WHERE uuid = ${uuid} LIMIT 1;
      `;

      return result[0] as DatabaseUser || null;
    } catch (error) {
      console.error('Failed to get user by UUID:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    if (!sql) {
      console.warn('Database not configured, skipping user lookup');
      return null;
    }

    try {
      await this.ensureInitialized();

      const result = await sql`
        SELECT * FROM users WHERE email = ${email} LIMIT 1;
      `;

      return result[0] as DatabaseUser || null;
    } catch (error) {
      console.error('Failed to get user by email:', error);
      throw error;
    }
  }

  async updateUserLogin(googleId: string): Promise<void> {
    if (!sql) {
      console.warn('Database not configured, skipping login update');
      return;
    }

    try {
      await this.ensureInitialized();

      await sql`
        UPDATE users
        SET last_login = NOW(), updated_at = NOW()
        WHERE google_id = ${googleId};
      `;
    } catch (error) {
      console.error('Failed to update user login:', error);
      throw error;
    }
  }

  async createOrUpdateUser(userData: CreateUserData): Promise<DatabaseUser | null> {
    if (!sql) {
      console.warn('Database not configured, skipping user upsert');
      return null;
    }

    try {
      await this.ensureInitialized();

      // Check if user exists
      const existingUser = await this.getUserByGoogleId(userData.google_id);

      if (existingUser) {
        // Update existing user's login time and return
        await this.updateUserLogin(userData.google_id);

        // Fetch updated user data
        const updatedUser = await this.getUserByGoogleId(userData.google_id);
        return updatedUser;
      } else {
        // Create new user
        return await this.createUser(userData);
      }
    } catch (error) {
      console.error('Failed to create or update user:', error);
      throw error;
    }
  }

  async updateUserProfile(googleId: string, updates: Partial<Pick<CreateUserData, 'name' | 'email'>>): Promise<DatabaseUser | null> {
    if (!sql) {
      console.warn('Database not configured, skipping profile update');
      return null;
    }

    try {
      await this.ensureInitialized();

      const setParts = [];
      const values = [];

      if (updates.name) {
        setParts.push(`name = $${setParts.length + 1}`);
        values.push(updates.name);
      }

      if (updates.email) {
        setParts.push(`email = $${setParts.length + 1}`);
        values.push(updates.email);

        const domain = updates.email.split('@')[1];
        setParts.push(`domain = $${setParts.length + 1}`);
        values.push(domain);
      }

      setParts.push(`updated_at = NOW()`);
      values.push(googleId);

      if (setParts.length === 1) { // Only updated_at, no actual changes
        return await this.getUserByGoogleId(googleId);
      }

      const query = `
        UPDATE users
        SET ${setParts.join(', ')}
        WHERE google_id = $${values.length}
        RETURNING *;
      `;

      const result = await sql.unsafe(query, values);
      return result[0] as DatabaseUser || null;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }
}

export const userService = new UserService();