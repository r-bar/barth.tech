DATE_VERSION := $(shell date +%F-%H%M%S)
MITHRIL_VERSION := v2.0.4
SOURCE_FILES = $(wildcard sass/** content/** static/** templates/** themes/** config.toml)
FONTS_URL := "https://fonts.googleapis.com/css?family=PT+Sans:400,400italic,700|Abril+Fatface"
IMAGE_NAME := registry.barth.tech/library/website
CONTAINER_RUNTIME ?= docker


.DEFAULT: help
.PHONY: help
help: ## Show this help text
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


.PHONY: tag
tag: ## Tag a new public version
	# check if the repo is dirty before tagging
	if [[ $(shell git status -s | grep -v '^??' | wc -l) -ne 0 ]]; then exit 1; fi
	git tag $(DATE_VERSION)
	git push origin $(DATE_VERSION)


static/vendor/mithril.min.js:
	wget https://github.com/MithrilJS/mithril.js/releases/download/${MITHRIL_VERSION}/mithril.min.js -P static/vendor


static/vendor/fonts:
	./bin/gfonts.py ${FONTS_URL} $@


.PHONY: build
public: build
build: ${SOURCE_FILES} static/vendor/fonts static/vendor/mithril.min.js ## Build the site
	zola build


.PHONY: image
image: ## Build and tag docker image
	${CONTAINER_RUNTIME} build . \
		-t ${IMAGE_NAME}:$(shell git describe --tags --dirty) \
		-t ${IMAGE_NAME}:$(shell git show-ref --abbrev) \
		-t ${IMAGE_NAME}:latest


.PHONY: publish
publish:
	${CONTAINER_RUNTIME} push ${IMAGE_NAME}:$(shell git describe --tags --dirty)
	${CONTAINER_RUNTIME} push ${IMAGE_NAME}:$(shell git show-ref --abbrev)
	${CONTAINER_RUNTIME} push ${IMAGE_NAME}:latest


clean: ## Clean generated files
	-rm -r static/vendor/*
	-rm -r public
