import CustomElement, { element } from "@surface/custom-element";
import template                   from "./index.html";
import style                      from "./index.scss";

@element("about-view", template, style)
export default class AboutView extends CustomElement
{ }