deploy:
	@doctl serverless deploy functions

site:
	@make -C web

.PHONY: deploy site
