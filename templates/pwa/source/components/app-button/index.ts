import CustomElement, { attribute, element } from "@surface/custom-element";
import template                              from "./index.html";
import style                                 from "./index.scss";

@element("app-button", template, style)
export default class Button extends CustomElement
{
    @attribute
    public fab = false;

    @attribute
    public flat = false;

    @attribute
    public text = false;
}