// @ts-nocheck
"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async find(ctx) {
    // Only return orders for the logged-in user, and populate user relation
    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        user: ctx.state.user.id,
      },
      populate: { user: { fields: ["email"] } },
    };
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    // Find the order and populate user email
    const entity = await strapi.entityService.findOne("api::order.order", id, {
      populate: { user: { fields: ["email"] } },
    });

    // Check if the order belongs to the logged-in user
    if (!entity || entity.user.id !== ctx.state.user.id) {
      return ctx.unauthorized("You cannot access this order");
    }

    return await super.findOne(ctx);
  },

  async create(ctx) {
    // Set orderDate and user to the authenticated user
    ctx.request.body.data = {
      ...(ctx.request.body.data || {}),
      orderDate: new Date(),
      user: ctx.state.user.id,
    };
    return await super.create(ctx);
  },
}));
