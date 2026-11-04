/**
 * @fileoverview Type definitions and DTO skeletons for Social module
 */

/**
 * @typedef {Object} PostDTO
 * @property {number} id
 * @property {number} place_id
 * @property {number} user_id
 * @property {string} title
 * @property {string} content
 * @property {string} post_type - 'deal' | 'announcement' | 'update'
 * @property {string|null} discount_code
 * @property {number|null} discount_percentage
 * @property {string|null} expires_at
 * @property {boolean} is_active
 * @property {number} likes_count
 * @property {boolean} is_liked_by_user
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} CreatePostDTO
 * @property {string} title
 * @property {string} content
 * @property {string} post_type
 * @property {string} [discount_code]
 * @property {number} [discount_percentage]
 * @property {string} [expires_at]
 */

// TODO: Export TypeScript types or PropTypes when strict typing is configured

