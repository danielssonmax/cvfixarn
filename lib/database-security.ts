import { createClient } from "@supabase/supabase-js"
import { logSecurityEvent, SecurityEventType } from "./security-logger"

// Database security configuration
export const DB_SECURITY_CONFIG = {
  // Maximum query execution time (30 seconds)
  MAX_QUERY_TIME: 30000,
  // Maximum result set size
  MAX_RESULT_SIZE: 1000,
  // Allowed operations
  ALLOWED_OPERATIONS: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
  // Blocked patterns
  BLOCKED_PATTERNS: [
    /DROP\s+TABLE/i,
    /TRUNCATE\s+TABLE/i,
    /ALTER\s+TABLE/i,
    /CREATE\s+TABLE/i,
    /DELETE\s+FROM\s+auth\./i,
    /UPDATE\s+auth\./i,
    /INSERT\s+INTO\s+auth\./i,
  ],
}

// Database client with security enhancements
export class SecureDatabaseClient {
  private supabase: any
  private userId?: string
  private isServiceRole: boolean

  constructor(serviceRole: boolean = false) {
    if (serviceRole) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
      this.isServiceRole = true
    } else {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
      this.isServiceRole = false
    }
  }

  // Set user context for RLS
  setUserContext(userId: string) {
    this.userId = userId
  }

  // Validate query for security
  private validateQuery(query: string): { valid: boolean; error?: string } {
    // Check for blocked patterns
    for (const pattern of DB_SECURITY_CONFIG.BLOCKED_PATTERNS) {
      if (pattern.test(query)) {
        return {
          valid: false,
          error: `Blocked query pattern detected: ${pattern}`
        }
      }
    }

    // Check query length
    if (query.length > 10000) {
      return {
        valid: false,
        error: 'Query too long'
      }
    }

    return { valid: true }
  }

  // Secure select operation
  async select(
    table: string,
    columns: string = '*',
    filters?: Record<string, any>,
    options?: { limit?: number; orderBy?: string }
  ) {
    try {
      // Validate table name
      if (!this.isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`)
      }

      // Build query
      let query = this.supabase.from(table).select(columns)

      // Apply filters
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value)
        }
      }

      // Apply options
      if (options?.limit) {
        query = query.limit(Math.min(options.limit, DB_SECURITY_CONFIG.MAX_RESULT_SIZE))
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy)
      }

      // Execute query with timeout
      const result = await Promise.race([
        query,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), DB_SECURITY_CONFIG.MAX_QUERY_TIME)
        )
      ])

      return result
    } catch (error) {
      // Log security event
      logSecurityEvent(
        SecurityEventType.SQL_INJECTION_ATTEMPT,
        {} as any,
        { 
          table, 
          columns, 
          filters, 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: this.userId 
        },
        this.userId,
        undefined,
        'high'
      )
      throw error
    }
  }

  // Secure insert operation
  async insert(table: string, data: Record<string, any>) {
    try {
      // Validate table name
      if (!this.isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`)
      }

      // Validate data
      const validatedData = this.validateInsertData(table, data)
      if (!validatedData.valid) {
        throw new Error(validatedData.error)
      }

      // Execute insert
      const result = await this.supabase
        .from(table)
        .insert(validatedData.data)

      return result
    } catch (error) {
      // Log security event
      logSecurityEvent(
        SecurityEventType.SQL_INJECTION_ATTEMPT,
        {} as any,
        { 
          table, 
          data, 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: this.userId 
        },
        this.userId,
        undefined,
        'high'
      )
      throw error
    }
  }

  // Secure update operation
  async update(
    table: string,
    data: Record<string, any>,
    filters: Record<string, any>
  ) {
    try {
      // Validate table name
      if (!this.isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`)
      }

      // Validate data
      const validatedData = this.validateUpdateData(table, data)
      if (!validatedData.valid) {
        throw new Error(validatedData.error)
      }

      // Build query
      let query = this.supabase.from(table).update(validatedData.data)

      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value)
      }

      // Execute update
      const result = await query

      return result
    } catch (error) {
      // Log security event
      logSecurityEvent(
        SecurityEventType.SQL_INJECTION_ATTEMPT,
        {} as any,
        { 
          table, 
          data, 
          filters,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: this.userId 
        },
        this.userId,
        undefined,
        'high'
      )
      throw error
    }
  }

  // Secure delete operation
  async delete(table: string, filters: Record<string, any>) {
    try {
      // Validate table name
      if (!this.isValidTableName(table)) {
        throw new Error(`Invalid table name: ${table}`)
      }

      // Build query
      let query = this.supabase.from(table).delete()

      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value)
      }

      // Execute delete
      const result = await query

      return result
    } catch (error) {
      // Log security event
      logSecurityEvent(
        SecurityEventType.SQL_INJECTION_ATTEMPT,
        {} as any,
        { 
          table, 
          filters,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: this.userId 
        },
        this.userId,
        undefined,
        'high'
      )
      throw error
    }
  }

  // Validate table name
  private isValidTableName(table: string): boolean {
    // Only allow alphanumeric characters and underscores
    const validTablePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/
    return validTablePattern.test(table)
  }

  // Validate insert data
  private validateInsertData(
    table: string,
    data: Record<string, any>
  ): { valid: boolean; data?: Record<string, any>; error?: string } {
    try {
      // Sanitize data
      const sanitizedData: Record<string, any> = {}
      
      for (const [key, value] of Object.entries(data)) {
        // Validate key
        if (!this.isValidColumnName(key)) {
          return { valid: false, error: `Invalid column name: ${key}` }
        }

        // Sanitize value
        sanitizedData[key] = this.sanitizeValue(value)
      }

      return { valid: true, data: sanitizedData }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Data validation failed' 
      }
    }
  }

  // Validate update data
  private validateUpdateData(
    table: string,
    data: Record<string, any>
  ): { valid: boolean; data?: Record<string, any>; error?: string } {
    return this.validateInsertData(table, data)
  }

  // Validate column name
  private isValidColumnName(column: string): boolean {
    // Only allow alphanumeric characters and underscores
    const validColumnPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/
    return validColumnPattern.test(column)
  }

  // Sanitize value
  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // Remove potential SQL injection patterns
      return value
        .replace(/[';]/g, '') // Remove quotes and semicolons
        .replace(/--/g, '') // Remove SQL comments
        .replace(/\/\*/g, '') // Remove block comments
        .replace(/\*\//g, '') // Remove block comments
        .trim()
    }
    return value
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const stats = {
        activeConnections: 0, // This would need to be implemented with proper monitoring
        queryCount: 0, // This would need to be implemented with proper monitoring
        errorCount: 0, // This would need to be implemented with proper monitoring
        lastBackup: null, // This would need to be implemented with proper monitoring
      }

      return stats
    } catch (error) {
      console.error('Error getting database stats:', error)
      return null
    }
  }
}

// Export singleton instances
export const secureDbClient = new SecureDatabaseClient(false)
export const secureDbServiceClient = new SecureDatabaseClient(true)
