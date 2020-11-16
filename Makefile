DATE_VERSION = $(shell date +%F-%H%M%S)

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

