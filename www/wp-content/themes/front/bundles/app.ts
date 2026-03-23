"use strict";

// import gsap from "gsap";
// import CustomEase from "gsap/CustomEase";

import { Input } from "atoms/input";
import { Media } from "atoms/media";
import { Number } from "atoms/number";
import { Scrollbar } from "atoms/scrollbar";
import { Select } from "atoms/select";
import { Textarea } from "atoms/textarea";
import { Accordions } from "blocks/accordions";
import { DemoPreview } from "blocks/demo-preview";
import { Logos } from "blocks/logos";
import { Reader } from "blocks/reader";
import { Slider } from "blocks/slider";
import { SolutionDemo } from "blocks/solution-demo";
import { Testimonials } from "blocks/testimonials";
import { App, AppConstructor, ComponentConstructor, ServiceConstructor } from "core";
import { Accordion } from "modules/accordion";
import { Form } from "modules/form";
import { Tooltip } from "modules/tooltip";
import { AdminWidget } from "onces/admin-widget";
import { CookieBanner } from "onces/cookie-banner";
import { CookieOptions } from "onces/cookie-options";
import { Header } from "onces/header";
import { Loader } from "onces/loader";
import { Menu } from "onces/menu";
import { Solution } from "pages/solution";
import { Anim, Parallax, Scroll } from "services";
// import { VideoYoutube } from "modules/video-youtube";

const components: ComponentConstructor[] = [
	AdminWidget, //
	Media,
	Input,
	Textarea,
	Form,
	Header,
	CookieBanner,
	CookieOptions,
	Loader,
	Scrollbar,
	Menu,
	Select,
	Logos,
	Tooltip,
	Testimonials,
	Accordion,
	Accordions,
	Solution,
	SolutionDemo,
	Slider,
	DemoPreview,
	Number,
	Reader,
];

const services: ServiceConstructor[] = [
	Scroll, //
	Anim,
	Parallax,
];

const plugins: ComponentConstructor[] = [];

(window as any).app = new (App as AppConstructor)(components, services, plugins);
