IMAGE ?= jaewon-k9s
TAG ?= 0.1.0

.PHONY: test build validate install

test:
	cd backend && go test ./...
	cd ui && npm test -- --run

build:
	docker build --tag $(IMAGE):$(TAG) .

validate: build
	docker extension validate $(IMAGE):$(TAG)

install: build
	docker extension install $(IMAGE):$(TAG)
