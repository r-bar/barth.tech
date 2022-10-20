DATE_VERSION := $(shell date +%F-%H%M%S)
MITHRIL_VERSION := v2.0.4
SOURCE_FILES = $(wildcard sass/** content/** static/** templates/** themes/** config.toml)
FONTS_URL := "https://fonts.googleapis.com/css?family=PT+Sans:400,400italic,700|Abril+Fatface"
IMAGE_NAME ?= registry.barth.tech/library/website
CONTAINER_RUNTIME ?= docker
GIT_REVISION ?= HEAD
GIT_TAG = $(shell git describe --tags --dirty)
GIT_SHORT_SHA = $(shell git show-ref ${GIT_REVISION} -s --abbrev)


.DEFAULT: help
.PHONY: help
help: ## Show this help text
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


.PHONY: tag
tag: ## Tag a new public version
	# check if the repo is dirty before tagging
	if [[ $(shell git status -s | grep -v '^??' | wc -l) -ne 0 ]]; then exit 1; fi
	git tag ${DATE_VERSION}
	git push origin ${DATE_VERSION}
	@echo Tagged ${DATE_VERSION}


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
		-t "${IMAGE_NAME}:${GIT_TAG}" \
		-t "${IMAGE_NAME}:${GIT_SHORT_SHA}" \
		-t "${IMAGE_NAME}:latest"


.PHONY: publish
publish: ## Publish the current docker image to the repository
	${CONTAINER_RUNTIME} push "${IMAGE_NAME}:${GIT_TAG}"
	${CONTAINER_RUNTIME} push "${IMAGE_NAME}:${GIT_SHORT_SHA}"
	${CONTAINER_RUNTIME} push "${IMAGE_NAME}:latest"


clean: ## Clean generated files
	-rm -r static/vendor/*
	-rm -r public
