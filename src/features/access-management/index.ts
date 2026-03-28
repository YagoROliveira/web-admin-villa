/**
 * Access Management feature — Admin-only page for managing user roles & permissions.
 *
 * Provides:
 * - List of all panel users with their current roles
 * - Ability to change user roles (SUPER_ADMIN, ADMIN, VENDOR, VENDOR_EMPLOYEE)
 * - Ability to customize per-user permissions (override defaults)
 * - Invite new users to the panel
 * - Revoke access
 */

export { AccessManagement } from './components/access-management-page'
