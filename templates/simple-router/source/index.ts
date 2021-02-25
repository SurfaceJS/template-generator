import CustomElement                     from "@surface/custom-element";
import WebRouter, { RouteConfiguration } from "@surface/web-router";

const routes: RouteConfiguration[] =
[
    { component: async () => import("./views/home"),  name: "home",  path: "/home", },
    { component: async () => import("./views/about"), name: "about", path: "/about" },
];

const router = new WebRouter("app-root", routes);

CustomElement.registerDirective(WebRouter.createDirectiveRegistry(router));

void import("./app");