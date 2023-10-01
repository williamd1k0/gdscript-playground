PROD := no
NAMESPACE = gdscript-playground
ifneq (${PROD}, yes)
	NAMESPACE = gdscript-playground-devel
endif

site:
	@make -C web

deploy: connect
	@doctl sls deploy functions

connect:
	@doctl sls connect ${NAMESPACE}

.PHONY: site connect deploy
