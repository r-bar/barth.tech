DATE_VERSION := $(shell date +%F-%H%M%S)
MITHRIL_VERSION := v2.0.4
SOURCE_FILES = $(wildcard sass/** content/** static/** templates/** themes/** config.toml)
FONTS_URL := "https://fonts.googleapis.com/css?family=PT+Sans:400,400italic,700|Abril+Fatface"
IMAGE_NAME := barth.tech

.DEFAULT: help
.PHONY: help
help: ## Show this help text
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: deploy
deploy: helm-chart/barth-tech/Chart.yaml VERSION ## Publish a new public version
	git commit -m 'tag version $(shell cat VERSION)' $^
	git tag $(shell cat VERSION)
	git push
	git push origin $(shell cat VERSION)

.PHONY: VERSION
VERSION:
	echo ${DATE_VERSION} > $@

helm-chart/barth-tech/Chart.yaml: VERSION
	sed -i 's/appVersion: .*/appVersion: $(shell cat VERSION)/' $@

static/vendor/mithril.min.js:
	wget https://github.com/MithrilJS/mithril.js/releases/download/${MITHRIL_VERSION}/mithril.min.js -P static/vendor

static/vendor/fonts:
	./bin/gfonts.py ${FONTS_URL} $@

.PHONY: build
public: build
build: ${SOURCE_FILES} static/vendor/fonts static/vendor/mithril.min.js ## Build the site
	zola build

.PHONY: image
image: VERSION ## Build and tag docker image
	docker build . \
		-t ${IMAGE_NAME}:$(shell cat VERSION) \
		-t ${IMAGE_NAME}:latest


clean: ## Clean generated files
	-rm -r static/vendor/*
	-rm -r public
