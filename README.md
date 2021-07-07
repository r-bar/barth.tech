# Static Personal Website at barth.tech
![CD](https://github.com/r-bar/barth.tech/workflows/CD/badge.svg)

## Get the Code
```
git clone --recursive git@github.com:r-bar/barth.tech.git
```

## Updating submodules for existing repo
```
git submodule update
```

## Building
### Requirements
* [Zola](https://github.com/getzola/zola)

### Commands

Build the site:
```
zola build
```

Add the `--drafts` flag to render draft content.

Serve and live reload the site for development:
```
zola serve --drafts
```
