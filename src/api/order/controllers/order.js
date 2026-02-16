// @ts-nocheck
"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async find(ctx) {
    // Only return orders for the logged-in user
    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        user: ctx.state.user.id,
      },
    };
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    // Find the order
    const entity = await strapi.entityService.findOne("api::order.order", id, {
      populate: { user: true },
    });

    // Check if the order belongs to the logged-in user
    if (!entity || entity.user.id !== ctx.state.user.id) {
      return ctx.unauthorized("You cannot access this order");
    }

    return await super.findOne(ctx);
  },

  async create(ctx) {
    // Attach the authenticated user to the order
    const { items, totalQuantity } = ctx.request.body.data || {};

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return ctx.badRequest("Items array is required and cannot be empty");
    }

    if (!totalQuantity || totalQuantity <= 0) {
      return ctx.badRequest("Valid totalQuantity is required");
    }

    ctx.request.body.data = {
      items,
      totalQuantity,
      orderDate: new Date(),
      user: ctx.state.user.id, // Set user from context
      userEmail: ctx.state.user.email, // Auto-populate user email
    };

    return await super.create(ctx);
  },

  async me(ctx) {
    // Get all orders for the authenticated user with populated data
    const orders = await strapi.entityService.findMany("api::order.order", {
      filters: {
        user: ctx.state.user.id,
      },
      sort: { orderDate: "desc" },
      populate: {
        user: {
          fields: ["username", "email"],
        },
      },
    });

    return { data: orders };
  },
}));
