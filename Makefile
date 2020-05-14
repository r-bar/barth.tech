DATE_VERSION = $(shell date +%F-%k%M%S)

.PHONY: deploy
deploy: helm-chart/barth-tech/Chart.yaml VERSION
	git commit -m 'tag version $(shell cat VERSION)' $^
	git tag $(shell cat VERSION)
	git push
	git push origin $(shell cat VERSION)

.PHONY: VERSION
VERSION:
	echo ${DATE_VERSION} > $@

helm-chart/barth-tech/Chart.yaml: VERSION
	sed -i 's/appVersion: .*/appVersion: $(shell cat VERSION)/' $@
