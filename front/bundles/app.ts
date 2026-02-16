"use strict";

// import gsap from "gsap";
// import CustomEase from "gsap/CustomEase";

import { App } from "core";
import { Anim, Parallax, Scroll } from "services";
import { Header } from "onces/header";
import { Menu } from "onces/menu";
import { CookieBanner } from "onces/cookie-banner";
import { CookieOptions } from "onces/cookie-options";
import { Scrollbar } from "atoms/scrollbar";
import { Password } from "atoms/password";
import { Quantity } from "atoms/quantity";
import { Textarea } from "atoms/textarea";
import { Form } from "modules/form";
import { AdminWidget } from "onces/admin-widget";
import { Input } from "atoms/input";
import { Loader } from "onces/loader";
import { Test } from "blocks/test";
import { Select } from "atoms/select";
import { Media } from "atoms/media";
import { Example } from "plugins/example";
import { FileUpload } from "atoms/file-upload";
// import { VideoYoutube } from "modules/video-youtube";

const components = [
	AdminWidget, //
	Media,
	Input,
	Password,
	Quantity,
	Textarea,
	Form,
	Header,
	CookieBanner,
	CookieOptions,
	Loader,
	Scrollbar,
	Menu,
	Select,
	Test,
	FileUpload,
];

const services = [
	Scroll, //
	Anim,
	Parallax,
];

const plugins = [
	Example, //
];

(window as any).app = new App(components, services, plugins);
