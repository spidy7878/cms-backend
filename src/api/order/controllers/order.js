// @ts-nocheck
"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Please log in to create an order");
    }

    const { items, totalQuantity } = ctx.request.body.data;

    try {
      // First create the order without the user relation
      const order = await strapi.documents("api::order.order").create({
        data: {
          items,
          totalQuantity,
          orderDate: new Date(),
          userEmail: user.email,
        },
        status: "published",
      });

      // Then update to add the user relation
      const updatedOrder = await strapi.documents("api::order.order").update({
        documentId: order.documentId,
        data: {
          user: user.id,
        },
      });

      return { data: updatedOrder };
    } catch (err) {
      console.error("Order creation error:", err);
      return ctx.badRequest(`Order creation failed: ${err.message}`);
    }
  },

  async find(ctx) {
    const user = ctx.state.user;
    ctx.query.filters = {
      ...ctx.query.filters,
      user: { id: user.id },
    };
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.entityService.findOne("api::order.order", id, {
      populate: { user: true },
    });

    if (!entity || entity.user.id !== ctx.state.user.id) {
      return ctx.unauthorized("You cannot access this order");
    }

    return await super.findOne(ctx);
  },
}));
