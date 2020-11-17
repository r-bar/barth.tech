+++
title = "Search on a static site"
description = "Light weight search results with the Zola static site framework"
date = 2020-11-16
draft = true

[taxonomies]
technologies = ["mithril.js", "Zola"]
+++

[Zola](https://www.getzola.org/) is an awesome static site generator written in
Rust. As part of the Zola you can generate a statically generated search index.
It is up to you to display the search results on your site. Here I am offering a
dead simple solution that should work for most sites and templates. I am
currently using the well supported [Hyde](https://github.com/getzola/hyde) theme
for Zola until inspiration (or boredom) strikes.

# The index

Setting `build_search_index = true` in Zola's `config.toml` file will use your
content files to build a search index. This search index is a JavaScript file
that lives at `/search_index.en.js` on the finished site. The extension will
change according to the language set in your config. It is also possible to have
indexes for multiple different content languages.

If we peak into this language file we can see it contains `window.searchIndex =
{...}`.

# Mithril.js
Mithril is a pretty neat FRP style framework. It is super light weight and its
small API footprint makes it eaisy to learn. Even for someone that normally sits
on the backend in their day job. In its most basic form `m.render()` Takes an
object with a `.view` method or property that when called with a vDOM object
returns a new vDOM object.

# The search box

# The results page

# Zola gotchas
