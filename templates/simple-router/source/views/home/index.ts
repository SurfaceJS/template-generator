import CustomElement, { element } from "@surface/custom-element";
import template                   from "./index.html";
import style                      from "./index.scss";

@element("home-view", template, style)
export default class HomeView extends CustomElement
{ }