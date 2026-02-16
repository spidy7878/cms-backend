"use strict";

/**
 * order router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

const defaultRouter = createCoreRouter("api::order.order");

const customRoutes = [
  {
    method: "GET",
    path: "/orders/me",
    handler: "order.me",
    config: {
      policies: [],
      middlewares: [],
    },
  },
];

module.exports = {
  routes: [...defaultRouter.routes, ...customRoutes],
};
