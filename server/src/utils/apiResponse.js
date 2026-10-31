/**
 * Centralized API response helpers.
 * Use these instead of calling res.json() directly so all responses
 * follow a consistent shape: { success, message, data? } or { success, message, errors? }
 */

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} [data]
 */
export function success(res, statusCode = 200, message = 'Success', data) {
  const body = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
}

/**
 * Send an error JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Array|null} [errors]
 */
export function error(res, statusCode = 500, message = 'An error occurred', errors) {
  const body = { success: false, message };
  if (errors !== undefined && errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Send a paginated list response.
 * @param {import('express').Response} res
 * @param {Array} items
 * @param {{ page: number, limit: number, total: number }} pagination
 * @param {string} [message]
 */
export function paginated(res, items, pagination, message = 'Success') {
  const { page, limit, total } = pagination;
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
}
