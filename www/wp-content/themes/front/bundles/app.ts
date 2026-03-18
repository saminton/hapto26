"use strict";

// import gsap from "gsap";
// import CustomEase from "gsap/CustomEase";

import { Input } from "atoms/input";
import { Media } from "atoms/media";
import { Scrollbar } from "atoms/scrollbar";
import { Select } from "atoms/select";
import { Textarea } from "atoms/textarea";
import { Accordions } from "blocks/accordions";
import { Logos } from "blocks/logos";
import { Testimonials } from "blocks/testimonials";
import { App, AppConstructor, ComponentConstructor, ServiceConstructor } from "core";
import { Accordion } from "modules/accordion";
import { ContactForm } from "modules/contact-form";
import { Tooltip } from "modules/tooltip";
import { AdminWidget } from "onces/admin-widget";
import { Header } from "onces/header";
import { Loader } from "onces/loader";
import { Menu } from "onces/menu";
import { Anim, Parallax, Scroll } from "services";
// import { VideoYoutube } from "modules/video-youtube";

const components: ComponentConstructor[] = [
	AdminWidget, //
	Media,
	Input,
	Textarea,
	ContactForm,
	Header,
	// CookieBanner,
	// CookieOptions,
	Loader,
	Scrollbar,
	Menu,
	Select,
	Logos,
	Tooltip,
	Testimonials,
	Accordion,
	Accordions,
];

const services: ServiceConstructor[] = [
	Scroll, //
	Anim,
	Parallax,
];

const plugins: ComponentConstructor[] = [];

(window as any).app = new (App as AppConstructor)(components, services, plugins);
