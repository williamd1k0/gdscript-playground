site:
	@make -C web

deploy:
	@doctl serverless deploy functions

.PHONY: site deploy