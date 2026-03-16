"use strict";

// import gsap from "gsap";
// import CustomEase from "gsap/CustomEase";

import { App, AppConstructor, ComponentConstructor, ServiceConstructor } from "core";
import { Anim, Parallax, Scroll } from "services";
import { Header } from "onces/header";
import { Menu } from "onces/menu";
import { CookieBanner } from "onces/cookie-banner";
import { CookieOptions } from "onces/cookie-options";
import { Scrollbar } from "atoms/scrollbar";
import { Password } from "atoms/password";
import { Quantity } from "atoms/quantity";
import { Textarea } from "atoms/textarea";
import { AdminWidget } from "onces/admin-widget";
import { Input } from "atoms/input";
import { Loader } from "onces/loader";
import { Test } from "blocks/test";
import { Select } from "atoms/select";
import { Media } from "atoms/media";
import { FileUpload } from "atoms/file-upload";
import { ContactForm } from "modules/contact-form";
import { Logos } from "blocks/logos";
// import { VideoYoutube } from "modules/video-youtube";

const components: ComponentConstructor[] = [
	AdminWidget, //
	Media,
	Input,
	Password,
	Quantity,
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
];

const services: ServiceConstructor[] = [
	Scroll, //
	Anim,
	Parallax,
];

const plugins: ComponentConstructor[] = [];

(window as any).app = new (App as AppConstructor)(components, services, plugins);
