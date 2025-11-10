# nuxt-frigear-nu

A simple website to demonstrate the [simple-content-site](https://github.com/hareland/simple-content-site) layer for Nuxt.
This allows simple editing and management of a website simply using markdown and yaml.


## Structure

> Normally you will be working with the `content/` folder, as this is the easiest way to build things that can be edited in the visual editor.

1. [`./content`](./content) Contains all static content e.g pages written in markdown or dynamic configuration
2. [`./app`](./app) Contains the custom parts of the site, which gets injected elsewhere e.g the SiteContactForm was a bit hard to build in markdown, so a custom component is a good solution to 
3. [`./public`](./public) Add any media or files that you want served - it gets served from the ROOT path, e.g `./public/logo.png` will be placed on `website.com/logo.png` ->< this makes it a good candidate to place your ROBOTS.txt there. 

